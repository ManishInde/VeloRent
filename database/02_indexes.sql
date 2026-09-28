-- =============================================================================
-- VeloRent — Intelligent Vehicle Rental and Fleet Management System
-- FILE: 02_indexes.sql
-- PURPOSE: Create all secondary indexes for query performance.
--          Primary keys are already indexed by MySQL automatically.
--          Foreign keys are also auto-indexed in InnoDB.
--          This file adds COMPOSITE and COVERING indexes for our actual
--          query patterns identified from the stored procedures and views.
--
-- RULE: Index based on real query needs — not on every column.
--       Over-indexing hurts INSERT/UPDATE performance.
--
-- RUN AFTER: 01_schema.sql
-- =============================================================================

USE velorent;

-- ---------------------------------------------------------------------------
-- USERS
-- ---------------------------------------------------------------------------
-- Login lookup by email is the most frequent query in the system.
-- email already has a UNIQUE constraint (which creates a unique index).
-- No additional index needed on users.

-- ---------------------------------------------------------------------------
-- BOOKINGS  — the most heavily queried table in the system
-- ---------------------------------------------------------------------------

-- 1. Check vehicle availability for a date range.
--    Query pattern: WHERE vehicle_id = ? AND start_date < ? AND end_date > ?
--                   AND status NOT IN ('CANCELLED','EXPIRED','COMPLETED')
--    This is called inside sp_create_booking and the availability view.
CREATE INDEX idx_bookings_vehicle_dates
    ON bookings (vehicle_id, start_date, end_date);

-- 2. Customer rental history page — list all bookings for a customer.
CREATE INDEX idx_bookings_customer_id
    ON bookings (customer_id);

-- 3. Filter bookings by status (e.g., all CONFIRMED bookings for the fleet manager).
CREATE INDEX idx_bookings_status
    ON bookings (status);

-- ---------------------------------------------------------------------------
-- RENTALS
-- ---------------------------------------------------------------------------

-- 4. Find all active rentals quickly (dashboard KPI card).
CREATE INDEX idx_rentals_status
    ON rentals (status);

-- 5. Lookup rental by booking_id (unique, but named for clarity in EXPLAIN plans).
--    The UNIQUE constraint already creates an index — so we add a separate one
--    only for covering queries that need both booking_id and rental_id.
--    Actually: the existing UNIQUE index on booking_id covers this.
--    No extra index needed here.

-- ---------------------------------------------------------------------------
-- PAYMENTS
-- ---------------------------------------------------------------------------

-- 6. Total revenue per rental, or list payments for a rental.
CREATE INDEX idx_payments_rental_id
    ON payments (rental_id);

-- 7. Find pending payments across the system (admin dashboard).
CREATE INDEX idx_payments_status
    ON payments (status);

-- ---------------------------------------------------------------------------
-- DAMAGE REPORTS
-- ---------------------------------------------------------------------------

-- 8. All damage reports for a vehicle (vehicle damage history view).
CREATE INDEX idx_damage_vehicle_id
    ON damage_reports (vehicle_id);

-- 9. Unresolved damage reports — used to compute vehicle health and alert staff.
CREATE INDEX idx_damage_unresolved
    ON damage_reports (is_resolved, vehicle_id);

-- ---------------------------------------------------------------------------
-- MAINTENANCE
-- ---------------------------------------------------------------------------

-- 10. All maintenance tasks for a vehicle (vehicle maintenance history).
CREATE INDEX idx_maintenance_vehicle_id
    ON maintenance (vehicle_id);

-- 11. Open/in-progress maintenance tasks — used in fleet manager dashboard.
CREATE INDEX idx_maintenance_status
    ON maintenance (status);

-- 12. Maintenance tasks assigned to a staff member.
CREATE INDEX idx_maintenance_assigned_to
    ON maintenance (assigned_to);

-- ---------------------------------------------------------------------------
-- VEHICLE INSPECTIONS
-- ---------------------------------------------------------------------------

-- 13. Latest inspection for a vehicle — used in health score computation.
--     Query: WHERE vehicle_id = ? ORDER BY inspected_at DESC LIMIT 1
CREATE INDEX idx_inspections_vehicle_date
    ON vehicle_inspections (vehicle_id, inspected_at DESC);

-- ---------------------------------------------------------------------------
-- REVIEWS
-- ---------------------------------------------------------------------------

-- 14. All reviews for a vehicle (average rating computation in view).
CREATE INDEX idx_reviews_vehicle_id
    ON reviews (vehicle_id);

-- 15. All reviews by a customer (customer history page).
CREATE INDEX idx_reviews_customer_id
    ON reviews (customer_id);

-- ---------------------------------------------------------------------------
-- WAITLIST
-- ---------------------------------------------------------------------------

-- 16. Find WAITING entries for a specific vehicle — used by sp_promote_waitlist.
--     Query: WHERE vehicle_id = ? AND status = 'WAITING' ORDER BY queued_at ASC
CREATE INDEX idx_waitlist_vehicle_status
    ON waitlist (vehicle_id, status, queued_at);

-- 17. Customer's own waitlist entries.
CREATE INDEX idx_waitlist_customer_id
    ON waitlist (customer_id);

-- ---------------------------------------------------------------------------
-- NOTIFICATIONS
-- ---------------------------------------------------------------------------

-- 18. Fetch all unread notifications for a user — the notification bell.
--     Query: WHERE user_id = ? AND is_read = FALSE ORDER BY created_at DESC
CREATE INDEX idx_notifications_user_read
    ON notifications (user_id, is_read, created_at DESC);

-- ---------------------------------------------------------------------------
-- SYSTEM LOGS  (audit trail)
-- ---------------------------------------------------------------------------

-- 19. Look up all log entries for a specific entity (e.g., booking_id = 42).
CREATE INDEX idx_syslog_entity
    ON system_logs (entity_type, entity_id);

-- 20. All actions by a specific actor.
CREATE INDEX idx_syslog_actor
    ON system_logs (actor_id);

-- 21. Time-range queries on audit log (admin audit page).
CREATE INDEX idx_syslog_performed_at
    ON system_logs (performed_at);

-- ---------------------------------------------------------------------------
-- LOYALTY TRANSACTIONS
-- ---------------------------------------------------------------------------

-- 22. All transactions for a loyalty account (loyalty history page).
CREATE INDEX idx_loyalty_txn_account
    ON loyalty_transactions (loyalty_id, created_at DESC);

-- ---------------------------------------------------------------------------
-- VEHICLE HEALTH SNAPSHOTS
-- ---------------------------------------------------------------------------

-- 23. Health trend for a vehicle over time (fleet analytics chart).
CREATE INDEX idx_hs_vehicle_time
    ON vehicle_health_snapshots (vehicle_id, recorded_at DESC);

-- ---------------------------------------------------------------------------
-- VEHICLES
-- ---------------------------------------------------------------------------

-- 24. Filter vehicles by status — very common in availability queries.
CREATE INDEX idx_vehicles_status
    ON vehicles (status);

-- 25. Filter vehicles by category (search by type).
CREATE INDEX idx_vehicles_category
    ON vehicles (category_id);

-- 26. Filter by status + category (combined search with type filter).
CREATE INDEX idx_vehicles_status_category
    ON vehicles (status, category_id);

-- =============================================================================
-- END OF INDEXES
-- =============================================================================
