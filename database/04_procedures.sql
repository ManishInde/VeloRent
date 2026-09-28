-- =============================================================================
-- VeloRent — Intelligent Vehicle Rental and Fleet Management System
-- FILE: 04_procedures.sql
-- PURPOSE: Stored procedures for multi-step transactional operations.
--
-- WHY STORED PROCEDURES:
--   Each procedure wraps a multi-table workflow inside a single transaction.
--   This ensures atomicity — either the whole operation succeeds (COMMIT)
--   or the database is left unchanged (ROLLBACK).
--   The C++ DAL calls these procedures via CALL statement.
--   Business logic (pricing engine, recommendation) still lives in C++.
--   These procedures handle the PERSISTENCE layer of each workflow.
--
-- DELIMITER:
--   MySQL requires a custom delimiter when procedures contain semicolons.
--   We use $$ throughout this file.
--
-- ERROR HANDLING:
--   DECLARE EXIT HANDLER FOR SQLEXCEPTION rolls back and re-signals the error.
--   The C++ layer catches the error and maps it to a BookingException or similar.
--
-- RUN AFTER: 01_schema.sql, 02_indexes.sql, 03_views.sql
-- =============================================================================

USE velorent;

DELIMITER $$

-- ---------------------------------------------------------------------------
-- 1. sp_create_booking
-- ---------------------------------------------------------------------------
-- WHAT IT DOES:
--   Validates that the vehicle is AVAILABLE and has no overlapping ACTIVE
--   bookings for the requested date range, then inserts a new booking and
--   changes the vehicle status to RESERVED.
--
-- PARAMETERS:
--   p_customer_id  — customer performing the booking
--   p_vehicle_id   — vehicle being booked
--   p_start_date   — rental start date
--   p_end_date     — rental end date
--   p_quoted_price — price computed by the C++ PricingEngine (passed in)
--   p_demand_factor — demand multiplier captured at booking time (for audit)
--   p_actor_id     — user_id of whoever triggered this (may == p_customer_id
--                    or an admin override)
--   p_new_booking_id — OUT param: the newly inserted booking_id
--
-- DESIGN DECISION:
--   The quoted_price is computed in C++ (PricingEngine) and passed in.
--   The procedure does NOT recompute pricing — it only persists the result.
--   This keeps pricing logic centralised in C++.
-- ---------------------------------------------------------------------------
DROP PROCEDURE IF EXISTS sp_create_booking$$

CREATE PROCEDURE sp_create_booking(
    IN  p_customer_id       INT,
    IN  p_vehicle_id        INT,
    IN  p_start_date        DATE,
    IN  p_end_date          DATE,
    IN  p_quoted_price      DECIMAL(12,2),
    IN  p_demand_factor     DECIMAL(5,3),
    IN  p_actor_id          INT,
    OUT p_new_booking_id    INT
)
BEGIN
    DECLARE v_vehicle_status        VARCHAR(20);
    DECLARE v_overlap_count         INT DEFAULT 0;
    DECLARE v_licence_expiry        DATE;
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;

    -- Step 1: Lock the vehicle row for this transaction to prevent concurrent bookings.
    SELECT status INTO v_vehicle_status
    FROM vehicles
    WHERE vehicle_id = p_vehicle_id
    FOR UPDATE;

    -- Step 2: Validate vehicle is in a bookable state.
    IF v_vehicle_status NOT IN ('AVAILABLE', 'RESERVED') THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Vehicle is not available for booking.';
    END IF;

    -- Step 3: Check driving licence expiry.
    SELECT licence_expiry INTO v_licence_expiry
    FROM customers
    WHERE customer_id = p_customer_id;

    IF v_licence_expiry < p_start_date THEN
        SIGNAL SQLSTATE '45001'
            SET MESSAGE_TEXT = 'Customer driving licence will be expired during the rental period.';
    END IF;

    -- Step 4: Check for overlapping bookings on this vehicle.
    -- An overlap exists when a booking's [start, end) overlaps [p_start, p_end).
    -- We exclude CANCELLED and EXPIRED bookings.
    SELECT COUNT(*)
    INTO   v_overlap_count
    FROM   bookings
    WHERE  vehicle_id  = p_vehicle_id
      AND  status NOT IN ('CANCELLED', 'EXPIRED', 'COMPLETED')
      AND  start_date  < p_end_date
      AND  end_date    > p_start_date;

    IF v_overlap_count > 0 THEN
        SIGNAL SQLSTATE '45002'
            SET MESSAGE_TEXT = 'Vehicle already has an active booking for the requested dates.';
    END IF;

    -- Step 5: Insert the booking.
    INSERT INTO bookings (
        customer_id, vehicle_id, start_date, end_date,
        quoted_price, demand_factor, status
    ) VALUES (
        p_customer_id, p_vehicle_id, p_start_date, p_end_date,
        p_quoted_price, p_demand_factor, 'CONFIRMED'
    );

    SET p_new_booking_id = LAST_INSERT_ID();

    -- Step 6: Update vehicle status to RESERVED.
    UPDATE vehicles
    SET    status = 'RESERVED'
    WHERE  vehicle_id = p_vehicle_id;

    -- Step 7: Write audit log.
    INSERT INTO system_logs (
        actor_id, actor_role, action, entity_type, entity_id,
        new_value
    )
    SELECT
        p_actor_id,
        u.role,
        'BOOKING_CREATED',
        'booking',
        p_new_booking_id,
        JSON_OBJECT(
            'booking_id',   p_new_booking_id,
            'vehicle_id',   p_vehicle_id,
            'start_date',   p_start_date,
            'end_date',     p_end_date,
            'quoted_price', p_quoted_price
        )
    FROM users u
    WHERE u.user_id = p_actor_id;

    COMMIT;
