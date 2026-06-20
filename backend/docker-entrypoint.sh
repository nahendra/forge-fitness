#!/bin/sh
set -e

echo "Running database migrations..."
npx prisma migrate deploy

if [ "$RUN_SEED_ON_BOOT" = "true" ]; then
  echo "Seeding database..."
  node prisma/seed.js
fi

echo "Starting FORGE backend..."
exec node src/server.js
