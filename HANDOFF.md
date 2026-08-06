# Velnox — AI Handoff Document

> อัปเดตล่าสุด: 2026-08-06 ~13:50 +07  
> Repo: https://github.com/EnJirad/velnox.git  
> เป้าหมายเจ้าของ: **เปิดใช้ธุรกิจภายในอาทิตย์นี้ (MVP ซื้อ–ขายได้)** ไม่ต้อง perfect  
> Ops: cron-job.org `GET /api/categories` ทุก **10 นาที** (กัน Render free cold start)  
> Neon: `orders.shipping_*` ยืนยันครบแล้ว · ตาราง VelRepeat ครบแล้ว

---

## ไฟล์นี้คืออะไร — อ่านก่อนทำงานทุกครั้ง

**`HANDOFF.md` = เอกสารส่งต่อระหว่าง AI (และคน) เท่านั้น**

1. สถานะจริงของโปรเจกต์ ณ ตอนอัปเดตล่าสุด  
2. ทำอะไรไปแล้ว / ค้างอะไร / ขั้นถัดไปเรียงลำดับ  
3. AI ตัวใหม่ต้องอ่านทั้งไฟล์ก่อนลงมือ  
4. เชื่อโค้ดใน repo + DB จริง มากกว่าข้อความเก่า  
5. จบงานสำคัญแล้วอัปเดตไฟล์นี้ · **ห้ามใส่ secrets**

---

## บริบทโปรเจกต์

| App | Path | Host | บทบาท |
|-----|------|------|--------|
| **VelShop** | `apps/shop` | Vercel | หน้าร้านลูกค้า |
| **VelMerchant** | `apps/merchant` | Vercel | หลังบ้านร้านค้า |
| **VelCenter** | `apps/center` | Vercel | Admin แพลตฟอร์ม |
| **Backend** | `backend/` | Render | NestJS + Prisma → Neon Postgres |

Auth: access token ใน memory + refresh token HttpOnly cookie  
ข้ามโดเมน Vercel↔Render ต้อง `SameSite=None; Secure` (`NODE_ENV=production` และ/หรือ `COOKIE_SAMESITE=none`)

---

## สิ่งที่ทำไปแล้ว (สรุปถึงกลางวัน 6 ส.ค. 2026)

### Feature / ธุรกิจ
| รายการ | สถานะ |
|--------|--------|
| Phase 1–3.5, 4A SKU, 4B Catalog/Auth/Cart/Orders | ✅ |
| **VelRepeat** prepaid pack (schema + API + Shop widget + Merchant ตั้งแผน) | ✅ |
| **VelRepeat Monitor** Center `/admin/velrepeat` + Merchant `/dashboard/velrepeat` | ✅ (Merchant **nav อาจยังขาด** — ตรวจ `dashboard-layout.tsx`) |
| **Shipping snapshot** บน Order + Checkout ส่งที่อยู่ | ✅ โค้ด + Neon columns |
| **ที่อยู่โปรไฟล์** GET/POST/DELETE `/api/users/addresses` + UI แท็บที่อยู่ | ✅ (แก้ class brace แล้ว — ดูด้านล่าง) |
| **ซื้อเลย / เพิ่มตะกร้า** บน Shop product detail | ✅ (`BuyNowButton` + แก้ปุ่มตาย) |
| Checkout ฟอร์มที่อยู่ (step 0) | ✅ |
| Merchant orders **WebSocket live** (เหมือน Center) | ✅ + `socket.io-client` ใน merchant + **lockfile importer** |
| Perf: Cloudinary ย่อรูป, ProductImage, client cache, list รูปใบแรก | ✅ |
| Cron keep-alive 10 นาที | ✅ |

### แก้บั๊กสำคัญที่เจอ production
| อาการ | สาเหตุ | ทางแก้ |
|--------|--------|--------|
| ซื้อ VelRepeat 500 | ตาราง `velrepeat_history` ไม่มี | CREATE ตาราง pack (ห้ามชื่อ `_new`) |
| Merchant/Center orders·dashboard·reports 500 | Prisma SELECT `orders.shipping_*` ขณะ DB ยังไม่ตรง | Neon มีคอลัมน์แล้ว + list ใช้ `ORDER_LIST_SELECT` **ไม่ดึง shipping** |
| Center “You do not have access” หลังพัก | refresh cookie ข้ามโดเมนล้ม | `useCrossSiteCookie()` + RoleGuard → `/login` |
| Render build lockfile | เพิ่ม `socket.io-client` แต่ merchant importer ใน lock ไม่มี | แก้ `pnpm-lock.yaml` importers `apps/merchant` |
| Render TS build fail `users.service.ts` | เมธอด address แปะ **นอก class** | ย้ายเข้าใน `UsersService` ก่อน `}` ปิด class |
| ปุ่ม Shop「ซื้อเลย」กดไม่ได้ | ไม่มี `onClick` | `BuyNowButton` → add cart + `/checkout` |
| โปรไฟล์「+ เพิ่มที่อยู่」ไม่ขึ้นฟอร์ม | ปุ่มตาย + ไม่มี API | form + `/users/addresses` |

