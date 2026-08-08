# Velnox — AI Handoff Document

> อัปเดตล่าสุด: 2026-08-08 ~07:10 +07  
> Commit อ้างอิง: `05498f5`  
> Repo: https://github.com/EnJirad/velnox.git  
> Backend: https://velnox-api.onrender.com  
> เป้าหมาย: MVP ซื้อ–ขายได้เร็ว  
> Ops: cron-job.org `GET /api/categories` ทุก **10 นาที**

---

## ไฟล์นี้คืออะไร

สถานะโปรเจกต์ · ทำแล้ว/ค้าง · ขั้นถัดไป · **ห้ามใส่ secrets**  
AI ตัวถัดไป: อ่านทั้งไฟล์ก่อนลงมือ · โฟกัส MVP · อัปเดต HANDOFF หลังงานสำคัญ

---

## แอป

| App | Path | Host |
|-----|------|------|
| VelShop | `apps/shop` | Vercel |
| VelMerchant | `apps/merchant` | Vercel |
| VelCenter | `apps/center` | Vercel |
| Backend | `backend/` | Render → Neon |

Auth: access ใน memory + refresh HttpOnly · production `SameSite=None; Secure`

Monorepo: pnpm workspaces + Turbo · `packageManager: pnpm@10.17.1`

---

## สถานะธุรกิจ MVP

| รายการ | สถานะ | หมายเหตุ |
|--------|--------|----------|
| Catalog / Cart / Checkout + ที่อยู่ | ✅ | |
| PromptPay dynamic QR + countdown 24 ชม. | ✅ | `promptpay-qr@0.5.x` + `qrcode` |
| อัปโหลดสลิป (`folder=slips`) + ดาวน์โหลด QR | ✅ | |
| Center ดูสลิป / อนุมัติ / ปฏิเสธ → NEEDS_RESLIP | ✅ | `apps/center/app/admin/orders/[id]/page.tsx` |
| Merchant กรอกเลขพัสดุ + carrier | ✅ | `POST /orders/merchant/:id/ship` · มี CSV template |
| Shop แสดงเลขพัสดุ + timeline สถานะ | ✅ | ยัง cast `trackingNumber` เพราะ type ยังไม่ครบ |
| Notification bell (client-side snapshot) | ✅ | เทียบ status/payment/tracking กับ localStorage |
| Shop UX มือถือ (bottom nav, Teal–Mint, filter) | ✅ โค้ดแล้ว | **ต้อง QA มือถือหลัง deploy เขียว** |
| Merchant หน้าคลัง (inventory) | ✅ มีแล้ว | แสดง stock · ลิงก์ไป edit เท่านั้น **ยังไม่มี quick inline stock** |
| Merchant รวมหน้าสินค้า+คลัง | ⏳ | ยังแยก `/dashboard/products` กับ `/dashboard/inventory` |
| Merchant payout 7 วัน / CSV payout | ⏳ | ยังไม่มีโค้ด |
| Center soft-delete สินค้า 30 วัน | ⏳ | ตอนนี้ archive = `status: ARCHIVED` ทันที ไม่มี `deletedAt` / restore window |
| Center type-confirm (พิมพ์ CONFIRM/DELETE) | ⏳ | กฎมีแล้ว ยังไม่ครบทุก destructive action |
| Center รายได้บริษัท | ✅ พื้นฐาน | dashboard + analytics + reports มี revenue chart |
| VelRepeat | ✅ | ไม่บังคับวันแรก |

---

## Payment flow (อ้างอิง)

```text
Checkout promptpay → Order PENDING
  → GET /api/payments/orders/:id/promptpay-qr  (expiresAt = createdAt+24h)
  → สแกนโอน → POST .../slip { slipUrl }
  → Center อนุมัติ → PAID  /  ปฏิเสธ → NEEDS_RESLIP → ลูกค้าอัปโหลดใหม่
```

### API หลัก

| Method | Path |
|--------|------|
| GET | `/api/payments/orders/:orderId/promptpay-qr` |
| POST | `/api/payments/orders/:orderId/slip` |
| POST | `/api/uploads/image?folder=slips` |
| GET | `/api/payments/admin/pending-slips` |
| PATCH | `/api/payments/admin/orders/:id/approve` |
| PATCH | `/api/payments/admin/orders/:id/reject-slip` |
| POST | `/api/orders/merchant/:orderId/ship` | body: `{ trackingNumber, carrier? }` |

### Schema ที่เกี่ยวข้อง (Neon / Prisma)

