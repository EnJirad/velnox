#!/usr/bin/env bash
set -e

# Generates a new NestJS module (controller + service + module) inside
# backend/src/<name>, following the Foundation's module pattern.
NAME="$1"
if [ -z "$NAME" ]; then
  echo "Usage: ./scripts/generate.sh <module-name>"
  exit 1
fi

cd backend
npx nest g module "$NAME"
npx nest g controller "$NAME"
npx nest g service "$NAME"
