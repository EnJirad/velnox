-- =========================
-- Enums
-- =========================

CREATE TYPE "UserRole" AS ENUM ('CUSTOMER', 'MERCHANT', 'ADMIN', 'SUPER_ADMIN');
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'BANNED');
CREATE TYPE "MerchantStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED');
CREATE TYPE "ShopStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');
CREATE TYPE "ProductStatus" AS ENUM ('DRAFT', 'ACTIVE', 'INACTIVE', 'ARCHIVED');
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED');
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'FAILED', 'REFUNDED');
CREATE TYPE "VelRepeatFrequency" AS ENUM ('WEEKLY', 'BI_WEEKLY', 'MONTHLY');
CREATE TYPE "VelRepeatPackStatus" AS ENUM ('ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED');

-- =========================
-- User Domain
-- =========================

CREATE TABLE "users" (
  "id"            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "email"         TEXT NOT NULL UNIQUE,
  "password_hash" TEXT NOT NULL,
  "name"          TEXT NOT NULL,
  "phone"         TEXT,
  "role"          "UserRole" NOT NULL DEFAULT 'CUSTOMER',
  "status"        "UserStatus" NOT NULL DEFAULT 'ACTIVE',
  "created_at"    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at"    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE "user_profiles" (
  "id"            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id"       UUID NOT NULL UNIQUE,
  "avatar_url"    TEXT,
  "date_of_birth" TIMESTAMPTZ,
  "gender"        TEXT,
  "created_at"    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "user_profiles_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
);

CREATE TABLE "addresses" (
  "id"            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id"       UUID NOT NULL,
  "name"          TEXT NOT NULL,
  "phone"         TEXT NOT NULL,
  "address_line"  TEXT NOT NULL,
  "city"          TEXT NOT NULL,
  "province"      TEXT NOT NULL,
  "postal_code"   TEXT NOT NULL,
  "country"       TEXT NOT NULL DEFAULT 'TH',
  "is_default"    BOOLEAN NOT NULL DEFAULT FALSE,
  CONSTRAINT "addresses_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
);

CREATE TABLE "refresh_tokens" (
  "id"         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id"    UUID NOT NULL,
  "token_hash" TEXT NOT NULL,
  "revoked"    BOOLEAN NOT NULL DEFAULT FALSE,
  "expires_at" TIMESTAMPTZ NOT NULL,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "refresh_tokens_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
);

CREATE INDEX "refresh_tokens_user_id_idx" ON "refresh_tokens"("user_id");

-- =========================
-- Merchant Domain
-- =========================

CREATE TABLE "merchants" (
  "id"          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id"     UUID NOT NULL UNIQUE,
  "status"      "MerchantStatus" NOT NULL DEFAULT 'PENDING',
  "approved_at" TIMESTAMPTZ,
  "created_at"  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "merchants_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
);

CREATE TABLE "shops" (
  "id"           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "merchant_id"  UUID NOT NULL,
  "name"         TEXT NOT NULL,
  "description"  TEXT,
  "logo_url"     TEXT,
  "banner_url"   TEXT,
  "status"       "ShopStatus" NOT NULL DEFAULT 'ACTIVE',
  "created_at"   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "shops_merchant_id_fkey"
    FOREIGN KEY ("merchant_id") REFERENCES "merchants"("id") ON DELETE CASCADE
);

-- =========================
-- Product Domain
-- =========================

CREATE TABLE "categories" (
  "id"        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name"      TEXT NOT NULL,
  "slug"      TEXT NOT NULL UNIQUE,
  "image_url" TEXT,
  "parent_id" UUID,
  "status"    TEXT NOT NULL DEFAULT 'ACTIVE',
  CONSTRAINT "categories_parent_id_fkey"
    FOREIGN KEY ("parent_id") REFERENCES "categories"("id")
);

CREATE TABLE "products" (
  "id"          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "shop_id"     UUID NOT NULL,
  "category_id" UUID NOT NULL,
  "name"        TEXT NOT NULL,
  "slug"        TEXT NOT NULL UNIQUE,
  "sku"         TEXT NOT NULL UNIQUE,
  "seller_sku"  TEXT,
  "description" TEXT,
  "price"       DECIMAL(12, 2) NOT NULL,
  "stock"       INTEGER NOT NULL DEFAULT 0,
  "status"      "ProductStatus" NOT NULL DEFAULT 'DRAFT',
  "created_at"  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "products_shop_id_fkey"
    FOREIGN KEY ("shop_id") REFERENCES "shops"("id") ON DELETE CASCADE,
  CONSTRAINT "products_category_id_fkey"
    FOREIGN KEY ("category_id") REFERENCES "categories"("id")
);

