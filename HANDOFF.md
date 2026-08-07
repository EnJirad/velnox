# Velnox — AI Handoff Document

> อัปเดตล่าสุด: 2026-08-07 ~09:50 +07  
> Repo: https://github.com/EnJirad/velnox.git  
> Backend: https://velnox-api.onrender.com  
> เป้าหมาย: MVP ซื้อ–ขายได้เร็ว  
> Ops: cron-job.org `GET /api/categories` ทุก **10 นาที**

---

## ไฟล์นี้คืออะไร

สถานะโปรเจกต์ · ทำแล้ว/ค้าง · ขั้นถัดไป · **ห้ามใส่ secrets**

---

## แอป

| App | Path | Host |
|-----|------|------|
| VelShop | `apps/shop` | Vercel |
| VelMerchant | `apps/merchant` | Vercel |
| VelCenter | `apps/center` | Vercel |
| Backend | `backend/` | Render → Neon |

Auth: access ใน memory + refresh HttpOnly · production `SameSite=None; Secure`

---

## สถานะฟีเจอร์

| รายการ | สถานะ |
|--------|--------|
| Catalog / Cart / Checkout + ที่อยู่ | ✅ |
| `orders.shipping_*` บน Neon | ✅ (ต้องตรง DB production) |
| PromptPay dynamic QR (`promptpay-qr@0.5.x` + `qrcode`) | ✅ |
| แสดง QR หลัง checkout + ในคำสั่งซื้อ | ✅ |
| Countdown ชำระ **24 ชม.** | ✅ (commit ที่มี expiresAt) |
| ดาวน์โหลด QR + อัปโหลดสลิป (`folder=slips`) | ✅ |
| Center ดูสลิป / อนุมัติ / ปฏิเสธ → ลูกค้าอัปโหลดใหม่ | ⏳ แพตช์ `center-slip-review` (merge ถ้ายังไม่เข้า main) |
| Merchant เลขพัสดุ / CSV / payout 7 วัน | ⏳ ยังไม่ทำ |
| VelRepeat | ✅ (ไม่บังคับเปิดวันแรก) |

---

## Payment flow

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

### Schema ที่เกี่ยวข้อง

- `PlatformSettings.promptPayId`, bank fields  
- `Payment.slipUrl`, `slipUploadedAt`  
- `Order.shipping_*`  

---

## ปัญหา CI / Deploy ที่เจอบ่อย

| อาการ | สาเหตุ | แก้ |
|--------|--------|-----|
| `ERR_SOCKET_TIMEOUT` ไปที่ `http://35.245.43.102/npm/...` | **pnpm-lock.yaml มี tarball ชี้ mirror ภายใน** | ใช้ lockfile ที่ **ไม่มี** `35.245.43.102` (เหลือแค่ integrity) แล้ว commit |
| Vercel build commit `6fbb69a` แล้ว timeout | commit เก่ายังมี mirror URL | **Deploy จาก main ล่าสุด** ที่แก้ lock แล้ว ไม่ใช่ 6fbb69a |
| `ERR_PNPM_OUTDATED_LOCKFILE` | package.json ไม่ตรง lock | `pnpm install` แล้ว commit lock |
| `promptpay-qr@^2.4.4` ไม่มีบน npm | เวอร์ชันผิด | ใช้ **`^0.5.0`** |
| Invalid upload folder | backend ไม่มี `slips` หรือ deploy เก่า | ALLOWED_FOLDERS รวม `slips` + redeploy |
| สั่งซื้อ 500 shipping_name | Neon ไม่มีคอลัมน์ | ALTER orders shipping_* |

**กฎ lockfile:** ห้าม commit lock ที่สร้างจาก registry ภายใน / proxy ที่ URL ไม่ public

---

## งานถัดไป

1. [ ] ให้ **Vercel/Render ใช้ commit ล่าสุด** (ไม่ค้าง 6fbb69a) + lockfile สะอาด  
2. [ ] Merge Center สลิป review ถ้ายังไม่เข้า main · ทดสอบอนุมัติ/ปฏิเสธ  
3. [ ] Merchant กรอกเลขพัสดุ + ชื่อผู้รับ  
4. [ ] Shop แสดงเลขพัสดุ  
5. [ ] CSV / payout 7 วัน  

---

## Deploy notes

- Monorepo: แก้ dependency ใดๆ → อัปเดต **pnpm-lock.yaml ทั้งไฟล์** แล้ว push  
- Backend Render: `pnpm install && pnpm build`  
- Cron keep-alive 10 นาที  
- ตั้ง `prompt_pay_id` บน Neon  

---

## กฎ AI ตัวถัดไป

1. อ่าน HANDOFF ทั้งไฟล์  
2. โฟกัส MVP  
3. อย่าสร้าง lockfile จาก mirror ที่ไม่ใช่ registry.npmjs.org  
4. `promptpay-qr` = 0.5.x  
5. เทียบ schema กับ Neon ก่อน create/select  
6. อัปเดต HANDOFF หลังงานสำคัญ · ไม่ใส่ secrets  
