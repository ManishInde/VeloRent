-- =============================================================================
-- VeloRent — Intelligent Vehicle Rental and Fleet Management System
-- FILE: 01_schema.sql
-- PURPOSE: Create the velorent database and all tables in dependency order.
--
-- EXECUTION ORDER: This file must be run first.
-- STANDARD: InnoDB, UTF8MB4, MySQL 8.x / 9.x compatible.
--
-- NORMALIZATION: All tables are designed to Third Normal Form (3NF).
--   1NF: Every column is atomic; no repeating groups.
--   2NF: All non-key attributes depend on the entire primary key.
--        All PKs are single-column surrogates, so partial dependency is impossible.
--   3NF: No transitive dependencies.
--        e.g. loyalty tier lives in loyalty_accounts, NOT in users.
--        e.g. vehicle health_score is stored per inspection/computed, NOT duplicated.
--
-- DESIGN DECISIONS:
--   - Single users table with a role discriminator. Role-specific detail
--     tables (customers, admins, fleet_managers, maintenance_staff) hold
--     role-specific attributes and reference users(user_id). This avoids
--     duplicating the common auth/contact columns across four tables.
--   - Monetary values use DECIMAL(12,2) — exact arithmetic for INR amounts.
--   - Timestamps use DATETIME (not TIMESTAMP) to avoid year-2038 overflow and
--     timezone auto-conversion surprises on the server.
--   - ENUMs are used for bounded, stable value sets. VARCHAR + CHECK is used
--     where the value set may need to be extended without ALTER TABLE.
--   - ON DELETE RESTRICT is the default for all FKs — we never silently delete
--     dependent data. The application layer handles cascade logic explicitly.
--   - vehicle_features is normalised: features are stored in a lookup table,
--     and vehicle_feature_mapping is the M:N junction table.
--   - pricing_rules is a configuration table that the C++ PricingEngine reads.
--     The engine applies the rules; MySQL stores them.
--   - system_logs is a generic audit table. The C++ AuditRepository writes here
--     on every significant state change.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 0. DATABASE
-- ---------------------------------------------------------------------------

DROP DATABASE IF EXISTS velorent;
CREATE DATABASE velorent
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE velorent;

