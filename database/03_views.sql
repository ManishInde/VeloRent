-- =============================================================================
-- VeloRent — Intelligent Vehicle Rental and Fleet Management System
-- FILE: 03_views.sql
-- PURPOSE: Create all SQL views.
--
-- VIEWS are named with a v_ prefix for immediate recognition.
-- They are read-only abstractions — no DML through views.
-- The C++ Data Access Layer uses these views in its SELECT queries
-- instead of writing the same JOIN logic repeatedly.
--
-- RUN AFTER: 01_schema.sql, 02_indexes.sql
-- =============================================================================

USE velorent;

-- ---------------------------------------------------------------------------
-- 1. v_available_vehicles
-- ---------------------------------------------------------------------------
-- Lists all vehicles currently in AVAILABLE status with their category name,
-- average rating, and current health score. Used on the search/booking page.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE VIEW v_available_vehicles AS
SELECT
    v.vehicle_id,
    v.registration_no,
    v.brand,
    v.model,
    vc.category_name,
    v.fuel_type,
    v.transmission,
    v.seats,
    v.purchase_year,
    v.colour,
    v.base_rate_per_day,
    v.odometer_km,
    v.health_score,
    v.status,
    -- Average rating from completed reviews (NULL if no reviews yet).
    ROUND(AVG(r.rating), 2)         AS avg_rating,
    COUNT(r.review_id)              AS total_reviews
FROM vehicles v
JOIN vehicle_categories vc  ON v.category_id = vc.category_id
LEFT JOIN reviews r         ON v.vehicle_id  = r.vehicle_id
WHERE v.status = 'AVAILABLE'
  AND v.health_score >= 40.00   -- Do not offer dangerously low-health vehicles
GROUP BY
    v.vehicle_id, v.registration_no, v.brand, v.model,
    vc.category_name, v.fuel_type, v.transmission, v.seats,
    v.purchase_year, v.colour, v.base_rate_per_day,
    v.odometer_km, v.health_score, v.status;


-- ---------------------------------------------------------------------------
-- 2. v_active_bookings
-- ---------------------------------------------------------------------------
-- All bookings in PENDING or CONFIRMED status — the operational dashboard
-- for admins and fleet managers.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE VIEW v_active_bookings AS
SELECT
    b.booking_id,
    b.status                        AS booking_status,
    b.start_date,
    b.end_date,
    DATEDIFF(b.end_date, b.start_date) AS duration_days,
    b.quoted_price,
    b.demand_factor,
    b.created_at                    AS booked_at,
    -- Customer info
    u.full_name                     AS customer_name,
    u.email                         AS customer_email,
    u.phone                         AS customer_phone,
    -- Vehicle info
    v.registration_no,
    v.brand,
    v.model,
    vc.category_name
FROM bookings b
JOIN customers c            ON b.customer_id    = c.customer_id
JOIN users u                ON c.customer_id    = u.user_id
JOIN vehicles v             ON b.vehicle_id     = v.vehicle_id
JOIN vehicle_categories vc  ON v.category_id    = vc.category_id
WHERE b.status IN ('PENDING', 'CONFIRMED');


-- ---------------------------------------------------------------------------
-- 3. v_active_rentals
-- ---------------------------------------------------------------------------
-- All currently ACTIVE or OVERDUE rentals with customer and vehicle details.
-- Used by the admin dashboard and by the return workflow.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE VIEW v_active_rentals AS
SELECT
    r.rental_id,
    r.status                        AS rental_status,
    r.actual_start,
    r.start_odometer,
    -- Days since rental started (how long has the customer had the vehicle).
    DATEDIFF(NOW(), r.actual_start) AS days_elapsed,
    -- Booked end date for reference.
    b.end_date                      AS booked_return_date,
    b.quoted_price,
    -- Customer
    u.full_name                     AS customer_name,
    u.phone                         AS customer_phone,
    -- Vehicle
    v.vehicle_id,
    v.registration_no,
    v.brand,
    v.model,
    vc.category_name
