# Troubleshooting Guide

## "Invalid environment configuration" on backend startup
The backend validates `process.env` against a Zod schema (`backend/src/config/env.js`) and exits
immediately if anything required is missing or malformed. Read the printed `fieldErrors` — it names
the exact variable. Most common cause: `.env` wasn't created (`cp .env.example .env`) or
`JWT_SECRET` is shorter than 16 characters.

## Backend container restarts in a loop / "Can't reach database server"
- `docker compose ps` → confirm `db` shows `healthy`, not just `running`.
- The backend's `docker-entrypoint.sh` runs `prisma migrate deploy` before starting the server — if
  Postgres isn't ready yet, this fails and the container exits (compose then restarts it). The
  `depends_on: condition: service_healthy` in `docker-compose.yml` should prevent this, but on a slow
  first boot you may see one or two restarts before Postgres finishes initializing — that's normal;
  it should stabilize within ~30s.
- If it never stabilizes: `docker compose logs db` — check `POSTGRES_PASSWORD` in `.env` matches what
  `DATABASE_URL` expects (they're derived from the same `.env` values in `docker-compose.yml`, so this
  usually only breaks if you edited one and not the other after the volume already initialized with
  old credentials — see "Postgres ignores my new password" below).

## Postgres ignores my new POSTGRES_PASSWORD after I changed .env
Postgres only applies `POSTGRES_USER`/`POSTGRES_PASSWORD`/`POSTGRES_DB` on **first initialization** of
its data volume. If you change `.env` after the volume already exists, Postgres keeps the old
credentials. Fix: `docker compose down -v` (⚠ deletes all data) and `./scripts/start.sh` again, or
manually `ALTER USER forge WITH PASSWORD '...'` inside the existing container.

## Login/register returns 403 "Invalid or missing CSRF token"
The frontend must call `GET /api/auth/csrf-token` once (it does, in `AuthContext`'s mount effect)
before any POST/PUT/DELETE — that response sets the `forge_csrf` cookie, which the API client reads
and echoes back as the `x-csrf-token` header on every mutating request. If you're calling the API
directly (Postman/curl), you must do the same: fetch the cookie first, then send it back as a header.
This is also the expected, correct behavior if something forges a cross-site request — see
`backend/src/middleware/csrf.js`.

## Login appears to succeed but I'm immediately logged out / `GET /api/auth/me` returns 401
Almost always a cookie `SameSite`/domain mismatch:
- Frontend and backend on **different domains** (e.g. Vercel + Railway)? You need
  `COOKIE_SAMESITE=none` + `COOKIE_SECURE=true` (which requires HTTPS) — see
  [DEPLOYMENT.md](DEPLOYMENT.md#cross-domain-frontendbackend).
- Testing over plain `http://` with `COOKIE_SECURE=true`? Browsers drop `Secure` cookies on non-HTTPS
  origins. Use `COOKIE_SECURE=false` for local HTTP development.
- Check DevTools → Application → Cookies — if `forge_token` isn't there at all, the `Set-Cookie`
  response header is likely being stripped by an intermediate proxy that doesn't forward it; if it's
  there but requests don't include it, check `credentials: 'include'` is set on every fetch (it is,
  in `frontend/src/api/client.js` — only relevant if you've customized the client).

## CORS error in the browser console
`CORS_ORIGIN` on the backend must be the **exact** origin (scheme + host + port) the frontend is
served from. `http://localhost:5173` ≠ `http://127.0.0.1:5173` ≠ `https://localhost:5173`. If you're
running the bundled nginx proxy (production/docker setup), CORS shouldn't be in play at all since the
browser only ever talks to one origin — a CORS error there usually means you're accidentally hitting
the backend port directly instead of going through nginx.

## Dashboard/strength chart shows "No sessions logged yet" but I logged workouts
- The strength chart filters by **exact exercise name match** (case-insensitive) against the four
  presets (Bench Press, Squat, Deadlift, OHP — note the original prototype's "Overhead Press" tab maps
  to the exercise name "Overhead Press", the chart tab label says "OHP" for brevity). Make sure the
  exercise name you typed matches one of those, or pick a different exercise via the chart tabs.
- The dashboard endpoints are scoped to the logged-in user — logging in as a different account (or
  the demo account) won't show another account's workouts.

## `npm run prisma:migrate` fails with "Environment variable not found: DATABASE_URL"
You're running it outside the directory with the `.env` Prisma reads, or the `.env` wasn't created.
Run it from `backend/` with `backend/.env` present (Prisma's CLI loads `.env` from the current working
directory, not the project root).

## Jest tests fail with a Postgres connection error
They shouldn't need one — `tests/health.test.js` only hits `/api/health` and validation-rejected
requests, neither of which touches Prisma. If you added a new test that does touch the database,
either mock Prisma or point `DATABASE_URL` (in `tests/env.setup.js` or your shell) at a real test
database.

## AI plan enrichment isn't doing anything / always shows the rule-engine text
Expected when `AI_PROVIDER=none` (the default) — that's by design, not a bug. If you set
`AI_PROVIDER=anthropic` or `openai` and it's still falling back, check the backend logs for a `warn`
level entry from `ai.service.js` — it logs the reason (missing key, timeout, non-2xx response, or
output that failed validation) every time it falls back.

## Docker build is slow / image is huge
The backend Dockerfile already uses a multi-stage build with `npm install --omit=dev` in the final
stage. If you've added new dependencies, make sure dev-only tools (test runners, linters) stay in
`devDependencies` in `package.json`, not `dependencies`.
