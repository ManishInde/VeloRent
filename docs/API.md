# VeloRent — Phase 7: Secured REST API Specification Reference

## 1. Overview

The VeloRent REST API provides a standardized JSON interface to access fleet inventory, process bookings and rentals, manage maintenance tasks, trigger intelligence engines, and calculate business analytics.

- **Base URL**: `http://localhost:8080`
- **Content-Type**: `application/json`
- **Authentication Header**: `Authorization: Bearer <JWT_TOKEN>`
- **Architecture**: Secured 3-Tier Layered Architecture (Controllers $\to$ Services/Engines $\to$ Repositories $\to$ MySQL)

---

## 2. Authentication Baseline (Phase 7)

All protected API endpoints require an authenticated Bearer token. Include the token returned by `POST /api/auth/login` in request headers:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 3. Standard Response Formats

### Success Response (`200 OK`, `201 Created`)
```json
{
    "success": true,
    "data": { ... }
}
```

### Collection Response (`200 OK`)
```json
{
    "success": true,
    "data": [ ... ],
    "count": 10
}
```

### Error Response (`400`, `401`, `403`, `404`, `409`, `422`, `500`)
```json
{
    "success": false,
    "error": {
        "code": "UNAUTHORIZED",
        "message": "Authentication required. Please provide a valid Bearer token."
    }
}
```

---

## 4. HTTP Status Codes Matrix

| Code | Status | Usage |
| :--- | :--- | :--- |
| **200** | OK | Successful GET, PUT, PATCH, or action execution |
| **201** | Created | Successful resource creation (POST) |
| **204** | No Content | Successful OPTIONS pre-flight check |
| **400** | Bad Request | Malformed JSON request or parameter validation failure |
| **401** | Unauthorized | Missing, invalid, or expired Bearer token / bad login credentials |
| **403** | Forbidden | User lacks required role or is attempting to access another customer's resource |
| **404** | Not Found | Requested entity or endpoint does not exist |
| **409** | Conflict | Business logic conflict (e.g. vehicle unavailable or booking overlap) |
| **422** | Unprocessable Entity | Domain rule violation or invalid transaction input |
| **500** | Internal Server Error | Unhandled server exception |
| **503** | Service Unavailable | Database connectivity failure |

---

## 5. Endpoints Reference

### 5.1 Authentication Endpoints (NEW - Phase 7)
- `POST /api/auth/login` — Authenticate user using email & password. Returns JWT token. (Public)
- `POST /api/auth/logout` — Invalidate active Bearer token. (Protected)
- `GET /api/auth/me` — Retrieve current authenticated user profile. (Protected)

### 5.2 System & Health
- `GET /api` — Returns API version and running status. (Public)
- `GET /api/health` — Checks service and MySQL database connection health. (Public)

### 5.3 Vehicle Endpoints
- `GET /api/vehicles` — Search vehicles. (Public)
- `GET /api/vehicles/{id}` — Fetch vehicle details. (Public)
- `GET /api/vehicles/{id}/health` — Returns real-time health score computed by `VehicleHealthEngine`. (FLEET_MANAGER, MAINTENANCE_STAFF, ADMIN)
- `POST /api/vehicles` — Create a new vehicle. (FLEET_MANAGER, ADMIN)
- `PUT /api/vehicles/{id}` — Update rental rate and details. (FLEET_MANAGER, ADMIN)
- `PATCH /api/vehicles/{id}/status` — Update operational status (`AVAILABLE`, `RENTED`, `MAINTENANCE`, `OUT_OF_SERVICE`). (FLEET_MANAGER, MAINTENANCE_STAFF, ADMIN)
- `DELETE /api/vehicles/{id}` — Soft deactivate vehicle. (ADMIN)

### 5.4 Customer Endpoints
- `POST /api/customers` — Self-register new customer profile. (Public)
- `GET /api/customers/{id}` — Get customer details. (CUSTOMER owner, ADMIN)
- `GET /api/customers/{id}/bookings` — Retrieve customer booking history. (CUSTOMER owner, ADMIN)
- `GET /api/customers/{id}/rentals` — Retrieve customer rental history. (CUSTOMER owner, ADMIN)
- `GET /api/customers/{id}/loyalty` — Get customer loyalty account status, points, and current tier. (CUSTOMER owner, ADMIN)
- `GET /api/customers/{id}/risk` — Get operational risk indicator score. (CUSTOMER owner, FLEET_MANAGER, ADMIN)

