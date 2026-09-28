-- =============================================================================
-- VeloRent — Intelligent Vehicle Rental and Fleet Management System
-- FILE: 05_functions.sql
-- PURPOSE: Stored functions that return computed scalar values.
--
-- WHY FUNCTIONS (vs. procedures):
--   Functions return a single value and can be called inline inside SELECT,
--   WHERE, or SET statements. Procedures cannot.
--   We use functions for reusable computed values that are:
--   (a) needed inside views or other queries
--   (b) needed by stored procedures as helper computations
--   (c) needed by C++ code via SELECT fn_name(?)
--
--   The C++ engines (HealthScoringEngine, RiskEngine, etc.) use these as a
--   lightweight alternative to fetching raw data and computing in C++.
--   The C++ engine can choose: compute locally OR call the SQL function.
--
-- DETERMINISM:
--   Functions are declared NOT DETERMINISTIC because they read from tables.
--   READS SQL DATA is used instead of MODIFIES SQL DATA.
--
-- RUN AFTER: 01_schema.sql, 02_indexes.sql
-- =============================================================================

USE velorent;

DELIMITER $$

-- ---------------------------------------------------------------------------
-- 1. fn_compute_health_score(p_vehicle_id)
-- ---------------------------------------------------------------------------
-- Returns a computed vehicle health score (0–100) based on:
--   A. Mileage since last routine maintenance (−points per 1000 km over 5000).
--   B. Days since last inspection (−2 points per week over 4 weeks).
--   C. Open MINOR damage reports (−5 each).
--   D. Open MODERATE damage reports (−10 each).
--   E. Open SEVERE damage reports (−20 each).
--   F. Vehicle age in years (−1 per year over 5 years).
--
-- Result is clamped to [0, 100].
--
-- NOTE: The C++ HealthScoringEngine also has its own version of this formula.
--       This SQL function is the "database replica" used in triggers and views.
--       Both must stay in sync with the shared formula definition.
-- ---------------------------------------------------------------------------
DROP FUNCTION IF EXISTS fn_compute_health_score$$

CREATE FUNCTION fn_compute_health_score(p_vehicle_id INT)
RETURNS DECIMAL(5,2)
READS SQL DATA
NOT DETERMINISTIC
BEGIN
    DECLARE v_base_score        DECIMAL(8,2) DEFAULT 100.00;
    DECLARE v_last_maint_km     INT          DEFAULT 0;
    DECLARE v_current_km        INT          DEFAULT 0;
    DECLARE v_km_since_service  INT          DEFAULT 0;
    DECLARE v_last_insp_days    INT          DEFAULT 0;
    DECLARE v_open_minor        INT          DEFAULT 0;
    DECLARE v_open_moderate     INT          DEFAULT 0;
    DECLARE v_open_severe       INT          DEFAULT 0;
    DECLARE v_vehicle_age_yrs   INT          DEFAULT 0;
    DECLARE v_maint_deduction   DECIMAL(8,2) DEFAULT 0.00;
    DECLARE v_insp_deduction    DECIMAL(8,2) DEFAULT 0.00;
    DECLARE v_damage_deduction  DECIMAL(8,2) DEFAULT 0.00;
    DECLARE v_age_deduction     DECIMAL(8,2) DEFAULT 0.00;
    DECLARE v_final_score       DECIMAL(5,2);

    -- A. Mileage since last completed routine maintenance.
    SELECT COALESCE(m.total_cost, 0), v.odometer_km, v.purchase_year
    INTO   v_last_maint_km, v_current_km, v_vehicle_age_yrs
    FROM   vehicles v
    LEFT JOIN maintenance m ON m.vehicle_id = v.vehicle_id
        AND m.maintenance_type = 'ROUTINE'
        AND m.status = 'COMPLETED'
    WHERE  v.vehicle_id = p_vehicle_id
    ORDER BY m.completed_at DESC
    LIMIT 1;

    -- Simpler km approximation: use current odometer.
    SET v_km_since_service = v_current_km;

    -- Deduct 2 points per 1000 km beyond 5000 km without service.
    IF v_km_since_service > 5000 THEN
        SET v_maint_deduction = FLOOR((v_km_since_service - 5000) / 1000) * 2.0;
    END IF;

    -- B. Days since last inspection.
    SELECT COALESCE(DATEDIFF(NOW(), MAX(inspected_at)), 999)
    INTO   v_last_insp_days
    FROM   vehicle_inspections
    WHERE  vehicle_id = p_vehicle_id;

    -- Deduct 2 points per week (7 days) beyond 4 weeks (28 days).
    IF v_last_insp_days > 28 THEN
        SET v_insp_deduction = FLOOR((v_last_insp_days - 28) / 7) * 2.0;
    END IF;

    -- C. Open damage reports by severity.
    SELECT
        SUM(severity = 'MINOR'),
        SUM(severity = 'MODERATE'),
        SUM(severity = 'SEVERE')
    INTO v_open_minor, v_open_moderate, v_open_severe
    FROM damage_reports
    WHERE vehicle_id = p_vehicle_id
      AND is_resolved = FALSE;

    SET v_open_minor    = COALESCE(v_open_minor, 0);
    SET v_open_moderate = COALESCE(v_open_moderate, 0);
    SET v_open_severe   = COALESCE(v_open_severe, 0);

    SET v_damage_deduction = (v_open_minor * 5.0)
                           + (v_open_moderate * 10.0)
                           + (v_open_severe * 20.0);

    -- D. Vehicle age deduction.
    SET v_vehicle_age_yrs = YEAR(NOW()) - v_vehicle_age_yrs;
    IF v_vehicle_age_yrs > 5 THEN
        SET v_age_deduction = (v_vehicle_age_yrs - 5) * 1.0;
    END IF;

    -- Compute final score.
    SET v_final_score = v_base_score
                      - v_maint_deduction
                      - v_insp_deduction
                      - v_damage_deduction
                      - v_age_deduction;

    -- Clamp to [0, 100].
    RETURN GREATEST(0.00, LEAST(100.00, v_final_score));
