# Velnox Backend

NestJS REST API powering VelShop, VelMerchant, and VelCenter.

## Modules (Foundation)

- `auth` — register, login, logout, refresh (JWT access + refresh tokens)
- `users` — profile read/update
- `roles` — role hierarchy helper (CUSTOMER, MERCHANT, ADMIN, SUPER_ADMIN)
- `database` — global Prisma service
- `common` — guards, decorators, filters, interceptors shared across modules

## Getting started

\`\`\`bash
cp .env.example .env   # fill in DATABASE_URL and secrets
pnpm install
pnpm db:generate
pnpm db:migrate
pnpm db:seed
pnpm dev
\`\`\`

API is served under `http://localhost:4000/api`.

## Auth flow

- `POST /api/auth/register` — create a CUSTOMER account, returns access + refresh tokens
- `POST /api/auth/login` — returns access + refresh tokens
- `POST /api/auth/refresh` — rotates the refresh token, returns a new pair
- `POST /api/auth/logout` — revokes all active refresh tokens for the user

All other routes require `Authorization: Bearer <accessToken>` unless annotated `@Public()`.
Use `@Roles('ADMIN', 'SUPER_ADMIN')` on a controller/handler to restrict by role.