END$$


-- ---------------------------------------------------------------------------
-- 2. sp_cancel_booking
-- ---------------------------------------------------------------------------
-- WHAT IT DOES:
--   Cancels a booking, releases the vehicle (back to AVAILABLE if no other
--   active bookings exist for it), records the cancellation details,
--   and triggers waitlist promotion for the vehicle.
-- ---------------------------------------------------------------------------
DROP PROCEDURE IF EXISTS sp_cancel_booking$$

CREATE PROCEDURE sp_cancel_booking(
    IN p_booking_id         INT,
    IN p_cancelled_by       INT,
    IN p_reason             TEXT,
    IN p_refund_amount      DECIMAL(12,2)
)
BEGIN
    DECLARE v_vehicle_id            INT;
    DECLARE v_current_status        VARCHAR(20);
    DECLARE v_other_active_count    INT DEFAULT 0;
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;

    -- Step 1: Lock and validate the booking.
    SELECT vehicle_id, status
    INTO   v_vehicle_id, v_current_status
    FROM   bookings
    WHERE  booking_id = p_booking_id
    FOR UPDATE;

    IF v_current_status IN ('CANCELLED', 'COMPLETED', 'EXPIRED') THEN
        SIGNAL SQLSTATE '45003'
            SET MESSAGE_TEXT = 'Booking cannot be cancelled in its current state.';
    END IF;

    -- Step 2: Cancel the booking.
    UPDATE bookings
    SET    status               = 'CANCELLED',
           cancelled_at         = NOW(),
           cancellation_reason  = p_reason
    WHERE  booking_id = p_booking_id;

    -- Step 3: Record cancellation details.
    INSERT INTO cancellation_records (
        booking_id, cancelled_by, reason, refund_amount,
        refund_status, cancelled_at
    ) VALUES (
        p_booking_id, p_cancelled_by, p_reason, p_refund_amount,
        IF(p_refund_amount > 0, 'PENDING', 'NOT_APPLICABLE'),
        NOW()
    );

    -- Step 4: Check if the vehicle has any other non-cancelled active bookings.
    SELECT COUNT(*)
    INTO   v_other_active_count
    FROM   bookings
    WHERE  vehicle_id = v_vehicle_id
      AND  booking_id != p_booking_id
      AND  status     IN ('PENDING', 'CONFIRMED');

    -- Step 5: Release vehicle only if no other active bookings hold it.
    IF v_other_active_count = 0 THEN
        UPDATE vehicles
        SET    status = 'AVAILABLE'
        WHERE  vehicle_id = v_vehicle_id
          AND  status     = 'RESERVED';
    END IF;

    -- Step 6: Audit log.
    INSERT INTO system_logs (
        actor_id, actor_role, action, entity_type, entity_id,
        new_value
    )
    SELECT
        p_cancelled_by,
        u.role,
        'BOOKING_CANCELLED',
        'booking',
        p_booking_id,
        JSON_OBJECT(
            'booking_id',    p_booking_id,
            'cancelled_by',  p_cancelled_by,
            'refund_amount', p_refund_amount
        )
    FROM users u
    WHERE u.user_id = p_cancelled_by;

    -- Step 7: Promote waitlist (find oldest WAITING entry for this vehicle).
    CALL sp_promote_waitlist(v_vehicle_id);

    COMMIT;
