#!/usr/bin/env bash
set -e

if [ -z "$DATABASE_URL" ]; then
  echo "DATABASE_URL is not set. Load your .env first."
  exit 1
fi

TIMESTAMP=$(date +%Y%m%d%H%M%S)
OUT="backup-${TIMESTAMP}.sql"

pg_dump "$DATABASE_URL" > "$OUT"
echo "Backup written to $OUT"
