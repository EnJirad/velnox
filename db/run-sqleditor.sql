-- ============================================================================
-- Velnox — One-Shot Database Initialization Script
-- ============================================================================
-- This script creates the COMPLETE Velnox database schema from scratch.
-- It can be pasted into Neon SQL Editor and run to initialize a new database.
--
-- All statements use IF NOT EXISTS — safe to run on existing databases.
-- Tables are ordered by dependency (parent tables first).
--
-- Usage:
--   1. Open Neon Console → SQL Editor
--   2. Paste this entire script
--   3. Click "Run"
--
-- After running:
--   Verify with: DATABASE_URL=<connection-string> bun run db:smoke
--
-- IMPORTANT: When adding new tables or columns:
--   1. Create migration in db/migrations/
--   2. UPDATE this file to include the new schema
--   3. UPDATE db/schema.sql to match
--   4. UPDATE AI_Handoff.md
-- ============================================================================

-- ─── Extensions ─────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ─── Functions ──────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ─── Sequences ──────────────────────────────────────────────────────────────
CREATE SEQUENCE IF NOT EXISTS orders_number_seq;

-- ============================================================================
-- TABLES (in dependency order)
-- ============================================================================

-- 1. media (no dependencies)
CREATE TABLE IF NOT EXISTS media (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_type        TEXT NOT NULL CHECK (owner_type IN ('user','product','shop','order','system')),
  owner_id          TEXT NOT NULL,
  kind              TEXT NOT NULL CHECK (kind IN ('avatar','cover','product_image','store_image','banner','document','other')),
  object_key        TEXT NOT NULL,
  cdn_url           TEXT NOT NULL,
  mime_type         TEXT NOT NULL,
  file_size         INTEGER NOT NULL DEFAULT 0,
  width             INTEGER,
  height            INTEGER,
  status            TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','deleted','processing')),
  legacy_provider   TEXT,
  legacy_key        TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at        TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_media_owner ON media (owner_type, owner_id);
CREATE INDEX IF NOT EXISTS idx_media_kind ON media (kind, status);
CREATE INDEX IF NOT EXISTS idx_media_status ON media (status, created_at DESC);
DROP TRIGGER IF EXISTS trg_media_updated ON media;
CREATE TRIGGER trg_media_updated BEFORE UPDATE ON media FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- 2. users (depends on: media)
CREATE TABLE IF NOT EXISTS users (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  convex_id           TEXT NOT NULL UNIQUE,
  email               TEXT,
  phone               TEXT,
  name                TEXT,
  role                TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer','seller','staff','admin','owner')),
  department          TEXT CHECK (department IN ('marketing','sales','operations','finance','general')),
  status              TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','pending','suspended','banned')),
  deleted_at          TIMESTAMPTZ,
  avatar_url          TEXT,
  cover_url           TEXT,
  avatar_media_id     UUID REFERENCES media (id),
  cover_media_id      UUID REFERENCES media (id),
  employee_id         TEXT,
  password_updated_at TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
CREATE INDEX IF NOT EXISTS idx_users_status ON users (status);
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_employee_id ON users (employee_id) WHERE employee_id IS NOT NULL;
-- Normalized email unique index (prevents duplicate users with same email)
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_normalized_email
  ON users (LOWER(TRIM(email)))
  WHERE email IS NOT NULL;
DROP TRIGGER IF EXISTS trg_users_updated ON users;
CREATE TRIGGER trg_users_updated BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- 3. user_profiles (depends on: users, addresses)
CREATE TABLE IF NOT EXISTS user_profiles (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL UNIQUE REFERENCES users (id) ON DELETE CASCADE,
  first_name          TEXT,
  last_name           TEXT,
  display_name        TEXT,
  date_of_birth       DATE,
  gender              TEXT CHECK (gender IN ('male','female','other','unspecified')),
  default_address_id  UUID,  -- FK to addresses added after addresses table
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. sellers (depends on: users)
CREATE TABLE IF NOT EXISTS sellers (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id        UUID NOT NULL UNIQUE REFERENCES users (id) ON DELETE CASCADE,
  name                 TEXT NOT NULL,
  tax_id               TEXT,
  status               TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','suspended')),
  approved_at          TIMESTAMPTZ,
  approved_by          UUID REFERENCES users (id),
  rejection_reason     TEXT,
  refund_policy_limit  NUMERIC(6,4) NOT NULL DEFAULT 0.10,
  business_type        TEXT,
  contact_phone        TEXT,
  contact_email        TEXT,
  deleted_at           TIMESTAMPTZ,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_sellers_status ON sellers (status);

-- 5. shops (depends on: sellers)
CREATE TABLE IF NOT EXISTS shops (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id       UUID NOT NULL REFERENCES sellers (id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  slug            TEXT UNIQUE,
  description     TEXT,
  image_url       TEXT,
  phone           TEXT,
  address         TEXT,
  announcement    TEXT,
  status          TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('pending','active','suspended','closed')),
  commission_rate NUMERIC(6,4) NOT NULL DEFAULT 0.03,
  currency        TEXT NOT NULL DEFAULT 'THB',
  banner_url      TEXT,
  business_hours  TEXT,
  return_policy   TEXT,
  shipping_policy TEXT,
  rating          NUMERIC(3,2) NOT NULL DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  review_count    INTEGER NOT NULL DEFAULT 0,
  subdistrict     TEXT,
  district        TEXT,
  province        TEXT,
  latitude        NUMERIC(10,7) CHECK (latitude IS NULL OR (latitude >= -90 AND latitude <= 90)),
  longitude       NUMERIC(10,7) CHECK (longitude IS NULL OR (longitude >= -180 AND longitude <= 180)),
  place_id        TEXT,
  deleted_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_shops_seller ON shops (seller_id);
CREATE INDEX IF NOT EXISTS idx_shops_status ON shops (status);

-- 6. categories (self-referencing)
CREATE TABLE IF NOT EXISTS categories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  slug        TEXT UNIQUE,
  description TEXT,
  image_url   TEXT,
  parent_id   UUID REFERENCES categories (id) ON DELETE SET NULL,
  level       INTEGER NOT NULL DEFAULT 0 CHECK (level >= 0),
  sort_order  INTEGER NOT NULL DEFAULT 0,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_categories_parent ON categories (parent_id);
INSERT INTO categories (name, slug, level, sort_order)
SELECT * FROM (VALUES
  ('Electronics', 'electronics', 0, 1),
  ('Home',        'home',        0, 2),
  ('Beauty',      'beauty',      0, 3),
  ('Food',        'food',        0, 4),
  ('Fashion',     'fashion',     0, 5),
  ('Other',       'other',       0, 99)
) AS seed(name, slug, level, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = seed.slug);

-- 7. products (depends on: shops, sellers, categories)
CREATE TABLE IF NOT EXISTS products (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id           UUID NOT NULL REFERENCES shops (id) ON DELETE CASCADE,
  seller_id         UUID REFERENCES sellers (id),
  category_id       UUID REFERENCES categories (id),
  name              TEXT NOT NULL,
  description       TEXT,
  category          TEXT NOT NULL DEFAULT 'general' CHECK (category IN ('general','food','daily','beauty','packaging','other')),
  slug              TEXT,
  brand             TEXT,
  unit              TEXT NOT NULL DEFAULT 'piece',
  price             NUMERIC(12,2) NOT NULL DEFAULT 0,
  compare_at_price  NUMERIC(12,2),
  currency          TEXT NOT NULL DEFAULT 'THB',
  product_type      TEXT NOT NULL DEFAULT 'physical' CHECK (product_type IN ('one_time','velrepeat','service','digital','physical')),
  weight            NUMERIC(10,3),
  status            TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','pending_review','published','rejected','archived')),
  rejection_reason  TEXT,
  supplier          TEXT,
  deleted_at        TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_products_shop ON products (shop_id);
CREATE INDEX IF NOT EXISTS idx_products_seller ON products (seller_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products (category_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products (slug);
CREATE INDEX IF NOT EXISTS idx_products_status ON products (status);
DROP TRIGGER IF EXISTS trg_products_updated ON products;
CREATE TRIGGER trg_products_updated BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- 8. product_variants (depends on: products)
CREATE TABLE IF NOT EXISTS product_variants (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id       UUID NOT NULL REFERENCES products (id) ON DELETE CASCADE,
  name             TEXT NOT NULL,
  sku              TEXT UNIQUE,
  price            NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (price >= 0),
  compare_at_price NUMERIC(12,2),
  weight           NUMERIC(10,3),
  options          JSONB NOT NULL DEFAULT '{}'::jsonb,
  image_url        TEXT,
  is_active        BOOLEAN NOT NULL DEFAULT true,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_product_variants_product ON product_variants (product_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_sku ON product_variants (sku);

-- 9. product_images (depends on: products, product_variants)
CREATE TABLE IF NOT EXISTS product_images (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id       UUID NOT NULL REFERENCES products (id) ON DELETE CASCADE,
  variant_id       UUID REFERENCES product_variants (id) ON DELETE SET NULL,
  url              TEXT NOT NULL,
  storage_provider TEXT NOT NULL DEFAULT 'r2',
  storage_key      TEXT,
  thumbnail_url    TEXT,
  alt              TEXT,
  sort_order       INTEGER NOT NULL DEFAULT 0,
  is_primary       BOOLEAN NOT NULL DEFAULT false,
  width            INTEGER,
  height           INTEGER,
  r2_object_key    TEXT,
  r2_cdn_url       TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_product_images_product ON product_images (product_id);
CREATE INDEX IF NOT EXISTS idx_product_images_variant ON product_images (variant_id);

-- 10. inventory (depends on: products, shops, product_variants)
CREATE TABLE IF NOT EXISTS inventory (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id        UUID NOT NULL REFERENCES products (id) ON DELETE CASCADE,
  variant_id        UUID REFERENCES product_variants (id) ON DELETE CASCADE,
  shop_id           UUID NOT NULL REFERENCES shops (id) ON DELETE CASCADE,
  quantity          INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  reserved_quantity INTEGER NOT NULL DEFAULT 0 CHECK (reserved_quantity >= 0),
  reorder_level     INTEGER NOT NULL DEFAULT 0 CHECK (reorder_level >= 0),
  warehouse         TEXT NOT NULL DEFAULT 'main',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_inventory_product ON inventory (product_id) WHERE variant_id IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uq_inventory_product_variant ON inventory (product_id, variant_id) WHERE variant_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_inventory_shop ON inventory (shop_id);
CREATE INDEX IF NOT EXISTS idx_inventory_variant ON inventory (variant_id);
DROP TRIGGER IF EXISTS trg_inventory_updated ON inventory;
CREATE TRIGGER trg_inventory_updated BEFORE UPDATE ON inventory FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- 11. addresses (depends on: users)
CREATE TABLE IF NOT EXISTS addresses (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  label          TEXT NOT NULL DEFAULT 'บ้าน',
  recipient_name TEXT NOT NULL,
  phone          TEXT NOT NULL,
  line1          TEXT NOT NULL,
  line2          TEXT,
  city           TEXT NOT NULL,
  state          TEXT,
  postal_code    TEXT,
  country        TEXT NOT NULL DEFAULT 'TH',
  latitude       NUMERIC(10,7) CHECK (latitude IS NULL OR (latitude >= -90 AND latitude <= 90)),
  longitude      NUMERIC(10,7) CHECK (longitude IS NULL OR (longitude >= -180 AND longitude <= 180)),
  subdistrict    TEXT,
  district       TEXT,
  province       TEXT,
  place_id       TEXT,
  is_default     BOOLEAN NOT NULL DEFAULT false,
  deleted_at     TIMESTAMPTZ,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_addresses_user ON addresses (user_id);
DROP TRIGGER IF EXISTS trg_addresses_updated ON addresses;
CREATE TRIGGER trg_addresses_updated BEFORE UPDATE ON addresses FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Add FK from user_profiles to addresses (created after addresses)
DO $$ BEGIN
  ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_default_address_id_fkey
    FOREIGN KEY (default_address_id) REFERENCES addresses (id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 12. carts (depends on: users)
CREATE TABLE IF NOT EXISTS carts (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  status     TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','checked_out','abandoned')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_carts_user ON carts (user_id);

-- 13. cart_items (depends on: carts, products, product_variants, sellers, shops)
CREATE TABLE IF NOT EXISTS cart_items (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id       UUID NOT NULL REFERENCES carts (id) ON DELETE CASCADE,
  product_id    UUID NOT NULL REFERENCES products (id),
  variant_id    UUID REFERENCES product_variants (id) ON DELETE SET NULL,
  seller_id     UUID NOT NULL REFERENCES sellers (id),
  shop_id       UUID NOT NULL REFERENCES shops (id),
  quantity      INTEGER NOT NULL CHECK (quantity > 0),
  price_snapshot NUMERIC(12,2) NOT NULL CHECK (price_snapshot >= 0),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_cart_items_cart ON cart_items (cart_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_product ON cart_items (product_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_seller ON cart_items (seller_id);
CREATE UNIQUE INDEX IF NOT EXISTS uq_cart_items_cart_product
  ON cart_items (cart_id, product_id, COALESCE(variant_id, '00000000-0000-0000-0000-000000000000'));

-- 14. wishlists (depends on: users)
CREATE TABLE IF NOT EXISTS wishlists (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL UNIQUE REFERENCES users (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 15. wishlist_items (depends on: wishlists, products)
CREATE TABLE IF NOT EXISTS wishlist_items (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wishlist_id UUID NOT NULL REFERENCES wishlists (id) ON DELETE CASCADE,
  product_id  UUID NOT NULL REFERENCES products (id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (wishlist_id, product_id)
);
CREATE INDEX IF NOT EXISTS idx_wishlist_items_product ON wishlist_items (product_id);

-- 16. orders (depends on: users, sellers, shops — self-referencing for parent_order_id)
CREATE TABLE IF NOT EXISTS orders (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number     TEXT NOT NULL UNIQUE DEFAULT ('ORD-' || lpad(nextval('orders_number_seq')::text, 6, '0')),
  customer_user_id UUID NOT NULL REFERENCES users (id),
  parent_order_id  UUID REFERENCES orders (id),
  seller_id        UUID REFERENCES sellers (id),
  shop_id          UUID REFERENCES shops (id),
  status           TEXT NOT NULL DEFAULT 'pending'
                   CHECK (status IN ('pending','confirmed','processing','packed','shipped',
                                     'in_transit','out_for_delivery','delivered','completed',
                                     'cancelled','return_requested','returned','refunded')),
  payment_status   TEXT NOT NULL DEFAULT 'unpaid'
                   CHECK (payment_status IN ('unpaid','pending','processing','paid',
                                             'partially_refunded','refunded','failed','cancelled')),
  shipping_status  TEXT NOT NULL DEFAULT 'not_shipped'
                   CHECK (shipping_status IN ('not_shipped','processing','shipped','delivered','returned')),
  shipping_method  TEXT,
  tracking_number  TEXT,
  subtotal         NUMERIC(12,2) NOT NULL DEFAULT 0,
  discount         NUMERIC(12,2) NOT NULL DEFAULT 0,
  shipping_fee     NUMERIC(12,2) NOT NULL DEFAULT 0,
  tax              NUMERIC(12,2) NOT NULL DEFAULT 0,
  total            NUMERIC(12,2) NOT NULL DEFAULT 0,
  currency         TEXT NOT NULL DEFAULT 'THB',
  address_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
  note             TEXT,
  idempotency_key  TEXT UNIQUE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders (customer_user_id);
CREATE INDEX IF NOT EXISTS idx_orders_parent ON orders (parent_order_id);
CREATE INDEX IF NOT EXISTS idx_orders_seller ON orders (seller_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders (status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders (created_at DESC);
DROP TRIGGER IF EXISTS trg_orders_updated ON orders;
CREATE TRIGGER trg_orders_updated BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- 17. order_items (depends on: orders)
CREATE TABLE IF NOT EXISTS order_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id        UUID NOT NULL REFERENCES orders (id) ON DELETE CASCADE,
  product_id      UUID NOT NULL,
  variant_id      UUID,
  variant_name    TEXT,
  sku             TEXT,
  shop_id         UUID NOT NULL,
  seller_id       UUID NOT NULL,
  product_name    TEXT NOT NULL,
  unit            TEXT NOT NULL,
  unit_price      NUMERIC(12,2) NOT NULL,
  quantity        INTEGER NOT NULL CHECK (quantity > 0),
  subtotal        NUMERIC(12,2) NOT NULL,
  discount        NUMERIC(12,2) NOT NULL DEFAULT 0,
  commission_rate NUMERIC(6,4) NOT NULL DEFAULT 0.03,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items (order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_seller ON order_items (seller_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product ON order_items (product_id);
CREATE INDEX IF NOT EXISTS idx_order_items_variant ON order_items (variant_id);

-- 18. payments (depends on: orders, users)
CREATE TABLE IF NOT EXISTS payments (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id     UUID NOT NULL REFERENCES orders (id) ON DELETE CASCADE,
  user_id      UUID REFERENCES users (id),
  amount       NUMERIC(12,2) NOT NULL,
  currency     TEXT NOT NULL DEFAULT 'THB',
  method       TEXT NOT NULL CHECK (method IN ('cod','transfer','card','promptpay','wallet')),
  provider     TEXT,
  status       TEXT NOT NULL DEFAULT 'pending'
               CHECK (status IN ('pending','processing','succeeded','failed','cancelled','refunded')),
  external_ref TEXT,
  paid_at      TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_payments_order ON payments (order_id);
CREATE INDEX IF NOT EXISTS idx_payments_user ON payments (user_id);

-- 19. payment_transactions (depends on: payments)
CREATE TABLE IF NOT EXISTS payment_transactions (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id             UUID NOT NULL REFERENCES payments (id) ON DELETE CASCADE,
  provider               TEXT NOT NULL,
  provider_transaction_id TEXT,
  type                   TEXT NOT NULL DEFAULT 'payment' CHECK (type IN ('payment','refund','partial_refund')),
  amount                 NUMERIC(12,2) NOT NULL CHECK (amount >= 0),
  currency               TEXT NOT NULL DEFAULT 'THB',
  status                 TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','succeeded','failed')),
  metadata               JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_payment ON payment_transactions (payment_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_provider ON payment_transactions (provider, provider_transaction_id);

-- 20. refunds (depends on: orders, payments)
CREATE TABLE IF NOT EXISTS refunds (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id           UUID NOT NULL REFERENCES orders (id) ON DELETE CASCADE,
  payment_id         UUID REFERENCES payments (id),
  amount             NUMERIC(12,2) NOT NULL,
  currency           TEXT NOT NULL DEFAULT 'THB',
  reason             TEXT,
  status             TEXT NOT NULL DEFAULT 'requested' CHECK (status IN ('requested','approved','processed','rejected')),
  provider_refund_id TEXT,
  completed_at       TIMESTAMPTZ,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_refunds_order ON refunds (order_id);
CREATE INDEX IF NOT EXISTS idx_refunds_provider ON refunds (provider_refund_id);

-- 21. commissions (depends on: order_items, orders)
CREATE TABLE IF NOT EXISTS commissions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_item_id     UUID NOT NULL REFERENCES order_items (id) ON DELETE CASCADE,
  order_id          UUID NOT NULL REFERENCES orders (id) ON DELETE CASCADE,
  seller_id         UUID NOT NULL,
  shop_id           UUID NOT NULL,
  order_amount      NUMERIC(12,2) NOT NULL,
  commission_rate   NUMERIC(6,4) NOT NULL,
  commission_amount NUMERIC(12,2) NOT NULL,
  status            TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','settled','voided')),
  settled_at        TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_commissions_order ON commissions (order_id);
CREATE INDEX IF NOT EXISTS idx_commissions_seller ON commissions (seller_id);
CREATE INDEX IF NOT EXISTS idx_commissions_item ON commissions (order_item_id);

-- 22. settlements (depends on: sellers)
CREATE TABLE IF NOT EXISTS settlements (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id         UUID NOT NULL REFERENCES sellers (id) ON DELETE CASCADE,
  period_start      DATE NOT NULL,
  period_end        DATE NOT NULL,
  gross_amount      NUMERIC(12,2) NOT NULL DEFAULT 0,
  commission_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  refund_amount     NUMERIC(12,2) NOT NULL DEFAULT 0,
  payout_amount     NUMERIC(12,2) NOT NULL DEFAULT 0,
  status            TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','paid')),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_settlements_seller ON settlements (seller_id);

-- 23. subscriptions (depends on: users, products, shops, product_variants, addresses)
CREATE TABLE IF NOT EXISTS subscriptions (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_user_id    UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  product_id          UUID NOT NULL REFERENCES products (id) ON DELETE CASCADE,
  shop_id             UUID NOT NULL REFERENCES shops (id) ON DELETE CASCADE,
  seller_id           UUID NOT NULL,
  variant_id          UUID REFERENCES product_variants (id) ON DELETE SET NULL,
  quantity            INTEGER NOT NULL CHECK (quantity > 0),
  unit_price_snapshot NUMERIC(12,2) NOT NULL,
  frequency           TEXT NOT NULL DEFAULT 'monthly' CHECK (frequency IN ('daily','weekly','monthly','custom')),
  interval_days       INTEGER NOT NULL DEFAULT 30,
  next_order_date     DATE NOT NULL,
  last_order_date     DATE,
  payment_method      TEXT,
  shipping_address_id UUID REFERENCES addresses (id) ON DELETE SET NULL,
  status              TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','paused','cancelled')),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_subscriptions_customer ON subscriptions (customer_user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_seller ON subscriptions (seller_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_product ON subscriptions (product_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_variant ON subscriptions (variant_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_due ON subscriptions (status, next_order_date);
DROP TRIGGER IF EXISTS trg_subscriptions_updated ON subscriptions;
CREATE TRIGGER trg_subscriptions_updated BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- 24. reviews (depends on: products, shops, users, orders)
CREATE TABLE IF NOT EXISTS reviews (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products (id) ON DELETE CASCADE,
  shop_id    UUID NOT NULL REFERENCES shops (id),
  user_id    UUID NOT NULL REFERENCES users (id),
  order_id   UUID REFERENCES orders (id) ON DELETE SET NULL,
  rating     INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title      TEXT,
  comment    TEXT,
  images     JSONB NOT NULL DEFAULT '[]'::jsonb,
  status     TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('published','pending','hidden')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, product_id, order_id)
);
CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews (product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_shop ON reviews (shop_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user ON reviews (user_id);

-- 25. velrepeat_orders (depends on: subscriptions, orders)
CREATE TABLE IF NOT EXISTS velrepeat_orders (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID NOT NULL REFERENCES subscriptions (id) ON DELETE CASCADE,
  order_id        UUID NOT NULL REFERENCES orders (id) ON DELETE CASCADE,
  scheduled_date  DATE NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (subscription_id, order_id)
);
CREATE INDEX IF NOT EXISTS idx_velrepeat_orders_subscription ON velrepeat_orders (subscription_id);
CREATE INDEX IF NOT EXISTS idx_velrepeat_orders_order ON velrepeat_orders (order_id);

-- 26. shipments (depends on: orders, sellers)
CREATE TABLE IF NOT EXISTS shipments (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id                UUID NOT NULL REFERENCES orders (id) ON DELETE CASCADE,
  seller_id               UUID NOT NULL REFERENCES sellers (id),
  carrier                 TEXT NOT NULL,
  tracking_number         TEXT,
  status                  TEXT NOT NULL DEFAULT 'created'
                          CHECK (status IN ('created','picked_up','in_transit','arrived_at_hub',
                                            'out_for_delivery','delivered','failed','returned','cancelled')),
  shipping_fee            NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (shipping_fee >= 0),
  estimated_delivery_date DATE,
  shipped_at              TIMESTAMPTZ,
  delivered_at            TIMESTAMPTZ,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_shipments_order ON shipments (order_id);
CREATE INDEX IF NOT EXISTS idx_shipments_tracking ON shipments (tracking_number);
CREATE INDEX IF NOT EXISTS idx_shipments_seller ON shipments (seller_id);

-- 27. tracking_events (depends on: shipments)
CREATE TABLE IF NOT EXISTS tracking_events (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id UUID NOT NULL REFERENCES shipments (id) ON DELETE CASCADE,
  status      TEXT NOT NULL,
  description TEXT,
  location    TEXT,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata    JSONB NOT NULL DEFAULT '{}'::jsonb
);
CREATE INDEX IF NOT EXISTS idx_tracking_events_shipment ON tracking_events (shipment_id);

-- 28. returns (depends on: orders, users, sellers)
CREATE TABLE IF NOT EXISTS returns (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id               UUID NOT NULL REFERENCES orders (id) ON DELETE CASCADE,
  customer_user_id       UUID NOT NULL REFERENCES users (id),
  seller_id              UUID NOT NULL REFERENCES sellers (id),
  reason                 TEXT,
  description            TEXT,
  evidence_urls          JSONB NOT NULL DEFAULT '[]'::jsonb,
  status                 TEXT NOT NULL DEFAULT 'requested'
                         CHECK (status IN ('requested','under_review','approved','rejected',
                                           'return_shipping','received','refunding','refunded','cancelled')),
  refund_amount          NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (refund_amount >= 0),
  return_tracking_number TEXT,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_returns_order ON returns (order_id);
CREATE INDEX IF NOT EXISTS idx_returns_seller ON returns (seller_id);
CREATE INDEX IF NOT EXISTS idx_returns_customer ON returns (customer_user_id);

-- 29. return_items (depends on: returns, order_items)
CREATE TABLE IF NOT EXISTS return_items (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  return_id     UUID NOT NULL REFERENCES returns (id) ON DELETE CASCADE,
  order_item_id UUID NOT NULL REFERENCES order_items (id),
  quantity      INTEGER NOT NULL CHECK (quantity > 0),
  reason        TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_return_items_return ON return_items (return_id);

-- 30. financial_ledger (depends on: orders, sellers)
CREATE TABLE IF NOT EXISTS financial_ledger (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id TEXT,
  order_id       UUID REFERENCES orders (id) ON DELETE SET NULL,
  seller_id      UUID REFERENCES sellers (id) ON DELETE SET NULL,
  type           TEXT NOT NULL
                 CHECK (type IN ('sale','platform_commission','shipping_revenue',
                                 'seller_payout','refund','return_cost','penalty','adjustment')),
  amount         NUMERIC(12,2) NOT NULL,
  currency       TEXT NOT NULL DEFAULT 'THB',
  description    TEXT,
  metadata       JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_financial_ledger_order ON financial_ledger (order_id);
CREATE INDEX IF NOT EXISTS idx_financial_ledger_seller ON financial_ledger (seller_id);
CREATE INDEX IF NOT EXISTS idx_financial_ledger_type ON financial_ledger (type);
CREATE INDEX IF NOT EXISTS idx_financial_ledger_created ON financial_ledger (created_at DESC);

-- 31. seller_balances (depends on: sellers)
CREATE TABLE IF NOT EXISTS seller_balances (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id         UUID NOT NULL UNIQUE REFERENCES sellers (id) ON DELETE CASCADE,
  available_balance NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (available_balance >= 0),
  pending_balance   NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (pending_balance >= 0),
  total_earned      NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (total_earned >= 0),
  total_withdrawn   NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (total_withdrawn >= 0),
  currency          TEXT NOT NULL DEFAULT 'THB',
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 32. seller_payouts (depends on: sellers)
CREATE TABLE IF NOT EXISTS seller_payouts (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id     UUID NOT NULL REFERENCES sellers (id) ON DELETE CASCADE,
  amount        NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  currency      TEXT NOT NULL DEFAULT 'THB',
  status        TEXT NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending','processing','completed','failed','cancelled')),
  method        TEXT,
  destination   TEXT,
  requested_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_seller_payouts_seller ON seller_payouts (seller_id);
CREATE INDEX IF NOT EXISTS idx_seller_payouts_status ON seller_payouts (status);

-- 33. platform_settings (no dependencies)
CREATE TABLE IF NOT EXISTS platform_settings (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key        TEXT NOT NULL UNIQUE,
  value      JSONB NOT NULL,
  updated_by UUID REFERENCES users (id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
INSERT INTO platform_settings (key, value)
SELECT * FROM (VALUES
  ('platform_name',              '"Velnox"'::jsonb),
  ('currency',                   '"THB"'::jsonb),
  ('platform_commission_percent', '3'::jsonb),
  ('shipping_company_percent',   '10'::jsonb),
  ('return_rate_threshold',      '10'::jsonb),
  ('auto_approve_sellers',       'false'::jsonb),
  ('auto_approve_products',      'false'::jsonb),
  ('tax_enabled',                'false'::jsonb),
  ('tax_percent',                '7'::jsonb),
  ('payment_credit_card',        'true'::jsonb),
  ('payment_promptpay',          'true'::jsonb),
  ('payment_bank_transfer',      'true'::jsonb),
  ('payment_cod',                'true'::jsonb)
) AS seed(key, value)
WHERE NOT EXISTS (SELECT 1 FROM platform_settings WHERE key = seed.key);

-- 34. notifications (depends on: users)
CREATE TABLE IF NOT EXISTS notifications (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  type       TEXT NOT NULL
             CHECK (type IN ('order','payment','shipping','return','refund','promotion','system','seller')),
  title      TEXT NOT NULL,
  message    TEXT,
  data       JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_read    BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications (user_id, is_read);

-- 35. audit_logs (depends on: users)
CREATE TABLE IF NOT EXISTS audit_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id    UUID REFERENCES users (id),
  actor_role  TEXT,
  action      TEXT NOT NULL,
  entity_type TEXT,
  entity_id   TEXT,
  before      JSONB,
  after       JSONB,
  ip_address  TEXT,
  user_agent  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON audit_logs (actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs (entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs (action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs (created_at DESC);

-- 36. staff_profiles (depends on: users)
CREATE TABLE IF NOT EXISTS staff_profiles (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL UNIQUE REFERENCES users (id) ON DELETE CASCADE,
  department  TEXT CHECK (department IN ('marketing','sales','operations','finance','general')),
  permissions JSONB NOT NULL DEFAULT '[]'::jsonb,
  status      TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 37. coupons (no dependencies)
CREATE TABLE IF NOT EXISTS coupons (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code             TEXT NOT NULL UNIQUE,
  type             TEXT NOT NULL CHECK (type IN ('percentage','fixed')),
  value            NUMERIC(12,2) NOT NULL CHECK (value >= 0),
  minimum_amount   NUMERIC(12,2) NOT NULL DEFAULT 0,
  maximum_discount NUMERIC(12,2),
  usage_limit      INTEGER,
  used_count       INTEGER NOT NULL DEFAULT 0 CHECK (used_count >= 0),
  starts_at        TIMESTAMPTZ,
  expires_at       TIMESTAMPTZ,
  is_active        BOOLEAN NOT NULL DEFAULT true,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons (code);

-- 38. promotions (no dependencies)
CREATE TABLE IF NOT EXISTS promotions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  description TEXT,
  type        TEXT,
  value       NUMERIC(12,2),
  starts_at   TIMESTAMPTZ,
  expires_at  TIMESTAMPTZ,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 39. behavioral_events (no dependencies)
CREATE TABLE IF NOT EXISTS behavioral_events (
  id              BIGSERIAL PRIMARY KEY,
  source          TEXT NOT NULL DEFAULT 'convex_customer_events',
  source_event_id TEXT NOT NULL,
  user_id         TEXT,
  anonymous_id    TEXT,
  session_id      TEXT,
  event_type      TEXT NOT NULL,
  entity_id       TEXT,
  value           TEXT,
  context         JSONB,
  occurred_at     TIMESTAMPTZ NOT NULL,
  ingested_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (source, source_event_id)
);
CREATE INDEX IF NOT EXISTS behavioral_events_user_idx ON behavioral_events (user_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS behavioral_events_anonymous_idx ON behavioral_events (anonymous_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS behavioral_events_type_idx ON behavioral_events (event_type, occurred_at DESC);
CREATE INDEX IF NOT EXISTS behavioral_events_entity_idx ON behavioral_events (entity_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS behavioral_events_session_idx ON behavioral_events (session_id, occurred_at DESC) WHERE session_id IS NOT NULL;

-- 40. event_flush_cursor (no dependencies)
CREATE TABLE IF NOT EXISTS event_flush_cursor (
  id            SMALLINT PRIMARY KEY CHECK (id = 1),
  last_event_at BIGINT NOT NULL DEFAULT 0,
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
INSERT INTO event_flush_cursor (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- 41. customer_profiles (depends on: users)
CREATE TABLE IF NOT EXISTS customer_profiles (
  id                           UUID PRIMARY KEY REFERENCES users (id) ON DELETE CASCADE,
  preferred_language           TEXT DEFAULT 'th',
  preferred_currency           TEXT DEFAULT 'THB',
  total_orders                 INTEGER NOT NULL DEFAULT 0,
  total_spent                  NUMERIC(12,2) NOT NULL DEFAULT 0,
  average_order_value          NUMERIC(12,2) NOT NULL DEFAULT 0,
  first_purchase_at            TIMESTAMPTZ,
  last_purchase_at             TIMESTAMPTZ,
  favorite_categories          JSONB DEFAULT '[]'::jsonb,
  favorite_shops               JSONB DEFAULT '[]'::jsonb,
  estimated_replenishment_days INTEGER,
  repeat_purchase_count        INTEGER NOT NULL DEFAULT 0,
  customer_segment             TEXT DEFAULT 'new'
                               CHECK (customer_segment IN ('new','active','repeat','high_value',
                                                           'price_sensitive','frequent_buyer',
                                                           'replenishment','inactive')),
  total_product_views          INTEGER NOT NULL DEFAULT 0,
  total_searches               INTEGER NOT NULL DEFAULT 0,
  total_cart_adds              INTEGER NOT NULL DEFAULT 0,
  last_event_at                TIMESTAMPTZ,
  last_rebuilt_at              TIMESTAMPTZ,
  created_at                   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_customer_profiles_segment ON customer_profiles (customer_segment);
CREATE INDEX IF NOT EXISTS idx_customer_profiles_last_purchase ON customer_profiles (last_purchase_at DESC NULLS LAST);
DROP TRIGGER IF EXISTS trg_customer_profiles_updated ON customer_profiles;
CREATE TRIGGER trg_customer_profiles_updated BEFORE UPDATE ON customer_profiles FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- 42. customer_segments (no dependencies)
CREATE TABLE IF NOT EXISTS customer_segments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL UNIQUE,
  description     TEXT,
  criteria        JSONB NOT NULL DEFAULT '{}'::jsonb,
  customer_count  INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
DROP TRIGGER IF EXISTS trg_customer_segments_updated ON customer_segments;
CREATE TRIGGER trg_customer_segments_updated BEFORE UPDATE ON customer_segments FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================================
-- DONE — 42 tables created
-- ============================================================================
