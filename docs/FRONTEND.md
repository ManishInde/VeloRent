# VeloRent Frontend Architecture & Design System (Phase 8A)

## 1. Overview

Phase 8A establishes the professional frontend foundation for **VeloRent Intelligent Vehicle Rental and Fleet Management System**. Built with Next.js (App Router), TypeScript, and Tailwind CSS, the frontend provides a responsive, role-gated user interface backed exclusively by the live C++ REST API (`http://localhost:8080`).

---

## 2. Technology Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript (Strict Mode)
- **Styling**: Tailwind CSS v4 + Vanilla CSS Design Tokens
- **Icons**: Lucide React
- **HTTP Client**: Centralized Fetch Wrapper (`lib/api/client.ts`)
- **State Management**: React Context (`AuthProvider`, `ToastProvider`)
- **UI Architecture**: Modular Reusable Atomic Components

---

## 3. Directory Structure

```text
frontend/
├── app/
│   ├── globals.css                # CSS Variables, Design Tokens, Scrollbars, Themes
│   ├── layout.tsx                 # Root Layout with AuthProvider & ToastProvider
│   ├── page.tsx                   # Root Redirect Handler
│   ├── login/
│   │   └── page.tsx               # Login Page with Suspense & Real Authentication
│   ├── customer/
│   │   ├── page.tsx               # Customer Dashboard Shell
│   │   ├── vehicles/page.tsx      # Vehicle Marketplace Foundation (GET /api/vehicles)
│   │   ├── bookings/page.tsx      # Bookings Placeholder
│   │   ├── rentals/page.tsx       # Rentals Placeholder
│   │   ├── loyalty/page.tsx       # Loyalty Rewards Placeholder
│   │   ├── notifications/page.tsx # Notifications Placeholder
│   │   └── profile/page.tsx       # User Profile Placeholder
│   ├── admin/                     # Admin Scaffolded Shell Pages
│   ├── fleet/                     # Fleet Manager Scaffolded Shell Pages
│   └── maintenance/               # Maintenance Staff Scaffolded Shell Pages
├── components/
│   ├── ui/                        # Reusable UI Library (Button, Input, Card, Badge, Modal, etc.)
│   ├── layout/                    # AppShell, Topbar, Sidebar, PlaceholderPage
│   ├── auth/                      # ProtectedRoute Guard
│   └── vehicles/                  # VehicleCard, VehicleGrid, VehicleFilterPanel
├── lib/
│   ├── api/
│   │   └── client.ts              # Centralized Fetch Client (Bearer Auth & HTTP Error Handling)
│   └── auth/
│       └── AuthContext.tsx        # Authentication Context & Token Lifecycle
├── types/
│   └── index.ts                   # TypeScript API & Domain Contract Interfaces
├── .env.example                   # API Base URL Environment Config Template
├── .env.local                     # Local Development Environment Overrides
└── package.json
```

---

## 4. Design System & Visual Identity

### Color Palette Tokens

- **Primary Brand**: Deep Slate (`#0F172A` / `#1E293B`)
- **Accent Brand**: Indigo/Blue (`#2563EB` / `#1D4ED8`)
- **Background**: Soft Neutral (`#F8FAFC` light / `#0B0F17` dark)
- **Surface**: Pure White (`#FFFFFF` light / `#111827` dark)
- **Borders**: Slate Border (`#E2E8F0` light / `#1F2937` dark)
- **Status Indicators**:
  - `AVAILABLE` / Success: Emerald (`#10B981`)
  - `RENTED` / Info: Blue (`#3B82F6`)
  - `MAINTENANCE` / Warning: Amber (`#F59E0B`)
  - `RESERVED`: Purple (`#8B5CF6`)
  - `DECOMMISSIONED` / Risk: Rose (`#F43F5E`)

### Guidelines

- Zero Emojis: All icons are SVG icons powered by `lucide-react`.
- Zero Fake Business Data: Displays polished `EmptyState` components when collections are empty.
- Fully Responsive: Desktop-first layout with mobile navigation drawer.

---

## 5. Centralized API Integration & Auth Flow

### API Client (`lib/api/client.ts`)

All HTTP communication flows through `apiClient.get()`, `post()`, `put()`, `patch()`, `delete()`.
- Automatically attaches `Authorization: Bearer <token>` from `localStorage`.
- Intercepts `401 Unauthorized` responses $\to$ clears session and redirects to `/login?expired=true`.
- Intercepts `403 Forbidden` responses $\to$ surfaces permission error alert.

### Authentication Context (`lib/auth/AuthContext.tsx`)

- On app initialization, checks `localStorage` for `velorent_token`.
- Executes `GET /api/auth/me` to validate session identity with C++ backend.
- Stores non-sensitive user identity (`userId`, `name`, `email`, `role`, `status`).

---

## 6. Role-Based Route Protection (`components/auth/ProtectedRoute.tsx`)

Each protected page route wraps its content inside `<ProtectedRoute allowedRoles={[...]}>`:
- **Unauthenticated**: Redirects to `/login?redirect=<pathname>`.
- **Authenticated CUSTOMER**: Access to `/customer/*`.
- **Authenticated ADMIN**: Access to `/admin/*`.
- **Authenticated FLEET_MANAGER**: Access to `/fleet/*`.
- **Authenticated MAINTENANCE_STAFF**: Access to `/maintenance/*`.

---

## 7. Environment Variables

| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_API_BASE_URL` | `http://localhost:8080` | URL of the C++ REST API Server |

---

## 8. Development & Build Commands

Run all commands inside the `frontend/` directory:

```bash
# Install dependencies
npm install

# Start local Next.js dev server (http://localhost:3000)
npm run dev

# Run ESLint validation
npm run lint

# Production build compilation
npm run build

# Start production server
npm start
```

---

## 9. Future Frontend Phases

- **Phase 8B**: Complete Customer Booking Workflow, Dynamic Pricing Quotes, Interactive Rental Checkout & Returns, Payment Gateway Forms, and Review Submissions.
- **Phase 8C**: Advanced Fleet Management Dashboards, Vehicle Health Scoring Graphs, Preventive Maintenance Task Board, and Admin User Management.
