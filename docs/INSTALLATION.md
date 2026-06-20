# Installation Guide

## Option A — Docker (recommended, fastest)

### Prerequisites
- Docker Engine 24+ and Docker Compose v2 (`docker compose version`)

### Steps
```bash
git clone <your-repo-url> forge-fitness
cd forge-fitness
cp .env.example .env
```
Edit `.env` and set at minimum:
- `POSTGRES_PASSWORD` — any strong password
- `JWT_SECRET` — 32+ random characters (`openssl rand -hex 32`)

```bash
chmod +x scripts/*.sh
./scripts/start.sh
```

This builds the backend and frontend images, starts Postgres, runs migrations automatically (the
backend container's entrypoint runs `prisma migrate deploy` on every boot — safe and idempotent),
and serves the app at **http://localhost:8080**.

Seed demo content (motivation quotes, fitness truths, transformation stories, a demo login):
```bash
docker compose exec backend node prisma/seed.js
```

Verify everything is running:
```bash
docker compose ps
curl http://localhost:8080/api/health
```

## Option B — Local development (no Docker)

### Prerequisites
- Node.js 18.18+ and npm
- PostgreSQL 14+ running locally (or any reachable instance)

### 1. Create the database
```bash
psql -U postgres -c "CREATE DATABASE forge_fitness;"
psql -U postgres -c "CREATE USER forge WITH PASSWORD 'forge_password';"
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE forge_fitness TO forge;"
```

### 2. Backend
```bash
cd backend
cp .env.example .env
```
Edit `.env`:
```
DATABASE_URL=postgresql://forge:forge_password@localhost:5432/forge_fitness?schema=public
JWT_SECRET=<32+ random characters>
CORS_ORIGIN=http://localhost:5173
```
```bash
npm install
npm run prisma:migrate     # applies the committed migration in prisma/migrations/
npm run prisma:seed        # optional but recommended — adds demo content + demo login
npm run dev
```
The API is now at `http://localhost:4000`. Check `http://localhost:4000/api/health`.

### 3. Frontend
```bash
cd frontend
cp .env.example .env       # VITE_API_BASE_URL=http://localhost:4000/api
npm install
npm run dev
```
Open `http://localhost:5173`.

### 4. Run tests
```bash
cd backend
npm test
```

## Option C — Manual production build (no Docker, no PaaS)

```bash
# Backend
cd backend && npm ci --omit=dev && npx prisma generate && npx prisma migrate deploy
NODE_ENV=production node src/server.js &

# Frontend
cd ../frontend && npm ci && npm run build
# Serve frontend/dist with any static file server / nginx, proxying /api to the backend port.
```

## Verifying the install

1. Visit the frontend URL — the FORGE landing page with the AI plan generator should load.
2. Register an account (or use the seeded demo login).
3. Run a calculator, log a workout, log a weight entry, check the dashboard charts update.
4. Confirm `docker compose logs backend` (or your terminal, in local-dev mode) shows structured JSON
   request logs with no errors.
