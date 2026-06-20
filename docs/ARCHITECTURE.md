# Architecture

## Request flow (production / docker-compose)

```
                         ┌─────────────────────────┐
   Browser  ───HTTPS───▶ │  nginx (frontend image)  │
                         │  - serves React build    │
                         │  - proxies /api/* ───────┼──┐
                         └─────────────────────────┘  │
                                                       ▼
                                         ┌───────────────────────┐
                                         │  Express API (backend) │
                                         │  helmet · cors · cookie│
                                         │  -parser · rate-limit  │
                                         │  -er · pino-http log   │
                                         │                        │
                                         │  routes → controllers  │
                                         │  → services → Prisma   │
                                         └───────────┬────────────┘
                                                      │
                                                      ▼
                                         ┌───────────────────────┐
                                         │     PostgreSQL          │
                                         └───────────────────────┘
```

Because nginx proxies `/api/*` to the backend container, the browser only ever talks to one origin.
That's what lets the auth cookie use `SameSite=strict` by default — see
[CONFIGURATION.md](CONFIGURATION.md) and the cross-domain note in
[DEPLOYMENT.md](DEPLOYMENT.md#cross-domain-frontendbackend) for when that's not true.

## Backend layering

```
routes/        — HTTP verbs + paths + middleware wiring only, no logic
  ↓
controllers/   — pulls req data, calls one service function, shapes the response
  ↓
services/      — business logic, the only layer that calls Prisma or external APIs
  ↓
validators/    — Zod schemas, applied as middleware before controllers run
```

This keeps each layer testable and replaceable independently — e.g. swapping Postgres for another
store only touches `services/`, not `routes/` or `controllers/`.

## Request lifecycle (a mutating request, e.g. "save workout")

1. `helmet` sets security headers; `cors` checks `Origin` against `CORS_ORIGIN`.
2. `cookieParser` reads the `forge_token` (JWT) and `forge_csrf` cookies.
3. `requestId` + `pino-http` assign a request id and start structured logging.
4. `apiLimiter` (global) then route-specific middleware run in order:
   `requireAuth` (verifies JWT, sets `req.user`) → `verifyCsrf` (double-submit check) →
   `validate(schema)` (Zod parses/coerces `req.body`).
5. Controller calls the matching service function with already-validated data.
6. Service runs the Prisma query/transaction and returns plain objects.
7. Controller sends JSON. Any thrown `ApiError` (or unexpected error) is caught by the global
   `errorHandler` and turned into a consistent `{ error: { message, details } }` response.

## What changed from the prototype, and why

| Prototype behaviour | Now | Why |
|---|---|---|
| All state in `localStorage` | Postgres via Prisma, scoped per user | Multi-device, multi-user, survives cache clears |
| No accounts | JWT httpOnly-cookie auth, bcrypt passwords | Required for any of the above to mean anything |
| "AI" plan = static JS object | Same static rule table, server-side (`plans.service.js`) + optional real LLM enrichment | Preserves exact behaviour; makes the AI claim in the marketing copy actually optionally true |
| Hardcoded fake leaderboard rows | Computed from real users' logged volume, opt-in only | A leaderboard with fake names is actively misleading once accounts exist |
| `innerHTML` string interpolation | React (auto-escapes by default) | Removes the XSS vector that free-text fields (notes, exercise names) created |
| No input validation beyond `if (!val)` | Zod schemas on every mutating endpoint | Prevents malformed/oversized/out-of-range data reaching the database |
| No rate limiting | `express-rate-limit` (global + stricter on auth) | Basic brute-force/credential-stuffing and scraping defense |
| One monolithic HTML/CSS/JS file | Layered backend + componentized React frontend | Testable, independently deployable, mergeable by more than one person at once |

## Database schema

See `backend/prisma/schema.prisma` for the source of truth. Summary:

```
User 1──* WorkoutSession 1──* Exercise 1──* ExerciseSet
User 1──* WeightLog
User 1──* PasswordResetToken
(MotivationQuote / MotivationTip / FitnessTruth / TransformationStory are standalone content tables)
```

All child rows cascade-delete with their parent (`onDelete: Cascade`), so deleting a user or a
session can never leave orphaned exercises/sets behind.

## Why PostgreSQL (and not e.g. MongoDB or SQLite)

- The data is inherently relational: sets belong to exercises belong to sessions belong to users, and
  the dashboard/leaderboard need real aggregate queries (`SUM`, `MAX`, `GROUP BY`-style logic) across
  those relations — a strength of SQL, an awkward fit for a document store.
- Every cloud platform in [DEPLOYMENT.md](DEPLOYMENT.md) offers managed Postgres, so there's no
  lock-in to a single vendor's proprietary database.
- Prisma's migration workflow (`prisma/migrations/`) gives reviewable, versioned schema changes —
  important once more than one person is touching the schema.
- SQLite was considered for local dev simplicity but rejected for the default story: it doesn't
  reflect production behavior (no real concurrent-write story, no managed hosting equivalent), and
  Prisma already makes local Postgres a two-command setup ([INSTALLATION.md](INSTALLATION.md)).