FROM rentals r
JOIN bookings b             ON r.booking_id     = b.booking_id
JOIN customers c            ON b.customer_id    = c.customer_id
JOIN users u                ON c.customer_id    = u.user_id
JOIN vehicles v             ON b.vehicle_id     = v.vehicle_id
JOIN vehicle_categories vc  ON v.category_id    = vc.category_id
WHERE r.status IN ('ACTIVE', 'OVERDUE');


-- ---------------------------------------------------------------------------
-- 4. v_customer_rental_history
-- ---------------------------------------------------------------------------
-- Full rental history per customer including payment totals.
-- Used on the customer profile page and by the C++ RiskEngine.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE VIEW v_customer_rental_history AS
SELECT
    c.customer_id,
    u.full_name                     AS customer_name,
    u.email,
    la.tier                         AS loyalty_tier,
    c.risk_label,
    b.booking_id,
    b.start_date,
    b.end_date,
    b.status                        AS booking_status,
    v.registration_no,
    v.brand,
    v.model,
    vc.category_name,
    r.rental_id,
    r.actual_start,
    r.actual_end,
    r.status                        AS rental_status,
    -- Total amount paid for this rental (sum across all payment records).
    COALESCE(SUM(p.amount), 0)      AS total_paid,
    COUNT(dr.report_id)             AS damage_reports_count
FROM customers c
JOIN users u                ON c.customer_id    = u.user_id
LEFT JOIN loyalty_accounts la ON c.customer_id  = la.customer_id
JOIN bookings b             ON c.customer_id    = b.customer_id
JOIN vehicles v             ON b.vehicle_id     = v.vehicle_id
JOIN vehicle_categories vc  ON v.category_id    = vc.category_id
LEFT JOIN rentals r         ON b.booking_id     = r.booking_id
LEFT JOIN payments p        ON r.rental_id      = p.rental_id
                           AND p.status = 'COMPLETED'
LEFT JOIN damage_reports dr ON r.rental_id      = dr.rental_id
GROUP BY
    c.customer_id, u.full_name, u.email, la.tier, c.risk_label,
    b.booking_id, b.start_date, b.end_date, b.status,
    v.registration_no, v.brand, v.model, vc.category_name,
    r.rental_id, r.actual_start, r.actual_end, r.status;


-- ---------------------------------------------------------------------------
-- 5. v_vehicle_rental_history
-- ---------------------------------------------------------------------------
-- All completed rentals for each vehicle — used in fleet analytics and
-- vehicle health/utilisation computation.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE VIEW v_vehicle_rental_history AS
SELECT
    v.vehicle_id,
    v.registration_no,
    v.brand,
    v.model,
    vc.category_name,
    b.booking_id,
    b.start_date,
    b.end_date,
    b.status                        AS booking_status,
    u.full_name                     AS customer_name,
    r.rental_id,
    r.actual_start,
    r.actual_end,
    r.start_odometer,
    r.end_odometer,
    COALESCE(r.end_odometer - r.start_odometer, 0) AS km_driven,
    r.status                        AS rental_status,
    COALESCE(SUM(p.amount), 0)      AS revenue_earned
FROM vehicles v
JOIN vehicle_categories vc  ON v.category_id    = vc.category_id
JOIN bookings b             ON v.vehicle_id     = b.vehicle_id
JOIN customers c            ON b.customer_id    = c.customer_id
JOIN users u                ON c.customer_id    = u.user_id
LEFT JOIN rentals r         ON b.booking_id     = r.booking_id
LEFT JOIN payments p        ON r.rental_id      = p.rental_id
                           AND p.status = 'COMPLETED'
GROUP BY
    v.vehicle_id, v.registration_no, v.brand, v.model, vc.category_name,
    b.booking_id, b.start_date, b.end_date, b.status,
    u.full_name, r.rental_id, r.actual_start, r.actual_end,
    r.start_odometer, r.end_odometer, r.status;


