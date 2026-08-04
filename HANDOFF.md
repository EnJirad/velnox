# Velnox — AI Handoff Document

> อัปเดตล่าสุด: 2026-08-04 \~21:20 +07  
> Repo: https://github.com/EnJirad/velnox.git  
> Focus: Prepaid VelRepeat Pack + Shop/Backend deploy

---

## กำลังทำ / สถานะปัจจุบัน

| รายการ | สถานะ |
|--------|--------|
| Phase 4A Product SKU | ✅ |
| Phase 4B Catalog + Auth + Orders + Checkout (Shop) | ✅ |
| **VelRepeat → Prepaid Pack (schema)** | ✅ `VelRepeatPack` / `Delivery` / `History` |
| **Backend Core pack API** | ✅ `POST/GET /velrepeat/packs`, pause/resume/cancel, cron `processDuePacks` |
| **Shop UI เลือกแพ็ก** | ✅ widget + store เรียก API + หน้า `/subscriptions` |
| Analytics นับ pack แทน subscription | ✅ |
| Drop ตาราง subscription เก่าบน production DB | 🔄 รัน SQL ลบแล้ว / กำลังยืนยัน |
| ซื้อแพ็กบน production ได้จริง (200) | 🔄 รอ DB ตรง schema (เคย 500 จาก history/ตารางเก่า) |
| Merchant ตั้งแผนแพ็กเอง + ขายปกติคู่กัน | 📋 ยังไม่ลงมือ (ออกแบบแล้ว) |
| Payment gateway จริงตอนซื้อแพ็ก | 📋 ยัง mock (สร้าง pack ทันที) |
| ที่อยู่จัดส่งลง Order | 📋 |
| Support Chat + SLA | 📋 |

---

## สรุปแพลตฟอร์ม

| App | สถานะ |
|-----|--------|
| VelCenter | ✅ + SKU |
| VelMerchant | ✅ + SKU · **ยังไม่มี UI ตั้ง VelRepeat plan** |
| VelShop | ✅ Catalog/Auth/Orders/Checkout · **UI pack แล้ว (แผนยัง hardcode)** |
| Backend (Render) | ✅ pack routes · ต้องให้ DB production มีตาราง pack |

---

## VelRepeat — โมเดลปัจจุบัน (Prepaid Pack)

- ลูกค้า **จ่ายก้อนเดียว** → ได้ `VelRepeatPack` (`totalUnits` / `remainingUnits`)
- Cron ลดเครดิต → สร้าง `Order` (`paymentStatus=PAID`) + `VelRepeatDelivery`
- `remainingUnits = 0` → `COMPLETED`
- ตารางเก่า `velrepeat_subscriptions` **เลิกใช้** — ควร DROP บน production

### API

| Method | Path |
|--------|------|
| POST | `/api/velrepeat/packs` |
| GET | `/api/velrepeat/packs` |
| GET | `/api/velrepeat/packs/:id/history` |
| PATCH | `/api/velrepeat/packs/:id/pause\|resume\|cancel` |
| GET | `/api/velrepeat/summary` |

### ไฟล์หลัก

- `backend/prisma/schema.prisma` — models pack
- `backend/src/velrepeat/*` — service/controller/cron/dto
- `apps/shop/components/velrepeat-widget.tsx` — เลือกแพ็ก
- `apps/shop/stores/velrepeat-store.ts` — เรียก API
- `apps/shop/app/subscriptions/subscriptions-view.tsx` — แสดง remaining

---

## งานถัดไป (เรียงลำดับ)

### ทันที (บล็อก production)
1. [ ] รัน SQL ลบตารางเก่า + สร้าง `velrepeat_packs` / `deliveries` / `history` ให้ตรง Prisma
2. [ ] ทดสอบซื้อแพ็กบน production → ต้องได้ 200 + เห็นแถวใน DB + หน้า `/subscriptions`
3. [ ] ยืนยัน Render deploy ล่าสุด (analytics ใช้ `velRepeatPack` แล้ว)

### ถัดไป — Merchant ตั้งแพ็ก (ขายปกติคู่กัน)
4. [ ] Schema `Product.velRepeatEnabled` + `ProductVelRepeatPlan`
5. [ ] API merchant CRUD แผนแพ็กของสินค้า
6. [ ] UI `product-form.tsx` — เปิด/ปิด VelRepeat + แก้แผน
7. [ ] Shop widget ดึงแผนจากสินค้า แทน hardcode

### ถัดไป — คุณภาพ / เงินจริง
8. [ ] ต่อ payment จริงตอนซื้อแพ็ก (ตอนนี้สร้าง pack ทันที)
9. [ ] ที่อยู่จัดส่งลง Order / CheckoutDto
10. [ ] Phase 5 Support Chat + SLA

---

## Deploy notes

- **Backend:** Render — `pnpm install && pnpm build` / `pnpm start:prod`
- **Shop:** Vercel — ต้องมี `NEXT_PUBLIC_API_URL`
- **CORS_ORIGINS** รวมโดเมน Shop
- **DB:** Neon — ตาราง pack ต้องมีก่อนซื้อแพ็ก มิฉะนั้น 500
- หลัง schema เปลี่ยน ต้อง generate Prisma ตอน build (มีใน build script แล้ว)

---

## ลำดับที่แนะนำตอนนี้

1. เคลียร์ DB production (drop ของเก่า + สร้างตาราง pack)  
2. Smoke test ซื้อแพ็ก + `/subscriptions`  
3. Merchant: ตั้งแผนแพ็กต่อสินค้า + คงขายปกติ  
4. Payment จริง / ที่อยู่จัดส่ง / Chat