END$$


-- ---------------------------------------------------------------------------
-- 2. fn_compute_risk_score(p_customer_id)
-- ---------------------------------------------------------------------------
-- Returns a customer risk score (0–100) based on:
--   A. Cancellation rate (cancellations / total bookings × 40).
--   B. Late return rate (overdue rentals / total rentals × 30).
--   C. Unresolved damage reports × 10.
--   D. Failed payments × 5 each.
--
-- Higher score = higher risk.
-- The C++ RiskEngine also computes this; the SQL function is used in the
-- v_customer_rental_history view and in admin queries.
-- ---------------------------------------------------------------------------
DROP FUNCTION IF EXISTS fn_compute_risk_score$$

CREATE FUNCTION fn_compute_risk_score(p_customer_id INT)
RETURNS DECIMAL(5,2)
READS SQL DATA
NOT DETERMINISTIC
BEGIN
    DECLARE v_total_bookings        INT          DEFAULT 0;
    DECLARE v_cancelled_bookings    INT          DEFAULT 0;
    DECLARE v_total_rentals         INT          DEFAULT 0;
    DECLARE v_overdue_rentals       INT          DEFAULT 0;
    DECLARE v_unresolved_damage     INT          DEFAULT 0;
    DECLARE v_failed_payments       INT          DEFAULT 0;
    DECLARE v_cancel_rate           DECIMAL(5,4) DEFAULT 0.0;
    DECLARE v_late_rate             DECIMAL(5,4) DEFAULT 0.0;
    DECLARE v_risk_score            DECIMAL(8,2);

    -- A. Booking stats.
    SELECT
        COUNT(*),
        SUM(status = 'CANCELLED')
    INTO v_total_bookings, v_cancelled_bookings
    FROM bookings
    WHERE customer_id = p_customer_id;

    IF v_total_bookings > 0 THEN
        SET v_cancel_rate = v_cancelled_bookings / v_total_bookings;
    END IF;

    -- B. Rental stats.
    SELECT
        COUNT(*),
        SUM(r.status = 'OVERDUE')
    INTO v_total_rentals, v_overdue_rentals
    FROM rentals r
    JOIN bookings b ON r.booking_id = b.booking_id
    WHERE b.customer_id = p_customer_id;

    IF v_total_rentals > 0 THEN
        SET v_late_rate = v_overdue_rentals / v_total_rentals;
    END IF;

    -- C. Unresolved damage reports linked to this customer's rentals.
    SELECT COUNT(*)
    INTO   v_unresolved_damage
    FROM   damage_reports dr
    JOIN   rentals r  ON dr.rental_id = r.rental_id
    JOIN   bookings b ON r.booking_id = b.booking_id
    WHERE  b.customer_id  = p_customer_id
      AND  dr.is_resolved = FALSE;

    -- D. Failed payments.
    SELECT COUNT(*)
    INTO   v_failed_payments
    FROM   payments p
    JOIN   rentals r  ON p.rental_id  = r.rental_id
    JOIN   bookings b ON r.booking_id = b.booking_id
    WHERE  b.customer_id = p_customer_id
      AND  p.status      = 'FAILED';

    -- Weighted risk score.
    SET v_risk_score = (v_cancel_rate * 40)
                     + (v_late_rate   * 30)
                     + (LEAST(v_unresolved_damage, 3) * 10)
                     + (LEAST(v_failed_payments, 4)   * 5);

    RETURN GREATEST(0.00, LEAST(100.00, ROUND(v_risk_score, 2)));
