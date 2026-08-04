# Velnox — AI Handoff Document

> อัปเดตล่าสุด: 2026-08-04 \~10:45 +07  
> Repo: https://github.com/EnJirad/velnox.git  
> Commit อ้างอิง: ล่าสุดบน main (Phase 4A Product SKU ครบ Backend + Merchant + Center)

---

## กำลังทำ / สถานะปัจจุบัน

| รายการ | สถานะ |
|--------|--------|
| VelCenter admin ครบ (users, merchants, shops, products, orders detail, reports, WS) | ✅ โค้ดครบ |
| Backend WS deps + order number fix | ✅ |
| Center `socket.io-client` + lockfile align | ✅ |
| Deploy Render/Vercel ผ่านจริง | ⏳ ยืนยันหลัง build ล่าสุด |
| **Product SKU — Backend** | ✅ schema + migration + auto-gen + search |
| **Product SKU — Merchant UI** | ✅ form (sellerSku) + list โชว์ SKU |
| **Product SKU — Center UI** | ✅ list + ค้นหาด้วย SKU |
| **Product SKU — Shop แสดง** | 📋 optional / คู่ Phase 4B |
| **VelShop ต่อ API (เลิก mock)** | 🔜 งานหลักถัดไป |
| **Support Chat + SLA 3 วัน** | 📋 วางแผนแล้ว — ยังไม่ลงมือ |

---

## สรุปแพลตฟอร์ม

| App | สถานะ |
|-----|--------|
| VelCenter | ✅ พร้อม + แสดง/ค้นหา SKU |
| VelMerchant | ✅ พร้อม + form/list SKU |
| VelShop | 🔄 UI + mock → ต้องต่อ API |
| Backend | ✅ foundation + admin + WS + SKU |

---

## Phase ที่เสร็จแล้ว

- Phase 1 Platform Settings ✅  
- Phase 2 Admin Users ✅  
- Phase 3 Admin Shops ✅  
- Phase 3.5 Orders detail + WebSocket + Reports ✅  
- **Phase 4A Product SKU ✅**  
  - Prisma: `sku` unique, `sellerSku` optional + index  
  - SQL migration + backfill สินค้าเก่า  
  - Auto-generate `VLX-P-` + base36(+rand) ตอนสร้าง  
  - Search: name / sku / sellerSku  
  - DTO + shared types  
  - Merchant: form (sellerSku, โชว์ platform SKU ตอน edit) + list  
  - Center: คอลัมน์ SKU + ค้นหาชื่อ/SKU/ร้าน  

---

## งานถัดไป (เรียงลำดับ)

### ตอนนี้ — ปิด deploy + smoke test SKU
- [ ] ยืนยัน Render backend build ผ่าน (หลัง SKU commits)
- [ ] ยืนยัน Vercel Center / Merchant build ผ่าน
- [ ] ทดสอบสร้างสินค้า → ได้ `sku` ใน DB
- [ ] ทดสอบใส่ `sellerSku` จาก Merchant แล้วเห็นใน list / Center
- [ ] ค้นหา SKU ใน Center เจอสินค้า

### Phase 4B — VelShop ต่อ API (งานหลัก)
- [ ] Catalog: `GET /products`, `GET /products/:slug`, categories
- [ ] แสดง SKU บนหน้า product detail (ถ้าต้องการ)
- [ ] Auth ลูกค้า
- [ ] Cart → Checkout → Orders/me
- [ ] เลิกพึ่ง `mock-data`

### Phase 5 — Support Chat + SLA
- [ ] Schema: Conversation, Message (+ type/status/slaDeadlineAt)
- [ ] API CRUD แชทตาม role
- [ ] UI inbox ใน Shop / Merchant / Center
- [ ] SLA 72 ชม. + เรียงเลยกำหนด / ใกล้หมดเวลา
- [ ] แถบ “ใกล้หมดเวลา” (≤24h / ≤6h / เลยกำหนด)
- [ ] WebSocket `chat:message`, `chat:conversation_updated`
- [ ] ผูก productId / orderId / แสดง SKU ในเคส

---

## ออกแบบย่อ — SKU (implemented)

- `sku`: unique, auto `VLX-P-` + base36 + 2 random chars — ห้ามแก้จาก client  
- `sellerSku`: optional จากร้าน (Merchant form)  
- ค้นหา backend: name OR sku OR sellerSku  
- แสดง: Merchant list/form, Center products  
- ใช้ในซัพพอร์ต/ออเดอร์แทน UUID (Phase 5)  

## ออกแบบย่อ — Chat

- ประเภท: CUSTOMER_SHOP | CUSTOMER_SUPPORT | SHOP_SUPPORT  
- SLA: ฝั่งที่ต้องตอบมีเวลา 3 วัน หลังข้อความล่าสุดของอีกฝั่ง  
- Sort: เลย SLA → เหลือเวลาน้อย → ล่าสุด  
- Realtime ผ่าน EventsGateway เดิม  

---

## Deploy notes

- Backend Render: `pnpm install && pnpm build` / `pnpm start:prod`  
- DB ต้องมีคอลัมน์ `products.sku` (NOT NULL UNIQUE) และ `products.seller_sku`  
- monorepo: ต้อง sync `pnpm-lock.yaml` กับทุก `package.json`  
- `CORS_ORIGINS` รวม Center + Shop + Merchant  
- Center ต้องมี `socket.io-client`  
- Shop: ตั้ง `NEXT_PUBLIC_API_URL` ชี้ backend  

---

## ลำดับที่แนะนำให้ทีมทำจริง

1. Redeploy backend + Center + Merchant → smoke test SKU  
2. **Phase 4B** VelShop catalog → auth → cart/checkout → เลิก mock  
3. (optional) โชว์ SKU บน Shop product detail  
4. Phase 5 Chat foundation → SLA UI → realtime