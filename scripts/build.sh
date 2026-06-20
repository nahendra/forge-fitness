#!/bin/bash
# Builds production Docker images for both services without starting them.
set -euo pipefail
cd "$(dirname "$0")/.."

echo "==> Building backend image"
docker compose build backend

echo "==> Building frontend image"
docker compose build frontend

echo "==> Build complete. Run ./scripts/start.sh to launch the stack."