### 5.5 Booking Endpoints
- `POST /api/bookings` — Create a booking reservation. Identity derived from token for CUSTOMER. (CUSTOMER, ADMIN)
- `GET /api/bookings/{id}` — Retrieve booking details. (CUSTOMER owner, ADMIN)
- `POST /api/bookings/{id}/cancel` — Cancel active booking. (CUSTOMER owner, ADMIN)

### 5.6 Rental Endpoints
- `POST /api/rentals/{id}/start` — Convert confirmed booking to active rental. (CUSTOMER owner, FLEET_MANAGER, ADMIN)
- `GET /api/rentals/{id}` — Retrieve rental record. (CUSTOMER owner, FLEET_MANAGER, ADMIN)
- `POST /api/rentals/{id}/return` — Return vehicle and record mileage. (CUSTOMER owner, FLEET_MANAGER, ADMIN)

### 5.7 Payment Endpoints
- `POST /api/payments` — Process payment for a rental (`CARD`, `UPI`, `NET_BANKING`, `CASH`). (CUSTOMER owner, ADMIN)

### 5.8 Review Endpoints
- `POST /api/reviews` — Submit completed rental rating and comment. (CUSTOMER owner, ADMIN)
- `GET /api/vehicles/{id}/reviews` — Fetch reviews for a vehicle. (Public)
- `GET /api/customers/{id}/reviews` — Fetch reviews written by customer. (CUSTOMER owner, ADMIN)

### 5.9 Maintenance Endpoints
- `GET /api/maintenance` — List open maintenance requests. (FLEET_MANAGER, MAINTENANCE_STAFF, ADMIN)
- `GET /api/maintenance/{id}` — Retrieve maintenance task. (FLEET_MANAGER, MAINTENANCE_STAFF, ADMIN)
- `POST /api/maintenance` — Schedule maintenance task manually or link damage report. (FLEET_MANAGER, MAINTENANCE_STAFF, ADMIN)
- `POST /api/maintenance/{id}/complete` — Complete maintenance task and record cost. (MAINTENANCE_STAFF, ADMIN)
- `PATCH /api/maintenance/{id}/status` — Update status (`OPEN`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`). (FLEET_MANAGER, MAINTENANCE_STAFF, ADMIN)

### 5.10 Loyalty Endpoints
- `POST /api/customers/{id}/loyalty/redeem` — Validate and redeem loyalty points. (CUSTOMER owner, ADMIN)
- `POST /api/customers/{id}/loyalty/earn` — Award loyalty points. (CUSTOMER owner, ADMIN)

### 5.11 Notification Endpoints
- `GET /api/customers/{id}/notifications` — Fetch user in-app notifications. (Target User, ADMIN)
- `GET /api/notifications/{id}` — Get notification. (Target User, ADMIN)
- `PATCH /api/notifications/{id}/read` — Mark notification read. (Target User, ADMIN)
- `POST /api/notifications` — Send notification. (FLEET_MANAGER, ADMIN)

### 5.12 Intelligence & Pricing Endpoints
- `POST /api/pricing/quote` — Compute dynamic rental quote using `PricingEngine`. (Public)
- `GET /api/recommendations` / `POST /api/recommendations` — Return ranked vehicle recommendations matching preferences. (Public)
- `POST /api/vehicles/allocate` — Select optimal vehicle matching booking specs. (CUSTOMER, ADMIN)

### 5.13 Fleet Analytics Endpoints
- `GET /api/fleet/analytics` — Fleet utilization %, revenue, maintenance cost, profit, and health summary. (FLEET_MANAGER, ADMIN)
- `GET /api/fleet/insights` — Actionable fleet operational insights generated by `FleetIntelligenceEngine`. (FLEET_MANAGER, ADMIN)
