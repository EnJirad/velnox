# Velnox — AI Handoff Document

> อัปเดตล่าสุด: 2026-08-04 \~22:12 +07  
> Repo: https://github.com/EnJirad/velnox.git  
> Commit อ้างอิงล่าสุดที่ตรวจแล้ว: `dde0a2c` (Merchant VelRepeat UI + Shop widget ผูก product plans ครบ)

---

## ไฟล์นี้คืออะไร — อ่านก่อนทำงานทุกครั้ง

**`HANDOFF.md` เป็นเอกสารส่งต่อระหว่าง AI (และคน) เท่านั้น**

### หน้าที่ของไฟล์นี้
1. บอก **สถานะจริงของโปรเจกต์** ณ ตอนอัปเดตล่าสุด (ไม่ใช่แผนในหัว)
2. บอก **กำลังทำอะไร / ทำเสร็จอะไร / ขั้นถัดไปเรียงลำดับ**
3. ลดการเริ่มจากศูนย์ — AI ตัวใหม่ต้องอ่านไฟล์นี้ก่อนลงมือแก้โค้ด
4. เป็น **single source of truth** ด้านสถานะงาน ไม่ใช่ design doc ยาว

### หน้าที่ของ AI ทุกตัวที่เข้ามาทำงานต่อ
1. **อ่าน `HANDOFF.md` ทั้งไฟล์ก่อน** ทุกครั้งที่เริ่ม session หรือรับงานต่อ
2. **อย่าสมมติสถานะ** — ถ้าข้อความในไฟล์กับโค้ดใน repo ไม่ตรง ให้เชื่อโค้ด + commit ล่าสุด แล้ว **แก้ HANDOFF ให้ตรงความจริง**
3. **เมื่อจบงานสำคัญ / จบ phase / เปลี่ยนทิศ** ต้อง **อัปเดต HANDOFF.md** เสมอ (วันที่, สถานะตาราง, ขั้นถัดไป, ปัญหาที่ค้าง)
4. อัปเดตแบบเดียวกับ AI ก่อนหน้า: ชัด, ตารางสถานะ, ลำดับงานถัดไป, deploy notes, ไม่เขียนยาวเกินจำเป็น
5. ถ้า user push เอง (ไม่มีสิทธิ์เขียน GitHub) → **เขียนเนื้อหาเต็มให้ user copy-paste** อย่าเงียบเรื่อง HANDOFF
6. อย่าลบประวัติ phase ที่เสร็จแล้วทั้งหมด — สรุปสั้น + โฟกัสงานปัจจุบัน

### สิ่งที่ห้าม
- เขียนสถานะ “เสร็จ” ทั้งที่ยังไม่ merge / ยังไม่ deploy / ยัง error บน production
- ข้ามการอัปเดต HANDOFF หลังเปลี่ยน schema / API / flow หลัก
- ใส่ secrets, token, connection string ในไฟล์นี้

---

## สรุปแพลตฟอร์ม

| App | บทบาท | สถานะโดยรวม |
|-----|--------|-------------|
| **VelShop** (`apps/shop`) | ร้านค้าลูกค้า (Vercel) | Catalog/Auth/Orders/Checkout ✅ · VelRepeat widget ดึงแผนจาก product ✅ |
| **VelMerchant** (`apps/merchant`) | หลังบ้านร้านค้า | สินค้า+SKU ✅ · **VelRepeat plan UI ใน product-form ✅** |
| **VelCenter** (`apps/center`) | Admin | ✅ + SKU |
| **Backend** (`backend/`) | NestJS + Prisma (Render) | Pack API ✅ · Product plans API ✅ · **ต้อง deploy หลัง schema ล่าสุด** |

---

## สถานะปัจจุบัน (ตารางหลัก)

| รายการ | สถานะ |
|--------|--------|
| Phase 4A Product SKU | ✅ |
| Phase 4B Catalog + Auth + Orders + Checkout | ✅ |
| VelRepeat โมเดลเก่า (subscription รายรอบ) | ❌ เลิกใช้ — ควร DROP ตารางเก่าบน DB |
| **VelRepeat Prepaid Pack** (schema + API + cron) | ✅ |
| Analytics นับ `velRepeatPack` | ✅ |
| Shop UI ซื้อแพ็ก / หน้า subscriptions | ✅ (เรียก API pack) |
| **Product.velRepeatEnabled + ProductVelRepeatPlan** | ✅ schema + DTO + products.service |
| Neon: `vel_repeat_enabled`, `product_velrepeat_plans` | ✅ มีแล้ว |
| Neon: `velrepeat_packs` / deliveries / history | 🔄 ต้องยืนยันว่าตรง Prisma (เคย 500 ตอนซื้อจากตาราง/history เก่า) |
| **Merchant UI ตั้งแผนแพ็ก** | ✅ `product-form.tsx` (toggle + แผนหลายอัน + ส่ง API) |
| **Shop widget ดึงแผนจากสินค้า** | ✅ `velrepeat-widget.tsx` ใช้ `velRepeatEnabled` + `velRepeatPlans`; ไม่มีแผน → ไม่โชว์ |
| Payment gateway จริงตอนซื้อแพ็ก | 📋 ยังสร้าง pack ทันที |
| ที่อยู่จัดส่งลง Order | 📋 |
| Support Chat + SLA | 📋 |

---

## VelRepeat — โมเดลที่ใช้อยู่ (Prepaid Pack)

