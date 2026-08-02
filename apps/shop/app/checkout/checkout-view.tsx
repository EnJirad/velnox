'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatCurrency, generateOrderNumber } from '@velnox/utils';
import { useCartStore } from '@/stores/cart-store';

const STEPS = ['ที่อยู่จัดส่ง', 'วิธีการชำระเงิน', 'ยืนยันคำสั่งซื้อ'];

export function CheckoutView() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const clear = useCartStore((s) => s.clear);
  const [step, setStep] = useState(0);
  const [payment, setPayment] = useState<'card' | 'promptpay' | 'cod'>('promptpay');
  const [address, setAddress] = useState({ name: '', phone: '', line: '', city: '', postal: '' });
  const [placed, setPlaced] = useState<string | null>(null);

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const shipping = subtotal >= 990 || subtotal === 0 ? 0 : 40;
  const total = subtotal + shipping;

  if (items.length === 0 && !placed) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <p className="text-slate-600">ไม่มีสินค้าในตะกร้า กรุณาเลือกสินค้าก่อนทำการชำระเงิน</p>
      </div>
    );
  }

  if (placed) {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center gap-3 px-4 py-24 text-center">
        <span className="text-6xl">🎉</span>
        <h1 className="text-xl font-semibold text-slate-900">สั่งซื้อสำเร็จแล้ว!</h1>
        <p className="text-sm text-slate-500">
          เลขที่คำสั่งซื้อของคุณคือ <span className="font-semibold text-teal-700">{placed}</span>
        </p>
        <button
          onClick={() => router.push('/orders')}
          className="mt-3 rounded-md bg-teal-700 px-6 py-2.5 text-sm font-semibold text-white hover:bg-teal-800"
        >
          ดูคำสั่งซื้อของฉัน
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 text-xl font-semibold text-slate-900">ชำระเงิน</h1>

      <div className="mb-8 flex items-center gap-1.5 overflow-x-auto text-sm sm:gap-2">
        {STEPS.map((s, i) => (
          <div key={s} className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            <div
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                i <= step ? 'bg-teal-700 text-white' : 'bg-slate-200 text-slate-500'
              }`}
            >
              {i + 1}
            </div>
            <span className={`hidden whitespace-nowrap sm:inline ${i <= step ? 'font-medium text-slate-900' : 'text-slate-400'}`}>{s}</span>
            {i < STEPS.length - 1 && <div className="mx-1 h-px w-5 shrink-0 bg-slate-300 sm:mx-2 sm:w-8" />}
          </div>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          {step === 0 && (
            <div className="flex flex-col gap-4">
              <h2 className="text-sm font-semibold text-slate-900">ที่อยู่สำหรับจัดส่ง</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <input
                  placeholder="ชื่อ-นามสกุล"
                  value={address.name}
                  onChange={(e) => setAddress({ ...address, name: e.target.value })}
                  className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-600"
                />
                <input
                  placeholder="เบอร์โทรศัพท์"
                  value={address.phone}
                  onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                  className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-600"
                />
              </div>
              <input
                placeholder="ที่อยู่ (บ้านเลขที่ ถนน แขวง/ตำบล)"
                value={address.line}
                onChange={(e) => setAddress({ ...address, line: e.target.value })}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-600"
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <input
                  placeholder="จังหวัด"
                  value={address.city}
                  onChange={(e) => setAddress({ ...address, city: e.target.value })}
                  className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-600"
                />
                <input
                  placeholder="รหัสไปรษณีย์"
                  value={address.postal}
                  onChange={(e) => setAddress({ ...address, postal: e.target.value })}
                  className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-600"
                />
              </div>
              <button
                onClick={() => setStep(1)}
                className="mt-2 w-fit rounded-md bg-teal-700 px-6 py-2.5 text-sm font-semibold text-white hover:bg-teal-800"
              >
                ถัดไป
              </button>
            </div>
          )}

          {step === 1 && (
            <div className="flex flex-col gap-3">
              <h2 className="mb-1 text-sm font-semibold text-slate-900">เลือกวิธีการชำระเงิน</h2>
              {[
                { key: 'promptpay', label: 'พร้อมเพย์ / QR Code', icon: '📱' },
                { key: 'card', label: 'บัตรเครดิต / เดบิต', icon: '💳' },
                { key: 'cod', label: 'เก็บเงินปลายทาง', icon: '💵' },
              ].map((m) => (
                <label
                  key={m.key}
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-sm ${
                    payment === m.key ? 'border-teal-600 bg-teal-50' : 'border-slate-200'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={payment === m.key}
                    onChange={() => setPayment(m.key as typeof payment)}
                  />
                  <span>{m.icon}</span>
                  <span className="font-medium text-slate-800">{m.label}</span>
                </label>
              ))}
              <div className="mt-2 flex gap-3">
                <button
                  onClick={() => setStep(0)}
                  className="rounded-md border border-slate-300 px-6 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  ย้อนกลับ
                </button>
                <button
                  onClick={() => setStep(2)}
                  className="rounded-md bg-teal-700 px-6 py-2.5 text-sm font-semibold text-white hover:bg-teal-800"
                >
                  ถัดไป
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-col gap-4">
              <h2 className="text-sm font-semibold text-slate-900">ตรวจสอบคำสั่งซื้อ</h2>
              <div className="rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
                <p className="font-medium text-slate-800">{address.name || 'ผู้รับสินค้า'}</p>
                <p>{address.phone}</p>
                <p>{[address.line, address.city, address.postal].filter(Boolean).join(' ')}</p>
              </div>
              <ul className="flex flex-col gap-2 text-sm text-slate-600">
                {items.map((i) => (
                  <li key={i.productId} className="flex justify-between">
                    <span>{i.emoji} {i.name} × {i.quantity}</span>
                    <span>{formatCurrency(i.price * i.quantity)}</span>
                  </li>
                ))}
              </ul>
              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="rounded-md border border-slate-300 px-6 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  ย้อนกลับ
                </button>
                <button
                  onClick={() => {
                    const orderNumber = generateOrderNumber();
                    clear();
                    setPlaced(orderNumber);
                  }}
                  className="rounded-md bg-orange-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-orange-600"
                >
                  ยืนยันการสั่งซื้อ
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="h-fit rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="mb-4 text-sm font-semibold text-slate-900">สรุปยอด</h2>
          <div className="flex flex-col gap-2 text-sm text-slate-600">
            <div className="flex justify-between"><span>ยอดรวมสินค้า</span><span>{formatCurrency(subtotal)}</span></div>
            <div className="flex justify-between"><span>ค่าจัดส่ง</span><span>{shipping === 0 ? 'ฟรี' : formatCurrency(shipping)}</span></div>
          </div>
          <div className="my-3 border-t border-dashed border-slate-200" />
          <div className="flex justify-between text-base font-bold text-slate-900">
            <span>ยอดชำระทั้งหมด</span>
            <span className="text-teal-700">{formatCurrency(total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
