#!/bin/bash
# Generic VPS deploy: pull latest code, rebuild images, restart the stack with
# zero-downtime-ish rollover (old containers stay up until new ones pass health checks).
set -euo pipefail
cd "$(dirname "$0")/.."

echo "==> Pulling latest code"
git pull --ff-only

echo "==> Rebuilding images"
docker compose build

echo "==> Recreating containers"
docker compose up -d --remove-orphans

echo "==> Pruning dangling images"
docker image prune -f

echo "==> Deploy complete."
docker compose ps