END$$


-- ---------------------------------------------------------------------------
-- 3. fn_loyalty_tier(p_total_points_earned)
-- ---------------------------------------------------------------------------
-- Pure function — given the total points earned, returns the correct tier.
-- Tier thresholds:
--   BRONZE:   0 – 999
--   SILVER:   1000 – 4999
--   GOLD:     5000 – 14999
--   PLATINUM: 15000+
-- ---------------------------------------------------------------------------
DROP FUNCTION IF EXISTS fn_loyalty_tier$$

CREATE FUNCTION fn_loyalty_tier(p_total_points_earned INT)
RETURNS VARCHAR(10)
DETERMINISTIC
NO SQL
BEGIN
    IF p_total_points_earned >= 15000 THEN
        RETURN 'PLATINUM';
    ELSEIF p_total_points_earned >= 5000 THEN
        RETURN 'GOLD';
    ELSEIF p_total_points_earned >= 1000 THEN
        RETURN 'SILVER';
    ELSE
        RETURN 'BRONZE';
    END IF;
END$$


-- ---------------------------------------------------------------------------
-- 4. fn_calculate_late_fee(p_rental_id)
-- ---------------------------------------------------------------------------
-- Returns the late fee in INR for a rental.
-- Late fee = 1.5 × daily rate × number of overdue days.
-- Returns 0 if the rental is not overdue or end_date is NULL.
-- ---------------------------------------------------------------------------
DROP FUNCTION IF EXISTS fn_calculate_late_fee$$

CREATE FUNCTION fn_calculate_late_fee(p_rental_id INT)
RETURNS DECIMAL(12,2)
READS SQL DATA
NOT DETERMINISTIC
BEGIN
    DECLARE v_booked_end_date   DATE;
    DECLARE v_actual_end        DATETIME;
    DECLARE v_daily_rate        DECIMAL(12,2);
    DECLARE v_overdue_days      INT DEFAULT 0;

    SELECT b.end_date, r.actual_end, v.base_rate_per_day
    INTO   v_booked_end_date, v_actual_end, v_daily_rate
    FROM   rentals r
    JOIN   bookings b  ON r.booking_id  = b.booking_id
    JOIN   vehicles v  ON b.vehicle_id  = v.vehicle_id
    WHERE  r.rental_id = p_rental_id;

    IF v_actual_end IS NULL THEN
        -- Vehicle not yet returned — calculate against NOW().
        SET v_overdue_days = GREATEST(0, DATEDIFF(NOW(), v_booked_end_date));
    ELSE
        SET v_overdue_days = GREATEST(0, DATEDIFF(DATE(v_actual_end), v_booked_end_date));
    END IF;

    IF v_overdue_days = 0 THEN
        RETURN 0.00;
    END IF;

    RETURN ROUND(v_daily_rate * 1.5 * v_overdue_days, 2);
