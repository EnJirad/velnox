# Velnox — AI Handoff Document

> อัปเดตล่าสุด: 2026-08-04 \~06:45 +07  
> Repo: https://github.com/EnJirad/velnox.git  
> Commit อ้างอิง: `2a18497` (center socket.io-client ^4.8.3)

---

## กำลังทำ / สถานะปัจจุบัน

| รายการ | สถานะ |
|--------|--------|
| VelCenter admin ครบ (users, merchants, shops, products, orders detail, reports, WS) | ✅ โค้ดครบ |
| Backend WS deps + order number fix | ✅ |
| Center `socket.io-client` + lockfile align | ✅ `2a18497` |
| Deploy Render/Vercel ผ่านจริง | ⏳ ยืนยันหลัง build ล่าสุด |
| **VelShop ต่อ API (เลิก mock)** | 🔜 งานหลักถัดไป |
| **Product SKU** | 📋 วางแผนแล้ว — ยังไม่ลงมือ |
| **Support Chat + SLA 3 วัน** | 📋 วางแผนแล้ว — ยังไม่ลงมือ |

---

## สรุปแพลตฟอร์ม

| App | สถานะ |
|-----|--------|
| VelCenter | ✅ พร้อม (ยืนยัน deploy) |
| VelMerchant | ✅ มีแล้ว |
| VelShop | 🔄 UI + mock → ต้องต่อ API |
| Backend | ✅ foundation + admin + WS |

---

## Phase ที่เสร็จแล้ว

- Phase 1 Platform Settings ✅  
- Phase 2 Admin Users ✅  
- Phase 3 Admin Shops ✅  
- Phase 3.5 Orders detail + WebSocket + Reports ✅  

---

## งานถัดไป (เรียงลำดับ)

### ตอนนี้ — ปิด deploy
- [ ] ยืนยัน Render build ผ่านที่ `2a18497+`
- [ ] ยืนยัน Vercel Center build ผ่าน
- [ ] Smoke test: orders live WS, shops, reports

### Phase 4A — Product SKU (สั้น ทำก่อนหรือคู่ VelShop)
- [ ] Prisma: `Product.sku` unique, `sellerSku` optional
- [ ] Auto-generate `VLX-P-XXXX` ตอนสร้างสินค้า
- [ ] Backfill สินค้าเก่า
- [ ] แสดง SKU ใน Center / Merchant / Shop / ออเดอร์
- [ ] ค้นหาด้วย SKU

### Phase 4B — VelShop ต่อ API (งานหลัก)
- [ ] Catalog: `GET /products`, `GET /products/:slug`, categories
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

## ออกแบบย่อ — SKU

- `sku`: unique, auto `VLX-P-` + base36  
- `sellerSku`: optional จากร้าน  
- ใช้ในซัพพอร์ตแทน UUID  

## ออกแบบย่อ — Chat

- ประเภท: CUSTOMER_SHOP | CUSTOMER_SUPPORT | SHOP_SUPPORT  
- SLA: ฝั่งที่ต้องตอบมีเวลา 3 วัน หลังข้อความล่าสุดของอีกฝั่ง  
- Sort: เลย SLA → เหลือเวลาน้อย → ล่าสุด  
- Realtime ผ่าน EventsGateway เดิม  

---

## Deploy notes

- Backend Render: `pnpm install && pnpm build` / `pnpm start:prod`  
- monorepo: ต้อง sync `pnpm-lock.yaml` กับทุก `package.json`  
- `CORS_ORIGINS` รวม Center + Shop + Merchant  
- Center ต้องมี `socket.io-client`  

---

## ลำดับที่แนะนำให้ทีมทำจริง

1. ยืนยัน deploy ผ่าน  
2. Product SKU (migration + แสดงผล)  
3. VelShop catalog → auth → cart/checkout  
4. Chat foundation → SLA UI → realtime