CREATE INDEX "products_seller_sku_idx" ON "products"("seller_sku");

CREATE TABLE "product_images" (
  "id"         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "product_id" UUID NOT NULL,
  "url"        TEXT NOT NULL,
  "public_id"  TEXT NOT NULL,
  "sort_order" INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "product_images_product_id_fkey"
    FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE
);

-- =========================
-- Inventory Domain
-- =========================

CREATE TABLE "inventory" (
  "id"                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "product_id"        UUID NOT NULL UNIQUE,
  "quantity"          INTEGER NOT NULL DEFAULT 0,
  "reserved_quantity" INTEGER NOT NULL DEFAULT 0,
  "updated_at"        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "inventory_product_id_fkey"
    FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE
);

-- =========================
-- Cart Domain
-- =========================

CREATE TABLE "carts" (
  "id"         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id"    UUID NOT NULL UNIQUE,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "carts_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
);

CREATE TABLE "cart_items" (
  "id"         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "cart_id"    UUID NOT NULL,
  "product_id" UUID NOT NULL,
  "quantity"   INTEGER NOT NULL,
  "price"      DECIMAL(12, 2) NOT NULL,
  CONSTRAINT "cart_items_cart_id_fkey"
    FOREIGN KEY ("cart_id") REFERENCES "carts"("id") ON DELETE CASCADE,
  CONSTRAINT "cart_items_product_id_fkey"
    FOREIGN KEY ("product_id") REFERENCES "products"("id")
);

-- =========================
-- Order Domain
-- =========================

CREATE TABLE "orders" (
  "id"             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id"        UUID NOT NULL,
  "order_number"   TEXT NOT NULL UNIQUE,
  "status"         "OrderStatus" NOT NULL DEFAULT 'PENDING',
  "subtotal"       DECIMAL(12, 2) NOT NULL,
  "shipping_fee"   DECIMAL(12, 2) NOT NULL DEFAULT 0,
  "total"          DECIMAL(12, 2) NOT NULL,
  "payment_status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
  "created_at"     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "orders_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id")
);

CREATE TABLE "order_items" (
  "id"          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "order_id"    UUID NOT NULL,
  "product_id"  UUID NOT NULL,
  "merchant_id" UUID NOT NULL,
  "quantity"    INTEGER NOT NULL,
  "price"       DECIMAL(12, 2) NOT NULL,
  CONSTRAINT "order_items_order_id_fkey"
    FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE,
  CONSTRAINT "order_items_product_id_fkey"
    FOREIGN KEY ("product_id") REFERENCES "products"("id"),
  CONSTRAINT "order_items_merchant_id_fkey"
    FOREIGN KEY ("merchant_id") REFERENCES "merchants"("id")
);

-- =========================
-- Payment Domain
-- =========================

CREATE TABLE "payments" (
  "id"             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "order_id"       UUID NOT NULL UNIQUE,
  "method"         TEXT NOT NULL,
  "amount"         DECIMAL(12, 2) NOT NULL,
  "status"         "PaymentStatus" NOT NULL DEFAULT 'PENDING',
  "transaction_id" TEXT,
  "paid_at"        TIMESTAMPTZ,
  CONSTRAINT "payments_order_id_fkey"
    FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE
);

-- =========================
-- VelRepeat Domain (Prepaid Pack)
-- =========================

CREATE TABLE "velrepeat_packs" (
  "id"                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id"            UUID NOT NULL,
  "product_id"         UUID NOT NULL,
  "plan_code"          TEXT NOT NULL,
  "frequency"          "VelRepeatFrequency" NOT NULL,
  "total_units"        INTEGER NOT NULL,
  "remaining_units"    INTEGER NOT NULL,
  "units_per_delivery" INTEGER NOT NULL DEFAULT 1,
  "unit_price"         DECIMAL(12, 2) NOT NULL,
  "pack_price"         DECIMAL(12, 2) NOT NULL,
  "free_shipping"      BOOLEAN NOT NULL DEFAULT TRUE,
  "status"             "VelRepeatPackStatus" NOT NULL DEFAULT 'ACTIVE',
  "next_delivery_date" TIMESTAMPTZ NOT NULL,
  "prepaid_payment_id" TEXT,
  "created_at"         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at"         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "velrepeat_packs_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
  CONSTRAINT "velrepeat_packs_product_id_fkey"
    FOREIGN KEY ("product_id") REFERENCES "products"("id")
);

