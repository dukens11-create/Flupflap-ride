# Setup

## Backend

1. Copy `.env.example` to `.env`.
2. Run `npm install`.
3. Run `npm run build`.
4. Start the API with `npm start`.

## Mobile (Expo)

1. `cd mobile`
2. `npm install`
3. `npm start`

Optional mobile validation:
- `npm run typecheck`

## Admin dashboard (Next.js)

1. `cd admin`
2. `cp .env.example .env.local`
3. Edit `.env.local` and set `NEXT_PUBLIC_API_BASE_URL` to the backend URL:
   - Same machine: `http://localhost:8080`
   - Another device on the LAN: `http://<host-LAN-IP>:8080` (e.g. `http://192.168.1.169:8080`)
4. `npm ci`
5. `npm run lint`
6. `npm run build`
7. `npm run dev`

> **Important:** `NEXT_PUBLIC_API_BASE_URL` is baked into the Next.js bundle at
> build time. If you change the value in `.env.local` after building, delete the
> `.next/` folder and run `npm run build` again (or restart `npm run dev`).

## Basic backend test run

Run `npm test` to compile and execute core API route tests.

## Health endpoints

- `/health` basic service status
- `/livez` liveness probe
- `/readyz` readiness probe with process uptime

## Docker quick run

1. `docker build -t drive .`
2. `docker run --rm -p 8080:8080 --env-file .env drive`

## Docker Compose stack

1. `cp .env.development.example .env`
2. `docker compose up --build`

This starts:

- Redis
- API container on `http://localhost:8080`
- queue worker container

## CI/CD reference

See `CI_CD.md` for GitHub Actions, release automation, deployment promotion, and environment configuration details.