END$$


-- ---------------------------------------------------------------------------
-- 3. sp_confirm_rental
-- ---------------------------------------------------------------------------
-- WHAT IT DOES:
--   Converts a CONFIRMED booking into an ACTIVE rental.
--   Records actual start datetime and starting odometer.
--   Changes vehicle status to RENTED.
--   Called when the customer physically picks up the vehicle.
-- ---------------------------------------------------------------------------
DROP PROCEDURE IF EXISTS sp_confirm_rental$$

CREATE PROCEDURE sp_confirm_rental(
    IN  p_booking_id        INT,
    IN  p_start_odometer    INT,
    IN  p_actor_id          INT,
    OUT p_new_rental_id     INT
)
BEGIN
    DECLARE v_booking_status    VARCHAR(20);
    DECLARE v_vehicle_id        INT;
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;

    -- Step 1: Validate booking.
    SELECT status, vehicle_id
    INTO   v_booking_status, v_vehicle_id
    FROM   bookings
    WHERE  booking_id = p_booking_id
    FOR UPDATE;

    IF v_booking_status != 'CONFIRMED' THEN
        SIGNAL SQLSTATE '45004'
            SET MESSAGE_TEXT = 'Only CONFIRMED bookings can be activated as rentals.';
    END IF;

    -- Step 2: Create the rental record.
    INSERT INTO rentals (
        booking_id, actual_start, start_odometer, status
    ) VALUES (
        p_booking_id, NOW(), p_start_odometer, 'ACTIVE'
    );

    SET p_new_rental_id = LAST_INSERT_ID();

    -- Step 3: Update vehicle status to RENTED.
    UPDATE vehicles
    SET    status = 'RENTED'
    WHERE  vehicle_id = v_vehicle_id;

    -- Step 4: Audit.
    INSERT INTO system_logs (
        actor_id, actor_role, action, entity_type, entity_id, new_value
    )
    SELECT
        p_actor_id, u.role, 'RENTAL_STARTED', 'rental', p_new_rental_id,
        JSON_OBJECT('rental_id', p_new_rental_id, 'booking_id', p_booking_id,
                    'start_odometer', p_start_odometer)
    FROM users u WHERE u.user_id = p_actor_id;

    COMMIT;
END$$


-- ---------------------------------------------------------------------------
-- 4. sp_return_vehicle
-- ---------------------------------------------------------------------------
-- WHAT IT DOES:
--   Records the vehicle return. Updates rental end time and odometer.
--   Updates the master vehicle odometer.
--   Marks the rental COMPLETED.
--   Changes vehicle status back to AVAILABLE (unless damage is SEVERE).
--   Awards loyalty points (1 point per ₹100 spent, rounded down).
--   A separate payment record should be inserted by the C++ layer BEFORE
--   calling this procedure, so that total paid is already in the DB.
--
-- NOTE: If there are SEVERE damage reports, the vehicle goes to MAINTENANCE
--       instead of AVAILABLE. This is handled by the trigger
--       trg_after_damage_report in 06_triggers.sql. This procedure
--       sets status to AVAILABLE; the trigger overrides it if needed.
-- ---------------------------------------------------------------------------
DROP PROCEDURE IF EXISTS sp_return_vehicle$$

