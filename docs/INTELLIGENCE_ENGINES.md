# VeloRent — Phase 5: Intelligent Business Engines Documentation

## 1. Executive Summary

Phase 5 introduces **deterministic, rule-based algorithmic intelligence** to the VeloRent platform. Built in modern **C++17**, these engines transform traditional vehicle rental operations into an automated, data-driven decision system.

The business engines operate completely decoupled from raw database connectivity and HTTP handlers, adhering strictly to **Clean Architecture** principles and single-responsibility domain design.

---

## 2. Intelligence Architecture

```
                       +-----------------------------+
                       |    VeloRent Application     |
                       +--------------+--------------+
                                      |
                                      v
                       +-----------------------------+
                       |   Business Engine Layer     |
                       |        (src/engines)        |
                       +--------------+--------------+
                                      |
         +----------------------------+----------------------------+
         |                            |                            |
         v                            v                            v
+------------------+         +------------------+         +------------------+
|  PricingEngine   |         | VehicleHealthEng |         | RecommendationEng|
+------------------+         +------------------+         +------------------+
         |                            |                            |
         v                            v                            v
+------------------+         +------------------+         +------------------+
| LoyaltyEngine    |         | AllocationEngine |         | CustomerRiskEng  |
+------------------+         +------------------+         +------------------+
                                      |
                                      v
                             +------------------+
                             | FleetIntellEng   |
                             +------------------+
```

---

## 3. Comprehensive Engine Specifications

### 3.1 Dynamic Pricing Engine (`PricingEngine`)
- **Purpose**: Calculates precise rental price adjustments dynamically based on temporal, demand, duration, customer loyalty, and insurance factors.
- **Mathematical Formula**:
  $$\text{Effective Daily Rate} = \text{Base Rate} \times \text{Peak Multiplier} \times (1 - \text{Duration Discount}) \times (1 - \text{Loyalty Discount})$$
  $$\text{Subtotal} = \text{Effective Daily Rate} \times \text{Days} + \text{Insurance Addon}$$
  $$\text{Final Price} = \max(0, \text{Subtotal} - \text{Loyalty Points Discount})$$
- **Rules**:
  - **Weekend/Peak Surcharge**: +15% multiplier during peak days (Fri-Sun).
  - **Duration Discounts**: 7+ days = 5% off, 14+ days = 10% off, 30+ days = 15% off.
  - **Loyalty Tier Discounts**: Silver (5%), Gold (10%), Platinum (15%).
  - **Insurance Addon**: ₹300/day for Cars, ₹100/day for Bikes (if opted).

---

### 3.2 Vehicle Recommendation Engine (`RecommendationEngine`)
- **Purpose**: Ranks available fleet vehicles against customer profile preferences and trip context.
- **Scoring Algorithm**:
  $$\text{Match Score} = S_{\text{budget}} + S_{\text{capacity}} + S_{\text{vehicle\_type}} + S_{\text{fuel}} + S_{\text{health}}$$
  - **Budget Match ($S_{\text{budget}}$)**: Max 30 points. Penalizes vehicles exceeding budget.
  - **Capacity Match ($S_{\text{capacity}}$)**: Max 25 points. Matches seating needs.
  - **Category Match ($S_{\text{category}}$)**: Max 20 points for exact match.
  - **Fuel Preference ($S_{\text{fuel}}$)**: Max 15 points.
  - **Vehicle Health ($S_{\text{health}}$)**: Max 10 points based on health score.

---

### 3.3 Vehicle Health Scoring Engine (`VehicleHealthEngine`)
- **Purpose**: Calculates real-time maintenance readiness and safety health score (0 to 100).
- **Scoring Algorithm**:
  $$\text{Health Score} = 100 - (P_{\text{mileage}} + P_{\text{age}} + P_{\text{damage}} + P_{\text{overdue\_maint}})$$
  - **Mileage Penalty**: -1 point per 5,000 km.
  - **Age Penalty**: -2 points per year from current year.
  - **Damage History Penalty**: -10 (MINOR), -25 (MODERATE), -50 (SEVERE), -75 (CRITICAL).
  - **Overdue Maintenance**: -25 points if scheduled service is overdue.
- **Thresholds**:
  - `score >= 80`: EXCELLENT
  - `60 <= score < 80`: GOOD
  - `40 <= score < 60`: NEEDS_INSPECTION
  - `score < 40`: CRITICAL (Auto-triggers maintenance flag)