- `PlatformSettings.promptPayId`, bank fields  
- `Payment.slipUrl`, `slipUploadedAt`  
- `Order.shipping_*`, `trackingNumber`, `carrier`  
- **ไม่มี** `Order.updatedAt` ใน Prisma/Order type — ใช้ `createdAt` เท่านั้น  
- Product status: `DRAFT | ACTIVE | INACTIVE | ARCHIVED` (archive ≠ soft-delete 30 วัน)

---

## Build fixes ล่าสุด (2026-08-08 เช้า)

Commit ช่วง `0d96b4a` → `05498f5` แก้ TypeScript ที่ทำให้ Vercel Shop build fail:

| Commit | ไฟล์ | ปัญหา | แก้ |
|--------|------|--------|-----|
| `d07023e` | `apps/shop/app/orders/orders-view.tsx` | `cur` / `stepIdx` declared but never read | ลบ leftover ใช้แค่ `map` + `curN`/`stepN` |
| `193c00b` | `apps/shop/app/products/products-view.tsx` | `<ProductImage product={p} />` | เปลี่ยนเป็น `src={p.imageUrl} alt={p.name} width={400}` (API จริงของ component) |
| `05498f5` | `apps/shop/components/layout/notification-bell.tsx` | `o.updatedAt` ไม่มีบน type `Order` | ใช้ `o.createdAt` |

**สถานะ deploy:** โค้ด type-error ที่รู้จักแก้ครบแล้วใน `05498f5`  
**ยังไม่เห็น log Vercel สีเขียวใน handoff นี้** → ก่อนเริ่ม feature ใหม่ ยืนยันว่า Shop deploy ล่าสุด **Ready** บน Vercel

### Warning ที่ไม่บล็อก build (แต่ควรรู้)

- Tailwind: `content` มี `../../packages/ui/**/*.{ts,tsx}` → เตือนว่า pattern อาจ match ลึกเกินไป (performance)  
- pnpm: Ignored build scripts (`@prisma/client`, `@nestjs/core`, …) บน Vercel shop install — backend postinstall เป็น `echo skip` ตั้งใจ

---

## Type debt ที่ควรแก้เมื่อแตะไฟล์ใกล้เคียง

`packages/types/order.ts` **ยังไม่มี**:

```ts
trackingNumber?: string | null;
carrier?: string | null;
```

ทั้งที่ Prisma มีแล้ว และ API select ส่งแล้ว → Shop ใช้ `(order as { trackingNumber?: string })` หลายที่  
**แนะนำ:** เพิ่มฟิลด์ใน `Order` interface แล้วลบ cast (ไม่ต้อง migrate DB)

---

## งานถัดไป (ลำดับแนะนำ)

### 0) ยืนยัน deploy เขียว (ทำก่อนทุกอย่าง)
- [ ] Vercel VelShop deploy จาก `05498f5` (หรือใหม่กว่า) สถานะ Ready  
- [ ] Smoke: เปิด `/products`, `/orders`, bottom nav มือถือ, กระดิ่งแจ้งเตือน  
- [ ] ถ้า fail อีก — ส่ง build log ทั้งก้อน อย่าเดา

### 1) Shop QA มือถือ (สั้น)
- [ ] `MobileBottomNav`: หน้าหลัก · สินค้า · ติดตามออเดอร์ · ตะกร้า · โปรไฟล์  
- [ ] Filter sheet มือถือ + ธีม Teal–Mint  
- [ ] แสดงเลขพัสดุหลัง Merchant ship

### 2) Merchant: คลัง + สต็อกเร็ว (MVP สูง)
สถานะปัจจุบัน:
- `/dashboard/inventory` = รายการ + low/out badge + ลิงก์ไป `/dashboard/products/[id]/edit`
- `/dashboard/products` แยกต่างหาก
- **ยังไม่มี** inline แก้ stock จากหน้าคลัง

งานที่ควรทำ:
- [ ] Quick stock edit บน inventory (input + save → API อัปเดต stock)  
- [ ] (ทางเลือก) รวม/ลิงก์ products + inventory ให้ merchant ทำงานจุดเดียว  
- [ ] อย่าสร้าง payout จนกว่า stock/order flow นิ่ง

### 3) Center: type-confirm + soft-delete
- [ ] Destructive actions (ลบ shop/user/product ฯลฯ) ต้องพิมพ์ `CONFIRM` หรือ `DELETE` ก่อน submit  
- [ ] Soft-delete สินค้า 30 วัน: ต้องออกแบบ `deletedAt` (หรือเทียบเท่า) + ซ่อนจาก catalog + restore/purge — **sync schema กับ Neon ก่อน** อย่าเดาคอลัมน์  
- [ ] ตอนนี้ `ARCHIVED` = เก็บถาวรทันที อย่าสับสนกับ soft-delete