CREATE PROCEDURE sp_return_vehicle(
    IN p_rental_id          INT,
    IN p_end_odometer       INT,
    IN p_actor_id           INT
)
BEGIN
    DECLARE v_rental_status         VARCHAR(20);
    DECLARE v_vehicle_id            INT;
    DECLARE v_booking_id            INT;
    DECLARE v_customer_id           INT;
    DECLARE v_total_paid            DECIMAL(12,2) DEFAULT 0.00;
    DECLARE v_loyalty_id            INT;
    DECLARE v_points_to_award       INT;
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;

    -- Step 1: Lock and validate rental.
    SELECT r.status, b.vehicle_id, r.booking_id, b.customer_id
    INTO   v_rental_status, v_vehicle_id, v_booking_id, v_customer_id
    FROM   rentals r
    JOIN   bookings b ON r.booking_id = b.booking_id
    WHERE  r.rental_id = p_rental_id
    FOR UPDATE;

    IF v_rental_status NOT IN ('ACTIVE', 'OVERDUE') THEN
        SIGNAL SQLSTATE '45005'
            SET MESSAGE_TEXT = 'Rental is not in an active state for return.';
    END IF;

    -- Step 2: Complete the rental record.
    UPDATE rentals
    SET    status        = 'COMPLETED',
           actual_end   = NOW(),
           end_odometer = p_end_odometer
    WHERE  rental_id = p_rental_id;

    -- Step 3: Update master vehicle odometer and status.
    UPDATE vehicles
    SET    odometer_km = p_end_odometer,
           status      = 'AVAILABLE'
    WHERE  vehicle_id = v_vehicle_id;

    -- Step 4: Mark the booking as COMPLETED.
    UPDATE bookings
    SET    status = 'COMPLETED'
    WHERE  booking_id = v_booking_id;

    -- Step 5: Award loyalty points.
    -- Calculation: 1 point per ₹100 of total completed payments for this rental.
    SELECT COALESCE(SUM(amount), 0)
    INTO   v_total_paid
    FROM   payments
    WHERE  rental_id = p_rental_id
      AND  status    = 'COMPLETED'
      AND  payment_type NOT IN ('REFUND');

    SET v_points_to_award = FLOOR(v_total_paid / 100);

    IF v_points_to_award > 0 THEN
        SELECT loyalty_id INTO v_loyalty_id
        FROM   loyalty_accounts
        WHERE  customer_id = v_customer_id;

        IF v_loyalty_id IS NOT NULL THEN
            UPDATE loyalty_accounts
            SET    points_balance       = points_balance + v_points_to_award,
                   total_points_earned = total_points_earned + v_points_to_award
            WHERE  loyalty_id = v_loyalty_id;

            INSERT INTO loyalty_transactions (
                loyalty_id, txn_type, points, source, reference_id
            ) VALUES (
                v_loyalty_id, 'EARN', v_points_to_award,
                'RENTAL_COMPLETE', p_rental_id
            );
        END IF;
    END IF;

    -- Step 6: Audit log.
    INSERT INTO system_logs (
        actor_id, actor_role, action, entity_type, entity_id, new_value
    )
    SELECT
        p_actor_id, u.role, 'RENTAL_COMPLETED', 'rental', p_rental_id,
        JSON_OBJECT('rental_id', p_rental_id, 'end_odometer', p_end_odometer,
                    'loyalty_points_awarded', v_points_to_award,
                    'total_paid', v_total_paid)
    FROM users u WHERE u.user_id = p_actor_id;

    COMMIT;
END$$


-- ---------------------------------------------------------------------------
-- 5. sp_schedule_maintenance
-- ---------------------------------------------------------------------------
-- WHAT IT DOES:
--   Creates a maintenance task for a vehicle, sets the vehicle to MAINTENANCE
--   status, and assigns staff if provided.
-- ---------------------------------------------------------------------------
DROP PROCEDURE IF EXISTS sp_schedule_maintenance$$

CREATE PROCEDURE sp_schedule_maintenance(
    IN  p_vehicle_id            INT,
    IN  p_maintenance_type      VARCHAR(20),
    IN  p_priority              VARCHAR(10),
    IN  p_description           TEXT,
    IN  p_scheduled_date        DATE,
    IN  p_assigned_to           INT,        -- NULL if not yet assigned
    IN  p_damage_report_id      INT,        -- NULL if not triggered by damage
    IN  p_actor_id              INT,
    OUT p_new_maintenance_id    INT
)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;

    INSERT INTO maintenance (
        vehicle_id, damage_report_id, maintenance_type, priority,
        status, assigned_to, description, scheduled_date
    ) VALUES (
        p_vehicle_id, p_damage_report_id, p_maintenance_type, p_priority,
        'OPEN', p_assigned_to, p_description, p_scheduled_date
    );

    SET p_new_maintenance_id = LAST_INSERT_ID();

    -- Vehicle goes to MAINTENANCE status.
    UPDATE vehicles
    SET    status = 'MAINTENANCE'
    WHERE  vehicle_id = p_vehicle_id;

    -- Audit.
    INSERT INTO system_logs (
        actor_id, actor_role, action, entity_type, entity_id, new_value
    )
    SELECT
        p_actor_id, u.role, 'MAINTENANCE_SCHEDULED', 'maintenance',
        p_new_maintenance_id,
        JSON_OBJECT('vehicle_id', p_vehicle_id, 'type', p_maintenance_type,
                    'priority', p_priority)
    FROM users u WHERE u.user_id = p_actor_id;

    COMMIT;
