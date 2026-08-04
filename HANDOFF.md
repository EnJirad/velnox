# Velnox — AI Handoff Document

> อัปเดตล่าสุด: 2026-08-04 ~11:35 +07  
> Repo: https://github.com/EnJirad/velnox.git  
> Commit อ้างอิง: `871c30f` + local Phase 4B Auth/Orders/Checkout (ยังไม่ push — GitHub write 403)

---

## กำลังทำ / สถานะปัจจุบัน

| รายการ | สถานะ |
|--------|--------|
| VelCenter admin ครบ | ✅ |
| Product SKU Backend | ✅ schema + auto-gen + search + migration |
| Product SKU Merchant UI | ✅ form sellerSku + list SKU |
| Product SKU Center UI | ✅ คอลัมน์ SKU + ค้นหา |
| **VelShop Catalog ต่อ API** | ✅ โค้ดแล้ว (`catalog.ts` path แก้แล้วบน main) |
| **VelShop Auth** | ✅ login/register/restore ต่อ API อยู่แล้ว |
| **VelShop Orders** | ✅ ดึง `GET /orders/me` (ไฟล์ local รอ commit) |
| **VelShop Checkout** | ✅ sync cart → `POST /orders/checkout` (ไฟล์ local รอ commit) |
| Cart ยัง client-side (zustand) | 🔄 sync ตอน checkout เท่านั้น |
| Support Chat + SLA | 📋 ยังไม่ลงมือ |
| Deploy ยืนยันหลัง 4B | ⏳ |

---

## สรุปแพลตฟอร์ม

| App | สถานะ |
|-----|--------|
| VelCenter | ✅ + แสดง/ค้นหา SKU |
| VelMerchant | ✅ + SKU form/list |
| VelShop | 🔄 Catalog API ✅ · Auth ✅ · Orders/Checkout ต่อ API (รอ push) · Cart client-side |
| Backend | ✅ + SKU + cart + checkout จาก server cart |

---

## Phase ที่เสร็จแล้ว

- Phase 1–3.5 ✅  
- **Phase 4A Product SKU** ✅ (DB + backend + Merchant + Center)  
- **Phase 4B Catalog** ✅  
  - `apps/shop/lib/catalog.ts` → GET categories / products / by slug  
  - Home, products list, product detail เลิก mock  
  - Inline SVG icons (ไม่มี emoji) เหมือน Center  
  - Cart / VelRepeat ใช้ `imageUrl` แทน emoji  

---

## งานถัดไป (เรียงลำดับ)

### ทันที
- [ ] **Commit/push** ไฟล์ Phase 4B ด้านล่าง (GitHub integration ตอนนี้ write ไม่ได้)
- [ ] ตั้ง `NEXT_PUBLIC_API_URL` บน Vercel Shop → backend จริง
- [ ] Redeploy Shop + smoke test: หน้าแรก, /products, รายละเอียด, login, checkout, /orders
- [ ] ยืนยัน CORS อนุญาต origin ของ Shop

### ไฟล์ที่แก้/เพิ่มในรอบนี้ (local)
- `apps/shop/lib/orders.ts` **(ใหม่)** — `fetchMyOrders`, `checkoutFromClientCart`, status labels
- `apps/shop/app/orders/orders-view.tsx` — เลิก mock → API
- `apps/shop/app/checkout/checkout-view.tsx` — require auth, sync cart, POST checkout, แก้ emoji→imageUrl

### Phase 4B ต่อ (optional)
- [ ] (optional) sync cart กับ backend ตลอด session ไม่ใช่แค่ตอน checkout
- [ ] ส่งที่อยู่จัดส่ง / payment method ไป backend (ตอนนี้ UI เก็บ local อย่างเดียว — order ยังไม่เก็บ address)
- [ ] แสดงรายละเอียด order (items) บนหน้า orders

### Phase 5 — Support Chat + SLA
- [ ] Schema Conversation / Message
- [ ] API + UI + WebSocket + SLA 72h

---

## ออกแบบย่อ — SKU (implemented)

- `sku`: unique, auto `VLX-P-` + base36 + rand  
- `sellerSku`: optional จากร้าน  
- แสดง: Merchant, Center, Shop detail/list  

## ออกแบบย่อ — Shop icons

- ใช้ inline SVG ใน `apps/shop/components/icons.tsx`  
- ไม่ใช้อีโมจิใน UI หลัก (สไตล์เดียวกับ VelCenter)

## ออกแบบย่อ — Checkout flow (ใหม่)

1. ลูกค้าต้อง login (redirect `/login?redirect=/checkout` ถ้ายังไม่ login)
2. กดยืนยัน → `DELETE /cart` แล้ว `POST /cart/items` ทีละรายการจาก local cart
3. `POST /orders/checkout` → backend สร้าง order จาก server cart + ลด stock + เคลียร์ cart
4. เคลียร์ local cart + แสดง orderNumber

---

## Deploy notes

- Backend Render: `pnpm install && pnpm build` / `pnpm start:prod`  
- Shop Vercel: **ต้องมี** `NEXT_PUBLIC_API_URL`  
- `CORS_ORIGINS` รวม Shop domain  
- หลัง migration ต้องมีคอลัมน์ `sku` / `seller_sku` บน products  

---

## ลำดับที่แนะนำ

1. Push ไฟล์ orders/checkout → commit  
2. Deploy Shop + ตั้ง env + ทดสอบ catalog + auth + checkout  
3. (optional) address/payment บน order  
4. Chat + SLA