- ลูกค้าจ่ายก้อนเดียว → `VelRepeatPack` (`totalUnits` / `remainingUnits`)
- Cron `processDuePacks` → สร้าง Order `paymentStatus=PAID` + `VelRepeatDelivery` + ลดเครดิต/stock
- ร้านตั้งแผนได้ผ่าน `ProductVelRepeatPlan` + เปิดด้วย `Product.velRepeatEnabled`
- ขายปกติ (cart/checkout) **ไม่ถูกปิด** — ทำงานคู่กันได้

### API pack (ลูกค้า)

| Method | Path |
|--------|------|
| POST | `/api/velrepeat/packs` |
| GET | `/api/velrepeat/packs` |
| GET | `/api/velrepeat/packs/:id/history` |
| PATCH | `/api/velrepeat/packs/:id/pause` \| `resume` \| `cancel` |
| GET | `/api/velrepeat/summary` |

แผนแพ็กของสินค้าถูกส่งมากับ product API (`findAll` / `findBySlug` / `findMine`) ผ่าน `velRepeatPlans`

### ไฟล์สำคัญ

| โซน | ไฟล์ |
|-----|------|
| Schema | `backend/prisma/schema.prisma` |
| Pack service | `backend/src/velrepeat/*` |
| Product + plans | `backend/src/products/products.service.ts`, `dto/create-product.dto.ts`, `update-product.dto.ts` |
| Shop widget | `apps/shop/components/velrepeat-widget.tsx` |
| Shop store | `apps/shop/stores/velrepeat-store.ts` |
| Shop catalog types | `apps/shop/lib/catalog.ts` |
| Subscriptions page | `apps/shop/app/subscriptions/subscriptions-view.tsx` |
| Merchant form | `apps/merchant/components/product-form.tsx` ✅ VelRepeat block |
| Merchant types | `apps/merchant/lib/api-types.ts` |

---

## Phase ที่เสร็จแล้ว (สรุปสั้น)

- Phase 1–3.5 ✅
- Phase 4A Product SKU ✅ (DB + backend + Merchant + Center)
- Phase 4B Catalog + Auth + Orders + Checkout ✅
- VelRepeat Prepaid Pack (schema + API + cron + Shop UI) ✅
- Product plans (schema + DTO + service) ✅
- **Merchant UI ตั้งแผน + Shop widget ผูก plans** ✅ (ตรวจแล้วใน repo ณ 2026-08-04)

---

## งานถัดไป (เรียงลำดับ — ทำตามนี้)

### ทันที (ops / deploy)
1. [ ] Deploy backend ล่าสุดบน Render ให้ `prisma generate` + schema ใหม่สำเร็จ
2. [ ] ยืนยันซื้อแพ็กบน production ได้ 200 (ถ้ายัง 500 → จัดตาราง `velrepeat_packs` / `velrepeat_deliveries` / `velrepeat_history` ให้ตรง Prisma, DROP ของเก่าถ้าจำเป็น)
3. [ ] Smoke test: Merchant สร้าง/แก้สินค้า + เปิด VelRepeat → Shop เห็น widget + ซื้อแพ็กได้

### โค้ดถัดไป
4. [ ] **ที่อยู่จัดส่งใน Order / Checkout** — เก็บ address ลง Order, Checkout UI ส่งที่อยู่ (ตอนนี้ Address model มีแล้ว แต่ Order ยังไม่ผูก)
5. [ ] Payment gateway จริงตอนซื้อแพ็ก (ตอนนี้สร้าง pack ทันทีโดยไม่ผ่าน gateway)
6. [ ] Phase 5 Support Chat + SLA

---

## Deploy notes

- **Backend (Render):** root/backend ตามที่ตั้ง — build มี `prisma generate && tsc`
- **Shop (Vercel):** ต้องมี `NEXT_PUBLIC_API_URL`
- **CORS_ORIGINS** รวมโดเมน Shop
- **DB (Neon):** schema pack + product plans ต้องตรง Prisma ก่อนใช้งาน production
- หลังแก้ Prisma แล้วถ้า build พัง มักเพราะยังอ้าง model/field เก่า (เช่น `velRepeatSubscription`) — แก้ให้ชี้ pack/plan ใหม่

---

## บันทึกปัญหาที่เจอแล้ว (อย่าทำซ้ำ)

| อาการ | สาเหตุ | ทางแก้ |
|--------|--------|--------|
| `Cannot POST /api/velrepeat/packs` | Backend ยังไม่ deploy โค้ด pack | Deploy Render ใหม่ |
| Build fail `velRepeatSubscription` | analytics ยังใช้ model เก่า | ใช้ `velRepeatPack` |
| Internal server error ตอนซื้อแพ็ก | ตาราง/history เก่าไม่ตรง (`pack_id`) | DROP ของเก่า + สร้างตาม Prisma |
| Schema มี `ProductVelRepeatPlan` แต่ Product ไม่มี relation | generate/runtime พัง | ต้องมี `velRepeatEnabled` + `velRepeatPlans` บน Product (แก้แล้ว) |
| HANDOFF บอก Merchant/Shop UI ยังไม่ทำ | เอกสารค้างหลังโค้ด merge | อัปเดต HANDOFF ให้ตรงโค้ด (รอบนี้) |

---

## กฎสั้นสำหรับ AI ตัวถัดไป

1. อ่าน HANDOFF ทั้งไฟล์ก่อน
2. เชื่อโค้ดใน repo มากกว่าข้อความเก่าใน HANDOFF
3. จบงานแล้วอัปเดต HANDOFF ทันที
4. อย่าใส่ secrets ในไฟล์นี้