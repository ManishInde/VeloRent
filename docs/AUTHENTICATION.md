# VeloRent Security & Authentication Architecture (Phase 7)

## 1. Overview

Phase 7 introduces full backend authentication, password security, stateless request identity, role-based authorization (RBAC), and customer resource ownership enforcement across all VeloRent REST API endpoints.

---

## 2. Authentication Flow Architecture

```text
Client Application
       │
       │ HTTP Request + "Authorization: Bearer <JWT>"
       ▼
HttpServer (CORS / Security Headers: X-Content-Type-Options)
       │
       ▼
AuthMiddleware::extractAuthContext()
  ├── Decodes HMAC-SHA256 JWT
  ├── Verifies Signature & Expiration (`exp`)
  ├── Checks Revocation List (`jti`)
  └── Populates AuthContext (userId, email, role, status)
       │
       ▼
Controller Authorization Assertions
  ├── AuthMiddleware::requireAuthenticated(auth)
  ├── AuthMiddleware::requireRole(auth, role)
  └── AuthMiddleware::checkOwnership(auth, targetCustomerId)
       │
       ▼
Service Layer & Repositories
       │
       ▼
MySQL velorent Database
```

---

## 3. Password Security & Hashing Algorithm

- **Algorithm**: Bcrypt (`$2b$`) adaptive password hashing function.
- **Cost Factor**: `12` iterations.
- **Salt Generation**: 16 bytes of cryptographically secure random salt per password.
- **Rules**: Plaintext passwords are **NEVER** stored, logged, or exposed in API request/response payloads.

### Sample Test Credentials (Development Only)

> [!CAUTION]
> These credentials are strictly for local academic development testing. **Never commit real credentials to production.**

- **Default Password for all sample users**: `VeloRent@2026`

| Role | Name | Email | User ID |
| :--- | :--- | :--- | :---: |
| **ADMIN** | Arjun Mehta | `arjun.mehta@velorent.in` | 1 |
| **FLEET_MANAGER** | Ravi Krishnamurthy | `ravi.km@velorent.in` | 3 |
| **MAINTENANCE_STAFF** | Mohammed Salim | `salim.m@velorent.in` | 5 |
| **CUSTOMER** | Aditya Kumar | `aditya.kumar@gmail.com` | 7 |
| **CUSTOMER** | Neha Gupta | `neha.gupta@gmail.com` | 8 |

---

## 4. Token Strategy (HMAC-SHA256 JWT)

- **Token Type**: Signed JSON Web Token (JWT).
- **Signing Algorithm**: `HS256` (HMAC with SHA-256).
- **Secret Management**: Loaded dynamically from `config/config.json` (`auth.jwt_secret`) or `AUTH_JWT_SECRET` environment variable.
- **Token Claims**:
  - `sub`: User ID (`int`)
  - `email`: Email address (`string`)
  - `role`: Role discriminator (`CUSTOMER`, `ADMIN`, `FLEET_MANAGER`, `MAINTENANCE_STAFF`)
  - `status`: Account status (`ACTIVE`)
  - `iat`: Token issued timestamp (seconds)
  - `exp`: Token expiration timestamp (`iat + 86400`)
  - `jti`: Unique token identifier string for revocation tracking
- **Logout Strategy**: Server-side token revocation tracking (`TokenManager::revokeToken(jti)`).

---

## 5. Role Authorization Matrix

| Endpoint Category | Public | CUSTOMER | FLEET_MANAGER | MAINTENANCE_STAFF | ADMIN |
| :--- | :---: | :---: | :---: | :---: | :---: |
| `GET /api`, `/api/health` | Yes | Yes | Yes | Yes | Yes |
| `POST /api/auth/login` | Yes | Yes | Yes | Yes | Yes |
| `POST /api/customers` (Register) | Yes | Yes | Yes | Yes | Yes |
| `GET /api/vehicles`, `GET /api/vehicles/{id}` | Yes | Yes | Yes | Yes | Yes |
| `POST /api/pricing/quote`, `GET /api/recommendations` | Yes | Yes | Yes | Yes | Yes |
| `GET /api/auth/me`, `POST /api/auth/logout` | No | Yes | Yes | Yes | Yes |
| `POST /api/bookings` | No | Own Only | No | No | Yes |
| `GET /api/customers/{id}/*` (Profile, History, Loyalty, Risk) | No | Own Only | Risk/Fleet | No | Yes |
| `POST /api/rentals/{id}/start`, `return` | No | Own Only | Yes | No | Yes |
| `POST /api/payments`, `POST /api/reviews` | No | Own Only | No | No | Yes |
| `GET /api/vehicles/{id}/health` | No | No | Yes | Yes | Yes |
| `GET /api/maintenance`, `POST /api/maintenance` | No | No | Yes | Yes | Yes |
| `POST /api/maintenance/{id}/complete` | No | No | No | Yes | Yes |
| `GET /api/fleet/analytics`, `GET /api/fleet/insights` | No | No | Yes | No | Yes |
| `POST /api/vehicles` (Add Vehicle), `DELETE /api/vehicles/{id}` | No | No | Yes (Create) | No | Yes |

---

## 6. Resource Ownership Rules

- When a `CUSTOMER` accesses customer-specific endpoints (`/api/customers/{id}/*`, `/api/bookings`, `/api/reviews`, etc.), the controller enforces:
  $$\text{targetCustomerId} == \text{AuthContext.userId}$$
- If a customer attempts to query or modify another customer's data, the API immediately returns `403 Forbidden` (`FORBIDDEN`).
- `ADMIN` role is granted global system access.

---

## 7. Security Headers & CORS Configuration

- **Security Header**: `X-Content-Type-Options: nosniff`
- **Configurable CORS**: Allowed origins configured in `config.json` (`cors.allowed_origin`), e.g.:
  `http://localhost:3000,http://127.0.0.1:3000`
- **Brute-Force Protection**: `AuthService` tracks failed login attempts per email/IP (5 failed attempts locks login for 900 seconds / 15 minutes).