-- ---------------------------------------------------------------------------
-- 6. v_fleet_utilisation
-- ---------------------------------------------------------------------------
-- Per-vehicle utilisation over the last 30 days.
-- Utilisation = days rented / 30 × 100 (as a percentage).
-- Used by the C++ FleetIntelligenceEngine and analytics dashboards.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE VIEW v_fleet_utilisation AS
SELECT
    v.vehicle_id,
    v.registration_no,
    v.brand,
    v.model,
    vc.category_name,
    v.status,
    v.health_score,
    -- Count distinct days the vehicle was rented in the last 30 days.
    -- We use the overlap of rental period and the 30-day window.
    COALESCE(
        SUM(
            DATEDIFF(
                LEAST(COALESCE(r.actual_end, NOW()), NOW()),
                GREATEST(r.actual_start, DATE_SUB(NOW(), INTERVAL 30 DAY))
            )
        ), 0
    )                               AS rented_days_last_30,
    ROUND(
        COALESCE(
            SUM(
                DATEDIFF(
                    LEAST(COALESCE(r.actual_end, NOW()), NOW()),
                    GREATEST(r.actual_start, DATE_SUB(NOW(), INTERVAL 30 DAY))
                )
            ), 0
        ) / 30.0 * 100, 2
    )                               AS utilisation_pct_30d,
    COALESCE(SUM(p.amount), 0)      AS revenue_last_30d,
    COUNT(DISTINCT r.rental_id)     AS rentals_last_30d
FROM vehicles v
JOIN vehicle_categories vc      ON v.category_id    = vc.category_id
LEFT JOIN bookings b            ON v.vehicle_id     = b.vehicle_id
    AND b.status IN ('COMPLETED', 'CONFIRMED')
LEFT JOIN rentals r             ON b.booking_id     = r.booking_id
    AND r.actual_start >= DATE_SUB(NOW(), INTERVAL 30 DAY)
LEFT JOIN payments p            ON r.rental_id      = p.rental_id
    AND p.status = 'COMPLETED'
WHERE v.status != 'INACTIVE'
GROUP BY
    v.vehicle_id, v.registration_no, v.brand, v.model,
    vc.category_name, v.status, v.health_score;


-- ---------------------------------------------------------------------------
-- 7. v_vehicle_revenue
-- ---------------------------------------------------------------------------
-- Revenue summary per vehicle — for the fleet analytics revenue chart.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE VIEW v_vehicle_revenue AS
SELECT
    v.vehicle_id,
    v.registration_no,
    v.brand,
    v.model,
    vc.category_name,
    v.base_rate_per_day,
    COUNT(DISTINCT r.rental_id)     AS total_rentals,
    COALESCE(SUM(p.amount), 0)      AS total_revenue,
    ROUND(AVG(rev.rating), 2)       AS avg_rating,
    -- Total maintenance cost for this vehicle.
    COALESCE(SUM(m.total_cost), 0)  AS total_maintenance_cost,
    -- Profit approximation = revenue − maintenance costs.
    COALESCE(SUM(p.amount), 0)
        - COALESCE(SUM(m.total_cost), 0)
                                    AS estimated_profit
FROM vehicles v
JOIN vehicle_categories vc      ON v.category_id    = vc.category_id
LEFT JOIN bookings b            ON v.vehicle_id     = b.vehicle_id
LEFT JOIN rentals r             ON b.booking_id     = r.booking_id
LEFT JOIN payments p            ON r.rental_id      = p.rental_id
    AND p.status = 'COMPLETED'
LEFT JOIN reviews rev           ON v.vehicle_id     = rev.vehicle_id
LEFT JOIN maintenance m         ON v.vehicle_id     = m.vehicle_id
    AND m.status = 'COMPLETED'
GROUP BY
    v.vehicle_id, v.registration_no, v.brand, v.model,
    vc.category_name, v.base_rate_per_day;


