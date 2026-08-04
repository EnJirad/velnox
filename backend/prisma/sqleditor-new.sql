-- Phase 4A: Product SKU
-- ปลอดภัยรันซ้ำได้ (IF NOT EXISTS)

-- 1) เพิ่มคอลัมน์ (nullable ก่อน เพื่อ backfill ได้)
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "sku" TEXT;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "seller_sku" TEXT;

-- 2) Backfill สินค้าเก่าที่ยังไม่มี SKU
-- รูปแบบ: VLX-P- + 8 ตัวแรกของ UUID (ไม่มีขีด)
UPDATE "products"
SET "sku" = 'VLX-P-' || UPPER(SUBSTRING(REPLACE("id"::text, '-', ''), 1, 8))
WHERE "sku" IS NULL OR "sku" = '';

-- 3) บังคับ NOT NULL หลังมีค่าครบ
ALTER TABLE "products" ALTER COLUMN "sku" SET NOT NULL;

-- 4) Unique index สำหรับ sku
CREATE UNIQUE INDEX IF NOT EXISTS "products_sku_key" ON "products"("sku");

-- 5) Index สำหรับ seller_sku (ค้นหา)
CREATE INDEX IF NOT EXISTS "products_seller_sku_idx" ON "products"("seller_sku");