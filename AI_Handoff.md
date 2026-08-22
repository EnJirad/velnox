# Velnox AI Handoff

> **Last Updated:** 2026-08-22
> **Latest Migration:** 016_canonical_identity.sql
> **Total Tables:** 42
> **Total Migrations:** 16 (002–016)

---

## 1. Project Overview

Velnox is a Thai e-commerce marketplace platform with 4 applications:

| App | Purpose | URL |
|-----|---------|-----|
| **velshop** | Customer storefront | velshop.vercel.app |
| **velseller** | Seller management portal | velseller.vercel.app |
| **velcenter** | Company admin dashboard | velcenter.vercel.app |
| **corporate** | Corporate/marketing site | — |

**Tech Stack:**
- **Frontend:** React + TypeScript + Vite + Tailwind CSS + shadcn/ui
- **Backend:** Convex (realtime + actions) + Neon PostgreSQL (commerce core)
- **Media Storage:** Cloudflare R2 (binary files) + Neon (metadata)
- **Auth:** Convex Auth (JWT-based)
- **Payments:** Stripe
- **Monorepo:** Bun workspaces

---

## 2. Current Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND APPS                        │
│  velshop · velseller · velcenter · corporate            │
└────────────────────────┬────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         ▼               ▼               ▼
┌────────────────┐ ┌───────────┐ ┌──────────────┐
│    CONVEX      │ │   NEON    │ │  R2 / CDN    │
│                │ │           │ │              │
│ Auth           │ │ Commerce  │ │ Binary files │
│ Realtime       │ │ Core      │ │ Images       │
│ Intelligence   │ │ Source of │ │ Documents    │
│ Actions        │ │ Truth     │ │              │
│ Mutations      │ │           │ │              │
│ Cron jobs      │ │           │ │              │
└────────────────┘ └───────────┘ └──────────────┘
```

---

## 3. Database Architecture

### Ownership Rules

| System | Owns | Role |
|--------|------|------|
| **Neon PostgreSQL** | Commerce data, metadata, business logic | Source of Truth |
| **Cloudflare R2** | Binary files (images, documents) | Object Storage |
| **Convex** | Realtime state, intelligence, AI features | Realtime Layer |

**CRITICAL:** Neon is the ONLY source of truth for commerce data. Never create a second source of truth in Convex or anywhere else.

### Neon Responsibilities

- users, sellers, shops, products, inventory
- orders, payments, refunds, commissions
- settlements, subscriptions
- addresses, carts, wishlists
- behavioral events, customer profiles
- platform settings, notifications, audit logs
- media metadata (binary lives in R2)

### Convex Responsibilities

- Authentication (Convex Auth)
- Realtime subscriptions
- Customer intelligence events (temporary, flushed to Neon)
- AI-powered features
- Rate limiting
- Action orchestration

### R2 Responsibilities

- Profile avatars and covers
- Product images
- Shop banners and images
- Marketing media
- Documents

---

## 4. Source of Truth Rules

1. **Neon is the source of truth** for all commerce data
2. **Convex stores realtime state** that is eventually consistent with Neon
3. **R2 stores binary files** — Neon stores metadata (media table)
4. **Never duplicate commerce data** into Convex tables that Neon already owns
5. **Never store binary data** in Neon or Convex
6. **Never expose R2 credentials** to the browser
7. **Always use parameterized queries** against Neon (never string interpolation)

---

## 5. Neon Database

### Connection

```typescript
import { getDb, getPool, withTransaction } from "../backend/db";

// Simple query (HTTP)
const rows = await getDb()("SELECT * FROM users WHERE id = $1", [userId]);

// Transaction (WebSocket pool)
const result = await withTransaction(async (client) => {
  await client.query("BEGIN");
  // ... multi-statement atomic flow
  await client.query("COMMIT");
});
```

### Environment Variable

```
DATABASE_URL=<neon-connection-string>
```

Set in the project Keys/API keys UI. Never commit or expose.

---

## 6. Convex

### Key Files

| File | Purpose |
|------|---------|
| `convex/customer.ts` | Customer-facing actions (profile, upload intent) |
| `convex/centerAdmin.ts` | VelCenter admin actions (Neon queries) |
| `convex/actions/profile.ts` | Server-side avatar upload (R2 via AWS SDK) |
| `convex/users.ts` | User queries/mutations (Convex auth) |
| `convex/schema.ts` | Convex schema (realtime tables only) |
| `convex/http.ts` | HTTP actions (webhooks) |

### Convex → Neon Bridge

Many Convex actions call Neon through `getDb()`:

```typescript
"use node";
import { getDb } from "../backend/db";