---

### 3.4 Smart Vehicle Allocation Engine (`VehicleAllocationEngine`)
- **Purpose**: Selects optimal vehicle assignment when multiple units match a booking request.
- **Objective**: Maximize fleet life cycle distribution while ensuring safety and health.
- **Optimization Strategy**:
  1. Filters out unavailable vehicles or vehicles with health score < 40.
  2. Ranks remaining vehicles using composite weight:
     $$\text{Allocation Weight} = 0.6 \times \text{HealthScore} + 0.4 \times \left(100 - \frac{\text{Odometer}}{2000}\right)$$

---

### 3.5 Customer Loyalty Engine (`LoyaltyEngine`)
- **Purpose**: Manages point accumulation, redemption, and tier transitions.
- **Tier Structure**:
  - **BRONZE**: 0 - 499 pts (0% discount)
  - **SILVER**: 500 - 1,999 pts (5% discount)
  - **GOLD**: 2,000 - 4,999 pts (10% discount)
  - **PLATINUM**: 5,000+ pts (15% discount)
- **Point Conversion Rate**:
  - **Earning**: 1 point earned per ₹100 spent.
  - **Redemption**: 1 point = ₹0.50 monetary discount (capped at 50% of rental subtotal).

---

### 3.6 Operational Customer Risk Engine (`CustomerRiskEngine`)
- **Purpose**: Analyzes operational risk indicator (0.0 to 100.0) to prevent vehicle misuse, fraud, and default.
- **Risk Metrics**:
  - **Unverified KYC / License**: +30 risk points.
  - **Late Return History**: +10 risk points per incident.
  - **Damage History**: +15 to +40 risk points based on severity.
  - **Payment Failures**: +15 risk points per failed payment.
- **Risk Categories**:
  - `score < 30`: **LOW** (Standard booking)
  - `30 <= score < 60`: **MEDIUM** (Requires identity re-verification & security deposit)
  - `score >= 60`: **HIGH** (Manual admin approval required / High deposit)

---

### 3.7 Fleet Intelligence Engine (`FleetIntelligenceEngine`)
- **Purpose**: Aggregates fleet-wide metrics to generate operational reporting and actionable business insights.
- **Key Metrics**:
  - **Fleet Utilization Rate**: $(\text{Rented Vehicles} / \text{Total Fleet}) \times 100\%$
  - **Financial Metrics**: Total Revenue, Total Maintenance Cost, Net Profit.
  - **Average Fleet Health Score**.
- **Automated Insights**: Flag low utilization categories, high maintenance cost vehicles, and overdue service alerts.

---

## 4. Technical College Viva & Evaluation FAQ

### Q1: Why use rule-based engines instead of machine learning algorithms?
> **Answer**: In business-critical software such as vehicle rental platforms, rule-based engines offer complete **determinism**, **transparency**, **explainability**, and **auditability**. Rules can be verified instantly against business contracts without black-box unpredictability or requiring expensive ML training infrastructure.

### Q2: How is clean architecture maintained in Phase 5?
> **Answer**: The engines take domain entities (`Vehicle`, `Customer`, `Booking`, etc.) as input parameters or depend on interface contracts. They contain **zero SQL queries** and **zero HTTP response rendering**.

### Q3: How do the engines integrate with MySQL in VeloRent?
> **Answer**: Repositories fetch data from MySQL into C++ model domain objects. Services pass these domain objects into the business engines for calculation, and then persist results back through repositories in atomic database transactions.

---

## 5. Verification and Test Results

All 7 intelligence engines have been thoroughly verified with dedicated unit tests in `velorent_engine_tests`:

1. `test_pricing_engine.cpp` — Verifies base pricing, peak surcharges, duration discounts, and points redemption.
2. `test_recommendation_engine.cpp` — Verifies multi-factor vehicle ranking and sorting.
3. `test_vehicle_health_engine.cpp` — Verifies mileage, age, damage penalty scoring, and status transitions.
4. `test_vehicle_allocation_engine.cpp` — Verifies optimal allocation selection and low-health filtering.
5. `test_loyalty_engine.cpp` — Verifies earning rates, tier upgrades, and redemption caps.
6. `test_customer_risk_engine.cpp` — Verifies risk indicator scoring and action recommendations.
7. `test_fleet_intelligence_engine.cpp` — Verifies utilization, profit metrics, and automated insight generation.
