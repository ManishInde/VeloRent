# VeloRent — REST API Testing & Curl Examples

This document provides ready-to-use `curl` commands to test the VeloRent REST API locally.

Ensure `velorent_server.exe` is running on `http://localhost:8080`.

---

## 1. System & Health Check

### API Version Info
```bash
curl -X GET http://localhost:8080/api
```

### Health Check (Database & Service Status)
```bash
curl -X GET http://localhost:8080/api/health
```

---

## 2. Vehicles API

### List All Vehicles
```bash
curl -X GET http://localhost:8080/api/vehicles
```

### Search Vehicles by Filter
```bash
curl -X GET "http://localhost:8080/api/vehicles?search=Honda&minPrice=1000&maxPrice=5000"
```

### Get Vehicle Details by ID
```bash
curl -X GET http://localhost:8080/api/vehicles/1
```

### Get Vehicle Health Score & Recommended Maintenance Actions
```bash
curl -X GET http://localhost:8080/api/vehicles/1/health
```

### Register New Vehicle
```bash
curl -X POST http://localhost:8080/api/vehicles \
  -H "Content-Type: application/json" \
  -d '{
    "registrationNumber": "KA05XY9999",
    "brand": "Toyota",
    "model": "Camry",
    "categoryId": 1,
    "type": "CAR",
    "baseRentalRate": 3500.0,
    "fuelType": "HYBRID",
    "transmission": "AUTOMATIC",
    "seats": 5
  }'
```

---

## 3. Dynamic Pricing & Recommendation Engines

### Get Dynamic Pricing Quote
```bash
curl -X POST http://localhost:8080/api/pricing/quote \
  -H "Content-Type: application/json" \
  -d '{
    "vehicleId": 1,
    "startDate": "2026-10-01",
    "endDate": "2026-10-10",
    "demandFactor": 1.2,
    "loyaltyTier": "GOLD"
  }'
```

### Get Ranked Vehicle Recommendations
```bash
curl -X POST http://localhost:8080/api/recommendations \
  -H "Content-Type: application/json" \
  -d '{
    "maxBudget": 3000.0,
    "category": "SEDAN",
    "fuelType": "PETROL",
    "transmission": "AUTOMATIC",
    "seating": 5
  }'
```

---

## 4. Customers & Risk Engine

### Register New Customer
```bash
curl -X POST http://localhost:8080/api/customers \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Alice Johnson",
    "email": "alice.johnson@example.com",
    "password": "Password123!",
    "phone": "9876543299",
    "drivingLicenseNumber": "DL998877",
    "licenseExpiry": "2030-12-31"
  }'
```

### Get Customer Profile
```bash
curl -X GET http://localhost:8080/api/customers/1
```

### Get Customer Risk Indicator Score & Actions
```bash
curl -X GET http://localhost:8080/api/customers/1/risk
```

### Get Customer Loyalty Tier & Points
```bash
curl -X GET http://localhost:8080/api/customers/1/loyalty
```

---

## 5. Booking & Rental Core Workflow

### Create Booking Reservation
```bash
curl -X POST http://localhost:8080/api/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": 1,
    "vehicleId": 1,
    "startDate": "2026-11-01",
    "endDate": "2026-11-05"
  }'
```

### Start Rental Pickup (Activate Booking #1)
```bash
curl -X POST http://localhost:8080/api/rentals/1/start
```

### Process Vehicle Return
```bash
curl -X POST http://localhost:8080/api/rentals/1/return \
  -H "Content-Type: application/json" \
  -d '{
    "returnOdometerKm": 15350,
    "hasDamage": false
  }'
```

---

## 6. Payments & Reviews

### Process Rental Payment
```bash
curl -X POST http://localhost:8080/api/payments \
  -H "Content-Type: application/json" \
  -d '{
    "rentalId": 1,
    "amount": 4000.0,
    "method": "CARD",
    "type": "RENTAL_FEE"
  }'
```

### Submit Customer Review
```bash
curl -X POST http://localhost:8080/api/reviews \
  -H "Content-Type: application/json" \
  -d '{
    "rentalId": 1,
    "rating": 5,
    "comment": "Excellent vehicle condition and smooth driving experience!"
  }'
```

---

## 7. Fleet Intelligence & Analytics

### Fleet Analytics Dashboard Report
```bash
curl -X GET http://localhost:8080/api/fleet/analytics
```

### Automated Fleet Operational Insights
```bash
curl -X GET http://localhost:8080/api/fleet/insights
```