export const someAction = action({
  handler: async () => {
    const db = getDb();
    const rows = await db("SELECT * FROM orders WHERE id = $1", [orderId]);
    return rows[0];
  },
});
```

---

## 7. Cloudflare R2

### Key Files

| File | Purpose |
|------|---------|
| `backend/r2.ts` | R2 config, signed URLs, deletion, CDN URLs |
| `backend/media.ts` | Media metadata service (Neon queries) |
| `convex/actions/profile.ts` | Server-side upload (AWS SDK S3) |

### Upload Flow

```
1. Browser requests signed URL (Convex action → backend/r2.ts)
2. Browser uploads directly to R2 (presigned PUT URL)
3. Browser confirms upload (Convex action → backend/media.ts)
4. Media record created in Neon (metadata only)
5. Owner updated (users.avatar_media_id, etc.)
```

### Environment Variables

```
R2_ACCOUNT_ID=<cloudflare-account-id>
R2_ACCESS_KEY_ID=<r2-access-key>
R2_SECRET_ACCESS_KEY=<r2-secret-key>
R2_BUCKET=<bucket-name>         # e.g. "velnox-storage"
R2_PUBLIC_DOMAIN=<cdn-domain>   # e.g. "media.velshop.com"
```

---

## 8. Database Directory Structure

```
db/
├── schema.sql              ← CURRENT COMPLETE SCHEMA (canonical)
├── run-sqleditor.sql       ← One-shot bootstrap (same content, dependency-ordered)
├── migrate.ts              ← Migration runner (applies schema.sql + migrations/)
├── smoke.ts                ← Table existence verification
├── consistency-check.ts    ← Data integrity + financial reconciliation
└── migrations/
    ├── 002_profiles_gps.sql
    ├── 003_catalog.sql
    ├── 004_cart_wishlist.sql
    ├── 005_orders_payments.sql
    ├── 006_logistics_returns.sql
    ├── 007_reviews_velrepeat.sql
    ├── 008_finance.sql
    ├── 009_seller_store.sql
    ├── 010_platform.sql
    ├── 011_behavioral_events.sql
    ├── 012_employee_auth.sql
    ├── 013_product_moderation.sql
    ├── 014_profile_images.sql
    ├── 015_customer_intelligence.sql
    └── 016_canonical_identity.sql