### 4) Payout ร้าน 7 วัน + รายงาน
- [ ] ยังไม่มีโค้ด payout/settlement ใน repo  
- [ ] Center รายได้บริษัทมี chart พื้นฐานแล้ว (`/analytics/revenue-chart`, reports)  
- [ ] ออกแบบ: order PAID + หลังจัดส่ง/ครบ 7 วัน → ยอดร้าน − ค่าธรรมเนียม (ถ้ามี)

### 5) วิเคราะห์/รายงานเชิงลึก
- ทำหลัง MVP ซื้อ–ขาย–จัดส่ง–จ่าย นิ่ง

---

## ปัญหา CI / Deploy ที่เจอบ่อย (เก็บไว้)

| อาการ | สาเหตุ | แก้ |
|--------|--------|-----|
| `ERR_SOCKET_TIMEOUT` → `35.245.43.102` | pnpm-lock มี tarball mirror ภายใน | lockfile เหลือแค่ integrity สาธารณะ แล้ว commit |
| Vercel timeout บน commit เก่า | deploy commit ที่มี mirror URL | deploy จาก `main` ล่าสุดเท่านั้น |
| `ERR_PNPM_OUTDATED_LOCKFILE` | package.json ≠ lock | `pnpm install` แล้ว commit lock ทั้งไฟล์ |
| `promptpay-qr@^2.x` ไม่มีบน npm | เวอร์ชันผิด | ใช้ **`^0.5.0`** |
| Invalid upload folder | backend ไม่มี `slips` | `ALLOWED_FOLDERS` รวม `slips` + redeploy |
| สั่งซื้อ 500 `shipping_name` | Neon ไม่มีคอลัมน์ | ALTER `orders` shipping_* |
| TS: unused var / wrong props / missing field | type เข้มใน `next build` | อย่าทิ้งตัวแปร · เทียบ props กับ component · เทียบ type กับ Prisma |

**กฎ lockfile:** ห้าม commit lock ที่สร้างจาก registry ภายใน / proxy ที่ URL ไม่ public

---

## Deploy notes

- Monorepo: แก้ dependency ใดๆ → อัปเดต **pnpm-lock.yaml ทั้งไฟล์** แล้ว push  
- Backend Render: `pnpm install && pnpm build`  
- Cron keep-alive 10 นาที ที่ `GET /api/categories`  
- ตั้ง `prompt_pay_id` บน Neon / PlatformSettings  
- Shop / Merchant / Center แยก project บน Vercel — ตรวจว่า root/app filter ชี้ถูก app

---

## กฎ AI ตัวถัดไป

1. อ่าน HANDOFF ทั้งไฟล์ก่อนลงมือ  
2. โฟกัส MVP — อย่าขยาย scope (analytics ลึก / payout) ก่อน deploy เขียว + stock/ship นิ่ง  
3. อย่าสร้าง lockfile จาก mirror ที่ไม่ใช่ registry.npmjs.org  
4. `promptpay-qr` = **0.5.x** เท่านั้น  
5. เทียบ schema กับ Neon / `backend/prisma/schema.prisma` ก่อน create/select ฟิลด์ใหม่  
6. Destructive action ใน Center ต้องพิมพ์ CONFIRM หรือ DELETE  
7. ไม่ใช้ emoji ในเมนู admin — ใช้ icon SVG  
8. อัปเดต HANDOFF หลังงานสำคัญ · **ห้ามใส่ secrets**  
9. ถ้า Vercel fail: อ่าน error บรรทัด Type error ก่อน แก้ทีละจุด อย่า refactor ใหญ่  
10. `Order` ไม่มี `updatedAt` — อย่าใส่กลับโดยไม่ migrate

---

## โครงสร้างที่ AI ควรรู้จักเร็ว

```
apps/shop/          → ลูกค้า (Next 14)
  app/orders/orders-view.tsx
  app/products/products-view.tsx
  components/product-image.tsx      # props: src, alt, width?, priority?
  components/layout/mobile-bottom-nav.tsx
  components/layout/notification-bell.tsx
  components/promptpay-qr-panel.tsx
apps/merchant/      → ร้าน
  app/dashboard/orders/orders-view.tsx   # ship + CSV template
  app/dashboard/inventory/page.tsx       # view-only stock → edit link
  app/dashboard/products/
apps/center/        → แอดมิน
  app/admin/orders/[id]/page.tsx        # approve / reject slip
  app/admin/products|shops|users|reports
backend/
  prisma/schema.prisma
  src/orders/   src/payments/   src/uploads/
packages/types/order.ts   # ต้อง sync กับ Prisma เมื่อแตะ Order
```
