# Velnox — AI Handoff Document

> อัปเดตล่าสุด: 2026-08-04 \~05:15 +07  
> Repo: https://github.com/EnJirad/velnox.git  
> Commit อ้างอิง: `fa1198f` (fix orders page types)

---

## สรุปภาพรวมแพลตฟอร์ม

| App | บทบาท | สถานะ |
|-----|--------|--------|
| **VelCenter** (`apps/center`) | Admin แพลตฟอร์ม | ใช้งานได้ส่วนใหญ่ — เหลือ Shops admin actions + stats |
| **VelMerchant** (`apps/merchant`) | แดชบอร์ดร้านค้า | มีแล้ว (merchant-facing) |
| **VelShop** (`apps/shop`) | หน้าร้านลูกค้า | ยังไม่เริ่มเฟสถัดไปจาก Center |
| **Backend** (`backend`) | NestJS + Prisma | API หลักครบ foundation |

---

## Phase 1 — Platform Settings ✅

- โค้ดครบแล้ว (settings UI + API + `autoApproveProducts`)
- SQL (ถ้ายังไม่รันบน DB จริง):

```sql
ALTER TABLE "platform_settings"
  ADD COLUMN IF NOT EXISTS "auto_approve_products" BOOLEAN NOT NULL DEFAULT false;