### Schema / SQL
- Source of truth: `backend/prisma/schema.prisma` (Order shipping + VelRepeat models)  
- `backend/prisma/vel-table.sql` ควรมี shipping ใน CREATE + patch idempotent (ถ้ายังค้างของเก่า ให้ sync)  
- Neon ยืนยัน `shipping_name/phone/address_line/province/postal_code/country` (+ `shipping_fee`)

---

## สถานะปัจจุบัน (สำหรับเปิดธุรกิจ MVP)

### พร้อมใช้ (หลัง deploy ล่าสุดเขียว + smoke)
- สมัครลูกค้า / login  
- สมัครร้าน → Center อนุมัติ → ลงสินค้า  
- ดูสินค้า / ตะกร้า / เพิ่มตะกร้า / ซื้อเลย  
- Checkout + กรอกที่อยู่ + สร้างออเดอร์  
- โปรไฟล์บันทึกที่อยู่  
- Merchant / Center ดูออเดอร์ (list ไม่พึ่ง shipping select)  
- VelRepeat มีแล้ว แต่ **ไม่บังคับวันเปิด**

### ยังไม่ต้องมีก็เปิด soft launch ได้
- Payment gateway จริง (ใช้โอน/COD + แอดมินเปลี่ยนสถานะชั่วคราวได้)  
- ดึงที่อยู่โปรไฟล์มา prefill checkout อัตโนมัติ  
- แสดงที่อยู่บนหน้า orders ทุกฝั่ง  
- Support chat / SLA  
- UI polish

### ต้องยืนยัน ops ก่อนเปิดจริง
1. Render build เขียว (หลัง fix `users.service.ts` ใน class)  
2. Env backend: `NODE_ENV=production`, `COOKIE_SAMESITE=none`, `CORS_ORIGINS` ครบ shop/merchant/center, `DATABASE_URL` ชี้ Neon โปรดักชัน  
3. Smoke 1 รอบ: ร้านลงสินค้า → ลูกค้าซื้อจบ → Merchant/Center เห็นออเดอร์  
4. โปรไฟล์เพิ่มที่อยู่ได้ · ซื้อเลยไป checkout ได้  

---

## API ที่เกี่ยวกับงานล่าสุด

| Method | Path | หมายเหตุ |
|--------|------|----------|
| POST | `/api/orders/checkout` | ต้องมี `shippingAddress` |
| GET/POST/DELETE | `/api/users/addresses` | สมุดที่อยู่โปรไฟล์ |
| GET | `/api/orders`, `/api/orders/merchant` | list ใช้ select เบา |
| GET | `/api/analytics/merchant/dashboard` | select order เบา |
| GET | `/api/analytics/recent-orders` | select เบา |
| POST | `/api/velrepeat/packs` | ซื้อแพ็ก |
| GET | `/api/velrepeat/admin/packs`, `/merchant/packs` | monitor |
| WS | `/ws` | `order:created` / `order:updated` |

---

## งานถัดไป (เรียงลำดับ — โหมดเปิดเร็ว)

### ทันที (บล็อกการเปิด)
1. [ ] ยืนยัน Render deploy เขียว + smoke ซื้อ–ขาย 1 รอบ  
2. [ ] ยืนยัน Shop: เพิ่มตะกร้า / ซื้อเลย / checkout / โปรไฟล์ที่อยู่  
3. [ ] ใส่ nav VelRepeat ใน Merchant ถ้ายังไม่มี  
4. [ ] (ถ้ายัง) โหมดรับเงินชั่วคราว: โอน + admin ตั้ง `paymentStatus=PAID`

### หลัง soft open (ไม่บล็อกเปิด)
5. [ ] Prefill checkout จากที่อยู่โปรไฟล์  
6. [ ] แสดงที่อยู่จัดส่งบนหน้า orders (Shop / Merchant / Center)  
7. [ ] Payment gateway จริง  
8. [ ] Phase 5 Support Chat + SLA  

---

## Deploy notes

- **Backend (Render):** `pnpm install && pnpm build` (ใน backend: `prisma generate && tsc`) · หลังแก้ schema ต้อง deploy  
- **Lockfile:** เพิ่ม dependency ใน app แล้วต้อง `pnpm install` ให้ **importer** ใน `pnpm-lock.yaml` ตรงด้วย  
- **Frontends (Vercel):** `NEXT_PUBLIC_API_URL` = backend URL  
- **Cron:** `https://<backend>.onrender.com/api/categories` ทุก 10 นาที  
- **Cookie:** production cross-site → `SameSite=None; Secure`

---

## กฎสั้นสำหรับ AI ตัวถัดไป

1. อ่าน HANDOFF ทั้งไฟล์ก่อน  
2. โฟกัส **MVP ซื้อ–ขายได้** ตามเป้าหมายเจ้าของ — อย่าขยาย scope โดยไม่จำเป็น  
3. ก่อนแก้ DB เทียบ `schema.prisma` กับ Neon จริง  
4. อย่าสร้างตาราง pack ชื่อ `velrepeat_history_new`  
5. เพิ่มเมธอดใน service ต้องอยู่ **ใน class**  
6. เพิ่ม dependency ต้องอัปเดต **pnpm-lock.yaml importers**  
7. จบงานแล้วอัปเดต HANDOFF · อย่าใส่ secrets  