-- ---------------------------------------------------------------------------
-- 8. v_customer_spending
-- ---------------------------------------------------------------------------
-- Total spending per customer. Used in admin reporting and the C++ RiskEngine.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE VIEW v_customer_spending AS
SELECT
    c.customer_id,
    u.full_name                     AS customer_name,
    u.email,
    u.phone,
    la.tier                         AS loyalty_tier,
    la.points_balance,
    c.risk_label,
    COUNT(DISTINCT b.booking_id)    AS total_bookings,
    COUNT(DISTINCT r.rental_id)     AS total_rentals,
    COALESCE(SUM(p.amount), 0)      AS total_spent,
    COALESCE(MAX(b.end_date), NULL) AS last_rental_date
FROM customers c
JOIN users u                ON c.customer_id    = u.user_id
LEFT JOIN loyalty_accounts la ON c.customer_id  = la.customer_id
LEFT JOIN bookings b        ON c.customer_id    = b.customer_id
LEFT JOIN rentals r         ON b.booking_id     = r.booking_id
LEFT JOIN payments p        ON r.rental_id      = p.rental_id
    AND p.status = 'COMPLETED'
GROUP BY
    c.customer_id, u.full_name, u.email, u.phone,
    la.tier, la.points_balance, c.risk_label;


-- ---------------------------------------------------------------------------
-- 9. v_maintenance_alerts
-- ---------------------------------------------------------------------------
-- Open and in-progress maintenance tasks — the fleet manager alert board.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE VIEW v_maintenance_alerts AS
SELECT
    m.maintenance_id,
    m.maintenance_type,
    m.priority,
    m.status,
    m.description,
    m.scheduled_date,
    m.created_at,
    -- Vehicle
    v.vehicle_id,
    v.registration_no,
    v.brand,
    v.model,
    v.health_score                  AS current_health_score,
    -- Assigned staff (may be NULL if not yet assigned).
    us.full_name                    AS assigned_staff_name,
    us.phone                        AS staff_phone,
    -- Linked damage report (if triggered by damage).
    dr.severity                     AS damage_severity,
    dr.estimated_cost               AS damage_estimated_cost
FROM maintenance m
JOIN vehicles v             ON m.vehicle_id         = v.vehicle_id
LEFT JOIN users us          ON m.assigned_to        = us.user_id
LEFT JOIN damage_reports dr ON m.damage_report_id   = dr.report_id
WHERE m.status IN ('OPEN', 'IN_PROGRESS')
ORDER BY
    CASE m.priority
        WHEN 'CRITICAL' THEN 1
        WHEN 'HIGH'     THEN 2
        WHEN 'MEDIUM'   THEN 3
        WHEN 'LOW'      THEN 4
    END,
    m.created_at ASC;


-- ---------------------------------------------------------------------------
-- 10. v_fleet_overview
-- ---------------------------------------------------------------------------
-- High-level fleet composition KPI — used on the admin/fleet manager dashboard.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE VIEW v_fleet_overview AS
SELECT
    vc.category_name,
    COUNT(v.vehicle_id)                             AS total_vehicles,
    SUM(v.status = 'AVAILABLE')                     AS available,
    SUM(v.status = 'RESERVED')                      AS reserved,
    SUM(v.status = 'RENTED')                        AS rented,
    SUM(v.status = 'MAINTENANCE')                   AS under_maintenance,
    SUM(v.status = 'INACTIVE')                      AS inactive,
    ROUND(AVG(v.health_score), 2)                   AS avg_health_score,
    ROUND(AVG(v.base_rate_per_day), 2)              AS avg_rate_per_day
FROM vehicles v
JOIN vehicle_categories vc ON v.category_id = vc.category_id
GROUP BY vc.category_id, vc.category_name
ORDER BY total_vehicles DESC;

-- =============================================================================
-- END OF VIEWS
-- =============================================================================
