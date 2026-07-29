# Velnox

Velnox is a multi-vendor commerce platform monorepo, built as a **Foundation** that later
feature work (products, cart, checkout, VelRepeat subscriptions, payments, analytics, etc.)
can extend without re-architecting.

## Project Overview

Three frontends share one backend and one database:

| App | Path | Purpose |
|---|---|---|
| **VelShop** | `apps/shop` | Customer marketplace |
| **VelMerchant** | `apps/merchant` | Merchant management portal |
| **VelCenter** | `apps/center` | Admin / operations center |

```
                    Velnox
        ┌────────────┼────────────┐
     VelShop   VelMerchant   VelCenter
        └────────────┼────────────┘
              NestJS Backend
                    |
              Prisma ORM
                    |
          Neon PostgreSQL
                    |
              Cloudinary
```

## Technology Stack

- **Monorepo:** pnpm workspace + Turborepo
- **Frontend:** Next.js, TypeScript, Tailwind CSS
- **Backend:** NestJS, Prisma
- **Database:** PostgreSQL (Neon compatible)
- **Storage:** Cloudinary
- **Auth:** JWT access + refresh tokens

## Folder Structure

```
velnox/
├── apps/
│   ├── shop/       # VelShop (port 3000)
│   ├── merchant/   # VelMerchant (port 3001)
│   └── center/     # VelCenter (port 3002)
├── backend/        # NestJS API (port 4000)
├── packages/
│   ├── ui/         # Shared React components (Button, Input, Card, tokens)
│   ├── types/      # Shared TypeScript types
│   ├── config/     # Shared tsconfig / eslint presets / constants
│   └── utils/      # Shared helper functions
├── docs/           # Architecture, database, API, security, roadmap docs
└── scripts/        # setup, database, deploy, backup, generate
```

## Installation

Requires Node.js ≥ 18.18 and pnpm ≥ 9.

```bash
git clone <repo-url> velnox
cd velnox
cp .env.example .env      # fill in DATABASE_URL and secrets
pnpm install
pnpm db:generate
pnpm db:migrate
pnpm db:seed               # optional: creates admin user, categories, demo shop/products
```

## Development Commands

```bash
pnpm dev              # run all apps + backend in parallel (Turborepo)
pnpm --filter shop dev       # run VelShop only
pnpm --filter merchant dev   # run VelMerchant only
pnpm --filter center dev     # run VelCenter only
pnpm --filter backend dev    # run the API only

pnpm build            # build everything
pnpm lint             # lint everything
pnpm type-check       # type-check everything
pnpm test             # run backend + frontend tests

pnpm db:migrate       # run Prisma migrations (dev)
pnpm db:seed          # seed the database
```

Default ports: VelShop `3000`, VelMerchant `3001`, VelCenter `3002`, backend `4000`
(API served at `http://localhost:4000/api`).

## Seed accounts

After `pnpm db:seed`:

| Role | Email | Password |
|---|---|---|
| SUPER_ADMIN | `admin@velnox.dev` | `Admin@12345` |
| MERCHANT | `merchant@velnox.dev` | `Merchant@12345` |

Change these before deploying anywhere real.

## What's in this Foundation

- Full monorepo scaffold matching `docs/architecture/03_Project_Structure.md`
- Working JWT auth (register/login/logout/refresh with rotating, hashed
  refresh tokens) in `backend/src/auth`
- Prisma schema covering the full data model from `docs/database/12_Database_Design.md`
  (users, merchants, shops, products, inventory, cart, orders, payments,
  VelRepeat subscriptions, notifications, analytics)
- Role system (`CUSTOMER`, `MERCHANT`, `ADMIN`, `SUPER_ADMIN`) with `JwtAuthGuard` +
  `RolesGuard` wired globally, `@Public()` and `@Roles()` decorators
- Three Next.js apps with layout, navigation/dashboard/admin shells, an API
  client, and an auth provider/store each
- Shared packages for UI, types, config, and utils
- ESLint, Prettier, strict TypeScript across the repo
- Jest configured for backend (unit + e2e) and ready for frontend tests
- GitHub Actions CI (install → generate → lint → type-check → test → build)

Feature work (full product catalog, cart/checkout, payments, VelRepeat
automation, notifications, analytics dashboards) builds on top of this
foundation — see `docs/roadmap/16_Development_Roadmap.md`.

## License

MIT — see [LICENSE](./LICENSE).
