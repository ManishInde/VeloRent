# VELORent — Intelligent Vehicle Rental and Fleet Management System
## Project Architecture Document

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Technology Stack](#2-technology-stack)
3. [System Architecture](#3-system-architecture)
4. [Major Modules](#4-major-modules)
5. [Proposed C++ Architecture](#5-proposed-c-architecture)
6. [Proposed Database Architecture](#6-proposed-database-architecture)
7. [Frontend Architecture](#7-frontend-architecture)
8. [User Roles](#8-user-roles)
9. [Major Workflows](#9-major-workflows)
10. [Folder Structure](#10-folder-structure)
11. [OOP Concepts and Usage](#11-oop-concepts-and-usage)
12. [DBMS Concepts and Usage](#12-dbms-concepts-and-usage)
13. [Development Phases](#13-development-phases)

---

## 1. Project Overview

**VELORent** is an intelligent vehicle rental and fleet management system designed as a combined DBMS and Object-Oriented Programming mini-project. The system goes beyond basic CRUD operations by incorporating data-driven intelligence to support operational decisions: recommending vehicles, dynamically pricing rentals, monitoring fleet health, managing waitlists, rewarding loyal customers, and generating fleet analytics.

### Goals

- Demonstrate advanced OOP design patterns in Modern C++.
- Demonstrate comprehensive DBMS concepts using MySQL.
- Provide a professional, dashboard-based web frontend.
- Model real-world business logic such as dynamic pricing, risk assessment, and fleet intelligence.
- Support four user roles with role-specific capabilities and views.

### Scope

The system manages the complete lifecycle of a vehicle rental: from customer registration and vehicle search, through booking, rental, return, and payment, to maintenance scheduling, damage reporting, analytics, and audit logging.

---

## 2. Technology Stack

| Layer | Technology |
|---|---|
| Application Backend | C++ (C++17 standard) |
| Database Connectivity | MySQL Connector/C++ 8.x (JDBC-style API) |
| Database | MySQL 8.x |
| Web Server / API Bridge | C++ HTTP server (cpp-httplib) serving a REST-like JSON API |
| Frontend | HTML5, CSS3, Vanilla JavaScript (ES6+) |
| CSS Framework | Custom design system (no heavy framework dependency) |
| Build System | CMake |
| Version Control | Git |

### Rationale

The C++ backend is the single source of business logic. All intelligence (dynamic pricing, health scoring, recommendations, risk indicators) is computed in C++ and persisted to MySQL. The frontend consumes a JSON API exposed by the C++ HTTP layer. This ensures the project genuinely demonstrates OOP and DBMS concepts rather than delegating logic to scripting languages.

---

## 3. System Architecture

```
+--------------------------------------------------+
|                  Web Browser                     |
|    HTML5 / CSS3 / Vanilla JS Dashboard           |
+------------------------+-------------------------+
                         | HTTP (JSON API)
+------------------------v-------------------------+
|              C++ Application Server              |
|  +--------------------+  +--------------------+ |
|  |   HTTP Router      |  |   Auth Module      | |
|  |   (cpp-httplib)    |  |   (JWT-like tokens)| |
|  +--------------------+  +--------------------+ |
|  +--------------------------------------------+ |
|  |          Business Logic Layer               | |
|  |  Pricing | Recommender | Scheduler          | |
|  |  Health  | Risk        | Loyalty            | |
|  |  Waitlist| Analytics   | Allocation         | |
|  +--------------------------------------------+ |
|  +--------------------------------------------+ |
|  |           Data Access Layer (DAL)           | |
|  |   Repository classes wrapping SQL queries   | |
|  +--------------------------------------------+ |
|  +--------------------------------------------+ |
|  |      MySQL Connector/C++ (JDBC API)         | |
|  +--------------------------------------------+ |
+------------------------+-------------------------+
                         |
+------------------------v-------------------------+
|                  MySQL 8.x                       |
|   Tables | Views | Stored Procedures | Triggers  |
|   Functions | Indexes | Transactions             |
+--------------------------------------------------+
```

### Layer Responsibilities

| Layer | Responsibility |
|---|---|
| Frontend | Render dashboard, forms, tables; call JSON API; display analytics |
| HTTP Router | Parse HTTP requests, dispatch to controllers, serialize responses to JSON |
| Auth Module | Session token generation, role verification, password hashing |
| Business Logic | All intelligence and computation — pricing, scoring, recommendations |
| Data Access Layer | Repository classes — all SQL is here, none leaks into business logic |
| MySQL | Persistent storage, referential integrity, triggers, stored procedures |

---

## 4. Major Modules

### 4.1 Authentication Module
Handles registration, login, logout, and session management for all four roles. Passwords are stored as salted hashes. Session tokens are validated on every API request.

### 4.2 Customer Management Module
Customer profile creation and editing, loyalty tier tracking, rental history, risk indicator display, and review/rating submission.

### 4.3 Vehicle Management Module
Vehicle CRUD (add, edit, deactivate), type classification, availability tracking, and health score display. Supports vehicle types: Car, Bike, SUV, Luxury Vehicle, Electric Vehicle.

### 4.4 Booking and Rental Module
Vehicle search with filters (type, category, date range, price range, availability), smart allocation, booking creation, rental activation, and rental extension.

### 4.5 Return and Damage Module
Vehicle return processing, mileage update, damage report submission with severity levels, and automatic cost computation for damage charges.

### 4.6 Payment Module
Payment record creation, invoice generation, loyalty points application, damage charge integration, and payment status tracking.

### 4.7 Maintenance Module
Maintenance request creation (manual and automatic), scheduling, staff assignment, work log, and maintenance completion recording.

### 4.8 Dynamic Pricing Engine
Computes rental price based on: base rate, demand level, utilization ratio, customer loyalty tier, seasonal multiplier, and vehicle health. Implemented entirely in C++.

### 4.9 Vehicle Recommendation Engine
Ranks available vehicles for a customer query based on: match score (type, capacity, features), customer preference history, vehicle health score, and price fit. Returns a ranked list.

### 4.10 Smart Allocation Module
Selects the optimal vehicle to assign to a booking from a pool of available vehicles that match the query. Balances utilization across fleet.

### 4.11 Vehicle Health Scoring Module
Computes a 0–100 health score per vehicle based on: mileage since last service, age, maintenance history frequency, open damage reports, and inspection records.

### 4.12 Customer Loyalty System
Tracks loyalty points earned per rental, supports redemption, and classifies customers into tiers (Bronze, Silver, Gold, Platinum) with tier-specific benefits.

### 4.13 Customer Risk Indicator Module
Computes a risk score per customer based on: cancellation rate, late returns, unresolved damage reports, and payment disputes. Flags high-risk customers.

### 4.14 Waitlist Module
Manages customer waitlists for unavailable vehicles. Automatically notifies and promotes the next customer when a vehicle becomes available.

### 4.15 Notification Module
Stores and delivers in-app notifications for: booking confirmations, waitlist promotions, maintenance alerts, payment receipts, and loyalty tier upgrades.

### 4.16 Fleet Intelligence Module
Computes fleet-level metrics: utilization rate per vehicle, high-demand detection, low-utilization detection, revenue per vehicle, and maintenance cost ratio.

### 4.17 Revenue Analytics Module
Provides time-series revenue data, revenue by vehicle type, revenue by customer segment, and comparison across time periods.

### 4.18 Fleet Analytics Module
Fleet composition breakdown, availability heatmap, maintenance frequency analysis, and vehicle age distribution.

### 4.19 Audit Log Module
Records every significant state change (booking, rental, return, payment, damage, maintenance) with timestamp, actor role, and action description.

### 4.20 Reviews and Ratings Module
Customers submit ratings (1–5) and text reviews after rental completion. Ratings influence vehicle and fleet analytics.

### 4.21 Admin Management Module
Admin can manage all users, vehicles, view all reports, override bookings, and access full audit logs.

### 4.22 Fleet Manager Module
Fleet manager manages vehicle inventory, maintenance scheduling, and fleet intelligence reports.

### 4.23 Maintenance Staff Module
Maintenance staff views assigned tasks, logs work, and marks maintenance complete.

---

## 5. Proposed C++ Architecture

### 5.1 Class Hierarchy Overview

```
IEntity (abstract)
├── User (abstract)
│   ├── Customer
│   ├── Admin
│   ├── FleetManager
│   └── MaintenanceStaff
└── Vehicle (abstract)
    ├── Car
    ├── Bike
    ├── SUV
    ├── LuxuryVehicle
    └── ElectricVehicle

IRepository<T> (abstract template)
├── UserRepository
├── VehicleRepository
├── BookingRepository
├── RentalRepository
├── PaymentRepository
├── MaintenanceRepository
├── DamageRepository
├── WaitlistRepository
├── NotificationRepository
├── AuditRepository
└── ReviewRepository

IEngine (abstract)
├── PricingEngine
├── RecommendationEngine
├── AllocationEngine
├── HealthScoringEngine
├── RiskEngine
└── FleetIntelligenceEngine

IController (abstract)
├── AuthController
├── CustomerController
├── VehicleController
├── BookingController
├── RentalController
├── PaymentController
├── MaintenanceController
├── DamageController
├── WaitlistController
├── NotificationController
├── AnalyticsController
├── AdminController
└── ReviewController

Booking (composition of Customer + Vehicle + Payment)
Rental  (composition of Booking + Vehicle)
Payment (aggregation within Booking)
LoyaltyAccount (composition within Customer)
```

### 5.2 Key Classes — Detailed

#### IEntity
```cpp
class IEntity {
public:
    virtual int getId() const = 0;
    virtual std::string toString() const = 0;
    virtual ~IEntity() = default;
};
```

#### User (abstract, inherits IEntity)
```cpp
class User : public IEntity {
protected:
    int id;
    std::string name, email, passwordHash;
    UserRole role;
    std::string createdAt;
public:
    User(int id, std::string name, std::string email, UserRole role);
    virtual ~User();
    virtual void displayDashboard() const = 0;   // pure virtual
    virtual UserRole getRole() const;
    // Encapsulated getters/setters
};
```

#### Vehicle (abstract, inherits IEntity)
```cpp
class Vehicle : public IEntity {
protected:
    int id;
    std::string make, model, licensePlate;
    int year;
    double baseRatePerDay;
    VehicleStatus status;
    double healthScore;
public:
    Vehicle(...);
    virtual ~Vehicle();
    virtual VehicleType getType() const = 0;    // pure virtual
    virtual double computeSurcharge() const = 0; // pure virtual (overridden per type)
    virtual std::string getSpecifications() const;
    double getHealthScore() const;
};
```

#### PricingEngine
```cpp
class PricingEngine : public IEngine {
public:
    double computePrice(const Vehicle& v,
                        const Customer& c,
                        int durationDays,
                        double demandFactor) const;
    double computeDamageCharge(const DamageReport& d) const;
private:
    double applyLoyaltyDiscount(double price, LoyaltyTier tier) const;
    double applyDemandMultiplier(double price, double demandFactor) const;
    double applyHealthPenalty(double price, double healthScore) const;
};
```

#### RecommendationEngine
```cpp
class RecommendationEngine : public IEngine {
public:
    std::vector<RankedVehicle> recommend(
        const CustomerPreferences& prefs,
        const std::vector<Vehicle*>& available) const;
private:
    double scoreVehicle(const Vehicle& v,
                        const CustomerPreferences& prefs) const;
};
```

### 5.3 OOP Design Patterns Used

| Pattern | Where Used |
|---|---|
| Template Method | IEngine — defines algorithm skeleton, subclasses fill in steps |
| Repository Pattern | IRepository<T> — abstracts all data access |
| Strategy | Pricing strategies swappable at runtime |
| Factory | VehicleFactory — creates correct Vehicle subclass from DB record |
| Observer (simplified) | WaitlistManager notifies eligible customers on vehicle return |
| Composition | Booking contains Customer ref + Vehicle ref + Payment |
| Aggregation | Fleet contains Vehicle pointers (vehicles exist independently) |

### 5.4 Exception Handling

```
VeloRentException (base)
├── DatabaseException
├── AuthException
│   ├── InvalidCredentialsException
│   └── UnauthorizedException
├── BookingException
│   ├── VehicleUnavailableException
│   └── InvalidBookingDatesException
├── PaymentException
└── ValidationException
```

All repository methods throw `DatabaseException` on connector failure. Controllers catch and convert to HTTP error responses.

### 5.5 STL Usage

| Container / Algorithm | Where Used |
|---|---|
| `std::vector<Vehicle*>` | Available vehicle list in search results |
| `std::map<int, double>` | Demand factor cache keyed by vehicle_id |
| `std::unordered_map` | Session token store |
| `std::priority_queue` | Waitlist ordering by request timestamp |
| `std::sort` | Ranking recommendation results |
| `std::algorithm` (find_if, count_if) | Fleet intelligence filters |
| `std::unique_ptr` | Ownership of heap-allocated entity objects |
| `std::shared_ptr` | Shared Vehicle reference in Booking and Rental |

---

## 6. Proposed Database Architecture

### 6.1 Entity-Relationship Summary

**Core Entities:** users, vehicles, bookings, rentals, payments, damage_reports, maintenance_requests, maintenance_logs, waitlist_entries, notifications, audit_logs, reviews, loyalty_accounts, vehicle_inspections

**Key Relationships:**
- A `booking` belongs to one `user` (customer) and one `vehicle`.
- A `rental` is derived from one `booking`.
- A `payment` belongs to one `rental`.
- A `damage_report` belongs to one `rental` and one `vehicle`.
- A `maintenance_request` belongs to one `vehicle` and optionally one `damage_report`.
- A `maintenance_log` belongs to one `maintenance_request` and one `user` (maintenance staff).
- A `waitlist_entry` belongs to one `user` and one `vehicle`.
- A `loyalty_account` belongs to one `user` (customer).
- A `review` belongs to one `rental` and one `user`.

### 6.2 Table Definitions (Schema Outline)

#### users
| Column | Type | Constraints |
|---|---|---|
| user_id | INT | PK, AUTO_INCREMENT |
| name | VARCHAR(100) | NOT NULL |
| email | VARCHAR(150) | UNIQUE, NOT NULL |
| password_hash | VARCHAR(255) | NOT NULL |
| phone | VARCHAR(20) | UNIQUE |
| role | ENUM('CUSTOMER','FLEET_MANAGER','MAINTENANCE_STAFF','ADMIN') | NOT NULL |
| is_active | BOOLEAN | DEFAULT TRUE |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP |
| updated_at | DATETIME | ON UPDATE CURRENT_TIMESTAMP |

#### vehicles
| Column | Type | Constraints |
|---|---|---|
| vehicle_id | INT | PK, AUTO_INCREMENT |
| make | VARCHAR(50) | NOT NULL |
| model | VARCHAR(50) | NOT NULL |
| year | YEAR | NOT NULL, CHECK (year >= 2000) |
| license_plate | VARCHAR(20) | UNIQUE, NOT NULL |
| type | ENUM('Car','Bike','SUV','Luxury Vehicle','Electric Vehicle') | NOT NULL |
| base_rate_per_day | DECIMAL(10,2) | NOT NULL, CHECK (base_rate_per_day > 0) |
| status | ENUM('Available','Rented','Under Maintenance','Retired') | DEFAULT 'Available' |
| mileage_km | INT | DEFAULT 0 |
| health_score | DECIMAL(5,2) | DEFAULT 100.00, CHECK (health_score BETWEEN 0 AND 100) |
| added_by | INT | FK → users(user_id) |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP |

#### bookings
| Column | Type | Constraints |
|---|---|---|
| booking_id | INT | PK, AUTO_INCREMENT |
| customer_id | INT | FK → users(user_id), NOT NULL |
| vehicle_id | INT | FK → vehicles(vehicle_id), NOT NULL |
| start_date | DATE | NOT NULL |
| end_date | DATE | NOT NULL |
| status | ENUM('Pending','Confirmed','Active','Completed','Cancelled') | DEFAULT 'Pending' |
| total_amount | DECIMAL(10,2) | NOT NULL |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP |

CHECK: `end_date > start_date`

#### rentals
| Column | Type | Constraints |
|---|---|---|
| rental_id | INT | PK, AUTO_INCREMENT |
| booking_id | INT | FK → bookings(booking_id), UNIQUE, NOT NULL |
| actual_start | DATETIME | NOT NULL |
| actual_end | DATETIME | |
| start_mileage | INT | NOT NULL |
| end_mileage | INT | |
| status | ENUM('Ongoing','Completed','Disputed') | DEFAULT 'Ongoing' |

#### payments
| Column | Type | Constraints |
|---|---|---|
| payment_id | INT | PK, AUTO_INCREMENT |
| rental_id | INT | FK → rentals(rental_id), NOT NULL |
| amount | DECIMAL(10,2) | NOT NULL, CHECK (amount >= 0) |
| method | ENUM('Card','UPI','Cash','Loyalty Points') | NOT NULL |
| status | ENUM('Pending','Completed','Refunded','Failed') | DEFAULT 'Pending' |
| loyalty_points_used | INT | DEFAULT 0 |
| damage_charge | DECIMAL(10,2) | DEFAULT 0.00 |
| paid_at | DATETIME | |

#### damage_reports
| Column | Type | Constraints |
|---|---|---|
| report_id | INT | PK, AUTO_INCREMENT |
| rental_id | INT | FK → rentals(rental_id), NOT NULL |
| vehicle_id | INT | FK → vehicles(vehicle_id), NOT NULL |
| severity | ENUM('Minor','Moderate','Severe') | NOT NULL |
| description | TEXT | NOT NULL |
| estimated_cost | DECIMAL(10,2) | DEFAULT 0.00 |
| reported_by | INT | FK → users(user_id) |
| is_resolved | BOOLEAN | DEFAULT FALSE |
| reported_at | DATETIME | DEFAULT CURRENT_TIMESTAMP |

#### maintenance_requests
| Column | Type | Constraints |
|---|---|---|
| request_id | INT | PK, AUTO_INCREMENT |
| vehicle_id | INT | FK → vehicles(vehicle_id), NOT NULL |
| damage_report_id | INT | FK → damage_reports(report_id), NULLABLE |
| type | ENUM('Routine','Repair','Inspection','Emergency') | NOT NULL |
| priority | ENUM('Low','Medium','High','Critical') | DEFAULT 'Medium' |
| status | ENUM('Open','In Progress','Completed','Cancelled') | DEFAULT 'Open' |
| assigned_to | INT | FK → users(user_id), NULLABLE |
| requested_at | DATETIME | DEFAULT CURRENT_TIMESTAMP |
| completed_at | DATETIME | |

#### maintenance_logs
| Column | Type | Constraints |
|---|---|---|
| log_id | INT | PK, AUTO_INCREMENT |
| request_id | INT | FK → maintenance_requests(request_id), NOT NULL |
| staff_id | INT | FK → users(user_id), NOT NULL |
| notes | TEXT | |
| cost | DECIMAL(10,2) | DEFAULT 0.00 |
| logged_at | DATETIME | DEFAULT CURRENT_TIMESTAMP |

#### loyalty_accounts
| Column | Type | Constraints |
|---|---|---|
| loyalty_id | INT | PK, AUTO_INCREMENT |
| customer_id | INT | FK → users(user_id), UNIQUE, NOT NULL |
| points_balance | INT | DEFAULT 0, CHECK (points_balance >= 0) |
| tier | ENUM('Bronze','Silver','Gold','Platinum') | DEFAULT 'Bronze' |
| total_points_earned | INT | DEFAULT 0 |
| updated_at | DATETIME | ON UPDATE CURRENT_TIMESTAMP |

#### waitlist_entries
| Column | Type | Constraints |
|---|---|---|
| waitlist_id | INT | PK, AUTO_INCREMENT |
| customer_id | INT | FK → users(user_id), NOT NULL |
| vehicle_id | INT | FK → vehicles(vehicle_id), NOT NULL |
| requested_start | DATE | NOT NULL |
| requested_end | DATE | NOT NULL |
| status | ENUM('Waiting','Notified','Fulfilled','Expired') | DEFAULT 'Waiting' |
| queued_at | DATETIME | DEFAULT CURRENT_TIMESTAMP |

UNIQUE: `(customer_id, vehicle_id, requested_start)` — prevents duplicate waitlist entries

#### notifications
| Column | Type | Constraints |
|---|---|---|
| notification_id | INT | PK, AUTO_INCREMENT |
| user_id | INT | FK → users(user_id), NOT NULL |
| type | ENUM('Booking','Waitlist','Maintenance','Payment','Loyalty','System') | NOT NULL |
| message | TEXT | NOT NULL |
| is_read | BOOLEAN | DEFAULT FALSE |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP |

#### audit_logs
| Column | Type | Constraints |
|---|---|---|
| audit_id | INT | PK, AUTO_INCREMENT |
| actor_id | INT | FK → users(user_id), NULLABLE |
| action | VARCHAR(100) | NOT NULL |
| entity_type | VARCHAR(50) | NOT NULL |
| entity_id | INT | |
| details | JSON | |
| performed_at | DATETIME | DEFAULT CURRENT_TIMESTAMP |

#### reviews
| Column | Type | Constraints |
|---|---|---|
| review_id | INT | PK, AUTO_INCREMENT |
| rental_id | INT | FK → rentals(rental_id), UNIQUE, NOT NULL |
| customer_id | INT | FK → users(user_id), NOT NULL |
| vehicle_id | INT | FK → vehicles(vehicle_id), NOT NULL |
| rating | TINYINT | NOT NULL, CHECK (rating BETWEEN 1 AND 5) |
| comment | TEXT | |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP |

#### vehicle_inspections
| Column | Type | Constraints |
|---|---|---|
| inspection_id | INT | PK, AUTO_INCREMENT |
| vehicle_id | INT | FK → vehicles(vehicle_id), NOT NULL |
| inspector_id | INT | FK → users(user_id), NOT NULL |
| health_score | DECIMAL(5,2) | NOT NULL |
| notes | TEXT | |
| inspected_at | DATETIME | DEFAULT CURRENT_TIMESTAMP |

### 6.3 Normalization

All tables are designed to **Third Normal Form (3NF)**:

- **1NF**: Every attribute is atomic; no repeating groups.
- **2NF**: All non-key attributes are fully dependent on the entire primary key (no partial dependencies — all PKs are single-column surrogate keys).
- **3NF**: No transitive dependencies — e.g., loyalty tier is stored in `loyalty_accounts`, not duplicated in `users` or `bookings`.

### 6.4 Views

| View Name | Purpose |
|---|---|
| `v_available_vehicles` | Vehicles with status = 'Available', joined with latest health score |
| `v_active_rentals` | Ongoing rentals with customer and vehicle details |
| `v_vehicle_utilization` | Per-vehicle utilization rate over last 30 days |
| `v_customer_summary` | Customer profile with loyalty tier, total rentals, risk score |
| `v_fleet_overview` | Fleet counts by status and type |
| `v_revenue_by_type` | Revenue grouped by vehicle type |
| `v_pending_maintenance` | Open maintenance requests with vehicle and staff info |
| `v_waitlist_queue` | Active waitlist entries ordered by queue time |

### 6.5 Stored Procedures

| Procedure | Purpose |
|---|---|
| `sp_create_booking` | Validates dates, checks availability, inserts booking, locks vehicle |
| `sp_confirm_rental` | Converts booking to rental, updates vehicle status to Rented |
| `sp_process_return` | Records return, computes charges, updates mileage, triggers health update |
| `sp_process_payment` | Inserts payment record, deducts loyalty points, updates booking status |
| `sp_cancel_booking` | Cancels booking, releases vehicle, triggers waitlist check |
| `sp_assign_maintenance` | Assigns staff to request, updates vehicle status |
| `sp_complete_maintenance` | Marks request done, restores vehicle status, logs cost |
| `sp_promote_waitlist` | Finds next eligible waitlist entry for a vehicle, sends notification |

### 6.6 Functions

| Function | Returns |
|---|---|
| `fn_compute_health_score(vehicle_id)` | DECIMAL — health score (0–100) |
| `fn_compute_risk_score(customer_id)` | DECIMAL — customer risk score (0–100) |
| `fn_compute_loyalty_tier(customer_id)` | VARCHAR — 'Bronze'/'Silver'/'Gold'/'Platinum' |
| `fn_vehicle_utilization_rate(vehicle_id, days)` | DECIMAL — utilization % over N days |
| `fn_demand_factor(vehicle_id)` | DECIMAL — booking demand multiplier |
| `fn_rental_duration(booking_id)` | INT — number of rental days |

### 6.7 Triggers

| Trigger | Event | Action |
|---|---|---|
| `trg_after_booking_insert` | AFTER INSERT on bookings | Insert audit log entry |
| `trg_after_rental_complete` | AFTER UPDATE on rentals (status → Completed) | Award loyalty points, update mileage, recalculate health score |
| `trg_after_damage_report` | AFTER INSERT on damage_reports | Auto-create maintenance request if severity = Severe |
| `trg_after_maintenance_complete` | AFTER UPDATE on maintenance_requests (status → Completed) | Restore vehicle status, update health score |
| `trg_after_booking_cancel` | AFTER UPDATE on bookings (status → Cancelled) | Call sp_promote_waitlist |
| `trg_loyalty_tier_update` | AFTER UPDATE on loyalty_accounts | Recalculate and update tier based on total points |
| `trg_audit_vehicle_status` | AFTER UPDATE on vehicles (status change) | Insert audit log entry |

### 6.8 Indexes

| Table | Index | Columns | Purpose |
|---|---|---|---|
| bookings | idx_booking_customer | customer_id | Customer rental history queries |
| bookings | idx_booking_vehicle_dates | vehicle_id, start_date, end_date | Availability checking |
| bookings | idx_booking_status | status | Active bookings filter |
| rentals | idx_rental_status | status | Ongoing rental queries |
| damage_reports | idx_damage_vehicle | vehicle_id | Vehicle damage history |
| notifications | idx_notif_user_read | user_id, is_read | Unread notification fetch |
| audit_logs | idx_audit_entity | entity_type, entity_id | Entity history lookup |
| waitlist_entries | idx_waitlist_vehicle | vehicle_id, status | Waitlist promotion queries |
| vehicle_inspections | idx_inspection_vehicle | vehicle_id | Latest inspection lookup |

### 6.9 Transactions (ACID)

Critical multi-step operations are wrapped in transactions:

- **Booking creation**: Check availability → Lock vehicle → Insert booking → Insert audit → COMMIT (or ROLLBACK on failure).
- **Rental return**: Update rental → Update mileage → Compute charges → Insert payment → Award loyalty points → Update health → COMMIT.
- **Payment processing**: Deduct loyalty points → Insert payment → Update booking status → COMMIT.
- **Maintenance completion**: Update request → Insert log → Update vehicle status → Update health score → COMMIT.

---

## 7. Frontend Architecture

### 7.1 Design Language

- Clean, dashboard-based layout with a persistent sidebar navigation.
- Neutral color palette: dark navy header, white card surfaces, subtle grey backgrounds.
- Clear typography hierarchy — no emojis, no excessive animation.
- Data tables with sorting and filtering.
- Metric cards for key KPIs (fleet utilization, revenue, active rentals).
- Responsive grid layout for desktop-first use.

### 7.2 Pages / Views

| Route | Role(s) | Description |
|---|---|---|
| `/login` | All | Login form |
| `/register` | Customer | Customer self-registration |
| `/dashboard` | All | Role-specific dashboard landing |
| `/vehicles` | All | Vehicle search with filters |
| `/vehicles/:id` | All | Vehicle detail page |
| `/bookings` | Customer, Admin | Booking list and creation |
| `/bookings/:id` | Customer, Admin | Booking detail |
| `/rentals` | All | Active and completed rentals |
| `/rentals/:id/return` | Customer, Admin | Return processing form |
| `/payments` | Customer, Admin | Payment history and invoice |
| `/damage-reports` | Customer, Fleet, Admin | Damage report submission and list |
| `/maintenance` | Fleet, Staff, Admin | Maintenance request list and form |
| `/maintenance/:id` | Staff | Task detail and work log |
| `/waitlist` | Customer | Waitlist entries |
| `/notifications` | All | In-app notification center |
| `/analytics/revenue` | Admin, Fleet | Revenue analytics dashboard |
| `/analytics/fleet` | Admin, Fleet | Fleet analytics dashboard |
| `/loyalty` | Customer | Loyalty account and points history |
| `/reviews` | Customer | Submit and view reviews |
| `/audit-logs` | Admin | Full audit trail |
| `/admin/users` | Admin | User management |

### 7.3 API Communication

The frontend communicates with the C++ backend via HTTP JSON endpoints. All API calls include a session token header. Responses are plain JSON objects. Error responses use HTTP status codes (400, 401, 403, 404, 500) with a `{"error": "message"}` body.

### 7.4 File Organization (Frontend)

```
frontend/
├── index.html
├── css/
│   ├── base.css          # Reset, variables, typography
│   ├── layout.css        # Sidebar, header, grid
│   ├── components.css    # Cards, tables, forms, buttons
│   └── dashboard.css     # Dashboard-specific styles
├── js/
│   ├── api.js            # Fetch wrapper with token injection
│   ├── auth.js           # Login/logout/session handling
│   ├── router.js         # Client-side route dispatcher
│   ├── components/
│   │   ├── sidebar.js
│   │   ├── table.js      # Reusable sortable table
│   │   └── modal.js
│   └── pages/
│       ├── dashboard.js
│       ├── vehicles.js
│       ├── bookings.js
│       ├── rentals.js
│       ├── maintenance.js
│       ├── analytics.js
│       └── ...
└── assets/
    └── logo.svg
```

---

## 8. User Roles

### CUSTOMER
- Self-register and manage profile.
- Search and filter available vehicles.
- View vehicle recommendations.
- Create, view, and cancel bookings.
- Activate rentals and process returns.
- Submit damage reports on return.
- Make payments.
- Join vehicle waitlists.
- View loyalty account and redeem points.
- Submit and view reviews.
- Receive notifications.

### FLEET_MANAGER
- Add, edit, and retire vehicles.
- View and manage maintenance requests.
- Access fleet intelligence reports.
- View revenue and fleet analytics.
- Manage vehicle inspections.
- View damage reports.

### MAINTENANCE_STAFF
- View assigned maintenance tasks.
- Update task status and log work.
- Mark maintenance complete.
- View vehicle maintenance history.

### ADMIN
- Full access to all features.
- Manage all users (create, deactivate, promote roles).
- Override bookings and rentals.
- Access complete audit logs.
- View all analytics and reports.
- Manage system notifications.

---

## 9. Major Workflows

### 9.1 Customer Booking Flow
```
Customer logs in
  → Searches vehicles (type, dates, price range)
  → Recommendation Engine ranks results
  → Customer selects vehicle
  → Pricing Engine computes dynamic price
  → Customer confirms booking
  → sp_create_booking runs (transaction)
  → Booking confirmed, vehicle locked
  → Notification sent to customer
  → Audit log entry created
```

### 9.2 Rental Activation and Return Flow
```
Customer arrives at rental location
  → Admin / System activates rental (sp_confirm_rental)
  → Vehicle status → Rented
  → Rental period begins
  → Customer returns vehicle
  → Staff records return: actual end date, mileage
  → Damage inspection: optional damage report
  → sp_process_return runs (transaction)
    → Rental marked Completed
    → Charges computed (base + damage)
    → Payment created
    → Loyalty points awarded (trigger)
    → Health score recalculated (trigger)
    → Waitlist check triggered (trigger on cancel or return)
  → Invoice displayed to customer
```

### 9.3 Dynamic Pricing Calculation
```
C++ PricingEngine::computePrice(vehicle, customer, duration, demandFactor)
  = baseRate
  × durationDays
  × demandFactor          (from fn_demand_factor — booking frequency)
  × utilizationMultiplier (high utilization → price up)
  × loyaltyDiscount       (Gold/Platinum tiers get discount)
  × healthPenalty         (lower health → slight discount to promote bookings)
  × seasonalMultiplier    (configurable)
```

### 9.4 Vehicle Health Score Calculation
```
fn_compute_health_score(vehicle_id) in MySQL
  Considers:
  - Mileage since last service (−points per 1000 km over threshold)
  - Days since last inspection (−points per week over threshold)
  - Open damage reports (−points per open report, weighted by severity)
  - Maintenance history frequency (fewer routine services → lower score)
  - Vehicle age in years (gradual base deduction)
  Result: clamped to [0, 100]
```

### 9.5 Waitlist Promotion Flow
```
Booking cancelled OR rental completed
  → trg_after_booking_cancel / return trigger fires
  → sp_promote_waitlist(vehicle_id) called
  → Finds oldest Waiting entry for vehicle with compatible dates
  → Updates entry status → Notified
  → Inserts notification for customer
  → Customer receives in-app alert to confirm booking
```

### 9.6 Maintenance Scheduling Flow
```
Damage report submitted (severity = Severe)
  → trg_after_damage_report fires
  → Auto-creates maintenance_request (type = Repair, priority = High)
  → Vehicle status → Under Maintenance
  → Fleet manager sees new request in dashboard
  → Assigns maintenance staff (sp_assign_maintenance)
  → Staff logs work (maintenance_logs)
  → Staff marks complete (sp_complete_maintenance)
  → Vehicle status restored → Available
  → Health score recalculated
```

---

## 10. Folder Structure

```
VELORent/
├── docs/
│   └── PROJECT_ARCHITECTURE.md      ← This file
│
├── backend/
│   ├── CMakeLists.txt
│   ├── include/
│   │   ├── core/
│   │   │   ├── IEntity.h
│   │   │   ├── IRepository.h
│   │   │   ├── IEngine.h
│   │   │   └── IController.h
│   │   ├── models/
│   │   │   ├── User.h
│   │   │   ├── Customer.h
│   │   │   ├── Admin.h
│   │   │   ├── FleetManager.h
│   │   │   ├── MaintenanceStaff.h
│   │   │   ├── Vehicle.h
│   │   │   ├── Car.h
│   │   │   ├── Bike.h
│   │   │   ├── SUV.h
│   │   │   ├── LuxuryVehicle.h
│   │   │   ├── ElectricVehicle.h
│   │   │   ├── Booking.h
│   │   │   ├── Rental.h
│   │   │   ├── Payment.h
│   │   │   ├── DamageReport.h
│   │   │   ├── MaintenanceRequest.h
│   │   │   ├── MaintenanceLog.h
│   │   │   ├── LoyaltyAccount.h
│   │   │   ├── WaitlistEntry.h
│   │   │   ├── Notification.h
│   │   │   ├── AuditLog.h
│   │   │   ├── Review.h
│   │   │   └── VehicleInspection.h
│   │   ├── repositories/
│   │   │   ├── UserRepository.h
│   │   │   ├── VehicleRepository.h
│   │   │   ├── BookingRepository.h
│   │   │   ├── RentalRepository.h
│   │   │   ├── PaymentRepository.h
│   │   │   ├── MaintenanceRepository.h
│   │   │   ├── DamageRepository.h
│   │   │   ├── WaitlistRepository.h
│   │   │   ├── NotificationRepository.h
│   │   │   ├── AuditRepository.h
│   │   │   └── ReviewRepository.h
│   │   ├── engines/
│   │   │   ├── PricingEngine.h
│   │   │   ├── RecommendationEngine.h
│   │   │   ├── AllocationEngine.h
│   │   │   ├── HealthScoringEngine.h
│   │   │   ├── RiskEngine.h
│   │   │   └── FleetIntelligenceEngine.h
│   │   ├── controllers/
│   │   │   ├── AuthController.h
│   │   │   ├── VehicleController.h
│   │   │   ├── BookingController.h
│   │   │   ├── RentalController.h
│   │   │   ├── PaymentController.h
│   │   │   ├── MaintenanceController.h
│   │   │   ├── DamageController.h
│   │   │   ├── WaitlistController.h
│   │   │   ├── NotificationController.h
│   │   │   ├── AnalyticsController.h
│   │   │   └── AdminController.h
│   │   ├── exceptions/
│   │   │   └── VeloRentExceptions.h
│   │   ├── db/
│   │   │   ├── DatabaseConnection.h
│   │   │   └── ConnectionPool.h
│   │   └── utils/
│   │       ├── JsonSerializer.h
│   │       ├── PasswordHasher.h
│   │       ├── TokenManager.h
│   │       └── DateUtils.h
│   └── src/
│       ├── main.cpp
│       ├── models/
│       ├── repositories/
│       ├── engines/
│       ├── controllers/
│       ├── exceptions/
│       ├── db/
│       └── utils/
│
├── database/
│   ├── schema.sql               # All CREATE TABLE statements
│   ├── views.sql                # All VIEW definitions
│   ├── procedures.sql           # All stored procedures
│   ├── functions.sql            # All SQL functions
│   ├── triggers.sql             # All trigger definitions
│   ├── indexes.sql              # All index definitions
│   └── seed_data.sql            # Sample data for testing
│
└── frontend/
    ├── index.html
    ├── css/
    │   ├── base.css
    │   ├── layout.css
    │   ├── components.css
    │   └── dashboard.css
    ├── js/
    │   ├── api.js
    │   ├── auth.js
    │   ├── router.js
    │   ├── components/
    │   └── pages/
    └── assets/
```

---

## 11. OOP Concepts and Usage

| Concept | Where Used | How |
|---|---|---|
| **Encapsulation** | All model classes (User, Vehicle, Booking, etc.) | Private/protected members; public getters/setters only |
| **Abstraction** | IEntity, IRepository, IEngine, IController | Pure abstract interfaces hide implementation details |
| **Inheritance** | User → Customer/Admin/FleetManager/MaintenanceStaff; Vehicle → Car/Bike/SUV/Luxury/EV | Single inheritance from abstract base |
| **Polymorphism** | Vehicle::getType(), Vehicle::computeSurcharge(), User::displayDashboard() | Virtual dispatch — same call, different behaviour per subclass |
| **Virtual Functions** | IEntity::toString(), Vehicle::computeSurcharge(), User::displayDashboard() | Overridden in every concrete subclass |
| **Abstract Classes** | IEntity, User, Vehicle, IRepository, IEngine, IController | Cannot be instantiated; must be subclassed |
| **Constructors** | All model classes | Parameterized constructors initialize all members |
| **Destructors** | Database connection wrapper, repository classes | Virtual destructors; RAII resource cleanup |
| **Function Overloading** | PricingEngine::computePrice (with/without demandFactor), RecommendationEngine::recommend | Same name, different signatures |
| **Function Overriding** | Vehicle::computeSurcharge() in each subclass, User::displayDashboard() | Runtime polymorphism |
| **Composition** | Booking contains LoyaltyAccount ref; Rental contains Booking; PricingEngine is a member of BookingController | Member objects — lifecycle tied to owner |
| **Aggregation** | Fleet (in FleetIntelligenceEngine) holds vector<Vehicle*> | Vehicles exist independently of the engine |
| **STL Containers** | All engines and repositories | vector, map, unordered_map, priority_queue, set |
| **Exception Handling** | All repository and engine methods | try/catch with custom exception hierarchy; converted to HTTP errors in controllers |

---

## 12. DBMS Concepts and Usage

| Concept | Where Used | How |
|---|---|---|
| **Primary Keys** | Every table | Auto-increment INT surrogate keys |
| **Foreign Keys** | bookings → users, vehicles; rentals → bookings; payments → rentals; etc. | Referential integrity enforced by MySQL |
| **Candidate Keys** | users.email, users.phone, vehicles.license_plate | UNIQUE constraints identify alternate keys |
| **UNIQUE Constraints** | email, phone, license_plate, review per rental, loyalty per customer | Prevent duplicate business-critical values |
| **NOT NULL** | name, email, password_hash, start_date, vehicle_id in bookings, etc. | Mandatory fields |
| **CHECK Constraints** | vehicles.year >= 2000, health_score BETWEEN 0 AND 100, rating BETWEEN 1 AND 5 | Domain validation at DB level |
| **DEFAULT** | status fields, is_active, created_at | Sensible defaults reduce application-side boilerplate |
| **Referential Integrity** | ON DELETE RESTRICT on all FKs | Prevents orphaned records |
| **Normalization (3NF)** | All tables designed to 3NF | Eliminates redundancy, transitive dependencies |
| **JOINs** | v_active_rentals, v_customer_summary, analytics queries | INNER, LEFT JOINs across multiple tables |
| **Aggregate Functions** | Revenue queries, fleet utilization, rating averages | SUM, AVG, COUNT, MAX, MIN |
| **GROUP BY** | Revenue by vehicle type, bookings per customer | Groups aggregate results |
| **HAVING** | High-demand vehicles (bookings > threshold), low-utilization filter | Filters grouped results |
| **Subqueries** | fn_compute_health_score, availability check in sp_create_booking | Correlated and non-correlated subqueries |
| **Views** | v_available_vehicles, v_active_rentals, v_vehicle_utilization, etc. | Reusable, access-controlled query abstractions |
| **Stored Procedures** | sp_create_booking, sp_process_return, sp_process_payment, etc. | Encapsulate multi-step transactional logic |
| **Functions** | fn_compute_health_score, fn_compute_risk_score, fn_demand_factor, etc. | Reusable computed values callable from queries |
| **Triggers** | trg_after_rental_complete, trg_after_damage_report, trg_loyalty_tier_update, etc. | Automatic reactive database logic |
| **Transactions** | All stored procedures that modify multiple tables | BEGIN / COMMIT / ROLLBACK for ACID compliance |
| **Indexes** | booking dates, vehicle status, notification user+read, etc. | Performance optimization for frequent queries |
| **ACID** | sp_create_booking (Atomicity), FK constraints (Consistency), InnoDB locking (Isolation), InnoDB WAL (Durability) | Demonstrated through booking and payment transactions |

---

## 13. Development Phases

### Phase 1 — Database Foundation
- Design and create all tables (`schema.sql`).
- Define views, stored procedures, functions, triggers, and indexes.
- Load seed data (`seed_data.sql`).
- Verify referential integrity and trigger behavior.

### Phase 2 — C++ Core Models and DAL
- Implement `IEntity`, `User`, `Vehicle` abstract hierarchies.
- Implement all concrete model classes.
- Implement `DatabaseConnection` and `ConnectionPool`.
- Implement all repository classes (CRUD + custom queries).
- Write unit tests for repositories against real MySQL.

### Phase 3 — Business Logic Engines
- Implement `PricingEngine` with all multipliers.
- Implement `RecommendationEngine` with ranking logic.
- Implement `AllocationEngine`.
- Implement `HealthScoringEngine` (bridges to MySQL function).
- Implement `RiskEngine`.
- Implement `FleetIntelligenceEngine`.
- Implement `LoyaltyService` and `WaitlistManager`.

### Phase 4 — HTTP Layer and Controllers
- Integrate `cpp-httplib` as the HTTP server.
- Implement `TokenManager` and `AuthController`.
- Implement all remaining controllers.
- Define all API routes.
- Implement JSON serialization for all responses.

### Phase 5 — Frontend
- Build HTML/CSS base layout, sidebar, and component library.
- Implement `api.js` and `auth.js`.
- Build each page/view connected to the API.
- Build analytics dashboards with charts.
- Role-based route guards.

### Phase 6 — Integration and Testing
- End-to-end testing of all major workflows.
- Performance testing of heavy queries with EXPLAIN.
- Index tuning.
- Edge-case validation (double booking, concurrent return, etc.).

### Phase 7 — Documentation and Presentation
- Code comments and inline documentation.
- Final schema diagram (ER diagram).
- OOP class diagram.
- Demo walkthrough script.

---

*VELORent — Project Architecture v1.0 | Generated: 2026-09-20*