END$$


-- ---------------------------------------------------------------------------
-- 6. sp_complete_maintenance
-- ---------------------------------------------------------------------------
-- WHAT IT DOES:
--   Marks the maintenance task as COMPLETED.
--   Records total cost.
--   Restores vehicle status to AVAILABLE.
--   Triggers waitlist check via sp_promote_waitlist.
-- ---------------------------------------------------------------------------
DROP PROCEDURE IF EXISTS sp_complete_maintenance$$

CREATE PROCEDURE sp_complete_maintenance(
    IN p_maintenance_id     INT,
    IN p_total_cost         DECIMAL(12,2),
    IN p_staff_id           INT,
    IN p_notes              TEXT,
    IN p_parts_used         VARCHAR(300)
)
BEGIN
    DECLARE v_vehicle_id    INT;
    DECLARE v_maint_status  VARCHAR(20);
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;

    SELECT vehicle_id, status
    INTO   v_vehicle_id, v_maint_status
    FROM   maintenance
    WHERE  maintenance_id = p_maintenance_id
    FOR UPDATE;

    IF v_maint_status = 'COMPLETED' THEN
        SIGNAL SQLSTATE '45006'
            SET MESSAGE_TEXT = 'Maintenance task is already completed.';
    END IF;

    -- Mark maintenance done.
    UPDATE maintenance
    SET    status        = 'COMPLETED',
           total_cost    = p_total_cost,
           completed_at  = NOW(),
           started_at    = COALESCE(started_at, NOW())
    WHERE  maintenance_id = p_maintenance_id;

    -- Log the work entry.
    INSERT INTO maintenance_logs (
        maintenance_id, staff_id, notes, parts_used, cost_logged
    ) VALUES (
        p_maintenance_id, p_staff_id, p_notes, p_parts_used, p_total_cost
    );

    -- Restore vehicle to AVAILABLE.
    UPDATE vehicles
    SET    status = 'AVAILABLE'
    WHERE  vehicle_id = v_vehicle_id
      AND  status     = 'MAINTENANCE';

    -- Check if waitlist has anyone waiting for this vehicle.
    CALL sp_promote_waitlist(v_vehicle_id);

    -- Audit.
    INSERT INTO system_logs (
        actor_id, actor_role, action, entity_type, entity_id, new_value
    )
    SELECT
        p_staff_id, u.role, 'MAINTENANCE_COMPLETED', 'maintenance',
        p_maintenance_id,
        JSON_OBJECT('maintenance_id', p_maintenance_id,
                    'total_cost', p_total_cost, 'vehicle_id', v_vehicle_id)
    FROM users u WHERE u.user_id = p_staff_id;

    COMMIT;
END$$


-- ---------------------------------------------------------------------------
-- 7. sp_promote_waitlist
-- ---------------------------------------------------------------------------
-- WHAT IT DOES:
--   Finds the oldest WAITING waitlist entry for a given vehicle whose
--   requested dates are still in the future. Updates its status to NOTIFIED
--   and inserts a notification for the customer.
--
--   Called by: sp_cancel_booking, sp_complete_maintenance, and
--              trg_after_rental_complete trigger.
-- ---------------------------------------------------------------------------
DROP PROCEDURE IF EXISTS sp_promote_waitlist$$

