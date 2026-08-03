# Velnox — AI Handoff Document

> อัปเดตล่าสุด: 2026-08-03 ~23:45 +07  
> Repo: https://github.com/EnJirad/velnox.git  

---

## Phase 1 — Platform Settings (โค้ดส่งครบแล้ว)
ดูตารางไฟล์ phase1 ก่อนหน้า — เหลือ user ยืนยัน SQL/schema/deploy/ทดสอบ

SQL ยังต้องรันถ้ายังไม่รัน:
```sql
ALTER TABLE "platform_settings"
  ADD COLUMN IF NOT EXISTS "auto_approve_products" BOOLEAN NOT NULL DEFAULT false;
```

---

## Phase 2 / Part 2 — Admin Users (กำลังส่ง)

โฟลเดอร์: `part2/`

| ไฟล์ | path ใน repo |
|------|----------------|
| users.service.ts | `backend/src/users/users.service.ts` |
| users.controller.ts | `backend/src/users/users.controller.ts` |
| admin-update-user.dto.ts | `backend/src/users/dto/admin-update-user.dto.ts` **(ไฟล์ใหม่)** |
| users/page.tsx | `apps/center/app/admin/users/page.tsx` |
| users/[id]/page.tsx | `apps/center/app/admin/users/[id]/page.tsx` **(ไฟล์ใหม่)** |

### API ใหม่/ขยาย
- `GET /users` — รวม `phone`
- `GET /users/:id` — detail + addresses + orders + merchant
- `PATCH /users/:id` — แก้ชื่อ/เบอร์/อีเมล/role/status (admin)
- `DELETE /users/:id` — ลบผู้ใช้ (ห้าม SUPER_ADMIN)
- `PATCH /users/:id/status` — แบน/ปลดแบน (ห้าม SUPER_ADMIN)

### UI
- ค้นหา ชื่อ / อีเมล / เบอร์
- คลิกชื่อ → หน้ารายละเอียด
- แก้ข้อมูล, แบน, ลบ, ดูประวัติออเดอร์

### ลำดับส่งไฟล์ให้ user
1. ~~backend users.service + controller + dto~~ ✅  
2. **frontend users/page + users/[id]/page** ← ส่งรอบนี้  
3. commit deploy ทดสอบ  

---

## ยังไม่ทำ (Part 3+)
- Shops: กราฟ, ระงับชั่วคราว X วัน, ลบร้าน
- Dashboard ละเอียด
- WebSocket real-time

---

## Deploy notes
- Start: `pnpm start:prod`
- Part 2 ไม่ต้อง migration ใหม่ (ใช้ตาราง users/orders ที่มีอยู่)
