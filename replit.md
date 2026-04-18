# Clinic Booking App

A full-stack Nutrition Clinic Booking System for managing appointments, patients, invoices, and notifications.

## Architecture

This is a TypeScript monorepo using **pnpm workspaces**.

### Apps
- **`apps/clinic-app`** — React + Vite frontend dashboard (port 5000 in dev)
- **`apps/api-server`** — Express.js REST API backend
- **`apps/mockup-sandbox`** — UI component sandbox

### Packages
- **`packages/api-spec`** — OpenAPI YAML spec + Orval codegen config
- **`packages/api-zod`** — Zod schemas generated from OpenAPI spec
- **`packages/api-client-react`** — TanStack Query hooks generated from OpenAPI spec
- **`packages/db`** — Drizzle ORM + PostgreSQL database layer

## Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS v4, Radix UI, TanStack Query, Wouter, Framer Motion
- **Backend**: Node.js, Express 5, Drizzle ORM, Pino logging, Twilio (WhatsApp/SMS)
- **Database**: PostgreSQL via Supabase (connection in `.env`)
- **Auth**: OpenID Client
- **API**: OpenAPI spec-driven with Orval codegen

## Environment Variables

Stored in `.env`:
- `SUPABASE_URL` — Supabase project URL
- `SUPABASE_ANON_KEY` — Supabase anonymous key
- `MOYASAR_PUBLISHABLE_KEY` — Moyasar payment key

## Development

```bash
# Install dependencies
pnpm install

# Start frontend dev server (port 5000)
PORT=5000 pnpm --filter @workspace/clinic-app dev

# Run API server (set PORT env var)
PORT=3001 pnpm --filter @workspace/api-server dev

# Regenerate API types/hooks from OpenAPI spec
pnpm --filter @workspace/api-spec codegen
```

## Workflow

- **Start application**: `PORT=5000 pnpm --filter @workspace/clinic-app dev` (port 5000, webview)

## Deployment

### Replit (static site)
- Build: `PORT=5000 pnpm --filter @workspace/clinic-app build`
- Public dir: `apps/clinic-app/dist/public`

### Vercel
Configured via `vercel.json` at the root:
- Build command: `pnpm --filter @workspace/clinic-app build`
- Output directory: `apps/clinic-app/dist/public`
- SPA rewrites: all routes → `/index.html` (for client-side routing via Wouter)

To deploy: connect the repo to Vercel — it will auto-detect the `vercel.json` and use pnpm from the lockfile.
