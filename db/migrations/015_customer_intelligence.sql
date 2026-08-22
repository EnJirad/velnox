-- ============================================================================
-- Velnox — Migration 015: Customer Intelligence + R2 Media
-- ----------------------------------------------------------------------------
-- Architecture upgrade:
--   1. customer_profiles — derived customer intelligence (rebuilt from events/orders)
--   2. media — generic media metadata table (R2-backed, replaces Cloudinary metadata)
--   3. Enhanced behavioral_events with session_id for session grouping
--   4. customer_segments — derived customer segmentation
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. customer_profiles — derived intelligence, rebuilt from durable events
-- ---------------------------------------------------------------------------
-- These are DERIVED values. The original events/orders remain the source.
-- Never treat a profile as the only source of customer history.
-- Profiles are rebuilt by the event processor from behavioral_events + orders.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS customer_profiles (
  id                        UUID PRIMARY KEY REFERENCES users (id) ON DELETE CASCADE,
  -- preferences (derived from behavior)
  preferred_language        TEXT DEFAULT 'th',
  preferred_currency        TEXT DEFAULT 'THB',
  -- purchasing patterns (derived from orders)
  total_orders              INTEGER NOT NULL DEFAULT 0,
  total_spent               NUMERIC(12,2) NOT NULL DEFAULT 0,
  average_order_value       NUMERIC(12,2) NOT NULL DEFAULT 0,
  first_purchase_at         TIMESTAMPTZ,
  last_purchase_at          TIMESTAMPTZ,
  -- category preferences (derived from views + purchases)
  favorite_categories       JSONB DEFAULT '[]'::jsonb,
  favorite_shops            JSONB DEFAULT '[]'::jsonb,
  -- repeat purchase patterns (derived from order intervals)
  estimated_replenishment_days INTEGER,
  repeat_purchase_count     INTEGER NOT NULL DEFAULT 0,
  -- segmentation (derived, refreshed periodically)
  customer_segment          TEXT DEFAULT 'new'
                            CHECK (customer_segment IN (
                              'new','active','repeat','high_value',
                              'price_sensitive','frequent_buyer',
                              'replenishment','inactive'
                            )),
  -- engagement
  total_product_views       INTEGER NOT NULL DEFAULT 0,
  total_searches            INTEGER NOT NULL DEFAULT 0,
  total_cart_adds           INTEGER NOT NULL DEFAULT 0,
  -- metadata
  last_event_at             TIMESTAMPTZ,
  last_rebuilt_at           TIMESTAMPTZ,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_customer_profiles_segment ON customer_profiles (customer_segment);
CREATE INDEX IF NOT EXISTS idx_customer_profiles_last_purchase ON customer_profiles (last_purchase_at DESC NULLS LAST);

DROP TRIGGER IF EXISTS trg_customer_profiles_updated ON customer_profiles;
CREATE TRIGGER trg_customer_profiles_updated
  BEFORE UPDATE ON customer_profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ---------------------------------------------------------------------------
-- 2. media — generic media metadata (R2-backed)
-- ---------------------------------------------------------------------------
-- Binary lives in R2. This table stores canonical metadata + CDN URLs.
-- Supports avatars, covers, product images, store images, marketing media.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS media (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_type        TEXT NOT NULL
                    CHECK (owner_type IN ('user','product','shop','order','system')),
  owner_id          TEXT NOT NULL,
  kind              TEXT NOT NULL
                    CHECK (kind IN ('avatar','cover','product_image','store_image','banner','document','other')),
  -- R2 storage
  object_key        TEXT NOT NULL,               -- R2 key: e.g. "users/{id}/avatar/{uuid}.jpg"
  cdn_url           TEXT NOT NULL,               -- public CDN URL
  mime_type         TEXT NOT NULL,
  file_size         INTEGER NOT NULL DEFAULT 0,
  width             INTEGER,
  height            INTEGER,
  -- status
  status            TEXT NOT NULL DEFAULT 'active'
                    CHECK (status IN ('active','deleted','processing')),
  -- legacy migration support
  legacy_provider   TEXT,                        -- 'cloudinary' if migrated from Cloudinary
  legacy_key        TEXT,                        -- old Cloudinary public_id
  -- metadata
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at        TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_media_owner ON media (owner_type, owner_id);
CREATE INDEX IF NOT EXISTS idx_media_kind ON media (kind, status);
CREATE INDEX IF NOT EXISTS idx_media_status ON media (status, created_at DESC);

DROP TRIGGER IF EXISTS trg_media_updated ON media;
CREATE TRIGGER trg_media_updated
  BEFORE UPDATE ON media
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ---------------------------------------------------------------------------
-- 3. Add session_id support to behavioral_events (idempotent)
-- ---------------------------------------------------------------------------
ALTER TABLE behavioral_events ADD COLUMN IF NOT EXISTS session_id TEXT;
CREATE INDEX IF NOT EXISTS behavioral_events_session_idx
  ON behavioral_events (session_id, occurred_at DESC)
  WHERE session_id IS NOT NULL;

-- ---------------------------------------------------------------------------
-- 4. customer_segments — derived segmentation rules (for future evolution)
-- ---------------------------------------------------------------------------
-- Segmentation is derived from data. Rules can evolve without hard-coding
-- customers into permanent segments.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS customer_segments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL UNIQUE,
  description     TEXT,
  -- segment criteria (JSONB for flexibility)
  criteria        JSONB NOT NULL DEFAULT '{}'::jsonb,
  -- current counts (refreshed periodically)
  customer_count  INTEGER NOT NULL DEFAULT 0,
  -- metadata
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS trg_customer_segments_updated ON customer_segments;
CREATE TRIGGER trg_customer_segments_updated
  BEFORE UPDATE ON customer_segments
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ---------------------------------------------------------------------------
-- 5. Add R2 support to product_images (idempotent)
-- ---------------------------------------------------------------------------
ALTER TABLE product_images ADD COLUMN IF NOT EXISTS r2_object_key TEXT;
ALTER TABLE product_images ADD COLUMN IF NOT EXISTS r2_cdn_url TEXT;

-- ---------------------------------------------------------------------------
-- 6. Add avatar_media_id to users (for R2-backed avatars)
-- ---------------------------------------------------------------------------
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_media_id UUID REFERENCES media (id);
ALTER TABLE users ADD COLUMN IF NOT EXISTS cover_media_id UUID REFERENCES media (id);
