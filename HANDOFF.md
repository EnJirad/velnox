# Velnox — AI Handoff Document

> อัปเดตล่าสุด: 2026-08-05 \~06:05 +07  
> Repo: https://github.com/EnJirad/velnox.git  
> Commit อ้างอิง: `2a494b7` (VelRepeat Monitor API + Center/Merchant pages ขึ้น main แล้ว)

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
3. **เมื่อจบงานสำคัญ / จบ phase / เปลี่ยนทิศ** ต้อง **อัปเดต HANDOFF.md** เสมอ
4. ถ้า user push เอง (ไม่มีสิทธิ์เขียน GitHub) → **เขียนเนื้อหาเต็มให้ user copy-paste**
5. อย่าลบประวัติ phase ที่เสร็จแล้วทั้งหมด — สรุปสั้น + โฟกัสงานปัจจุบัน

### สิ่งที่ห้าม
- เขียนสถานะ “เสร็จ” ทั้งที่ยังไม่ merge / ยังไม่ deploy / ยัง error บน production
- ข้ามการอัปเดต HANDOFF หลังเปลี่ยน schema / API / flow หลัก
- ใส่ secrets, token, connection string ในไฟล์นี้

---

## สรุปแพลตฟอร์ม

| App | บทบาท | สถานะโดยรวม |
|-----|--------|-------------|
| **VelShop** (`apps/shop`) | ร้านค้าลูกค้า (Vercel) | Catalog/Auth/Orders/Checkout ✅ · VelRepeat widget ✅ |
| **VelMerchant** (`apps/merchant`) | หลังบ้านร้านค้า | สินค้า+SKU+plan UI ✅ · Monitor หน้า `/dashboard/velrepeat` ✅ · **nav sidebar ยังขาด** |
| **VelCenter** (`apps/center`) | Admin | ✅ + SKU · Monitor `/admin/velrepeat` + เมนู ✅ |
| **Backend** (`backend/`) | NestJS + Prisma (Render) | Pack + plans + Admin/Merchant list API ✅ (`2a494b7`) |

---

## สถานะปัจจุบัน (ตารางหลัก)

| รายการ | สถานะ |
|--------|--------|
| Phase 4A Product SKU | ✅ |
| Phase 4B Catalog + Auth + Orders + Checkout | ✅ |
| VelRepeat Prepaid Pack (schema + API + cron) | ✅ |
| Shop widget + Merchant plan form | ✅ |
| Neon pack tables (`packs` / `deliveries` / `history`) | ✅ 2026-08-05 |
| **VelCenter Monitor** | ✅ โค้ดบน `2a494b7` · รอ deploy ยืนยัน |
| **VelMerchant Monitor** | ✅ หน้า + API บน `2a494b7` · **nav ยังไม่ใส่** · รอ deploy |
| ซื้อแพ็ก production | 🔄 smoke test หลัง deploy |
| ที่อยู่จัดส่งลง Order | 📋 **ขั้นโค้ดถัดไป** |
| Payment gateway จริงตอนซื้อแพ็ก | 📋 |
| Support Chat + SLA | 📋 |

---

## VelRepeat — API (รวม Monitor)

| Method | Path | บทบาท |
|--------|------|--------|
| POST | `/api/velrepeat/packs` | ลูกค้า ซื้อ |
| GET | `/api/velrepeat/packs` | ลูกค้า ของฉัน |
| GET/PATCH | `/api/velrepeat/packs/:id/...` | history / pause / resume / cancel |
| GET | `/api/velrepeat/summary` | Admin สรุป (+ totalRevenue) |
| GET | `/api/velrepeat/admin/packs?status=` | Admin รายการทั้งหมด |
| GET | `/api/velrepeat/merchant/summary` | Merchant สรุปร้าน |
| GET | `/api/velrepeat/merchant/packs?status=` | Merchant รายการร้าน |

### ไฟล์สำคัญ
- `backend/src/velrepeat/velrepeat.service.ts` / `velrepeat.controller.ts`
- `apps/center/app/admin/velrepeat/page.tsx` + nav ใน `admin-layout.tsx`
- `apps/merchant/app/dashboard/velrepeat/page.tsx` (**nav ใน `dashboard-layout.tsx` ยังขาด**)
- `apps/shop/components/velrepeat-widget.tsx`, `apps/merchant/components/product-form.tsx`

---

## Phase ที่เสร็จแล้ว (สรุปสั้น)

- Phase 1–3.5 ✅ · 4A SKU ✅ · 4B Catalog/Auth/Orders/Checkout ✅
- VelRepeat Prepaid Pack + Shop/Merchant plan UI ✅
- Neon pack tables ✅ · Monitor API + Center/Merchant pages (`2a494b7`) ✅

---

## งานถัดไป (เรียงลำดับ)

### ทันที (ops)
1. [ ] Deploy backend `2a494b7` บน Render
2. [ ] Deploy Center + Merchant บน Vercel
3. [ ] Smoke test: ซื้อแพ็ก → Center `/admin/velrepeat` · Merchant `/dashboard/velrepeat`
4. [ ] **แก้ Merchant nav** — เพิ่ม `{ href: '/dashboard/velrepeat', label: 'VelRepeat', Icon: IconRepeat }` ใน `dashboard-layout.tsx` (และ IconRepeat ถ้ายังไม่มี)

### โค้ดถัดไป
5. [ ] **ที่อยู่จัดส่งใน Order / Checkout** (Address model มีแล้ว แต่ Order ยังไม่ผูก)
6. [ ] Payment gateway จริงตอนซื้อแพ็ก
7. [ ] Phase 5 Support Chat + SLA

---

## Deploy notes

- Backend Render: `prisma generate && tsc`
- Frontends Vercel: `NEXT_PUBLIC_API_URL` + CORS รวมโดเมนทั้งสาม
- DB Neon: ชื่อตาราง `velrepeat_history` (ไม่ใช่ `_new`)

---

## บันทึกปัญหาที่เจอแล้ว

| อาการ | สาเหตุ | ทางแก้ |
|--------|--------|--------|
| 500 `velrepeat_history` does not exist | ตารางไม่มี / ชื่อผิด | CREATE ตาม Prisma — แก้แล้ว 2026-08-05 |
| Merchant ไม่เห็นเมนู VelRepeat | push หน้าแล้วแต่ยังไม่อัปเดต nav | เพิ่มลิงก์ใน `dashboard-layout.tsx` |
| GitHub write 403 จาก AI | token ไม่มีสิทธิ์เขียน | user push เอง |

---

## กฎสั้นสำหรับ AI ตัวถัดไป

1. อ่าน HANDOFF ทั้งไฟล์ก่อน  
2. เชื่อโค้ดใน repo มากกว่าข้อความเก่า  
3. จบงานแล้วอัปเดต HANDOFF  
4. อย่าใส่ secrets