# Velnox — AI Handoff Document

> อัปเดตล่าสุด: 2026-08-03  
> Repo: https://github.com/EnJirad/velnox.git  
> ฟีเจอร์ที่กำลังทำ: **Platform Settings (VelCenter Admin)**

---

## 1. บริบทโปรเจกต์

Velnox เป็น monorepo (pnpm + turbo) ประกอบด้วย:

| ส่วน | เทคโนโลยี | หน้าที่ |
|------|-----------|---------|
| `backend/` | NestJS + Prisma + PostgreSQL (Neon) | API |
| `apps/center` | Next.js | แผงแอดมิน (VelCenter) |
| `apps/merchant` | Next.js | แดชบอร์ดร้านค้า |
| `apps/shop` | Next.js | หน้าร้านลูกค้า |
| `packages/*` | shared types, ui, i18n, utils, config | ใช้ร่วมกัน |

Backend deploy บน **Render** (Root Directory = `backend`)  
Database = **Neon (PostgreSQL)**

---

## 2. สิ่งที่ทำไปแล้ว (Backend — ครบแล้ว)

### 2.1 Prisma
- Model `PlatformSettings` อยู่ใน `backend/prisma/schema.prisma`
- Migration: `backend/prisma/migrations/20260803090000_platform_settings/`
- ฟิลด์:
  - `id` (default `"default"`)
  - `platformName` (default `"Velnox Commerce Platform"`)
  - `commissionPercent` (default `5`)
  - `autoApproveMerchants` (default `false`)
  - `requireProductReview` (default `true`)
  - `paymentCreditCard` / `paymentPromptPay` / `paymentBankTransfer` / `paymentCod` (default `true`)
  - `createdAt` / `updatedAt`

### 2.2 NestJS Module
โฟลเดอร์: `backend/src/platform-settings/`

| ไฟล์ | สถานะ |
|------|--------|
| `platform-settings.module.ts` | ✅ |
| `platform-settings.controller.ts` | ✅ |
| `platform-settings.service.ts` | ✅ |
| `dto/update-platform-settings.dto.ts` | ✅ |

- Import ใน `backend/src/app.module.ts` แล้ว (`PlatformSettingsModule`)
- API:
  - `GET  /api/platform-settings` — Roles: `ADMIN`, `SUPER_ADMIN`
  - `PATCH /api/platform-settings` — Roles: `ADMIN`, `SUPER_ADMIN`
- Service ใช้ `upsert` ด้วย `id = 'default'` → ถ้ายังไม่มีแถวจะสร้างให้อัตโนมัติ

### 2.3 Deploy (Render + Neon)
- **Build Command (แนะนำ):** `pnpm install && pnpm build`
- **Start Command (สำคัญ — ต้องรัน migrate ก่อน start):**
  ```bash
  pnpm db:migrate && pnpm start:prod
  ```
  - `db:migrate` = `prisma migrate deploy` (production-safe)
  - จะ apply migration ใหม่บน Neon อัตโนมัติทุกครั้งที่ deploy
- ต้องมี env `DATABASE_URL` ชี้ไป Neon (แนะนำมี `?sslmode=require`)

---

## 3. สิ่งที่ยังไม่ทำ (Frontend — ต้องทำต่อ)

### 3.1 `apps/center/lib/api-types.ts`
**สถานะ:** ยังไม่มี type ของ Platform Settings  
**ต้องเพิ่ม:**

```ts
export interface PlatformSettings {
  id: string;
  platformName: string;
  commissionPercent: number;
  autoApproveMerchants: boolean;
  requireProductReview: boolean;
  paymentCreditCard: boolean;
  paymentPromptPay: boolean;
  paymentBankTransfer: boolean;
  paymentCod: boolean;
  createdAt: string;
  updatedAt: string;
}

export type UpdatePlatformSettingsPayload = Partial<
  Omit<PlatformSettings, 'id' | 'createdAt' | 'updatedAt'>
>;
```

### 3.2 `apps/center/app/admin/settings/page.tsx`
**สถานะ:** ยังเป็น mock/hardcode (input ใช้ `defaultValue`, ไม่เรียก API)  
**ต้องทำ:** แทนที่ทั้งไฟล์ด้วยเวอร์ชันที่:
1. `useEffect` → `apiClient.get<PlatformSettings>('/platform-settings')`
2. เก็บ state ใน form
3. ปุ่มบันทึก → `apiClient.patch<PlatformSettings>('/platform-settings', form)`
4. แสดง loading / error / success
5. Tab: `general` | `payments` | `roles` (roles ยังเป็น read-only ได้)

รูปแบบการเรียก API ให้ดูตัวอย่างจาก:
- `apps/center/app/admin/merchants/merchants-view.tsx`
- `apps/center/app/admin/users/page.tsx`

`apiClient` อยู่ที่ `apps/center/lib/api-client.ts`  
- base path ถูกต่อเป็น `${API_URL}/api${path}` อยู่แล้ว  
- response ถูก unwrap จาก envelope `{ data, timestamp }` แล้ว

