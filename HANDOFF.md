# Velnox — AI Handoff Document

> อัปเดตล่าสุด: 2026-08-07 ~12:15 +07  
> Repo: https://github.com/EnJirad/velnox.git  
> Commit อ้างอิงโดยประมาณ: `986128e` (+ แพตช์ merchant tracking)  
> Backend: https://velnox-api.onrender.com  
> เป้าหมาย: MVP ซื้อ–ขาย–จัดส่งได้

---

## สถานะฟีเจอร์

| รายการ | สถานะ |
|--------|--------|
| Checkout + ที่อยู่ + PromptPay QR 24 ชม. | ✅ |
| อัปโหลดสลิป / ดาวน์โหลด QR | ✅ |
| Center อนุมัติสลิป → **PAID + PROCESSING** + WS | ✅ (`986128e`) |
| Merchant แจ้งจัดเตรียม + **กรอกเลขพัสดุ → SHIPPED** | ⏳ แพตช์ `merchant-tracking` |
| Shop แสดงเลขพัสดุ | ⏳ ในแพตช์เดียวกัน |
| CSV พัสดุ / payout 7 วัน / API เช็คพัสดุ | ⏳ ยังไม่ทำ |

---

## Flow หลังอนุมัติเงิน

```text
Center อนุมัติสลิป
  → paymentStatus=PAID, status=PROCESSING
  → WS order:updated → Merchant เห็น「กำลังจัดเตรียม」

Merchant กรอกเลขพัสดุ + ยืนยัน
  → trackingNumber, carrier บันทึก
  → status=SHIPPED
  → WS order:updated → Shop + Center
  → ลูกค้าเห็นเลขพัสดุใน「คำสั่งซื้อของฉัน」
```

### API

| Method | Path |
|--------|------|
| PATCH | `/api/orders/merchant/:orderId/ship` `{ trackingNumber, carrier? }` |

### Schema

```
Order.trackingNumber  @map("tracking_number")
Order.carrier
```

Neon: `ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_number TEXT, carrier TEXT;`

---

## Deploy / lockfile

- ห้าม lockfile มี `tarball: http://35.245...`  
- `promptpay-qr` = **^0.5.0**  
- Upload folder **`slips`** ต้องอยู่ใน backend ที่ deploy  

---

## งานถัดไป

1. Merge/deploy **merchant-tracking** + รัน SQL tracking  
2. ทดสอบ: อนุมัติ → ร้านเห็นแบนเนอร์ → กรอกพัสดุ → ลูกค้าเห็นเลข  
3. CSV bulk tracking (ภายหลัง)  
4. Payout ร้าน 7 วัน  

---

## กฎ AI

อ่าน HANDOFF · โฟกัส MVP · sync schema กับ Neon · อัปเดต HANDOFF · ไม่ใส่ secrets
