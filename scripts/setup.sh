#!/usr/bin/env bash
set -e

echo "Setting up Velnox..."

if [ ! -f .env ]; then
  cp .env.example .env
  echo "Created .env from .env.example - please fill in real values."
fi

pnpm install
pnpm db:generate

echo "Setup complete. Run 'pnpm dev' to start all apps."
