# Velnox — AI Handoff Document

> อัปเดตล่าสุด: 2026-08-04 \~05:30 +07  
> Repo: https://github.com/EnJirad/velnox.git  
> Commit อ้างอิง: `fe57938` (Part 3 Admin Shops)

---

## สรุปภาพรวมแพลตฟอร์ม

| App | บทบาท | สถานะ |
|-----|--------|--------|
| **VelCenter** (`apps/center`) | Admin แพลตฟอร์ม | ✅ พร้อมใช้ (งานหลักครบ) |
| **VelMerchant** (`apps/merchant`) | แดชบอร์ดร้านค้า | ✅ มีแล้ว |
| **VelShop** (`apps/shop`) | หน้าร้านลูกค้า | 🔄 UI มี — ยัง mock data เป็นหลัก |
| **Backend** (`backend`) | NestJS + Prisma | ✅ foundation + admin APIs |

---

## Phase 1 — Platform Settings ✅

```sql
ALTER TABLE "platform_settings"
  ADD COLUMN IF NOT EXISTS "auto_approve_products" BOOLEAN NOT NULL DEFAULT false;