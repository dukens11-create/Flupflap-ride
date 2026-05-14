# FlupFlap Ride V7 — Expanded Build-Ready Scaffold

This V7 package adds more missing developer pieces for a ride-share, food delivery, courier, and FlupFlap Marketplace same-day delivery platform.

V7 includes:
- TypeScript backend architecture
- Zod validation schemas
- Auth templates
- Webhook templates
- Dispatch engine design
- Background jobs
- Wallet ledger templates
- Driver onboarding workflow
- Rider and driver Flutter screens
- Admin and merchant dashboard page stubs
- API documentation
- Security/compliance/operations docs
- QA and load-test templates

Important: this is still not a finished Uber-scale production system. It is a stronger developer handoff package.

## Backend quick start

1. Copy `.env.example` to `.env`.
2. Install dependencies: `npm install`
3. Build TypeScript: `npm run build`
4. Start API: `npm start`
5. Run core backend tests: `npm test`

## Environment configuration

Required in production:
- `JWT_SECRET`
- `ADMIN_SEED_PASSWORD`

Optional with safe defaults:
- `NODE_ENV` (default `development`)
- `PORT` (default `8080`)
- `LOG_LEVEL` (default `info`; supported: `debug|info|warn|error`)
- `DATA_STORE_MODE` (default `memory`; use `file` for lightweight persistence)
- `DATA_STORE_FILE` (default `.data/store.json`)

Use `.env.example` as the baseline and override values per environment.

## Containerization

Build and run with Docker:

1. `docker build -t flupflap-ride .`
2. `docker run --rm -p 8080:8080 --env-file .env flupflap-ride`

The Docker image builds TypeScript and runs the compiled server from `dist/server.js`.

## CI foundation

A GitHub Actions workflow is available at `.github/workflows/ci.yml` and runs:
- dependency install (`npm ci`)
- TypeScript build (`npm run build`)
- backend tests (`node --test dist/*.test.js`)

## Current backend bootstrap additions

- Centralized runtime environment loading and defaults in `env.ts`
- Data store bootstrap supports:
  - `DATA_STORE_MODE=memory` for scaffold/development
  - `DATA_STORE_MODE=file` for lightweight persisted JSON state
- Core route tests in `core.routes.test.ts` cover `/health` and auth signup flow
- Operational probes include `/health`, `/livez`, and `/readyz`
