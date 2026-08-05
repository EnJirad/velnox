# Velnox — AI Handoff Document

> อัปเดตล่าสุด: 2026-08-06 ~01:25 +07  
> Repo: https://github.com/EnJirad/velnox.git  
> Commit อ้างอิง: `234b4f7`  
> Neon: ยืนยัน `orders.shipping_*` ครบแล้ว (query information_schema 2026-08-06)  
> Ops: cron-job.org ping `GET /api/categories` ทุก **10 นาที**

---

## ไฟล์นี้คืออะไร — อ่านก่อนทำงานทุกครั้ง

**`HANDOFF.md` = เอกสารส่งต่อระหว่าง AI (และคน) เท่านั้น**

1. บอกสถานะจริงของโปรเจกต์ ณ ตอนอัปเดตล่าสุด  
2. บอกว่าทำอะไรไปแล้ว / ค้างอะไร / ขั้นถัดไปเรียงลำดับ  
3. AI ตัวใหม่ต้องอ่านทั้งไฟล์ก่อนลงมือ  
4. เชื่อโค้ดใน repo + สถานะ DB จริง มากกว่าข้อความเก่า  
5. จบงานสำคัญแล้วอัปเดตไฟล์นี้เสมอ · ห้ามใส่ secrets

---

## บริบทโปรเจกต์ (ภาพรวม)

Velnox เป็นแพลตฟอร์ม e-commerce หลายแอป:

| App | Path | Host | บทบาท |
|-----|------|------|--------|
| **VelShop** | `apps/shop` | Vercel | หน้าร้านลูกค้า |
| **VelMerchant** | `apps/merchant` | Vercel | หลังบ้านร้านค้า |
| **VelCenter** | `apps/center` | Vercel | Admin |
| **Backend** | `backend/` | Render | NestJS + Prisma → Neon Postgres |

Auth: access token ใน memory + refresh token HttpOnly cookie (ข้ามโดเมน Vercel↔Render ต้อง `SameSite=None; Secure` + `NODE_ENV=production`)

---

## สิ่งที่ทำไปแล้วในรอบนี้ (สรุป timeline)

### Features ที่เสร็จในโค้ด (ถึง `234b4f7`)
1. **VelRepeat Prepaid Pack** — schema + API + cron + Shop widget + Merchant ตั้งแผน  
2. **VelRepeat Monitor** — Center `/admin/velrepeat` + Merchant `/dashboard/velrepeat` + API admin/merchant list  
3. **Shipping address บน Order** — snapshot ตอน checkout (ไม่ผูก FK addresses) + Shop UI บังคับกรอก  
4. **Performance** — Cloudinary transform ย่อรูป, ProductImage lazy, client cache 1 นาที, product list ดึงรูปแค่ใบแรก  
5. **DB** — ตาราง pack (`velrepeat_packs/deliveries/history`) + `product_velrepeat_plans` + `shipping_*` บน orders  

### Ops
- ตั้ง cron ปลุก backend ทุก 10 นาที (กัน Render free cold start)  
- แก้ 500 Merchant จาก missing `orders.shipping_name` ด้วยการมีคอลัมน์บน Neon (ยืนยัน 7 คอลัมน์ shipping แล้ว)

### เอกสาร/SQL ที่ต้อง sync ใน repo
- `backend/prisma/schema.prisma` — **ตรงกับ production แล้ว** (มี shipping)  
- `backend/prisma/vel-table.sql` — **ของเก่าค้าง** (orders ไม่มี shipping ใน CREATE + syntax platform_settings พัง) → **แทนที่ด้วยไฟล์ใหม่จาก session นี้**

---

## สถานะปัจจุบัน (ตารางหลัก)

| รายการ | สถานะ |
|--------|--------|
| Phase 1–3.5, 4A SKU, 4B Catalog/Auth/Orders/Checkout | ✅ |
| VelRepeat Prepaid Pack (API + UI plan + Shop ซื้อ) | ✅ |
| VelRepeat Monitor Center + Merchant pages | ✅ |
| Merchant nav ลิงก์ VelRepeat | 📋 ยังไม่มีใน `dashboard-layout.tsx` |
| Shipping snapshot + Checkout ส่งที่อยู่ | ✅ โค้ด + Neon columns |
| แสดงที่อยู่บนหน้า orders (Shop/Center/Merchant) | 📋 ยังไม่ทำ |
| Perf รูป/cache/list เบา | ✅ |
| Cron keep-alive 10 นาที | ✅ |
| VelCenter ต้อง login ใหม่หลัง idle | ⚠️ ตรวจ `NODE_ENV=production` + cookie SameSite=None |
| Payment gateway จริง | 📋 |
| Support Chat + SLA | 📋 |

---

## Schema / SQL ที่สำคัญ

