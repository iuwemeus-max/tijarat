# Tijarat – UAE COD E‑Commerce Admin

A professional, production-minded UAE e-commerce control center built with Next.js (App Router), TypeScript, Tailwind, Prisma, and NextAuth. The platform enforces a flat UAE delivery rule, COD-only payments, RBAC, and a stock movement ledger to prevent overselling.

## Key Features
- **Admin dashboard** with KPIs (orders, gross revenue, COD outstanding, delivery fees, quantity sold) and recent orders.
- **Products management** with creation, activation toggle, pricing, and stock visibility.
- **Inventory ledger** capturing IN/OUT/ADJUST/RETURN movements and preventing negative stock on OUT.
- **Order workflow** covering PENDING_PAYMENT → delivery lifecycle, COD payment marking, and cancellation with stock release.
- **Checkout API** that validates carts server-side, enforces the UAE delivery rule (20 AED, free when quantity ≥ 5), locks stock in a transaction, and opens COD payment records.
- **Reports** summarizing revenue, delivery fees, COD paid vs unpaid, and order counts.
- **Secure authentication** via NextAuth credentials with JWT sessions, middleware protection for `/admin` and `/api/admin/*`, and role-based access (OWNER, ADMIN, WAREHOUSE, SUPPORT).

## Tech Stack
- Next.js 14 (App Router, TypeScript)
- Tailwind CSS with modern SaaS-style UI components
- Prisma ORM with PostgreSQL
- NextAuth (Credentials provider, JWT sessions)
- Zod validation for strong payload contracts

## Getting Started
1. **Install dependencies**
   ```bash
   npm install
   ```
2. **Environment** – copy the example and update secrets & database URL:
   ```bash
   cp .env.example .env
   ```
3. **Database** – generate the Prisma client and apply migrations (requires PostgreSQL):
   ```bash
   npx prisma generate
   npx prisma migrate dev
   ```
4. **Seed data** (creates owner/admin users and sample products):
   ```bash
   npx prisma db seed
   ```
5. **Run the app**
   ```bash
   npm run dev
   ```

## Business Rules (enforced server-side)
- Delivery fee: **20 AED**, waived when **total quantity ≥ 5** (applies across all emirates).
- Payment method: **Cash on Delivery only**. Orders start as **PENDING_PAYMENT**; admins mark payments **PAID** once collected.
- Inventory: All stock changes captured as **StockMovement** records; OUT operations prevent negative stock.

## Project Structure
- `src/app` – App Router routes (admin pages, auth, API handlers)
- `src/lib` – Auth helpers, Prisma client, business services, and validators
- `prisma/schema.prisma` – Database models for users, products, orders, payments, and stock movements
- `src/components` – Layout and UI building blocks (admin shell, KPI cards)

## Credentials & Roles
Default seeded accounts:
- `owner@tijarat.ae` / `owner123` (OWNER)
- `admin@tijarat.ae` / `admin123` (ADMIN)

Additional roles: **WAREHOUSE** (inventory + order status) and **SUPPORT** (read-only orders/products).

## Notes
- Middleware protects `/admin` and `/api/admin/*`; unauthenticated users are redirected to `/login`.
- Delivery logic and totals are computed on the server; the frontend only displays results returned by the backend.
- Canceling orders automatically returns stock via ledger entries.
