# Shipping Address on Order — วิธีใส่ใน repo

## 1) Neon SQL (รันก่อน deploy backend)

```sql
ALTER TABLE "orders"
  ADD COLUMN IF NOT EXISTS "shipping_name" TEXT,
  ADD COLUMN IF NOT EXISTS "shipping_phone" TEXT,
  ADD COLUMN IF NOT EXISTS "shipping_address_line" TEXT,
  ADD COLUMN IF NOT EXISTS "shipping_province" TEXT,
  ADD COLUMN IF NOT EXISTS "shipping_postal_code" TEXT,
  ADD COLUMN IF NOT EXISTS "shipping_country" TEXT NOT NULL DEFAULT 'TH';
```

ไฟล์: `backend/prisma/add-order-shipping.sql`

## 2) Prisma schema

ใน `backend/prisma/schema.prisma` เพิ่ม field บน model `Order` ตาม `schema-order-snippet.prisma`

## 3) Backend (แทนที่ไฟล์)

- `backend/src/orders/dto/checkout.dto.ts`
- `backend/src/orders/orders.service.ts`
- `backend/src/orders/orders.controller.ts`

## 4) VelShop (แทนที่ไฟล์)

- `apps/shop/lib/orders.ts`
- `apps/shop/app/checkout/checkout-view.tsx`

## 5) Deploy

1. รัน SQL บน Neon
2. Push + deploy backend (Render)
3. Deploy Shop (Vercel)
4. ทดสอบ checkout พร้อมที่อยู่ → ตรวจ orders ว่ามี shipping_* ใน DB

## หมายเหตุ

- ที่อยู่ถูก **snapshot** ลง Order (ไม่ผูก FK ไป addresses) เพื่อให้ประวัติ order ไม่หายถ้าผู้ใช้ลบที่อยู่
- Checkout บังคับส่ง `shippingAddress` — ไม่ส่งจะได้ 400
- ช่อง "จังหวัด" ใน UI ส่งเป็น `province`

## 6) Shared types

- `packages/types/order.ts` — เพิ่ม shipping* optional fields
