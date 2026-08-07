# Velnox — AI Handoff

> อัปเดต: 2026-08-08 ~00:15 +07  
> Commit อ้างอิง: `032af4e` (+ แพตช์ `ux-mega` ชุด Shop)  
> Backend: https://velnox-api.onrender.com

## สถานะธุรกิจ MVP

| รายการ | สถานะ |
|--------|--------|
| สั่งซื้อ / PromptPay / สลิป / Center อนุมัติ | ✅ ใช้งานได้ |
| เลขพัสดุ Merchant → ลูกค้าเห็น | ✅ ตามรายงานผู้ใช้ |
| Shop UX มือถือ (bottom nav, ธีม, ฟิลเตอร์) | ⏳ แพตช์ `ux-mega` |
| Merchant คลังรวม / cover / payout 7 วัน | ⏳ ยังไม่ทำ |
| Center รายได้บริษัท / soft-delete / type-confirm | ⏳ ยังไม่ทำ |

## ทำแล้วในแพตช์นี้
- `MobileBottomNav`: หน้าหลัก · สินค้า · ติดตามออเดอร์ · ตะกร้า · โปรไฟล์
- เลิก hamburger dropdown
- ธีม Teal–Mint
- Products filter ดีขึ้น

## ลำดับงานถัดไป (แนะนำ)
1. Deploy ชุด Shop UX ทดสอบมือถือ
2. Merchant: รวมหน้าสินค้า+คลัง + แก้สต็อกเร็ว
3. Center: type-confirm + soft-delete สินค้า 30 วัน
4. แท็บรายได้บริษัท + payout ร้าน 7 วัน
5. วิเคราะห์/รายงานเชิงลึก

## กฎ
- Destructive action ต้องพิมพ์ CONFIRM หรือ DELETE
- ไม่ใช้ emoji ในเมนู admin ใช้ icon SVG
- Sync schema กับ Neon ก่อนใช้ฟิลด์ใหม่
