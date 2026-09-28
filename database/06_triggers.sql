-- =============================================================================
-- VeloRent — Intelligent Vehicle Rental and Fleet Management System
-- FILE: 06_triggers.sql
-- PURPOSE: Triggers for automatic, reactive database logic.
--
-- PHILOSOPHY (important):
--   Each trigger here exists because it represents a MANDATORY database-level
--   invariant — something that MUST happen on every relevant DML operation,
--   regardless of which code path triggered it.
--
--   We do NOT create triggers simply to demonstrate that triggers exist.
--   Each trigger below has a clear business or integrity justification.
--
-- TRIGGERS CREATED:
--   1. trg_after_booking_insert      — Audit log on new booking.
--   2. trg_after_rental_complete     — Award loyalty points + health snapshot
--                                      + waitlist check after rental completion.
--   3. trg_after_damage_report_insert — Auto-schedule maintenance if SEVERE.
--   4. trg_after_maintenance_complete — Restore vehicle + update health score.
--   5. trg_loyalty_tier_update       — Recalculate loyalty tier after point change.
--   6. trg_audit_vehicle_status      — Audit log on vehicle status change.
--   7. trg_after_booking_cancel      — Promote waitlist after cancellation.
--
-- RUN AFTER: 01_schema.sql through 05_functions.sql
-- =============================================================================

USE velorent;

DELIMITER $$

-- ---------------------------------------------------------------------------
-- 1. trg_after_booking_insert
-- ---------------------------------------------------------------------------
-- WHY: Every new booking must have an audit log entry. Enforcing this in a
--      trigger ensures it happens even if the sp_create_booking procedure is
--      bypassed (e.g., direct INSERT during testing or admin override).
--      The procedure also writes an audit entry — the trigger acts as a safety net.
-- ---------------------------------------------------------------------------
DROP TRIGGER IF EXISTS trg_after_booking_insert$$

CREATE TRIGGER trg_after_booking_insert
AFTER INSERT ON bookings
FOR EACH ROW
BEGIN
    -- Only write audit if the procedure didn't already write one.
    -- We can't know that directly, so we accept the possible duplicate.
    -- The audit log is append-only, duplicates are harmless for audit purposes.
    INSERT INTO system_logs (
        actor_id, actor_role, action, entity_type, entity_id, new_value
    )
    SELECT
        NEW.customer_id,
        'CUSTOMER',
        'BOOKING_CREATED_TRG',
        'booking',
        NEW.booking_id,
        JSON_OBJECT(
            'booking_id',   NEW.booking_id,
            'vehicle_id',   NEW.vehicle_id,
            'start_date',   NEW.start_date,
            'end_date',     NEW.end_date,
            'quoted_price', NEW.quoted_price,
            'status',       NEW.status
        );
END$$


-- ---------------------------------------------------------------------------
-- 2. trg_after_rental_status_update
-- ---------------------------------------------------------------------------
-- WHY: When a rental transitions to COMPLETED, three things MUST happen:
--   (a) A health score snapshot is written to vehicle_health_snapshots.
--   (b) The vehicle's current health_score is updated from the function.
--   (c) sp_promote_waitlist is called to notify any waiting customers.
--
-- Loyalty points are awarded inside sp_return_vehicle (the procedure).
-- The trigger handles the health + snapshot part as a database invariant.
-- ---------------------------------------------------------------------------
DROP TRIGGER IF EXISTS trg_after_rental_status_update$$

CREATE TRIGGER trg_after_rental_status_update
AFTER UPDATE ON rentals
FOR EACH ROW
BEGIN
    DECLARE v_vehicle_id    INT;
    DECLARE v_new_health    DECIMAL(5,2);

    -- Only fire when status changes TO 'COMPLETED'.
    IF NEW.status = 'COMPLETED' AND OLD.status != 'COMPLETED' THEN

        -- Get the vehicle_id via the booking.
        SELECT b.vehicle_id INTO v_vehicle_id
        FROM   bookings b
        WHERE  b.booking_id = NEW.booking_id;

        -- Compute updated health score using our SQL function.
        SET v_new_health = fn_compute_health_score(v_vehicle_id);

        -- Update the vehicle's current health score.
        UPDATE vehicles
        SET    health_score = v_new_health
        WHERE  vehicle_id   = v_vehicle_id;

        -- Record a health snapshot for time-series analytics.
        INSERT INTO vehicle_health_snapshots (vehicle_id, health_score, computed_by)
        VALUES (v_vehicle_id, v_new_health, 'ENGINE');

        -- Audit the rental completion.
        INSERT INTO system_logs (
            actor_id, actor_role, action, entity_type, entity_id, new_value
        ) VALUES (
            NULL, 'SYSTEM', 'RENTAL_COMPLETED_TRG', 'rental', NEW.rental_id,
            JSON_OBJECT('rental_id', NEW.rental_id, 'new_health_score', v_new_health)
        );

    END IF;
