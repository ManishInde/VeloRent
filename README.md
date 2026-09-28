# VeloRent — Intelligent Vehicle Rental & Fleet Management System

## Phase 2: C++ OOP Domain Model Foundation

VeloRent is an intelligent vehicle rental and fleet management system built using modern C++ (C++17 standard) and MySQL.

This repository contains the complete C++ Object-Oriented Programming (OOP) domain model layer, strong enum definitions, domain validation routines, custom exception hierarchy, and model unit tests.

---

## Architecture Overview

```
VeloRent System Architecture
┌─────────────────────────────────────────────────────────┐
│                Web Browser (HTML5/JS/CSS)               │
└────────────────────────────┬────────────────────────────┘
                             │ HTTP / JSON
┌────────────────────────────▼────────────────────────────┐
│                  C++ REST API Server                    │
│   Controllers ➔ Services ➔ Business Engines ➔ Models    │
└────────────────────────────┬────────────────────────────┘
                             │ Repository Layer
┌────────────────────────────▼────────────────────────────┐
│                    MySQL Database                       │
└─────────────────────────────────────────────────────────┘
```

### Directory Structure

```
d:/DBMS/
├── CMakeLists.txt              # CMake build configuration (C++17)
├── README.md                   # Build and architecture documentation
├── config/                     # Configuration files (config.json)
├── database/                   # MySQL schema, views, procedures, triggers, sample data
├── docs/                       # Project architecture documentation
├── src/
│   ├── models/                 # Domain model class hierarchy (User, Vehicle, Booking, etc.)
│   ├── exceptions/             # Exception hierarchy (VeloRentException, ValidationException, etc.)
│   ├── utils/                  # Enums, EnumUtils, DateUtils, MoneyUtils, ValidationUtils
│   ├── services/               # [Phase 3] Business logic services
│   ├── repositories/           # [Phase 3] MySQL repositories
│   ├── database/               # [Phase 3] Database connection pool & JDBC wrapper
│   ├── engines/                # [Phase 3] Pricing, Health, Recommendation & Risk engines
│   ├── controllers/            # [Phase 4] HTTP API route controllers
│   └── auth/                   # [Phase 4] JWT/Session Authentication
└── tests/                      # Model unit tests
```

---

## OOP Concepts & Class Hierarchy

### 1. Abstract Base Classes & Interfaces
- `IEntity`: Base interface with `getId()` and `toString()`.
- `User`: Abstract base class with pure virtual `displayDashboard()` and `getRoleName()`.
- `Vehicle`: Abstract base class with pure virtual `getVehicleType()`, `calculateMaintenanceFactor()`, and virtual `calculateRentalCost()`.

### 2. User Inheritance Hierarchy
```
User (Abstract Base)
├── Customer              (License, risk score, rental count)
├── Admin                 (Department, admin level)
├── FleetManager          (Assigned hub, managed vehicle count)
└── MaintenanceStaff      (Specialization, completed repair tasks count)
```

### 3. Vehicle Inheritance Hierarchy
```
Vehicle (Abstract Base)
├── Car                   (Standard hatchback/sedan pricing & maintenance)
├── Bike                  (Motorcycle/scooter weekly discount rates & high wear factor)
├── SUV                   (4WD rugged surcharge & high-capacity factor)
├── LuxuryVehicle         (Luxury tax multiplier & mandatory security deposit)
└── ElectricVehicle       (Battery capacity kWh, charge %, EV range & eco discount)
```

### 4. Domain Models
- `Booking`: Reservation with start/end date validation & quoted price.
- `Rental`: Physical rental event with distance calculation & overdue checking.
- `Payment`: Financial transaction with exact 2-decimal rounding.
- `Maintenance` & `MaintenanceLog`: Scheduled repair tasks & staff activity logs.
- `VehicleInspection` & `DamageReport`: Vehicle health inspections & damage incident reports.
- `LoyaltyAccount` & `LoyaltyTransaction`: Points tracking & auto tiering (BRONZE, SILVER, GOLD, PLATINUM).
- `Review`, `WaitlistEntry`, `Notification`, `CancellationRecord`, `VehicleFeature`, `VehicleCategory`, `PricingRule`, `SystemLog`, `VehicleHealthSnapshot`.

---

## Build & Test Instructions

### Prerequisites
- Modern C++ Compiler supporting **C++17** (GCC 14+, Clang 16+, MSVC 2019+ or portable GCC).
- **CMake** (3.14 or newer) or **GNU Make**.

### Building with CMake

1. Create and enter build directory:
   ```bash
   mkdir build
   cd build
   ```

2. Configure CMake project:
   ```bash
   cmake ..
   ```
   *(Or using portable GCC):*
   ```bash
   python -m cmake -G "Unix Makefiles" -DCMAKE_CXX_COMPILER="d:/DBMS/w64devkit/bin/g++.exe" -DCMAKE_MAKE_PROGRAM="d:/DBMS/w64devkit/bin/make.exe" ..
   ```

3. Build static library and test executable:
   ```bash
   make
   ```

4. Run unit tests:
   ```bash
   ./velorent_tests
   ```

---

## Verification & Status

All unit tests verify:
- Object instantiation & encapsulation
- Abstract base class & interface compliance
- Polymorphic method dispatch (`calculateRentalCost`, `calculateMaintenanceFactor`, `displayDashboard`)
- Domain validation rules (positive rates, valid date ranges, 0-100 health score, 1-5 ratings)
- Custom exception handling (`ValidationException`, `NotFoundException`, `BusinessRuleException`)
