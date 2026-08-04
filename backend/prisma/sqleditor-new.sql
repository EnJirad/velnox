-- ============================================================
-- Prepaid VelRepeat Pack
-- รันใน PostgreSQL / Neon SQL Editor
-- ============================================================

-- 1) Enum ใหม่
DO $$
BEGIN
  CREATE TYPE "VelRepeatPackStatus" AS ENUM (
    'ACTIVE',
    'PAUSED',
    'COMPLETED',
    'CANCELLED'
  );
EXCEPTION
  WHEN duplicate_object THEN
    NULL;
END
$$;

-- หากยังไม่มี VelRepeatFrequency ให้รันเฉพาะบล็อกนี้
/*
DO $$
BEGIN
  CREATE TYPE "VelRepeatFrequency" AS ENUM (
    'WEEKLY',
    'BI_WEEKLY',
    'MONTHLY'
  );
EXCEPTION
  WHEN duplicate_object THEN
    NULL;
END
$$;
*/

-- 2) ตารางแพ็ก
CREATE TABLE IF NOT EXISTS "velrepeat_packs" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL,
  "product_id" UUID NOT NULL,
  "plan_code" TEXT NOT NULL,
  "frequency" "VelRepeatFrequency" NOT NULL,
  "total_units" INTEGER NOT NULL,
  "remaining_units" INTEGER NOT NULL,
  "units_per_delivery" INTEGER NOT NULL DEFAULT 1,
  "unit_price" DECIMAL(12,2) NOT NULL,
  "pack_price" DECIMAL(12,2) NOT NULL,
  "free_shipping" BOOLEAN NOT NULL DEFAULT TRUE,
  "status" "VelRepeatPackStatus" NOT NULL DEFAULT 'ACTIVE',
  "next_delivery_date" TIMESTAMPTZ NOT NULL,
  "prepaid_payment_id" TEXT,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT "velrepeat_packs_user_id_fkey"
    FOREIGN KEY ("user_id")
    REFERENCES "users"("id")
    ON DELETE CASCADE,

  CONSTRAINT "velrepeat_packs_product_id_fkey"
    FOREIGN KEY ("product_id")
    REFERENCES "products"("id")
);

CREATE INDEX IF NOT EXISTS "velrepeat_packs_user_id_status_idx"
ON "velrepeat_packs" ("user_id", "status");

CREATE INDEX IF NOT EXISTS "velrepeat_packs_next_delivery_date_status_idx"
ON "velrepeat_packs" ("next_delivery_date", "status");

-- 3) ตารางรอบส่งของ
CREATE TABLE IF NOT EXISTS "velrepeat_deliveries" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "pack_id" UUID NOT NULL,
  "order_id" UUID UNIQUE,
  "units" INTEGER NOT NULL DEFAULT 1,
  "scheduled_at" TIMESTAMPTZ NOT NULL,
  "delivered_at" TIMESTAMPTZ,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT "velrepeat_deliveries_pack_id_fkey"
    FOREIGN KEY ("pack_id")
    REFERENCES "velrepeat_packs"("id")
    ON DELETE CASCADE,

  CONSTRAINT "velrepeat_deliveries_order_id_fkey"
    FOREIGN KEY ("order_id")
    REFERENCES "orders"("id")
);

-- 4) History ใหม่
CREATE TABLE IF NOT EXISTS "velrepeat_history_new" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "pack_id" UUID NOT NULL,
  "action" TEXT NOT NULL,
  "note" TEXT,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT "velrepeat_history_new_pack_id_fkey"
    FOREIGN KEY ("pack_id")
    REFERENCES "velrepeat_packs"("id")
    ON DELETE CASCADE
);