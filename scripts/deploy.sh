#!/usr/bin/env bash
set -e

echo "Building all apps and backend..."
pnpm build

echo "Running Prisma migrate deploy..."
pnpm --filter backend run db:migrate:deploy

echo "Build complete. Deploy the backend/dist and each app's .next output to your hosting targets."
