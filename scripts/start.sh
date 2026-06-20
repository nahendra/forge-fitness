#!/bin/bash
# Starts the full stack (db + backend + frontend), waits for the backend to
# become healthy, then applies migrations + seed data on first run.
set -euo pipefail
cd "$(dirname "$0")/.."

if [ ! -f .env ]; then
  echo "No .env found — copying .env.example. Edit it with real secrets before deploying to production!"
  cp .env.example .env
fi

docker compose up -d --build

echo "==> Waiting for backend health check..."
for i in $(seq 1 30); do
  status=$(docker inspect --format='{{.State.Health.Status}}' "$(docker compose ps -q backend)" 2>/dev/null || echo "starting")
  if [ "$status" = "healthy" ]; then
    echo "Backend is healthy."
    break
  fi
  sleep 2
done

echo "==> Stack is up:"
docker compose ps
echo ""
echo "Frontend:  http://localhost:${FRONTEND_PORT:-8080}"
echo "Backend:   http://localhost:${BACKEND_PORT:-4000}/api/health"
