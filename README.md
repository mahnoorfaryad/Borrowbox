# 📦 BorrowBox

**Borrow what you need. Lend what you don't.**

BorrowBox is a full-stack community platform for lending and borrowing tools and equipment. Members list items they own, others search by date-wise availability, send a borrow request, and both sides track the item's condition and rate each other once it's returned.

Built on the **PERN stack** — PostgreSQL, Express.js, React, Node.js.

---

## ✨ What it does

- **Availability engine** — a date-overlap SQL query means the system always knows which dates are free and never double-books an item.
- **Booking life-cycle** — every request moves through a state machine: `REQUESTED → APPROVED → PICKED_UP → RETURNED`, with `REJECTED` / `CANCELLED` branches and strict role-based rules on every transition.
- **Condition check-in / check-out** — the item's condition is logged at handover and again at return, creating a permanent audit trail.
- **Trust score** — two-way reviews after every completed booking build a rating for each member.
- **Full CRUD everywhere** — users, categories, items, bookings, reviews and condition logs all support create/read/update/delete through both the API and the UI.
- **Role-based access** — Guest, Member (lender + borrower in one account) and Admin.

---

## 🗂️ Project structure

```
borrowbox/
├── client/              React app (Vite)
│   └── src/
│       ├── api/         axios instance with JWT interceptor
│       ├── components/  Navbar, ItemCard, StatusBadge, BookingForm, ...
│       ├── context/     AuthContext, ToastContext
│       ├── pages/       Home, ItemDetail, Dashboard, Admin, ...
│       └── routes/      ProtectedRoute, AdminRoute
├── server/
│   ├── src/
│   │   ├── config/      db.js (pg Pool)
│   │   ├── controllers/ auth, users, items, categories, bookings, reviews, admin
│   │   ├── middleware/  auth.js, role.js, errorHandler.js
│   │   ├── routes/      one file per module
│   │   ├── services/    bookingService.js — business rules + transactions
│   │   └── db/          schema.sql, seed.sql, setup.js
│   └── server.js
└── README.md
```

---

## 🚀 Getting started

### 1. Prerequisites
- Node.js 18+
- PostgreSQL 14+ running locally (or a hosted instance)

### 2. Database

Create an empty database, then apply the schema and seed data:

```bash
createdb borrowbox
```

### 3. Backend

```bash
cd server
cp .env.example .env
# edit .env — set DATABASE_URL and a real JWT_SECRET
npm install
npm run db:setup     # applies schema.sql + seed.sql
npm run dev          # starts the API on http://localhost:5000
```

### 4. Frontend

```bash
cd client
cp .env.example .env   # VITE_API_URL=http://localhost:5000/api
npm install
npm run dev             # starts the app on http://localhost:5173
```

### 5. Log in

Seeded accounts (all use password `Password123`):

| Email | Role |
|---|---|
| admin@borrowbox.app | admin |
| ali@borrowbox.app | member |
| sara@borrowbox.app | member |
| bilal@borrowbox.app | member |

The seed file ships with a real, working bcrypt hash for `Password123`, so `npm run db:setup` gets you straight into a fully seeded, ready-to-log-in database.

---

## 🔑 Core business rules

| # | Rule |
|---|---|
| 1 | A member cannot borrow their own item. |
| 2 | `start_date` can't be in the past; `end_date` ≥ `start_date`. |
| 3 | Borrow duration can't exceed the item's `max_days`. |
| 4 | Requested dates can't overlap any `APPROVED`/`PICKED_UP` booking on the same item. |
| 5 | Only active items owned by active users can be requested. |
| 6 | A borrower may have at most 3 open bookings at once. |
| 7 | Only the owner can approve/reject/pickup/return; only the borrower can cancel. |
| 8 | Status can only move in the allowed order — invalid moves return `409`. |
| 9 | Approving a booking auto-rejects other clashing `REQUESTED` bookings — all inside one DB transaction. |
| 10 | Reviews open only after `RETURNED`, one per person per booking. |
| 11 | An item with open bookings can't be deleted; one with history is deactivated instead. |
| 12 | A booking can be edited only while `REQUESTED`, deleted only when `REJECTED`/`CANCELLED`. |
| 13 | Only the author (or an admin) can edit/delete a review. |

## 📡 API overview

All responses follow `{ success, data, message }`. Errors use `400` (validation), `401` (not logged in), `403` (not allowed), `404` (not found), `409` (date overlap / invalid status change).

- `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
- `PUT /api/users/me`, `DELETE /api/users/me`, `GET /api/users/:id`
- `GET/POST/PUT/DELETE /api/categories`
- `GET /api/items`, `GET /api/items/mine`, `GET /api/items/:id`, `GET /api/items/:id/availability`, `POST/PUT/DELETE /api/items/:id`
- `POST /api/bookings`, `GET /api/bookings/mine`, `GET /api/bookings/incoming`, `GET/PUT/DELETE /api/bookings/:id`, `PATCH /api/bookings/:id/status`
- `POST /api/bookings/:id/reviews`, `PUT/DELETE /api/reviews/:id`
- `GET /api/admin/stats`, `GET /api/admin/users`, `PATCH /api/admin/users/:id/status`, `GET/DELETE /api/admin/items`

---

## 🎨 Design system

Navy `#012894` · Blue `#1E8FD5` · Teal `#0E9F9A` · Indigo `#5B4BC4`

Status colours are consistent everywhere: `REQUESTED` (amber) · `APPROVED` (sky) · `PICKED_UP` (indigo) · `RETURNED` (emerald) · `REJECTED` (rose) · `CANCELLED` (slate).

---

**Lend it. Borrow it. Track it.** 📦
