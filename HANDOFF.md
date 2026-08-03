# Velnox — AI Handoff Document

> อัปเดตล่าสุด: 2026-08-03 ~23:21 +07  
> Repo: https://github.com/EnJirad/velnox.git  
> งานปัจจุบัน: Phase 1 — ไฟล์โค้ดส่งครบแล้ว เหลือ SQL + schema + deploy

---

## ความคืบหน้า Phase 1

| รายการ | สถานะ |
|--------|--------|
| Frontend: api-types, settings, products, orders | ✅ ส่งครบ |
| Backend: merchants.service | ✅ ส่งครบ |
| Backend: products.service + controller | ✅ ส่งครบ |
| Backend: platform-settings dto + service | ✅ ส่งครบ (service รอบนี้) |
| Neon SQL `auto_approve_products` | ❌ ต้องรัน |
| `schema.prisma` เพิ่ม field | ❌ ต้องแก้ |
| commit / push / deploy | ❌ |
| ทดสอบ 5 ข้อ | ❌ |

---

## สิ่งที่ user ต้องทำต่อทันที

### 1) Neon SQL
```sql
ALTER TABLE "platform_settings"
  ADD COLUMN IF NOT EXISTS "auto_approve_products" BOOLEAN NOT NULL DEFAULT false;
```

### 2) schema.prisma — ใน model PlatformSettings เพิ่ม
```prisma
autoApproveProducts  Boolean  @default(false) @map("auto_approve_products")
```

### 3) ยืนยันว่า copy ครบทุกไฟล์ใน repo แล้ว
```
apps/center/lib/api-types.ts
apps/center/app/admin/settings/page.tsx
apps/center/app/admin/products/page.tsx
apps/center/app/admin/orders/page.tsx
backend/src/merchants/merchants.service.ts
backend/src/products/products.service.ts
backend/src/products/products.controller.ts
backend/src/platform-settings/dto/update-platform-settings.dto.ts
backend/src/platform-settings/platform-settings.service.ts
```

### 4) Commit + deploy
```bash
git add .
git commit -m "feat: wire platform settings into merchant/product flows"
git push
```
- Backend Start: `pnpm start:prod`
- รีเฟรช VelCenter

### 5) ทดสอบ
1. Settings: % ไม่ติด 020  
2. autoApproveMerchants → ร้าน APPROVED  
3. requireProductReview เปิด / autoApproveProducts ปิด → สินค้า DRAFT  
4. `/admin/products` เห็น DRAFT อนุมัติได้  
5. `/admin/orders` polling + ค้นหา  

---

## Deploy notes
- ไม่ใช้ `migrate deploy` (เคย P3005)
- เพิ่มคอลัมน์ด้วย SQL บน Neon

## Backlog หลัง Phase 1 ผ่าน
- P2 Users detail  
- P3 Shops admin tools  
- P4 Dashboard  
- P5 WebSocket  

## สำหรับ AI ตัวถัดไป
Phase 1 โค้ดส่งครบแล้ว — ช่วย user ยืนยัน SQL/schema/deploy/ทดสอบ  
ถ้า error หลัง deploy ไล่จาก missing column `auto_approve_products` หรือ Prisma client ยังไม่รู้ field ใหม่  
