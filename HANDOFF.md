# Velnox — AI Handoff Document

> อัปเดตล่าสุด: 2026-08-04 \~16:52 +07  
> Repo: https://github.com/EnJirad/velnox.git  
> Commit อ้างอิง: main (Phase 4B Catalog + Auth + Orders + Checkout อยู่บน main แล้ว)

---

## กำลังทำ / สถานะปัจจุบัน

| รายการ | สถานะ |
|--------|--------|
| VelCenter admin ครบ | ✅ |
| Product SKU Backend | ✅ schema + auto-gen + search + migration |
| Product SKU Merchant UI | ✅ form sellerSku + list SKU |
| Product SKU Center UI | ✅ คอลัมน์ SKU + ค้นหา |
| **VelShop Catalog ต่อ API** | ✅ (`catalog.ts` + Home / products / detail เลิก mock) |
| **VelShop Auth** | ✅ login / register / restore ต่อ API |
| **VelShop Orders** | ✅ `GET /orders/me` + แสดงรายการสินค้า (items) แล้ว |
| **VelShop Checkout** | ✅ sync client cart → `POST /orders/checkout` แล้ว |
| Cart ยัง client-side (zustand) | 🔄 sync ตอน checkout เท่านั้น |
| ที่อยู่จัดส่ง | 🔄 UI เก็บ local — ยังไม่ส่งไป backend (Order model ยังไม่มี field) |
| Support Chat + SLA | 📋 ยังไม่ลงมือ |
| Deploy ยืนยันหลัง 4B | ⏳ |

---

## สรุปแพลตฟอร์ม

| App | สถานะ |
|-----|--------|
| VelCenter | ✅ + แสดง/ค้นหา SKU |
| VelMerchant | ✅ + SKU form/list |
| VelShop | ✅ Catalog API · Auth · Orders · Checkout · Cart client-side |
| Backend | ✅ + SKU + cart + checkout จาก server cart |

---

## Phase ที่เสร็จแล้ว

- Phase 1–3.5 ✅  
- **Phase 4A Product SKU** ✅ (DB + backend + Merchant + Center)  
- **Phase 4B Catalog + Auth + Orders + Checkout** ✅ (อยู่บน main)  
  - `apps/shop/lib/catalog.ts` → GET categories / products / by slug  
  - `apps/shop/lib/orders.ts` → `fetchMyOrders`, `checkoutFromClientCart`, status labels  
  - `apps/shop/app/orders/orders-view.tsx` → ดึง API + แสดง items  
  - `apps/shop/app/checkout/checkout-view.tsx` → require auth, sync cart, POST checkout  
  - Home, products list, product detail เลิก mock  
  - Inline SVG icons (ไม่มี emoji) เหมือน Center  
  - Cart / VelRepeat ใช้ `imageUrl` แทน emoji  

---

## งานถัดไป (เรียงลำดับ)

### ทันที
- [ ] ตั้ง `NEXT_PUBLIC_API_URL` บน Vercel Shop → backend จริง
- [ ] Redeploy Shop + smoke test: หน้าแรก, /products, รายละเอียด, login, checkout, /orders
- [ ] ยืนยัน CORS อนุญาต origin ของ Shop

### Phase 4B ต่อ (optional)
- [ ] ส่งที่อยู่จัดส่งไป backend (เพิ่ม field ใน Order / CheckoutDto + service)
- [ ] (optional) sync cart กับ backend ตลอด session ไม่ใช่แค่ตอน checkout
- [ ] แสดงที่อยู่จัดส่งบนหน้า orders (หลัง backend รองรับ)

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

## ออกแบบย่อ — Checkout flow (ปัจจุบัน)

1. ลูกค้าต้อง login (redirect `/login?redirect=/checkout` ถ้ายังไม่ login)
2. กดยืนยัน → `DELETE /cart` แล้ว `POST /cart/items` ทีละรายการจาก local cart
3. `POST /orders/checkout` → backend สร้าง order จาก server cart + ลด stock + เคลียร์ cart
4. เคลียร์ local cart + แสดง orderNumber  

หมายเหตุ: ที่อยู่จัดส่งยังเก็บแค่ใน UI (ยังไม่ส่งไป backend)

---

## Deploy notes

- Backend Render: `pnpm install && pnpm build` / `pnpm start:prod`  
- Shop Vercel: **ต้องมี** `NEXT_PUBLIC_API_URL`  
- `CORS_ORIGINS` รวม Shop domain  
- หลัง migration ต้องมีคอลัมน์ `sku` / `seller_sku` บน products  

---

## ลำดับที่แนะนำ

1. Deploy Shop + ตั้ง env + ทดสอบ catalog + auth + checkout + orders  
2. (optional) เพิ่ม shipping address ลง Order  
3. Chat + SLA