```

---

## 9. Migration System

### How It Works

1. `db/migrate.ts` runs `db/schema.sql` first (idempotent base)
2. Then applies each `db/migrations/*.sql` in filename order
3. All SQL uses `IF NOT EXISTS` / `ADD COLUMN IF NOT EXISTS` — safe to re-run

### Running Migrations

```bash
# Apply all migrations
DATABASE_URL=<connection-string> bun run db:migrate

# Verify schema
DATABASE_URL=<connection-string> bun run db:smoke

# Check data integrity
DATABASE_URL=<connection-string> bun run db:consistency
```

### GitHub Actions

`.github/workflows/migrate-neon.yml` automatically runs migrations on push to `main` when `db/**` files change.

---

## 10. db/schema.sql

**Purpose:** The canonical, complete, current database schema.

**Rules:**
- Must reflect the ACTUAL state of the database after all migrations
- Must use `CREATE TABLE IF NOT EXISTS` (idempotent)
- Must include ALL columns from ALL migrations
- Must include ALL tables (not just base tables)
- Every database change MUST update this file

**This file is NOT migration history.** It is a snapshot of the current schema.

---

## 11. db/run-sqleditor.sql

**Purpose:** One-shot database initialization script for Neon SQL Editor.

**Rules:**
- Can be pasted into Neon SQL Editor to create a fresh database
- Tables are ordered by dependency (parent tables first)
- All statements use `IF NOT EXISTS` (safe to run on existing DB)
- Must always match `db/schema.sql`
- This is NOT migration history — it's a complete bootstrap

**When to use:**
- Creating a new development database
- Resetting a test database
- Disaster recovery (rebuilding from scratch)

---

## 12. Migration Rules

1. **NEVER modify existing migrations** — always create a new one
2. **Use sequential numbering** — next number after the latest migration
3. **Be idempotent** — use `IF NOT EXISTS`, `ADD COLUMN IF NOT EXISTS`
4. **One migration = one concern** — don't mix unrelated changes
5. **Update schema.sql AND run-sqleditor.sql** after every migration
6. **Update AI_Handoff.md** after every migration
7. **Never DROP TABLE** without explicit approval
8. **Never DELETE production data** in a migration

### Migration Naming Convention

```
db/migrations/NNN_description.sql

Examples:
  016_add_whatever.sql
  017_add_another_thing.sql
```

---

## 13. Database Change Workflow

Every time you change the database schema:

```
STEP 1  Inspect current schema (db/schema.sql)
STEP 2  Check latest migration number
STEP 3  Create new migration (db/migrations/NNN_name.sql)
STEP 4  Update db/schema.sql (add new columns/tables)
STEP 5  Update db/run-sqleditor.sql (same changes)
STEP 6  Update AI_Handoff.md (if table list or rules change)
STEP 7  Verify code consistency (all SQL queries match schema)
STEP 8  Run: bun tsc -b --noEmit (typecheck)
STEP 9  Run: DATABASE_URL=... bun run db:smoke (if DB available)
STEP 10 Document all changed files
```

**Do not skip steps.**

---

## 14. Required Files To Update

When changing the database schema, update these files:

| File | What to update |
|------|---------------|
| `db/migrations/NNN_name.sql` | New migration |
| `db/schema.sql` | Add new columns/tables to canonical schema |
| `db/run-sqleditor.sql` | Same changes as schema.sql |
| `AI_Handoff.md` | Update table count, migration list, rules if needed |
| `db/smoke.ts` | If new table added, add to REQUIRED_TABLES |

---

## 15. Database Verification

### Smoke Test (table existence)

```bash
DATABASE_URL=<connection-string> bun run db:smoke
```

Checks that ALL 42 tables exist in the Neon database.

### Consistency Check (data integrity)

```bash
DATABASE_URL=<connection-string> bun run db:consistency
```

Checks:
- No negative stock
- No orphan rows
- Order totals match line items
- Commission amounts match rate × order_amount
- Paid orders have succeeded payments
- Seller balances match ledger
- Return rates within threshold

### Typecheck

```bash
bun tsc -b --noEmit
```

Verifies all TypeScript code compiles correctly.

---

## 16. GitHub Actions

### Database Migration (`.github/workflows/migrate-neon.yml`)

- **Trigger:** Push to `main` when `db/**` changes
- **Steps:**
  1. Checkout repo
  2. Setup Bun
  3. Install dependencies
  4. Verify migration files exist
  5. Run `bun run db:migrate` (applies all migrations)
  6. Run `bun run db:smoke` (verify tables)
  7. Run `bun run db:consistency` (verify data)

### Required Secrets

- `DATABASE_URL` — Neon PostgreSQL connection string

---

## 17. Important Environment Variables

### Neon

| Variable | Description | Where |
|----------|-------------|-------|
| `DATABASE_URL` | Neon PostgreSQL connection string | Keys/API keys UI |

### R2

| Variable | Description | Where |
|----------|-------------|-------|
| `R2_ACCOUNT_ID` | Cloudflare account ID | Convex env |
| `R2_ACCESS_KEY_ID` | R2 access key | Convex env |
| `R2_SECRET_ACCESS_KEY` | R2 secret key | Convex env |
| `R2_BUCKET` | R2 bucket name | Convex env |
| `R2_PUBLIC_DOMAIN` | Public CDN domain | Convex env |

### Convex

| Variable | Description | Where |
|----------|-------------|-------|
| `VITE_CONVEX_URL` | Convex deployment URL | Frontend .env |
| `CONVEX_DEPLOY_KEY` | Convex deploy key | CI/CD |

---

## 18. Current Tables (42)

### Core Commerce

| # | Table | Description | Created In |
|---|-------|-------------|------------|
| 1 | `media` | Binary storage metadata (R2-backed) | schema.sql + 015 |
| 2 | `users` | User accounts (Convex auth + business) | schema.sql + 002,009,012,014,015 |
| 3 | `user_profiles` | Extended profile (1:1 with users) | 002 |
| 4 | `sellers` | Merchant accounts | schema.sql + 009,013 |
| 5 | `shops` | Seller shops/stores | schema.sql + 009 |
| 6 | `categories` | Product categories (hierarchy) | 003 |
| 7 | `products` | Product catalog | schema.sql + 003,013 |
| 8 | `product_variants` | Per-variant SKU/price | 003 |
| 9 | `product_images` | Image metadata (binary in R2) | schema.sql + 003,015 |
| 10 | `inventory` | Stock management | schema.sql + 003 |
| 11 | `addresses` | Customer addresses | schema.sql + 002 |

### Carts + Wishlists

| # | Table | Description | Created In |
|---|-------|-------------|------------|
| 12 | `carts` | Shopping carts | 004 |
| 13 | `cart_items` | Cart line items | 004 |
| 14 | `wishlists` | User wishlists | 004 |
| 15 | `wishlist_items` | Wishlist line items | 004 |

### Orders + Payments

| # | Table | Description | Created In |
|---|-------|-------------|------------|
| 16 | `orders` | Order headers | schema.sql + 005 |
| 17 | `order_items` | Order line items (snapshots) | schema.sql + 005 |
| 18 | `payments` | Payment attempts | schema.sql + 005 |
| 19 | `payment_transactions` | Provider-level records | 005 |
| 20 | `refunds` | Refund records | schema.sql + 005 |
| 21 | `commissions` | Platform fees (3%) | schema.sql |
| 22 | `settlements` | Seller payout summaries | schema.sql |

### Subscriptions

| # | Table | Description | Created In |
|---|-------|-------------|------------|
| 23 | `subscriptions` | VelRepeat subscriptions | schema.sql + 007 |
| 24 | `reviews` | Product/store reviews | 007 |
| 25 | `velrepeat_orders` | Auto-placed subscription orders | 007 |

### Logistics

| # | Table | Description | Created In |
|---|-------|-------------|------------|
| 26 | `shipments` | Per-order shipments | 006 |
| 27 | `tracking_events` | Shipment event timeline | 006 |
| 28 | `returns` | Return requests | 006 |
| 29 | `return_items` | Return line items | 006 |

### Finance

| # | Table | Description | Created In |
|---|-------|-------------|------------|
| 30 | `financial_ledger` | Money movement (source of truth) | 008 |
| 31 | `seller_balances` | Derived balances (from ledger) | 008 |
| 32 | `seller_payouts` | Payout requests | 008 |

### Platform

| # | Table | Description | Created In |
|---|-------|-------------|------------|
| 33 | `platform_settings` | Key/value config | 010 |
| 34 | `notifications` | In-app notifications | 010 |
| 35 | `audit_logs` | Append-only action log | 010 |
| 36 | `staff_profiles` | Staff permissions | 010 |
| 37 | `coupons` | Discount coupons | 010 |
| 38 | `promotions` | Marketing promotions | 010 |

### Intelligence

| # | Table | Description | Created In |
|---|-------|-------------|------------|
| 39 | `behavioral_events` | Durable event store | 011 |
| 40 | `event_flush_cursor` | Convex → Neon flush progress | 011 |
| 41 | `customer_profiles` | Derived customer intelligence | 015 |
| 42 | `customer_segments` | Segmentation rules | 015 |

---

## 19. Current Migrations

| # | File | Description |
|---|------|-------------|
| 002 | `002_profiles_gps.sql` | user_profiles, users.status, addresses GPS |
| 003 | `003_catalog.sql` | categories, product_variants, product extensions |
| 004 | `004_cart_wishlist.sql` | carts, cart_items, wishlists |
| 005 | `005_orders_payments.sql` | Multi-seller orders, payment_transactions |
| 006 | `006_logistics_returns.sql` | shipments, tracking_events, returns |
| 007 | `007_reviews_velrepeat.sql` | reviews, velrepeat_orders, subscription extensions |
| 008 | `008_finance.sql` | financial_ledger, seller_balances, seller_payouts |
| 009 | `009_seller_store.sql` | Seller profile, shop settings + GPS |
| 010 | `010_platform.sql` | platform_settings, notifications, audit_logs, staff, coupons, promotions |
| 011 | `011_behavioral_events.sql` | behavioral_events, event_flush_cursor |
| 012 | `012_employee_auth.sql` | users.employee_id, password_updated_at |
| 013 | `013_product_moderation.sql` | sellers.rejection_reason, products.rejection_reason |
| 014 | `014_profile_images.sql` | users.avatar_url, cover_url |
| 015 | `015_customer_intelligence.sql` | customer_profiles, media (R2), customer_segments |

**Next migration number: 016**

---

## 20. Known Issues

1. **Schema.sql vs Migration 011 conflict:** schema.sql previously defined `behavioral_events` with UUID primary key. Migration 011 creates it with BIGSERIAL. Since schema.sql runs first, migration 011's `CREATE TABLE IF NOT EXISTS` would be skipped. This is resolved in the current schema.sql which uses BIGSERIAL.

2. **Schema.sql vs Migration 015 conflict:** schema.sql previously defined `media` with `owner_id UUID`. Migration 015 creates it with `owner_id TEXT`. The current schema.sql uses TEXT to match migration 015.

3. **Schema.sql vs Migration 015 conflict (customer_profiles):** schema.sql had a simpler `customer_profiles` with `user_id UUID PRIMARY KEY`. Migration 015 creates it with `id UUID PRIMARY KEY REFERENCES users(id)`. The current schema.sql uses the migration 015 version.

---

## 21. Important Warnings

- **NEVER** modify existing migration files (002-015)
- **NEVER** DROP TABLE without explicit approval
- **NEVER** store binary data in Neon or Convex
- **NEVER** expose R2 credentials to the browser
- **NEVER** create a second source of truth for commerce data
- **NEVER** use string interpolation in SQL queries (always use parameterized queries)
- **NEVER** hard-code commission rates or platform settings (read from platform_settings)
- **NEVER** re-price old orders from current product prices (use order_items snapshots)
- **ALWAYS** update schema.sql, run-sqleditor.sql, and AI_Handoff.md when changing schema
- **ALWAYS** use idempotent SQL (IF NOT EXISTS)
- **ALWAYS** run typecheck after changes: `bun tsc -b --noEmit`

---

## 22. Rules For Future AI Agents

1. **Read this file first** before making any database changes
2. **Inspect the actual code** — never guess schema from memory
3. **Check all migrations** before creating a new one
4. **Update all 4 files** when changing schema (migration, schema.sql, run-sqleditor.sql, AI_Handoff.md)
5. **Verify consistency** — code SQL queries must match actual schema columns
6. **Run typecheck** after every change
7. **Never skip the migration numbering** — always use next sequential number
8. **Document your changes** — explain what you changed and why
9. **Test idempotency** — migrations must be safe to re-run
10. **Respect the architecture** — Neon = commerce truth, Convex = realtime, R2 = binary

---

## 23. Pre-Commit Checklist

Before committing any database-related changes:

- [ ] New migration file created with correct sequential number
- [ ] Migration uses idempotent SQL (IF NOT EXISTS, ADD COLUMN IF NOT EXISTS)
- [ ] `db/schema.sql` updated to reflect the new schema
- [ ] `db/run-sqleditor.sql` updated to match schema.sql
- [ ] `AI_Handoff.md` updated (table count, migration list, rules if needed)
- [ ] `db/smoke.ts` updated if new table added
- [ ] All backend SQL queries match the actual schema columns
- [ ] Typecheck passes: `bun tsc -b --noEmit`
- [ ] No existing migrations modified
- [ ] No production data deleted
- [ ] No hardcoded values (commission rates, settings, etc.)

---

## 24. Last Updated

- **Date:** 2026-08-22
- **Author:** Buffy (Codebuff AI)
- **Changes:** Complete database audit, schema reconciliation, documentation creation
- **Files changed:**
  - `db/schema.sql` — Reconciled with all 15 migrations
  - `db/run-sqleditor.sql` — Created (one-shot bootstrap)
  - `db/smoke.ts` — Updated to include all 42 tables
  - `AI_Handoff.md` — Created (this file)