-- ---------------------------------------------------------------------------
-- 1. USERS  (root entity — no FK dependencies)
-- ---------------------------------------------------------------------------
-- All four human actor types share this table for authentication.
-- Role-specific profile data lives in separate tables below.
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS users (
    user_id         INT             NOT NULL AUTO_INCREMENT,
    full_name       VARCHAR(100)    NOT NULL,
    email           VARCHAR(150)    NOT NULL,
    password_hash   VARCHAR(255)    NOT NULL,
    phone           VARCHAR(15)     NOT NULL,
    role            ENUM('CUSTOMER','ADMIN','FLEET_MANAGER','MAINTENANCE_STAFF')
                                    NOT NULL,
    is_active       BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME                 DEFAULT NULL
                                    ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT pk_users             PRIMARY KEY (user_id),
    CONSTRAINT uq_users_email       UNIQUE (email),
    CONSTRAINT uq_users_phone       UNIQUE (phone)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- 2. ROLE-SPECIFIC PROFILE TABLES
-- ---------------------------------------------------------------------------
-- These hold attributes that apply only to one role.
-- All reference users(user_id) with a 1:1 relationship enforced by UNIQUE.
-- ---------------------------------------------------------------------------

-- 2a. CUSTOMERS
CREATE TABLE IF NOT EXISTS customers (
    customer_id         INT             NOT NULL,   -- same as user_id
    date_of_birth       DATE                        DEFAULT NULL,
    driving_licence_no  VARCHAR(20)     NOT NULL,
    licence_expiry      DATE            NOT NULL,
    address             VARCHAR(300)                DEFAULT NULL,
    city                VARCHAR(80)                 DEFAULT NULL,
    state               VARCHAR(80)                 DEFAULT NULL,
    pincode             VARCHAR(10)                 DEFAULT NULL,
    -- Rental risk indicator — written by C++ RiskEngine, read by staff/admin.
    -- Stored here so it persists and can be queried without recomputing every time.
    -- The engine updates this periodically; it is NOT derived on-the-fly by SQL.
    risk_score          DECIMAL(5,2)    NOT NULL DEFAULT 0.00,
    risk_label          ENUM('LOW','MEDIUM','HIGH') NOT NULL DEFAULT 'LOW',

    CONSTRAINT pk_customers         PRIMARY KEY (customer_id),
    CONSTRAINT fk_customers_user    FOREIGN KEY (customer_id)
                                    REFERENCES users(user_id)
                                    ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT chk_risk_score       CHECK (risk_score BETWEEN 0.00 AND 100.00),
    CONSTRAINT uq_driving_licence   UNIQUE (driving_licence_no)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2b. ADMINS
CREATE TABLE IF NOT EXISTS admins (
    admin_id        INT             NOT NULL,   -- same as user_id
    department      VARCHAR(100)                DEFAULT NULL,
    employee_code   VARCHAR(30)     NOT NULL,

    CONSTRAINT pk_admins            PRIMARY KEY (admin_id),
    CONSTRAINT fk_admins_user       FOREIGN KEY (admin_id)
                                    REFERENCES users(user_id)
                                    ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT uq_admin_emp_code    UNIQUE (employee_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2c. FLEET MANAGERS
CREATE TABLE IF NOT EXISTS fleet_managers (
    manager_id      INT             NOT NULL,   -- same as user_id
    employee_code   VARCHAR(30)     NOT NULL,
    depot_location  VARCHAR(150)                DEFAULT NULL,

    CONSTRAINT pk_fleet_managers    PRIMARY KEY (manager_id),
    CONSTRAINT fk_fleet_mgr_user    FOREIGN KEY (manager_id)
                                    REFERENCES users(user_id)
                                    ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT uq_fm_emp_code       UNIQUE (employee_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2d. MAINTENANCE STAFF
CREATE TABLE IF NOT EXISTS maintenance_staff (
    staff_id            INT             NOT NULL,   -- same as user_id
    employee_code       VARCHAR(30)     NOT NULL,
    specialisation      VARCHAR(100)               DEFAULT NULL,
    -- e.g. 'Engine', 'Bodywork', 'Electrical', 'General'

    CONSTRAINT pk_maintenance_staff PRIMARY KEY (staff_id),
    CONSTRAINT fk_mstaff_user       FOREIGN KEY (staff_id)
                                    REFERENCES users(user_id)
                                    ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT uq_mstaff_emp_code   UNIQUE (employee_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- 3. VEHICLE CATEGORIES  (lookup — no FK dependencies)
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS vehicle_categories (
    category_id     INT             NOT NULL AUTO_INCREMENT,
    category_name   VARCHAR(50)     NOT NULL,
    -- e.g. 'Hatchback', 'Sedan', 'SUV', 'Luxury', 'Electric', 'Bike'
    description     VARCHAR(300)               DEFAULT NULL,
    -- Surcharge multiplier applied by the C++ PricingEngine for this category.
    surcharge_pct   DECIMAL(5,2)    NOT NULL DEFAULT 0.00,

    CONSTRAINT pk_vehicle_categories    PRIMARY KEY (category_id),
    CONSTRAINT uq_category_name         UNIQUE (category_name),
    CONSTRAINT chk_surcharge_pct        CHECK (surcharge_pct >= 0.00)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- 4. VEHICLES
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS vehicles (
    vehicle_id          INT             NOT NULL AUTO_INCREMENT,
    registration_no     VARCHAR(20)     NOT NULL,
    brand               VARCHAR(50)     NOT NULL,
    model               VARCHAR(50)     NOT NULL,
    category_id         INT             NOT NULL,
    fuel_type           ENUM('PETROL','DIESEL','ELECTRIC','HYBRID','CNG')
                                        NOT NULL,
    transmission        ENUM('MANUAL','AUTOMATIC')
                                        NOT NULL DEFAULT 'MANUAL',
    seats               TINYINT         NOT NULL DEFAULT 5,
    purchase_year       YEAR            NOT NULL,
    colour              VARCHAR(30)                DEFAULT NULL,
    -- Base rate per day in INR. Dynamic price is computed in C++ on top of this.
    base_rate_per_day   DECIMAL(12,2)   NOT NULL,
    -- Odometer in kilometres — updated on every rental return.
    odometer_km         INT             NOT NULL DEFAULT 0,
    -- Health score 0–100 — written by C++ HealthScoringEngine after each
    -- rental return or inspection. Stored so queries can filter/sort without
    -- recomputing every time.
    health_score        DECIMAL(5,2)    NOT NULL DEFAULT 100.00,
    status              ENUM('AVAILABLE','RESERVED','RENTED',
                             'MAINTENANCE','INACTIVE')
                                        NOT NULL DEFAULT 'AVAILABLE',
    added_by            INT             NOT NULL,   -- FK → fleet manager user_id
    created_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME                 DEFAULT NULL
                                        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT pk_vehicles              PRIMARY KEY (vehicle_id),
    CONSTRAINT uq_registration_no       UNIQUE (registration_no),
    CONSTRAINT fk_vehicles_category     FOREIGN KEY (category_id)
                                        REFERENCES vehicle_categories(category_id)
                                        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_vehicles_added_by     FOREIGN KEY (added_by)
                                        REFERENCES users(user_id)
                                        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT chk_base_rate            CHECK (base_rate_per_day > 0),
    CONSTRAINT chk_odometer             CHECK (odometer_km >= 0),
    CONSTRAINT chk_health_score         CHECK (health_score BETWEEN 0.00 AND 100.00),
    CONSTRAINT chk_seats                CHECK (seats BETWEEN 1 AND 20),
    CONSTRAINT chk_purchase_year        CHECK (purchase_year >= 2000)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- 5. VEHICLE FEATURES  (lookup — no FK dependencies)
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS vehicle_features (
    feature_id      INT             NOT NULL AUTO_INCREMENT,
    feature_name    VARCHAR(80)     NOT NULL,
    -- e.g. 'Air Conditioning', 'GPS Navigation', 'Bluetooth', 'Sunroof',
    --      'Rear Camera', 'Child Seat', 'Fast Charging Port'

    CONSTRAINT pk_vehicle_features  PRIMARY KEY (feature_id),
    CONSTRAINT uq_feature_name      UNIQUE (feature_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- 6. VEHICLE FEATURE MAPPING  (M:N junction)
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS vehicle_feature_mapping (
    vehicle_id      INT     NOT NULL,
    feature_id      INT     NOT NULL,

    CONSTRAINT pk_vfm               PRIMARY KEY (vehicle_id, feature_id),
    CONSTRAINT fk_vfm_vehicle       FOREIGN KEY (vehicle_id)
                                    REFERENCES vehicles(vehicle_id)
                                    ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_vfm_feature       FOREIGN KEY (feature_id)
                                    REFERENCES vehicle_features(feature_id)
                                    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- 7. LOYALTY ACCOUNTS  (1:1 with customers)
-- ---------------------------------------------------------------------------
-- Created automatically when a customer registers (via trigger or application).
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS loyalty_accounts (
    loyalty_id          INT     NOT NULL AUTO_INCREMENT,
    customer_id         INT     NOT NULL,
    points_balance      INT     NOT NULL DEFAULT 0,
    -- total_points_earned is NOT derived from transactions here because:
    --   (a) points can be awarded from multiple sources (rentals, promos)
    --   (b) querying the sum of all transactions every time would be expensive
    --   (c) it is needed instantly to compute loyalty tier upgrades
    -- This is a deliberate, documented denormalisation for performance.
    total_points_earned INT     NOT NULL DEFAULT 0,
    tier                ENUM('BRONZE','SILVER','GOLD','PLATINUM')
                                NOT NULL DEFAULT 'BRONZE',
    -- Tier thresholds (total_points_earned):
    --   BRONZE:   0 – 999
    --   SILVER:   1000 – 4999
    --   GOLD:     5000 – 14999
    --   PLATINUM: 15000+
    created_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME         DEFAULT NULL
                                ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT pk_loyalty_accounts  PRIMARY KEY (loyalty_id),
    CONSTRAINT uq_loyalty_customer  UNIQUE (customer_id),
    CONSTRAINT fk_loyalty_customer  FOREIGN KEY (customer_id)
                                    REFERENCES customers(customer_id)
                                    ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT chk_points_balance   CHECK (points_balance >= 0),
    CONSTRAINT chk_total_points     CHECK (total_points_earned >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- 8. LOYALTY TRANSACTIONS
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS loyalty_transactions (
    txn_id          INT             NOT NULL AUTO_INCREMENT,
    loyalty_id      INT             NOT NULL,
    txn_type        ENUM('EARN','REDEEM','ADJUST','EXPIRE')
                                    NOT NULL,
    points          INT             NOT NULL,
    -- Points value: positive for EARN/ADJUST credit, negative for REDEEM/EXPIRE.
    source          VARCHAR(100)               DEFAULT NULL,
    -- e.g. 'RENTAL_COMPLETE', 'PROMO_DIWALI', 'REDEMPTION_BOOKING_4521'
    reference_id    INT                        DEFAULT NULL,
    -- Refers to rental_id or booking_id depending on source. Not a hard FK
    -- because the source type varies — the application resolves the reference.
    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT pk_loyalty_txn       PRIMARY KEY (txn_id),
    CONSTRAINT fk_loyalty_txn_acct  FOREIGN KEY (loyalty_id)
                                    REFERENCES loyalty_accounts(loyalty_id)
                                    ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT chk_loyalty_points   CHECK (points != 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- 9. BOOKINGS
-- ---------------------------------------------------------------------------
-- A booking is a customer's reservation of a vehicle for a date range.
-- One customer + one vehicle + one non-overlapping date range.
-- Overlap prevention is enforced by sp_create_booking (procedure + app logic).
-- A partial overlap check at DB level would require a CHECK with a subquery,
-- which MySQL does not support. The procedure handles this atomically.
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS bookings (
    booking_id          INT             NOT NULL AUTO_INCREMENT,
    customer_id         INT             NOT NULL,
    vehicle_id          INT             NOT NULL,
    start_date          DATE            NOT NULL,
    end_date            DATE            NOT NULL,
    -- Quoted price at booking time (before dynamic adjustments are frozen).
    quoted_price        DECIMAL(12,2)   NOT NULL,
    -- Demand factor captured at booking time for audit/reproductibility.
    demand_factor       DECIMAL(5,3)    NOT NULL DEFAULT 1.000,
    status              ENUM('PENDING','CONFIRMED','CANCELLED',
                             'COMPLETED','EXPIRED')
                                        NOT NULL DEFAULT 'PENDING',
    -- Cancellation fields — populated only when status = CANCELLED.
    cancelled_at        DATETIME                 DEFAULT NULL,
    cancellation_reason VARCHAR(300)             DEFAULT NULL,
    created_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME                 DEFAULT NULL
                                        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT pk_bookings              PRIMARY KEY (booking_id),
    CONSTRAINT fk_bookings_customer     FOREIGN KEY (customer_id)
                                        REFERENCES customers(customer_id)
                                        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_bookings_vehicle      FOREIGN KEY (vehicle_id)
                                        REFERENCES vehicles(vehicle_id)
                                        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT chk_booking_dates        CHECK (end_date > start_date),
    CONSTRAINT chk_quoted_price         CHECK (quoted_price > 0),
    CONSTRAINT chk_demand_factor        CHECK (demand_factor > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- 10. RENTALS
-- ---------------------------------------------------------------------------
-- A rental is the physical event — vehicle is actually taken by the customer.
-- Derived from one booking. 1:1 relationship enforced by UNIQUE on booking_id.
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS rentals (
    rental_id           INT             NOT NULL AUTO_INCREMENT,
    booking_id          INT             NOT NULL,
    actual_start        DATETIME        NOT NULL,
    actual_end          DATETIME                 DEFAULT NULL,
    start_odometer      INT             NOT NULL,
    end_odometer        INT                      DEFAULT NULL,
    status              ENUM('ACTIVE','COMPLETED','OVERDUE','CANCELLED')
                                        NOT NULL DEFAULT 'ACTIVE',
    -- Final bill total is NOT stored here.
    -- It is computed as SUM of payments for this rental — avoids redundancy.
    -- Exception: if partial payments are allowed, SUM(payments) = total.
    notes               TEXT                     DEFAULT NULL,

    CONSTRAINT pk_rentals               PRIMARY KEY (rental_id),
    CONSTRAINT uq_rental_booking        UNIQUE (booking_id),
    CONSTRAINT fk_rentals_booking       FOREIGN KEY (booking_id)
                                        REFERENCES bookings(booking_id)
                                        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT chk_rental_odometer      CHECK (
        end_odometer IS NULL OR end_odometer >= start_odometer
    ),
    CONSTRAINT chk_rental_dates         CHECK (
        actual_end IS NULL OR actual_end > actual_start
    )
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- 11. PAYMENTS
-- ---------------------------------------------------------------------------
-- A rental can have multiple payment records (base rent + damage charge,
-- or partial payments via different methods).
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS payments (
    payment_id              INT             NOT NULL AUTO_INCREMENT,
    rental_id               INT             NOT NULL,
    amount                  DECIMAL(12,2)   NOT NULL,
    payment_method          ENUM('CASH','UPI','CARD','NET_BANKING',
                                 'LOYALTY_POINTS','WALLET')
                                            NOT NULL,
    payment_type            ENUM('BASE_RENT','DAMAGE_CHARGE','LATE_FEE',
                                 'DEPOSIT','REFUND','ADJUSTMENT')
                                            NOT NULL DEFAULT 'BASE_RENT',
    status                  ENUM('PENDING','COMPLETED','FAILED','REFUNDED')
                                            NOT NULL DEFAULT 'PENDING',
    loyalty_points_used     INT             NOT NULL DEFAULT 0,
    -- Loyalty points redeemed for this payment (1 point = ₹0.50 in sample config).
    transaction_ref         VARCHAR(100)             DEFAULT NULL,
    -- UPI transaction ID, card approval code, etc.
    paid_at                 DATETIME                 DEFAULT NULL,
    created_at              DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT pk_payments              PRIMARY KEY (payment_id),
    CONSTRAINT fk_payments_rental       FOREIGN KEY (rental_id)
                                        REFERENCES rentals(rental_id)
                                        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT chk_payment_amount       CHECK (amount != 0),
    -- amount is negative for REFUND records — so we check != 0, not > 0
    CONSTRAINT chk_loyalty_pts_used     CHECK (loyalty_points_used >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- 12. VEHICLE INSPECTIONS
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS vehicle_inspections (
    inspection_id       INT             NOT NULL AUTO_INCREMENT,
    vehicle_id          INT             NOT NULL,
    inspector_id        INT             NOT NULL,   -- FK → users(user_id)
    inspection_type     ENUM('PRE_RENTAL','POST_RENTAL','ROUTINE','DAMAGE')
                                        NOT NULL,
    -- Snapshot health score recorded at inspection time.
    health_score_given  DECIMAL(5,2)    NOT NULL,
    odometer_reading    INT             NOT NULL,
    passed              BOOLEAN         NOT NULL DEFAULT TRUE,
    notes               TEXT                     DEFAULT NULL,
    inspected_at        DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT pk_inspections           PRIMARY KEY (inspection_id),
    CONSTRAINT fk_insp_vehicle          FOREIGN KEY (vehicle_id)
                                        REFERENCES vehicles(vehicle_id)
                                        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_insp_inspector        FOREIGN KEY (inspector_id)
                                        REFERENCES users(user_id)
                                        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT chk_insp_health          CHECK (health_score_given BETWEEN 0 AND 100),
    CONSTRAINT chk_insp_odometer        CHECK (odometer_reading >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- 13. DAMAGE REPORTS
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS damage_reports (
    report_id           INT             NOT NULL AUTO_INCREMENT,
    rental_id           INT             NOT NULL,
    vehicle_id          INT             NOT NULL,
    reported_by         INT             NOT NULL,   -- FK → users(user_id)
    severity            ENUM('MINOR','MODERATE','SEVERE')
                                        NOT NULL,
    description         TEXT            NOT NULL,
    estimated_cost      DECIMAL(12,2)   NOT NULL DEFAULT 0.00,
    actual_repair_cost  DECIMAL(12,2)             DEFAULT NULL,
    is_resolved         BOOLEAN         NOT NULL DEFAULT FALSE,
    reported_at         DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    resolved_at         DATETIME                 DEFAULT NULL,

    CONSTRAINT pk_damage_reports        PRIMARY KEY (report_id),
    CONSTRAINT fk_dmg_rental            FOREIGN KEY (rental_id)
                                        REFERENCES rentals(rental_id)
                                        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_dmg_vehicle           FOREIGN KEY (vehicle_id)
                                        REFERENCES vehicles(vehicle_id)
                                        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_dmg_reporter          FOREIGN KEY (reported_by)
                                        REFERENCES users(user_id)
                                        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT chk_dmg_est_cost         CHECK (estimated_cost >= 0),
    CONSTRAINT chk_dmg_actual_cost      CHECK (actual_repair_cost IS NULL
                                              OR actual_repair_cost >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- 14. MAINTENANCE
-- ---------------------------------------------------------------------------
-- Replaces the two-table maintenance_requests + maintenance_logs approach
-- from the architecture doc. Here maintenance is a single table because:
--   - A maintenance event has one clear lifecycle (Open → In Progress → Done).
--   - Multiple log entries per maintenance task are captured in maintenance_logs.
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS maintenance (
    maintenance_id      INT             NOT NULL AUTO_INCREMENT,
    vehicle_id          INT             NOT NULL,
    -- Optional link to a damage report that triggered this maintenance.
    damage_report_id    INT                      DEFAULT NULL,
    maintenance_type    ENUM('ROUTINE','REPAIR','INSPECTION','EMERGENCY')
                                        NOT NULL,
    priority            ENUM('LOW','MEDIUM','HIGH','CRITICAL')
                                        NOT NULL DEFAULT 'MEDIUM',
    status              ENUM('OPEN','IN_PROGRESS','COMPLETED','CANCELLED')
                                        NOT NULL DEFAULT 'OPEN',
    -- Staff member assigned to this task.
    assigned_to         INT                      DEFAULT NULL,   -- FK → users
    -- Cost logged when completed.
    total_cost          DECIMAL(12,2)            DEFAULT NULL,
    description         TEXT                     DEFAULT NULL,
    scheduled_date      DATE                     DEFAULT NULL,
    started_at          DATETIME                 DEFAULT NULL,
    completed_at        DATETIME                 DEFAULT NULL,
    created_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT pk_maintenance           PRIMARY KEY (maintenance_id),
    CONSTRAINT fk_maint_vehicle         FOREIGN KEY (vehicle_id)
                                        REFERENCES vehicles(vehicle_id)
                                        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_maint_damage_rpt      FOREIGN KEY (damage_report_id)
                                        REFERENCES damage_reports(report_id)
                                        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_maint_assigned_to     FOREIGN KEY (assigned_to)
                                        REFERENCES users(user_id)
                                        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT chk_maint_cost           CHECK (total_cost IS NULL OR total_cost >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- 15. MAINTENANCE LOGS  (work diary entries per maintenance task)
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS maintenance_logs (
    log_id              INT             NOT NULL AUTO_INCREMENT,
    maintenance_id      INT             NOT NULL,
    staff_id            INT             NOT NULL,
    notes               TEXT            NOT NULL,
    parts_used          VARCHAR(300)             DEFAULT NULL,
    cost_logged         DECIMAL(12,2)   NOT NULL DEFAULT 0.00,
    logged_at           DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT pk_maintenance_logs      PRIMARY KEY (log_id),
    CONSTRAINT fk_mlog_maintenance      FOREIGN KEY (maintenance_id)
                                        REFERENCES maintenance(maintenance_id)
                                        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_mlog_staff            FOREIGN KEY (staff_id)
                                        REFERENCES users(user_id)
                                        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT chk_mlog_cost            CHECK (cost_logged >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- 16. REVIEWS
-- ---------------------------------------------------------------------------
-- One review per completed rental (UNIQUE on rental_id).
-- Both customer_id and vehicle_id are stored for query convenience (avoids
-- joins through bookings every time). They are not transitive dependencies
-- because both are directly attributes of the review entity itself.
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS reviews (
    review_id       INT             NOT NULL AUTO_INCREMENT,
    rental_id       INT             NOT NULL,
    customer_id     INT             NOT NULL,
    vehicle_id      INT             NOT NULL,
    rating          TINYINT         NOT NULL,
    comment         TEXT                     DEFAULT NULL,
    is_flagged      BOOLEAN         NOT NULL DEFAULT FALSE,
    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT pk_reviews               PRIMARY KEY (review_id),
    CONSTRAINT uq_review_rental         UNIQUE (rental_id),
    CONSTRAINT fk_review_rental         FOREIGN KEY (rental_id)
                                        REFERENCES rentals(rental_id)
                                        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_review_customer       FOREIGN KEY (customer_id)
                                        REFERENCES customers(customer_id)
                                        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_review_vehicle        FOREIGN KEY (vehicle_id)
                                        REFERENCES vehicles(vehicle_id)
                                        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT chk_rating               CHECK (rating BETWEEN 1 AND 5)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- 17. WAITLIST
-- ---------------------------------------------------------------------------
-- A customer joins the waitlist when a desired vehicle is unavailable
-- for their requested dates. The C++ WaitlistManager (Observer pattern)
-- promotes the next entry when the vehicle becomes available.
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS waitlist (
    waitlist_id         INT     NOT NULL AUTO_INCREMENT,
    customer_id         INT     NOT NULL,
    vehicle_id          INT     NOT NULL,
    requested_start     DATE    NOT NULL,
    requested_end       DATE    NOT NULL,
    status              ENUM('WAITING','NOTIFIED','FULFILLED','EXPIRED')
                                NOT NULL DEFAULT 'WAITING',
    notified_at         DATETIME         DEFAULT NULL,
    queued_at           DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT pk_waitlist              PRIMARY KEY (waitlist_id),
    -- Prevent duplicate waitlist entries for the exact same request.
    CONSTRAINT uq_waitlist_entry        UNIQUE (customer_id, vehicle_id, requested_start),
    CONSTRAINT fk_waitlist_customer     FOREIGN KEY (customer_id)
                                        REFERENCES customers(customer_id)
                                        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_waitlist_vehicle      FOREIGN KEY (vehicle_id)
                                        REFERENCES vehicles(vehicle_id)
                                        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT chk_waitlist_dates       CHECK (requested_end > requested_start)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- 18. NOTIFICATIONS
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS notifications (
    notification_id     INT             NOT NULL AUTO_INCREMENT,
    user_id             INT             NOT NULL,
    notification_type   ENUM('BOOKING_CONFIRMED','BOOKING_CANCELLED',
                             'RENTAL_STARTED','RENTAL_COMPLETED',
                             'PAYMENT_RECEIVED','DAMAGE_REPORTED',
                             'MAINTENANCE_ALERT','WAITLIST_NOTIFIED',
                             'LOYALTY_TIER_UPGRADE','SYSTEM')
                                        NOT NULL,
    title               VARCHAR(150)    NOT NULL,
    message             TEXT            NOT NULL,
    reference_id        INT                      DEFAULT NULL,
    -- e.g. booking_id, rental_id, maintenance_id — app resolves from type.
    is_read             BOOLEAN         NOT NULL DEFAULT FALSE,
    created_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT pk_notifications         PRIMARY KEY (notification_id),
    CONSTRAINT fk_notif_user            FOREIGN KEY (user_id)
                                        REFERENCES users(user_id)
                                        ON DELETE CASCADE ON UPDATE CASCADE
    -- ON DELETE CASCADE is intentional here: if a user is deleted, their
    -- notifications are meaningless and should be removed.
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- 19. PRICING RULES  (configuration table — read by C++ PricingEngine)
-- ---------------------------------------------------------------------------
-- Stores multiplier configuration for dynamic pricing.
-- The C++ engine reads this table at startup (or on demand) and applies it.
-- Storing it in MySQL makes the pricing model configurable without recompiling.
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS pricing_rules (
    rule_id             INT             NOT NULL AUTO_INCREMENT,
    rule_name           VARCHAR(100)    NOT NULL,
    rule_type           ENUM('DEMAND','SEASONAL','UTILISATION',
                             'LOYALTY_DISCOUNT','FUEL_SURCHARGE',
                             'CATEGORY_SURCHARGE')
                                        NOT NULL,
    -- Multiplier value. 1.0 = no change; 1.2 = 20% increase; 0.9 = 10% off.
    multiplier          DECIMAL(6,4)    NOT NULL DEFAULT 1.0000,
    -- Condition field stores a simple JSON or descriptive string that
    -- the C++ engine parses to decide when to apply this rule.
    -- e.g. '{"min_demand": 0.8}' or '{"month": [10, 11, 12]}'
    condition_json      JSON                     DEFAULT NULL,
    is_active           BOOLEAN         NOT NULL DEFAULT TRUE,
    effective_from      DATE                     DEFAULT NULL,
    effective_to        DATE                     DEFAULT NULL,
    created_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT pk_pricing_rules     PRIMARY KEY (rule_id),
    CONSTRAINT uq_rule_name         UNIQUE (rule_name),
    CONSTRAINT chk_multiplier       CHECK (multiplier > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- 20. CANCELLATION RECORDS
-- ---------------------------------------------------------------------------
-- Stores the detailed reason and refund information for every cancellation.
-- Booking.cancellation_reason is a short VARCHAR; this table holds the full
-- record including refund amount and who processed it.
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS cancellation_records (
    cancellation_id     INT             NOT NULL AUTO_INCREMENT,
    booking_id          INT             NOT NULL,
    cancelled_by        INT             NOT NULL,   -- FK → users(user_id)
    reason              TEXT                     DEFAULT NULL,
    refund_amount       DECIMAL(12,2)   NOT NULL DEFAULT 0.00,
    refund_status       ENUM('NOT_APPLICABLE','PENDING','PROCESSED')
                                        NOT NULL DEFAULT 'NOT_APPLICABLE',
    cancelled_at        DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT pk_cancellation_records  PRIMARY KEY (cancellation_id),
    CONSTRAINT uq_cancellation_booking  UNIQUE (booking_id),
    CONSTRAINT fk_cancel_booking        FOREIGN KEY (booking_id)
                                        REFERENCES bookings(booking_id)
                                        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_cancel_by             FOREIGN KEY (cancelled_by)
                                        REFERENCES users(user_id)
                                        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT chk_refund_amount        CHECK (refund_amount >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- 21. SYSTEM LOGS  (audit trail)
-- ---------------------------------------------------------------------------
-- Written by the C++ AuditRepository on every significant state change.
-- actor_id is NULLABLE because some system-generated events have no human actor.
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS system_logs (
    log_id          BIGINT          NOT NULL AUTO_INCREMENT,
    -- BIGINT for log_id because audit tables grow very large.
    actor_id        INT                      DEFAULT NULL,
    actor_role      ENUM('CUSTOMER','ADMIN','FLEET_MANAGER',
                         'MAINTENANCE_STAFF','SYSTEM')
                                    NOT NULL,
    action          VARCHAR(100)    NOT NULL,
    -- e.g. 'BOOKING_CREATED', 'VEHICLE_STATUS_CHANGED', 'PAYMENT_PROCESSED'
    entity_type     VARCHAR(50)     NOT NULL,
    -- e.g. 'booking', 'vehicle', 'rental'
    entity_id       INT                      DEFAULT NULL,
    old_value       JSON                     DEFAULT NULL,
    new_value       JSON                     DEFAULT NULL,
    ip_address      VARCHAR(45)              DEFAULT NULL,
    -- VARCHAR(45) supports both IPv4 and IPv6 addresses.
    performed_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT pk_system_logs       PRIMARY KEY (log_id),
    CONSTRAINT fk_syslog_actor      FOREIGN KEY (actor_id)
                                    REFERENCES users(user_id)
                                    ON DELETE SET NULL ON UPDATE CASCADE
    -- ON DELETE SET NULL: if a user is deleted, we keep the audit log entry
    -- but lose the actor reference. History is preserved.
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- 22. VEHICLE HEALTH SNAPSHOTS  (time-series health score history)
-- ---------------------------------------------------------------------------
-- The C++ HealthScoringEngine computes a score and writes it here.
-- vehicles.health_score is the CURRENT score; this table is the history.
-- Used by fleet analytics to trend vehicle health over time.
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS vehicle_health_snapshots (
    snapshot_id     INT             NOT NULL AUTO_INCREMENT,
    vehicle_id      INT             NOT NULL,
    health_score    DECIMAL(5,2)    NOT NULL,
    computed_by     ENUM('ENGINE','INSPECTION','MANUAL')
                                    NOT NULL DEFAULT 'ENGINE',
    recorded_at     DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT pk_health_snapshots      PRIMARY KEY (snapshot_id),
    CONSTRAINT fk_hs_vehicle            FOREIGN KEY (vehicle_id)
                                        REFERENCES vehicles(vehicle_id)
                                        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT chk_hs_score             CHECK (health_score BETWEEN 0 AND 100)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- END OF SCHEMA
-- =============================================================================