CREATE PROCEDURE sp_promote_waitlist(
    IN p_vehicle_id INT
)
BEGIN
    DECLARE v_waitlist_id       INT;
    DECLARE v_customer_id       INT;
    DECLARE v_user_id           INT;
    DECLARE v_req_start         DATE;
    DECLARE v_req_end           DATE;
    DECLARE done                BOOLEAN DEFAULT FALSE;

    -- Find the oldest WAITING entry whose dates are still relevant.
    SELECT waitlist_id, customer_id, requested_start, requested_end
    INTO   v_waitlist_id, v_customer_id, v_req_start, v_req_end
    FROM   waitlist
    WHERE  vehicle_id       = p_vehicle_id
      AND  status           = 'WAITING'
      AND  requested_end    > CURDATE()
    ORDER BY queued_at ASC
    LIMIT 1;

    IF v_waitlist_id IS NOT NULL THEN
        -- Mark as NOTIFIED.
        UPDATE waitlist
        SET    status       = 'NOTIFIED',
               notified_at  = NOW()
        WHERE  waitlist_id  = v_waitlist_id;

        -- Get the user_id from the customer record.
        SELECT customer_id INTO v_user_id FROM customers WHERE customer_id = v_customer_id;

        -- Send notification.
        INSERT INTO notifications (
            user_id, notification_type, title, message, reference_id
        ) VALUES (
            v_user_id,
            'WAITLIST_NOTIFIED',
            'Vehicle Now Available',
            CONCAT('Good news! A vehicle you waitlisted (ID: ', p_vehicle_id,
                   ') is now available for your requested dates (',
                   v_req_start, ' to ', v_req_end,
                   '). Please confirm your booking within 24 hours.'),
            v_waitlist_id
        );
    END IF;
END$$


-- ---------------------------------------------------------------------------
-- 8. sp_process_payment
-- ---------------------------------------------------------------------------
-- WHAT IT DOES:
--   Inserts a payment record for a rental.
--   If loyalty points are used, deducts them from the loyalty account.
--   The C++ PaymentController calls this after the external payment gateway
--   confirms the transaction.
-- ---------------------------------------------------------------------------
DROP PROCEDURE IF EXISTS sp_process_payment$$

CREATE PROCEDURE sp_process_payment(
    IN  p_rental_id             INT,
    IN  p_amount                DECIMAL(12,2),
    IN  p_method                VARCHAR(20),
    IN  p_payment_type          VARCHAR(20),
    IN  p_loyalty_points_used   INT,
    IN  p_transaction_ref       VARCHAR(100),
    IN  p_actor_id              INT,
    OUT p_new_payment_id        INT
)
BEGIN
    DECLARE v_loyalty_id    INT;
    DECLARE v_customer_id   INT;
    DECLARE v_balance       INT;
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;

    -- If loyalty points are being redeemed, validate the balance.
    IF p_loyalty_points_used > 0 THEN
        SELECT b.customer_id
        INTO   v_customer_id
        FROM   rentals r
        JOIN   bookings b ON r.booking_id = b.booking_id
        WHERE  r.rental_id = p_rental_id;

        SELECT loyalty_id, points_balance
        INTO   v_loyalty_id, v_balance
        FROM   loyalty_accounts
        WHERE  customer_id = v_customer_id
        FOR UPDATE;

        IF v_balance < p_loyalty_points_used THEN
            SIGNAL SQLSTATE '45007'
                SET MESSAGE_TEXT = 'Insufficient loyalty points balance.';
        END IF;

        -- Deduct points.
        UPDATE loyalty_accounts
        SET    points_balance = points_balance - p_loyalty_points_used
        WHERE  loyalty_id = v_loyalty_id;

        INSERT INTO loyalty_transactions (
            loyalty_id, txn_type, points, source, reference_id
        ) VALUES (
            v_loyalty_id, 'REDEEM', -p_loyalty_points_used,
            'PAYMENT_REDEMPTION', p_rental_id
        );
    END IF;

    -- Insert the payment record.
    INSERT INTO payments (
        rental_id, amount, payment_method, payment_type,
        status, loyalty_points_used, transaction_ref, paid_at
    ) VALUES (
        p_rental_id, p_amount, p_method, p_payment_type,
        'COMPLETED', p_loyalty_points_used, p_transaction_ref, NOW()
    );

    SET p_new_payment_id = LAST_INSERT_ID();

    -- Audit.
    INSERT INTO system_logs (
        actor_id, actor_role, action, entity_type, entity_id, new_value
    )
    SELECT
        p_actor_id, u.role, 'PAYMENT_PROCESSED', 'payment', p_new_payment_id,
        JSON_OBJECT('payment_id', p_new_payment_id, 'amount', p_amount,
                    'method', p_method, 'rental_id', p_rental_id)
    FROM users u WHERE u.user_id = p_actor_id;

    COMMIT;
END$$


DELIMITER ;

-- =============================================================================
-- END OF PROCEDURES
-- =============================================================================
