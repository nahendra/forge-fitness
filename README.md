# FORGE Fitness

A production-grade rebuild of the original FORGE single-file HTML prototype: an AI-assisted fitness
planner, calculator suite, progressive-overload workout tracker, progress dashboard, motivation
engine, and community leaderboard — now with real accounts, a real database, and a real API instead
of `localStorage`.

## Tech stack

| Layer       | Choice                                  | Why                                                                                 |
|-------------|------------------------------------------|--------------------------------------------------------------------------------------|
| Frontend    | React 18 + Vite + Tailwind CSS          | Fast dev loop, component reuse, small production bundle, no server needed to host   |
| Backend     | Node.js 20 + Express                     | Lightweight, huge ecosystem, easy to containerize, matches the team's JS stack       |
| Database    | PostgreSQL + Prisma ORM                  | Relational data (users → sessions → exercises → sets) with real aggregate queries    |
| Auth        | JWT in httpOnly cookie + CSRF double-submit | Avoids storing tokens in `localStorage` (XSS-safe) while still defending against CSRF |
| Charts      | Chart.js via react-chartjs-2             | Same library as the prototype — proven, lightweight                                  |
| Containers  | Docker + docker-compose                  | One command spins up db + API + web for local dev, staging, or a VPS                 |

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the full request-flow diagram and a breakdown of
what changed from the prototype (and why).

## Project structure

```
forge-fitness/
├── backend/                 # Express API (auth, calculators, workouts, dashboard, community…)
│   ├── prisma/               # schema.prisma, migrations/, seed.js
│   ├── src/
│   │   ├── config/           # env validation, logger
│   │   ├── middleware/       # auth, csrf, rate limiting, error handling
│   │   ├── routes/ controllers/ services/ validators/ data/
│   │   └── lib/               # Prisma client singleton
│   └── tests/                 # Jest + Supertest smoke tests
├── frontend/                 # React SPA
│   └── src/
│       ├── api/               # one module per backend resource (fetch wrappers)
│       ├── context/           # Auth + Toast providers
│       ├── components/        # common/, layout/, calculators/, tracker/, dashboard/, plan/
│       ├── pages/              # one per route
│       └── hooks/ utils/ data/ charts/
├── scripts/                   # build.sh, start.sh, deploy.sh
├── docker-compose.yml          # db + backend + frontend, wired together
└── docs/                       # installation, configuration, deployment, troubleshooting, architecture
```

## Quick start (Docker — recommended)

```bash
git clone <your-repo-url> forge-fitness
cd forge-fitness
cp .env.example .env        # edit JWT_SECRET and POSTGRES_PASSWORD at minimum
./scripts/start.sh
```

Then open **http://localhost:8080**. The API is reverse-proxied at `/api` by nginx, so the browser
never talks to the backend container directly. A demo account is available once you seed the
database (see below): `demo@forge.fitness` / `DemoPass123!`.

To seed demo content (motivation quotes, fitness truths, transformation stories, one demo user):

```bash
docker compose exec backend node prisma/seed.js
```

## Quick start (local development, no Docker)

Requires Node.js 18+ and a running PostgreSQL instance.

```bash
# 1. Backend
cd backend
cp .env.example .env              # point DATABASE_URL at your local Postgres
npm install
npm run prisma:migrate            # applies prisma/migrations/*
npm run prisma:seed
npm run dev                        # http://localhost:4000

# 2. Frontend (new terminal)
cd frontend
cp .env.example .env               # VITE_API_BASE_URL=http://localhost:4000/api
npm install
npm run dev                        # http://localhost:5173
```

Full step-by-step instructions, including Postgres setup, live in
[docs/INSTALLATION.md](docs/INSTALLATION.md).

## What changed from the prototype

The original `forge-1.html` was a single static file: every calculator, the "AI" plan generator, the
workout logger, the dashboard charts, and the community leaderboard all ran in the browser and
persisted to `localStorage`. That meant no real users, no cross-device sync, no way to verify a
leaderboard claim, and zero protection against tampering. This rebuild preserves every feature and
every formula exactly (see `backend/src/services/calculators.service.js` and
`backend/src/data/plans.data.js`), but now:

- Accounts are real (bcrypt-hashed passwords, JWT httpOnly-cookie sessions, CSRF-protected mutations).
- Workouts, weight logs, and dashboard stats live in Postgres and are scoped per user.
- The "leaderboard" is computed from real opted-in users' training volume — not hardcoded names.
- The AI plan generator's rule engine is unchanged by default; an optional LLM enrichment layer can
  be turned on via environment variables (see [docs/CONFIGURATION.md](docs/CONFIGURATION.md)) with
  prompt-injection defenses built in.

## Documentation

- [Installation Guide](docs/INSTALLATION.md)
- [Configuration Guide](docs/CONFIGURATION.md)
- [Deployment Guide](docs/DEPLOYMENT.md) — Docker, VPS, AWS, Azure, Render, Railway, Vercel
- [Troubleshooting Guide](docs/TROUBLESHOOTING.md)
- [Architecture](docs/ARCHITECTURE.md)

## Testing

```bash
cd backend
npm test
```

The smoke test suite covers the health endpoint, CSRF enforcement, and input validation without
requiring a live database connection (the health route doesn't touch Postgres).

## Known limitations / honest caveats

- No automated CI pipeline is included — wire `npm test` and `docker compose build` into your CI of
  choice (see [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for a sample GitHub Actions snippet).
- The leaderboard's rank-over-time indicator from the prototype was fake data and has been
  intentionally dropped rather than faked again; a real version needs a periodic ranking-snapshot
  job, noted as a future enhancement in `backend/src/services/community.service.js`.
- AI plan enrichment is opt-in and untested against a live model key in this environment — verify
  the provider call against your own API key before relying on it in production.