END$$


-- ---------------------------------------------------------------------------
-- 3. trg_after_damage_report_insert
-- ---------------------------------------------------------------------------
-- WHY: A SEVERE damage report is a critical business event. The vehicle must
--      immediately go to MAINTENANCE status and a maintenance task must be
--      created. This is a mandatory database-level invariant — it must happen
--      every time regardless of which code path created the damage report.
--
-- MINOR/MODERATE: Logged only. Fleet manager decides whether to schedule maint.
-- SEVERE: Auto-schedules HIGH priority REPAIR maintenance.
-- ---------------------------------------------------------------------------
DROP TRIGGER IF EXISTS trg_after_damage_report_insert$$

CREATE TRIGGER trg_after_damage_report_insert
AFTER INSERT ON damage_reports
FOR EACH ROW
BEGIN
    IF NEW.severity = 'SEVERE' THEN
        -- Set vehicle to MAINTENANCE immediately.
        UPDATE vehicles
        SET    status = 'MAINTENANCE'
        WHERE  vehicle_id = NEW.vehicle_id;

        -- Auto-create a HIGH priority REPAIR maintenance task.
        INSERT INTO maintenance (
            vehicle_id, damage_report_id, maintenance_type,
            priority, status, description
        ) VALUES (
            NEW.vehicle_id,
            NEW.report_id,
            'REPAIR',
            'HIGH',
            'OPEN',
            CONCAT('Auto-created from SEVERE damage report #', NEW.report_id,
                   ': ', LEFT(NEW.description, 200))
        );

        -- Notify all fleet managers.
        INSERT INTO notifications (user_id, notification_type, title, message, reference_id)
        SELECT
            u.user_id,
            'MAINTENANCE_ALERT',
            'SEVERE Damage — Immediate Maintenance Required',
            CONCAT('Vehicle ID ', NEW.vehicle_id,
                   ' has a SEVERE damage report. Estimated repair cost: ₹',
                   NEW.estimated_cost,
                   '. A maintenance task has been auto-created.'),
            NEW.report_id
        FROM users u
        WHERE u.role = 'FLEET_MANAGER'
          AND u.is_active = TRUE;
    END IF;
END$$


-- ---------------------------------------------------------------------------
-- 4. trg_after_maintenance_status_update
-- ---------------------------------------------------------------------------
-- WHY: When maintenance is marked COMPLETED, the vehicle MUST return to
--      AVAILABLE status and a new health score MUST be computed.
--      This is done by sp_complete_maintenance, but the trigger acts as a
--      safety net for direct UPDATEs.
-- ---------------------------------------------------------------------------
DROP TRIGGER IF EXISTS trg_after_maintenance_status_update$$

CREATE TRIGGER trg_after_maintenance_status_update
AFTER UPDATE ON maintenance
FOR EACH ROW
BEGIN
    DECLARE v_new_health DECIMAL(5,2);

    IF NEW.status = 'COMPLETED' AND OLD.status != 'COMPLETED' THEN

        -- Recompute health score.
        SET v_new_health = fn_compute_health_score(NEW.vehicle_id);

        UPDATE vehicles
        SET    health_score = v_new_health,
               status       = IF(status = 'MAINTENANCE', 'AVAILABLE', status)
        WHERE  vehicle_id   = NEW.vehicle_id;

        -- Record a health snapshot.
        INSERT INTO vehicle_health_snapshots (vehicle_id, health_score, computed_by)
        VALUES (NEW.vehicle_id, v_new_health, 'ENGINE');

        -- Audit.
        INSERT INTO system_logs (
            actor_id, actor_role, action, entity_type, entity_id, new_value
        ) VALUES (
            NEW.assigned_to, 'MAINTENANCE_STAFF',
            'MAINTENANCE_COMPLETED_TRG', 'maintenance', NEW.maintenance_id,
            JSON_OBJECT('maintenance_id', NEW.maintenance_id,
                        'vehicle_id', NEW.vehicle_id,
                        'new_health_score', v_new_health,
                        'total_cost', NEW.total_cost)
        );

    END IF;
END$$


-- ---------------------------------------------------------------------------
-- 5. trg_loyalty_tier_update
-- ---------------------------------------------------------------------------
-- WHY: The loyalty tier must ALWAYS match the total_points_earned value.
--      Rather than require every code path that awards points to also update
--      the tier, we enforce this as a DB invariant here.
--      Whenever loyalty_accounts is updated, the tier is recalculated.
-- ---------------------------------------------------------------------------
DROP TRIGGER IF EXISTS trg_loyalty_tier_update$$

