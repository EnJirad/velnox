#!/usr/bin/env bash
set -e

case "$1" in
  migrate)
    pnpm --filter backend run db:migrate
    ;;
  generate)
    pnpm --filter backend run db:generate
    ;;
  seed)
    pnpm --filter backend run db:seed
    ;;
  studio)
    pnpm --filter backend run db:studio
    ;;
  *)
    echo "Usage: ./scripts/database.sh {migrate|generate|seed|studio}"
    exit 1
    ;;
esac
