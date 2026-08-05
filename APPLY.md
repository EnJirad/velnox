# Performance patch

## สาเหตุที่ช้า
1. Render free tier cold start (30-60s หลังไม่ใช้งานนาน)
2. รูป Cloudinary เต็มขนาด
3. img ดิบ ไม่ lazy
4. API list ดึงรูปทุกใบ
5. ไม่มี client cache

## ไฟล์
- apps/shop/lib/image.ts (ใหม่)
- apps/shop/components/product-image.tsx (ใหม่)
- apps/shop/lib/catalog.ts
- apps/shop/app/page.tsx
- apps/shop/app/products/products-view.tsx
- backend/src/products/products.service.ts

## Ops แนะนำ
ตั้ง cron ping backend ทุก 10 นาที หรืออัปเกรด Render plan