### 3.3 (ยังไม่จำเป็นตอนนี้) Business logic ที่ยังไม่ผูก settings
หลังหน้า settings ใช้ API ได้แล้ว ค่อยทำทีหลัง:
- `autoApproveMerchants` → ตอนสมัคร/สร้าง merchant
- `requireProductReview` → ตอนสร้าง/อัปเดตสินค้า (status DRAFT vs ACTIVE)
- payment flags → ตอน checkout / แสดงช่องทางชำระเงิน

---

## 4. ลำดับงานที่ AI ตัวถัดไปควรทำ

1. **ตรวจ Backend บน Render**
   - Start Command เป็น `pnpm db:migrate && pnpm start:prod` หรือยัง
   - `DATABASE_URL` ชี้ Neon ถูกต้องหรือยัง
   - Deploy แล้ว migration `platform_settings` ถูก apply หรือยัง
   - ทดสอบ `GET /api/platform-settings` ด้วย token ของ ADMIN

2. **แก้ Frontend types**
   - เพิ่ม `PlatformSettings` + `UpdatePlatformSettingsPayload` ใน `apps/center/lib/api-types.ts`

3. **แก้หน้า Settings**
   - เขียนใหม่ `apps/center/app/admin/settings/page.tsx` ให้เชื่อม API จริง

4. **ทดสอบ E2E**
   - Login ADMIN ใน VelCenter → `/admin/settings`
   - โหลดค่าจาก backend
   - แก้ค่า → บันทึก → รีเฟรชแล้วยังอยู่

5. **(ภายหลัง)** ผูก settings เข้า business logic จริง

---

## 5. ข้อจำกัดที่เจอระหว่างทำงาน

- GitHub connector **ไม่มีสิทธิ์เขียน** (403 ตอน `create_or_update_file`)  
  → AI ก่อนหน้าจึงส่งโค้ดให้ user copy เอง แทนการ push ขึ้น repo
- ถ้า AI ตัวถัดไปจะแก้ไฟล์ใน repo โดยตรง ต้องมี write permission หรือให้ user commit เอง

---

## 6. ไฟล์สำคัญ (quick reference)

```
backend/src/app.module.ts                          # import PlatformSettingsModule แล้ว
backend/src/platform-settings/*                    # module ครบ
backend/prisma/schema.prisma                       # model PlatformSettings
backend/prisma/migrations/20260803090000_platform_settings/
backend/package.json                               # scripts: db:migrate, start:prod, build

apps/center/lib/api-types.ts                       # ← ต้องเพิ่ม type
apps/center/lib/api-client.ts                      # apiClient พร้อมใช้
apps/center/app/admin/settings/page.tsx            # ← ต้องเชื่อม API
apps/center/app/admin/merchants/merchants-view.tsx # ตัวอย่าง pattern เรียก API
apps/center/components/layout/admin-layout.tsx     # มีลิงก์ /admin/settings แล้ว
```

---

## 7. โค้ดที่เตรียมไว้แล้ว (copy ได้ทันที)

### api-types.ts (เพิ่มท้ายไฟล์)

```ts
export interface PlatformSettings {
  id: string;
  platformName: string;
  commissionPercent: number;
  autoApproveMerchants: boolean;
  requireProductReview: boolean;
  paymentCreditCard: boolean;
  paymentPromptPay: boolean;
  paymentBankTransfer: boolean;
  paymentCod: boolean;
  createdAt: string;
  updatedAt: string;
}

export type UpdatePlatformSettingsPayload = Partial<
  Omit<PlatformSettings, 'id' | 'createdAt' | 'updatedAt'>
>;
```

### settings/page.tsx (แทนทั้งไฟล์)

ใช้ pattern เดียวกับ merchants/users:
- `useState` สำหรับ settings, form, loading, saving, error, success
- `useEffect` โหลด `/platform-settings`
- `handleSave` → `PATCH /platform-settings`
- Tab general = ชื่อแพลตฟอร์ม, commission, autoApprove, requireProductReview
- Tab payments = 4 ช่องทางชำระเงิน
- Tab roles = แสดง SUPER_ADMIN / ADMIN แบบอ่านอย่างเดียว

(รายละเอียดโค้ดเต็มมีในประวัติแชทก่อนหน้า — AI ตัวถัดไปสามารถสร้างใหม่ตาม spec ด้านบนได้)

---

## 8. สรุปสั้น ๆ สำหรับ AI ตัวถัดไป

**Backend Platform Settings เสร็จแล้ว**  
**Frontend ยังเป็น mock**  

งานถัดไปทันที:
1. เพิ่ม type ใน `apps/center/lib/api-types.ts`
2. เชื่อม `apps/center/app/admin/settings/page.tsx` กับ `GET/PATCH /api/platform-settings`
3. ยืนยันว่า Render รัน `pnpm db:migrate && pnpm start:prod` และ Neon มีตาราง `platform_settings`

อย่าเริ่มทำ business-logic binding (auto-approve / product review / payment flags) จนกว่าหน้า settings จะโหลด/บันทึกจาก API ได้จริง