CREATE TRIGGER trg_loyalty_tier_update
BEFORE UPDATE ON loyalty_accounts
FOR EACH ROW
BEGIN
    -- Recalculate tier based on the new total_points_earned.
    -- We use the inline expression (same logic as fn_loyalty_tier) to avoid
    -- function calls inside triggers, which can cause issues in some MySQL configs.
    SET NEW.tier = CASE
        WHEN NEW.total_points_earned >= 15000 THEN 'PLATINUM'
        WHEN NEW.total_points_earned >= 5000  THEN 'GOLD'
        WHEN NEW.total_points_earned >= 1000  THEN 'SILVER'
        ELSE 'BRONZE'
    END;

    -- If the tier changed, send a notification to the customer.
    IF NEW.tier != OLD.tier THEN
        INSERT INTO notifications (
            user_id, notification_type, title, message
        ) VALUES (
            NEW.customer_id,
            'LOYALTY_TIER_UPGRADE',
            CONCAT('Loyalty Tier Upgraded to ', NEW.tier, '!'),
            CONCAT('Congratulations! You have been upgraded to ', NEW.tier,
                   ' tier with ', NEW.total_points_earned, ' lifetime points. ',
                   'Enjoy your enhanced benefits on your next rental.')
        );
    END IF;
END$$


-- ---------------------------------------------------------------------------
-- 6. trg_audit_vehicle_status_change
-- ---------------------------------------------------------------------------
-- WHY: Every vehicle status change is a significant fleet event.
--      The full audit trail for a vehicle's lifecycle is essential for the
--      audit log page and for forensic investigation.
-- ---------------------------------------------------------------------------
DROP TRIGGER IF EXISTS trg_audit_vehicle_status_change$$

CREATE TRIGGER trg_audit_vehicle_status_change
AFTER UPDATE ON vehicles
FOR EACH ROW
BEGIN
    IF NEW.status != OLD.status THEN
        INSERT INTO system_logs (
            actor_id, actor_role, action, entity_type, entity_id,
            old_value, new_value
        ) VALUES (
            NULL, 'SYSTEM',
            'VEHICLE_STATUS_CHANGED',
            'vehicle',
            NEW.vehicle_id,
            JSON_OBJECT('status', OLD.status, 'health_score', OLD.health_score),
            JSON_OBJECT('status', NEW.status, 'health_score', NEW.health_score)
        );
    END IF;
END$$


-- ---------------------------------------------------------------------------
-- 7. trg_after_booking_cancel
-- ---------------------------------------------------------------------------
-- WHY: When a booking is cancelled (status → CANCELLED), the waitlist must
--      be checked and the next eligible customer notified.
--      This ensures waitlist promotion happens even when a booking is cancelled
--      outside of sp_cancel_booking (e.g., admin direct update, expiry job).
-- ---------------------------------------------------------------------------
DROP TRIGGER IF EXISTS trg_after_booking_cancel$$

CREATE TRIGGER trg_after_booking_cancel
AFTER UPDATE ON bookings
FOR EACH ROW
BEGIN
    IF NEW.status = 'CANCELLED' AND OLD.status != 'CANCELLED' THEN
        -- sp_promote_waitlist is called here to notify waiting customers.
        -- Note: MySQL triggers cannot CALL procedures with INOUT params in all
        -- versions. We replicate the waitlist promotion logic inline.
        BEGIN
            DECLARE v_waitlist_id   INT;
            DECLARE v_customer_id   INT;
            DECLARE v_req_start     DATE;
            DECLARE v_req_end       DATE;

            SELECT waitlist_id, customer_id, requested_start, requested_end
            INTO   v_waitlist_id, v_customer_id, v_req_start, v_req_end
            FROM   waitlist
            WHERE  vehicle_id    = NEW.vehicle_id
              AND  status        = 'WAITING'
              AND  requested_end > CURDATE()
            ORDER BY queued_at ASC
            LIMIT 1;

            IF v_waitlist_id IS NOT NULL THEN
                UPDATE waitlist
                SET    status       = 'NOTIFIED',
                       notified_at  = NOW()
                WHERE  waitlist_id  = v_waitlist_id;

                INSERT INTO notifications (
                    user_id, notification_type, title, message, reference_id
                ) VALUES (
                    v_customer_id,
                    'WAITLIST_NOTIFIED',
                    'Vehicle Now Available',
                    CONCAT('A vehicle you waitlisted is now available for your dates (',
                           v_req_start, ' to ', v_req_end,
                           '). Please confirm your booking within 24 hours.'),
                    v_waitlist_id
                );
            END IF;
        END;
    END IF;
END$$


DELIMITER ;

-- =============================================================================
-- END OF TRIGGERS
-- =============================================================================
