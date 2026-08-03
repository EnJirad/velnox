# Velnox — AI Handoff Document

> อัปเดตล่าสุด: 2026-08-04 \~06:05 +07  
> Repo: https://github.com/EnJirad/velnox.git  
> Commit อ้างอิง: `ba1b530` (backend WS deps + fix order number)

---

## สรุปภาพรวมแพลตฟอร์ม

| App | บทบาท | สถานะ |
|-----|--------|--------|
| **VelCenter** (`apps/center`) | Admin แพลตฟอร์ม | ✅ โค้ดครบ — เหลือ `socket.io-client` ใน package.json |
| **VelMerchant** (`apps/merchant`) | แดชบอร์ดร้านค้า | ✅ มีแล้ว |
| **VelShop** (`apps/shop`) | หน้าร้านลูกค้า | 🔄 UI มี — ยังใช้ mock data เป็นหลัก |
| **Backend** (`backend`) | NestJS + Prisma | ✅ พร้อม (WS + admin APIs) |

---

## Phase 1 — Platform Settings ✅

```sql
ALTER TABLE "platform_settings"
  ADD COLUMN IF NOT EXISTS "auto_approve_products" BOOLEAN NOT NULL DEFAULT false;