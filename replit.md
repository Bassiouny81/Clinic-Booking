# عيادتي — Nutrition Clinic Management System

## Overview

Full-stack clinic management system for the Saudi market. Arabic-first RTL UI, ZATCA-compliant invoicing, Moyasar payments, Twilio WhatsApp notifications, and Replit Auth.

## Application

- **clinic-app** (React + Vite at `/`): Full clinic management dashboard
  - **Login page** — Replit Auth with "book without login" option
  - **Public booking page** (`/book`) — 3-step flow: service → details → confirm + Moyasar payment
  - **Dashboard** — stats, upcoming appointments, quick-action buttons (all wired)
  - **Appointments** — list, create, confirm, complete, cancel
  - **Patients** — card grid, search, add patient, clickable detail slide panel with appointment history
  - **Invoices** — create with line items, VAT calc, print ZATCA-compliant HTML invoice, Moyasar pay
  - **Notifications** — WhatsApp send, type selector (confirmation/reminder/follow-up/custom), history log

- **api-server** (Express 5 at `/api`): REST API backend
  - Auth: `/api/login`, `/api/callback`, `/api/logout`, `/api/auth/user` (Replit OIDC)
  - Resources: patients, appointments, invoices, services, doctors, notifications, patientFiles, booking
  - Payments: `POST /api/payments/initiate` (Moyasar), `GET /api/invoices/:id/print` (ZATCA HTML)
  - Role guards: `requireAuth` applied to patients list, appointments list, invoices, dashboard stats

## Integrations & Keys

- **Moyasar**: `MOYASAR_SECRET_KEY`, `MOYASAR_PUBLISHABLE_KEY` — SAR payments (Mada, Apple Pay, STC Pay)
- **Twilio**: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_WHATSAPP_FROM` — WhatsApp notifications
- **Replit Auth**: OIDC via `REPL_ID`, sessions stored in PostgreSQL `sessions` table

## Saudi/ZATCA Compliance

- All prices in SAR (ريال سعودي)
- VAT rate: 15% (standard KSA rate)
- Invoice HTML includes clinic CR number, VAT number, ZATCA Phase 1 notice
- `GET /api/invoices/:invoiceId/print` renders printable Arabic invoice with Cairo font

## Stack

- **Monorepo**: pnpm workspaces
- **Node.js**: 24, **pnpm**: latest, **TypeScript**: 5.9
- **API**: Express 5 + Drizzle ORM + PostgreSQL
- **Frontend**: React 18 + Vite + Tailwind CSS + shadcn/ui + TanStack Query
- **Auth**: Replit OpenID Connect (PKCE), sessions in DB
- **Payments**: Moyasar REST API
- **Notifications**: Twilio WhatsApp API (real sending)
- **API codegen**: Orval from OpenAPI 3.1 spec

## Structure

```
artifacts/
  api-server/          Express API (port via $PORT, proxied at /api)
    src/routes/        auth, patients, appointments, invoices, notifications,
                       services, doctors, patientFiles, booking, payments
    src/lib/           auth.ts, whatsapp.ts, logger.ts
    src/middlewares/   authMiddleware.ts, roleMiddleware.ts
  clinic-app/          React+Vite frontend (port via $PORT, proxied at /)
    src/pages/         dashboard, appointments, patients, invoices,
                       notifications, book, not-found
    src/components/    layout.tsx, ui/* (shadcn)
    src/hooks/         use-clinic.ts (mutations + formatters)
lib/
  api-spec/            openapi.yaml + orval.config.ts
  api-client-react/    Generated TanStack Query hooks
  api-zod/             Generated Zod schemas
  db/                  Drizzle schema + DB connection
    src/schema/        appointments, patients, invoices, services, doctors,
                       notifications, patientFiles, auth (users+sessions)
  replit-auth-web/     useAuth() React hook
```

## Key Commands

```bash
pnpm --filter @workspace/db run push          # Apply DB schema changes
pnpm --filter @workspace/api-spec run codegen # Regenerate API client + Zod types
pnpm --filter @workspace/api-server run dev   # Run API server
pnpm --filter @workspace/clinic-app run dev   # Run frontend
```

## DB Schema Tables

`users`, `sessions`, `patients`, `doctors`, `services`, `appointmentTypes`, `appointments`, `invoices`, `invoiceItems`, `notifications`, `patientFiles`

## User Roles

`role` column on `users` table: `patient` | `doctor` | `admin` (default: `patient`)