### Order shipping (snapshot)
```
shipping_name, shipping_phone, shipping_address_line,
shipping_province, shipping_postal_code, shipping_country (default TH)
```
Prisma: `backend/prisma/schema.prisma` model `Order`  
Checkout บังคับ `shippingAddress` ใน `CheckoutDto`

### VelRepeat tables
- `velrepeat_packs`, `velrepeat_deliveries`, `velrepeat_history` (ชื่อต้องไม่ใช่ `_new`)  
- `product_velrepeat_plans`, `products.vel_repeat_enabled`

### ไฟล์ SQL อ้างอิง
- **ใช้:** `backend/prisma/vel-table.sql` ฉบับอัปเดต 2026-08-06 (มี shipping ใน CREATE + patch idempotent ท้ายไฟล์)  
- อย่าใช้ชื่อตาราง `velrepeat_history_new`

---

## API ที่เกี่ยวกับงานล่าสุด

| Method | Path | หมายเหตุ |
|--------|------|----------|
| POST | `/api/orders/checkout` | ต้องส่ง `shippingAddress` |
| POST | `/api/velrepeat/packs` | ซื้อแพ็ก |
| GET | `/api/velrepeat/summary` | Admin |
| GET | `/api/velrepeat/admin/packs` | Admin |
| GET | `/api/velrepeat/merchant/summary` | Merchant |
| GET | `/api/velrepeat/merchant/packs` | Merchant |
| GET | `/api/analytics/merchant/dashboard` | Merchant home (เคย 500 เมื่อขาด shipping_*) |

---

## ปัญหาที่เจอแล้ว (อย่าทำซ้ำ)

| อาการ | สาเหตุ | ทางแก้ |
|--------|--------|--------|
| 500 `velrepeat_history does not exist` | ตารางไม่มี / ชื่อ `_new` | CREATE `velrepeat_history` |
| 500 `orders.shipping_name does not exist` | โค้ด deploy ก่อน Neon มีคอลัมน์ | ALTER ADD shipping_* — **ทำแล้ว 2026-08-06** |
| VelCenter “You do not have access” / login ใหม่หลังพัก | access token ใน memory + refresh cookie ข้ามโดเมนล้ม (มัก NODE_ENV ≠ production) | ตั้ง `NODE_ENV=production` บน Render, ตรวจ CORS_ORIGINS |
| โหลดช้าหลังไม่ใช้ | Render free cold start | cron 10 นาที |
| HANDOFF / vel-table ค้าง | เอกสารไม่ตาม schema | อัปเดตให้ตรง repo + Neon |

---

## งานถัดไป (เรียงลำดับสำหรับ AI ตัวถัดไป)

### ทันที / ops ค้าง
1. [ ] **แทนที่** `backend/prisma/vel-table.sql` ด้วยฉบับ 2026-08-06 แล้ว commit  
2. [ ] ใส่ **nav VelRepeat** ใน Merchant `apps/merchant/components/layout/dashboard-layout.tsx`  
3. [ ] ยืนยัน Render env: `NODE_ENV=production`, `CORS_ORIGINS` รวม shop/merchant/center  
4. [ ] Smoke: Merchant dashboard โหลดได้ · Checkout มีที่อยู่ · Center ยัง login หลัง ~20 นาที  

### โค้ดถัดไป (เรียงลำดับ)
5. [ ] **แสดงที่อยู่จัดส่ง** บนหน้า orders (Shop `/orders`, Center order detail, Merchant orders)  
6. [ ] (ถ้า session ยังหลุด) บังคับ cookie refresh `sameSite: 'none', secure: true` เมื่อเป็น HTTPS ไม่พึ่งแค่ NODE_ENV  
7. [ ] Payment gateway จริง (checkout + ซื้อแพ็ก)  
8. [ ] Phase 5 Support Chat + SLA  

---

## Deploy notes

- **Backend (Render):** build มี `prisma generate` · หลังแก้ schema ต้อง deploy ใหม่  
- **Frontends (Vercel):** `NEXT_PUBLIC_API_URL` = backend URL  
- **Neon:** ต้องตรงกับ `DATABASE_URL` บน Render (อย่าคนละ branch)  
- **Cron:** `https://<backend>.onrender.com/api/categories` ทุก 10 นาที  

---

## กฎสั้นสำหรับ AI ตัวถัดไป

1. อ่าน HANDOFF ทั้งไฟล์ก่อน  
2. ก่อนแก้ DB เทียบ `schema.prisma` กับ Neon จริง  
3. อย่าสร้างตาราง pack ชื่อผิด (`velrepeat_history` ไม่ใช่ `_new`)  
4. จบงานแล้วอัปเดต HANDOFF  
5. อย่าใส่ secrets / connection string ในไฟล์นี้  