END$$


-- ---------------------------------------------------------------------------
-- 5. fn_vehicle_utilisation_rate(p_vehicle_id, p_days)
-- ---------------------------------------------------------------------------
-- Returns the utilisation rate (0–100) for a vehicle over the last p_days.
-- Utilisation = total rented days in window / p_days × 100.
-- ---------------------------------------------------------------------------
DROP FUNCTION IF EXISTS fn_vehicle_utilisation_rate$$

CREATE FUNCTION fn_vehicle_utilisation_rate(p_vehicle_id INT, p_days INT)
RETURNS DECIMAL(5,2)
READS SQL DATA
NOT DETERMINISTIC
BEGIN
    DECLARE v_rented_days   DECIMAL(10,2) DEFAULT 0;
    DECLARE v_window_start  DATETIME;

    SET v_window_start = DATE_SUB(NOW(), INTERVAL p_days DAY);

    SELECT COALESCE(
        SUM(
            DATEDIFF(
                LEAST(COALESCE(r.actual_end, NOW()), NOW()),
                GREATEST(r.actual_start, v_window_start)
            )
        ), 0
    )
    INTO v_rented_days
    FROM rentals r
    JOIN bookings b ON r.booking_id = b.booking_id
    WHERE b.vehicle_id  = p_vehicle_id
      AND r.actual_start < NOW()
      AND r.actual_start >= v_window_start;

    RETURN LEAST(100.00, ROUND((v_rented_days / p_days) * 100, 2));
END$$


-- ---------------------------------------------------------------------------
-- 6. fn_demand_factor(p_vehicle_id)
-- ---------------------------------------------------------------------------
-- Returns a demand multiplier for a vehicle based on how many bookings it
-- has received in the last 7 days relative to the fleet average.
--
-- Scale:
--   < 0.5× fleet avg  → 0.90  (low demand discount)
--   0.5–1.0× avg      → 1.00  (normal)
--   1.0–2.0× avg      → 1.15  (moderate demand)
--   > 2.0× avg        → 1.30  (high demand)
--
-- The C++ PricingEngine calls SELECT fn_demand_factor(vehicle_id) to get
-- this value before computing the final quoted price.
-- ---------------------------------------------------------------------------
DROP FUNCTION IF EXISTS fn_demand_factor$$

CREATE FUNCTION fn_demand_factor(p_vehicle_id INT)
RETURNS DECIMAL(5,3)
READS SQL DATA
NOT DETERMINISTIC
BEGIN
    DECLARE v_vehicle_bookings  INT          DEFAULT 0;
    DECLARE v_fleet_avg         DECIMAL(8,4) DEFAULT 1.0;
    DECLARE v_ratio             DECIMAL(8,4) DEFAULT 1.0;

    -- Bookings for this vehicle in the last 7 days.
    SELECT COUNT(*)
    INTO   v_vehicle_bookings
    FROM   bookings
    WHERE  vehicle_id  = p_vehicle_id
      AND  created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      AND  status NOT IN ('CANCELLED', 'EXPIRED');

    -- Average bookings per vehicle across the whole fleet in the last 7 days.
    SELECT AVG(cnt)
    INTO   v_fleet_avg
    FROM (
        SELECT vehicle_id, COUNT(*) AS cnt
        FROM   bookings
        WHERE  created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
          AND  status NOT IN ('CANCELLED', 'EXPIRED')
        GROUP BY vehicle_id
    ) sub;

    -- Protect against division by zero if fleet avg is 0.
    IF COALESCE(v_fleet_avg, 0) = 0 THEN
        RETURN 1.000;
    END IF;

    SET v_ratio = v_vehicle_bookings / v_fleet_avg;

    IF v_ratio < 0.5 THEN
        RETURN 0.900;
    ELSEIF v_ratio < 1.0 THEN
        RETURN 1.000;
    ELSEIF v_ratio < 2.0 THEN
        RETURN 1.150;
    ELSE
        RETURN 1.300;
    END IF;
END$$


DELIMITER ;

-- =============================================================================
-- END OF FUNCTIONS
-- =============================================================================
