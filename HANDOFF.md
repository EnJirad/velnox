# Velnox — AI Handoff Document

> อัปเดตล่าสุด: 2026-08-03 (หลัง commit `03b17a0`)  
> Repo: https://github.com/EnJirad/velnox.git  
> Commit ที่ตรวจ: `03b17a053b26a4e7c0855e4b499be64f275d2ebd` (`update2`)  
> ฟีเจอร์: **Platform Settings (VelCenter Admin)**

---

## สรุปสถานะ (สั้นมาก)

| ชั้น | สถานะ |
|------|--------|
| Backend module + API | ✅ ครบ |
| Prisma model + migration | ✅ ครบใน repo |
| Frontend types (`api-types.ts`) | ✅ ครบใน commit นี้ |
| Frontend settings page (เชื่อม API) | ✅ ครบใน commit นี้ |
| Render auto-migrate บน Neon | ⚠️ ต้องยืนยัน runtime |
| ทดสอบ E2E ในเบราว์เซอร์ | ⚠️ ยังไม่ยืนยัน |
| ผูก settings เข้า business logic | ❌ ยังไม่ทำ (ทำทีหลัง) |

**โค้ดฟีเจอร์ Platform Settings (CRUD หน้า admin) ถือว่าเสร็จแล้ว**  
งานที่เหลือส่วนใหญ่คือ verify บน production/staging และ (ภายหลัง) เอาค่า settings ไปใช้จริงใน flow อื่น

---

## 1. บริบทโปรเจกต์

Monorepo (pnpm + turbo):

| ส่วน | เทคโนโลยี | หน้าที่ |
|------|-----------|---------|
| `backend/` | NestJS + Prisma + PostgreSQL (Neon) | API |
| `apps/center` | Next.js | แผงแอดมิน (VelCenter) |
| `apps/merchant` | Next.js | แดชบอร์ดร้านค้า |
| `apps/shop` | Next.js | หน้าร้านลูกค้า |
| `packages/*` | shared | types, ui, i18n, utils, config |

- Backend deploy: **Render** (Root Directory = `backend`)
- Database: **Neon (PostgreSQL)**

---

## 2. สิ่งที่ทำเสร็จแล้ว

### 2.1 Backend
- `backend/src/platform-settings/` ครบ (module, controller, service, dto)
- Import ใน `backend/src/app.module.ts` แล้ว
- API:
  - `GET  /api/platform-settings` — Roles: `ADMIN`, `SUPER_ADMIN`
  - `PATCH /api/platform-settings` — Roles: `ADMIN`, `SUPER_ADMIN`
- Service ใช้ `upsert` ด้วย `id = 'default'`

### 2.2 Prisma
- Model `PlatformSettings` ใน `schema.prisma`
- Migration: `backend/prisma/migrations/20260803090000_platform_settings/`
- ฟิลด์: `platformName`, `commissionPercent`, `autoApproveMerchants`, `requireProductReview`, payment flags ×4, timestamps

### 2.3 Frontend (commit `03b17a0`)
- `apps/center/lib/api-types.ts`
  - มี `PlatformSettings`
  - มี `UpdatePlatformSettingsPayload`
- `apps/center/app/admin/settings/page.tsx`
  - โหลดด้วย `apiClient.get('/platform-settings')`
  - บันทึกด้วย `apiClient.patch('/platform-settings', form)`
  - มี loading / error / success
  - Tab: ทั่วไป | การชำระเงิน | สิทธิ์ (roles = อ่านอย่างเดียว)
  - controlled inputs (ไม่ใช่ mock แล้ว)

### 2.4 ไฟล์ช่วย deploy
- `backend/prisma/command.txt` เก็บคำสั่ง:
  ```bash
  pnpm db:migrate && pnpm start:prod
  ```

---

## 3. สิ่งที่ยังต้องทำ / ตรวจ

### 3.1 ยืนยัน Runtime (ทำก่อนอย่างอื่น)
1. Render **Start Command** = `pnpm db:migrate && pnpm start:prod`
2. Env `DATABASE_URL` ชี้ Neon ถูกต้อง (`?sslmode=require`)
3. Deploy แล้ว migration ถูก apply → มีตาราง `platform_settings` บน Neon
4. ทดสอบ API ด้วย token ADMIN:
   - `GET /api/platform-settings` → 200 + ข้อมูล
   - `PATCH /api/platform-settings` → บันทึกได้

### 3.2 ทดสอบ E2E บน VelCenter
1. Login เป็น `ADMIN` หรือ `SUPER_ADMIN`
2. เปิด `/admin/settings`
3. ต้องโหลดค่าจาก backend (ไม่ error)
4. แก้ค่า → กดบันทึก → เห็น success
5. รีเฟรชหน้า → ค่ายังอยู่

### 3.3 (ภายหลัง) Business logic binding
ยังไม่ผูกค่า settings เข้า flow อื่น:
- `autoApproveMerchants` → ตอนสมัคร/สร้าง merchant
- `requireProductReview` → ตอนสร้าง/อัปเดตสินค้า
- payment flags → ตอน checkout / แสดงช่องทางชำระเงิน

**อย่าเริ่มข้อ 3.3 จนกว่า 3.1–3.2 จะผ่าน**

---

## 4. ลำดับงานสำหรับ AI / คนถัดไป

1. ตรวจ Render + Neon (migrate ผ่านหรือยัง)
2. ทดสอบ API ตรง ๆ
3. ทดสอบหน้า `/admin/settings` ในเบราว์เซอร์
4. ถ้าพัง → ไล่ตามอาการ (401 / 500 / ตารางไม่มี / CORS / env)
5. ถ้าผ่าน → ฟีเจอร์นี้ปิดได้ แล้วค่อยวางแผน business-logic binding

---

## 5. ไฟล์สำคัญ

```
backend/src/app.module.ts
backend/src/platform-settings/*
backend/prisma/schema.prisma
backend/prisma/migrations/20260803090000_platform_settings/
backend/prisma/command.txt
backend/package.json                    # db:migrate, start:prod, build

apps/center/lib/api-types.ts            # ✅ มี PlatformSettings แล้ว
apps/center/lib/api-client.ts
apps/center/app/admin/settings/page.tsx # ✅ เชื่อม API แล้ว
apps/center/components/layout/admin-layout.tsx  # ลิงก์ /admin/settings
```

---

## 6. หมายเหตุ

- Commit `03b17a0` ใส่ `HANDOFF.md` เวอร์ชันเก่าที่ยังบอกว่า Frontend เป็น mock — **ไม่ตรงความจริงแล้ว** ใช้เอกสารฉบับนี้แทน
- GitHub connector บางรอบเขียนไฟล์ไม่ได้ (403) ถ้าต้องแก้ repo ให้ user commit เองหรือขอ write permission
- `pnpm db:migrate` = `prisma migrate deploy` (ถูกสำหรับ production)

---

## 7. คำตอบสั้น ๆ: "ทั้งหมดแค่นี้ใช่ไหม?"

**ใช่ — ในส่วนโค้ดของฟีเจอร์ Platform Settings (backend + หน้า admin ตั้งค่า) ถือว่าครบแล้ว**

เหลือแค่:
1. ยืนยันว่า deploy/migrate บน Neon ทำงาน
2. ทดสอบใช้งานจริงครั้งหนึ่ง
3. (งานถัดไปคนละ epic) เอาค่า settings ไปบังคับในระบบจริง
