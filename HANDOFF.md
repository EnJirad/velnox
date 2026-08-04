# Velnox — AI Handoff Document

> อัปเดตล่าสุด: 2026-08-04 \~09:45 +07  
> Repo: https://github.com/EnJirad/velnox.git  
> Commit อ้างอิง: `0b1a19a` (Phase 4A Product SKU — backend complete)

---

## กำลังทำ / สถานะปัจจุบัน

| รายการ | สถานะ |
|--------|--------|
| VelCenter admin ครบ (users, merchants, shops, products, orders detail, reports, WS) | ✅ โค้ดครบ |
| Backend WS deps + order number fix | ✅ |
| Center `socket.io-client` + lockfile align | ✅ |
| Deploy Render/Vercel ผ่านจริง | ⏳ ยืนยันหลัง build ล่าสุด |
| **Product SKU — Backend** | ✅ schema + migration + auto-gen + search |
| **Product SKU — UI แสดงผล** | 🔜 Merchant form/list, Center, Shop |
| **VelShop ต่อ API (เลิก mock)** | 🔜 งานหลักถัดไป |
| **Support Chat + SLA 3 วัน** | 📋 วางแผนแล้ว — ยังไม่ลงมือ |

---

## สรุปแพลตฟอร์ม

| App | สถานะ |
|-----|--------|
| VelCenter | ✅ พร้อม (ยืนยัน deploy) |
| VelMerchant | ✅ มีแล้ว — รอโชว์ SKU ใน form/list |
| VelShop | 🔄 UI + mock → ต้องต่อ API |
| Backend | ✅ foundation + admin + WS + **SKU** |

---

## Phase ที่เสร็จแล้ว

- Phase 1 Platform Settings ✅  
- Phase 2 Admin Users ✅  
- Phase 3 Admin Shops ✅  
- Phase 3.5 Orders detail + WebSocket + Reports ✅  
- **Phase 4A Product SKU (Backend)** ✅  
  - Prisma: `sku` unique, `sellerSku` optional  
  - Auto-generate `VLX-P-` + base36(+rand) ตอนสร้าง  
  - Backfill สินค้าเก่า (SQL Editor)  
  - Search: name / sku / sellerSku  
  - DTO + types อัปเดตแล้ว  

---

## งานถัดไป (เรียงลำดับ)

### ตอนนี้ — ปิด Phase 4A UI + smoke test
- [ ] Restart/redeploy backend หลัง `0b1a19a`
- [ ] ทดสอบสร้างสินค้า → ตรวจ `sku` ใน DB
- [ ] Merchant form: ช่อง `sellerSku` + โชว์ `sku` (read-only ตอน edit)
- [ ] Merchant products list แสดง SKU
- [ ] Center products: แสดง SKU + ค้นหาด้วย SKU
- [ ] (optional) Shop product detail แสดง SKU

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

## ออกแบบย่อ — SKU (implemented backend)

- `sku`: unique, auto `VLX-P-` + base36 + 2 random chars  
- `sellerSku`: optional จากร้าน (ร้านใส่ผ่าน API ได้แล้ว — รอ UI)  
- ค้นหา: name OR sku OR sellerSku  
- ห้ามแก้ `sku` จาก client ตอน update  

## ออกแบบย่อ — Chat

- ประเภท: CUSTOMER_SHOP | CUSTOMER_SUPPORT | SHOP_SUPPORT  
- SLA: ฝั่งที่ต้องตอบมีเวลา 3 วัน หลังข้อความล่าสุดของอีกฝั่ง  
- Sort: เลย SLA → เหลือเวลาน้อย → ล่าสุด  
- Realtime ผ่าน EventsGateway เดิม  

---

## Deploy notes

- Backend Render: `pnpm install && pnpm build` / `pnpm start:prod`  
- หลัง deploy ต้องมีคอลัมน์ `sku` / `seller_sku` บน products (รัน SQL แล้ว)  
- monorepo: ต้อง sync `pnpm-lock.yaml` กับทุก `package.json`  
- `CORS_ORIGINS` รวม Center + Shop + Merchant  
- Center ต้องมี `socket.io-client`  
- Shop: ตั้ง `NEXT_PUBLIC_API_URL` ชี้ backend  

---

## ลำดับที่แนะนำให้ทีมทำจริง

1. Redeploy backend + ทดสอบสร้างสินค้า (ตรวจ SKU ใน DB)  
2. Merchant form/list โชว์ SKU + ช่อง sellerSku  
3. Center แสดง/ค้นหา SKU  
4. VelShop catalog → auth → cart/checkout  
5. Chat foundation → SLA UI → realtime