CREATE INDEX "velrepeat_packs_user_id_status_idx"
  ON "velrepeat_packs"("user_id", "status");

CREATE INDEX "velrepeat_packs_next_delivery_date_status_idx"
  ON "velrepeat_packs"("next_delivery_date", "status");

CREATE TABLE "velrepeat_deliveries" (
  "id"           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "pack_id"      UUID NOT NULL,
  "order_id"     UUID UNIQUE,
  "units"        INTEGER NOT NULL DEFAULT 1,
  "scheduled_at" TIMESTAMPTZ NOT NULL,
  "delivered_at" TIMESTAMPTZ,
  "created_at"   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "velrepeat_deliveries_pack_id_fkey"
    FOREIGN KEY ("pack_id") REFERENCES "velrepeat_packs"("id") ON DELETE CASCADE,
  CONSTRAINT "velrepeat_deliveries_order_id_fkey"
    FOREIGN KEY ("order_id") REFERENCES "orders"("id")
);

CREATE TABLE "velrepeat_history" (
  "id"         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "pack_id"    UUID NOT NULL,
  "action"     TEXT NOT NULL,
  "note"       TEXT,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "velrepeat_history_pack_id_fkey"
    FOREIGN KEY ("pack_id") REFERENCES "velrepeat_packs"("id") ON DELETE CASCADE
);

ALTER TABLE "products"
  ADD COLUMN IF NOT EXISTS "vel_repeat_enabled" BOOLEAN NOT NULL DEFAULT FALSE;

CREATE TABLE IF NOT EXISTS "product_velrepeat_plans" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "product_id" UUID NOT NULL REFERENCES "products"("id") ON DELETE CASCADE,
  "plan_code" TEXT NOT NULL,
  "frequency" "VelRepeatFrequency" NOT NULL,
  "total_units" INTEGER NOT NULL,
  "units_per_delivery" INTEGER NOT NULL DEFAULT 1,
  "discount_percent" INTEGER NOT NULL DEFAULT 0,
  "free_shipping" BOOLEAN NOT NULL DEFAULT TRUE,
  "is_active" BOOLEAN NOT NULL DEFAULT TRUE,
  "sort_order" INTEGER NOT NULL DEFAULT 0,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "product_velrepeat_plans_product_id_is_active_idx"
  ON "product_velrepeat_plans" ("product_id", "is_active");
  
-- =========================
-- Notification Domain
-- =========================

CREATE TABLE "notifications" (
  "id"         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id"    UUID NOT NULL,
  "title"      TEXT NOT NULL,
  "message"    TEXT NOT NULL,
  "type"       TEXT NOT NULL,
  "read_at"    TIMESTAMPTZ,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "notifications_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
);

-- =========================
-- Analytics Domain (VelCenter)
-- =========================

CREATE TABLE "sales_reports" (
  "id"           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "date"         TIMESTAMPTZ NOT NULL,
  "total_orders" INTEGER NOT NULL DEFAULT 0,
  "total_sales"  DECIMAL(14, 2) NOT NULL DEFAULT 0,
  "total_users"  INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE "merchant_reports" (
  "id"          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "merchant_id" UUID NOT NULL,
  "sales"       DECIMAL(14, 2) NOT NULL DEFAULT 0,
  "orders"      INTEGER NOT NULL DEFAULT 0,
  "customers"   INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "merchant_reports_merchant_id_fkey"
    FOREIGN KEY ("merchant_id") REFERENCES "merchants"("id") ON DELETE CASCADE
);

-- =========================
-- Platform Settings (VelCenter)
-- =========================

CREATE TABLE IF NOT EXISTS "platform_settings" (
  "id"                      TEXT PRIMARY KEY DEFAULT 'default',
  "platform_name"           TEXT NOT NULL DEFAULT 'Velnox Commerce Platform',
  "commission_percent"      DECIMAL(5, 2) NOT NULL DEFAULT 5,
  "auto_approve_merchants"  BOOLEAN NOT NULL DEFAULT false,
  "require_product_review"  BOOLEAN NOT NULL DEFAULT true,
  "payment_credit_card"     BOOLEAN NOT NULL DEFAULT true,
  "payment_prompt_pay"      BOOLEAN NOT NULL DEFAULT true,
  "payment_bank_transfer"   BOOLEAN NOT NULL DEFAULT true,
  "payment_cod"             BOOLEAN NOT NULL DEFAULT true,
  "created_at"              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at"              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "auto_approve_products" BOOLEAN NOT NULL DEFAULT false;
);

INSERT INTO "platform_settings" ("id") VALUES ('default')
ON CONFLICT ("id") DO NOTHING;