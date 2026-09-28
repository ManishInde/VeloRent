-- =============================================================================
-- VeloRent — Intelligent Vehicle Rental and Fleet Management System
-- FILE: 08_authentication.sql
-- PURPOSE: Verification of users table authentication schema readiness and
--          test credentials overview for Phase 7.
--
-- RUN AFTER: 01_schema.sql through 07_sample_data.sql
-- =============================================================================

USE velorent;

-- 1. Ensure users table index on email for O(1) login lookup
ALTER TABLE users ADD INDEX idx_users_email (email);

-- 2. Sample User Accounts for Phase 7 Development Testing:
-- All sample users use password: VeloRent@2026
--
-- ADMINS:
--   - arjun.mehta@velorent.in (User ID: 1, Role: ADMIN)
--   - priya.sharma@velorent.in (User ID: 2, Role: ADMIN)
--
-- FLEET MANAGERS:
--   - ravi.km@velorent.in (User ID: 3, Role: FLEET_MANAGER)
--   - sunita.rao@velorent.in (User ID: 4, Role: FLEET_MANAGER)
--
-- MAINTENANCE STAFF:
--   - salim.m@velorent.in (User ID: 5, Role: MAINTENANCE_STAFF)
--   - ananya.n@velorent.in (User ID: 6, Role: MAINTENANCE_STAFF)
--
-- CUSTOMERS:
--   - rahul.verma@gmail.com (User ID: 7, Role: CUSTOMER)
--   - kavita.nair@yahoo.com (User ID: 8, Role: CUSTOMER)
-- =============================================================================
