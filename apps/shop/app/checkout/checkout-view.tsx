'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { formatCurrency } from '@velnox/utils';
import { useCartStore } from '@/stores/cart-store';
import { useAuthStore } from '@/stores/auth-store';
import { useAuthContext } from '@/components/providers/auth-provider';
import { checkoutFromClientCart } from '@/lib/orders';
import { ApiError } from '@/lib/api-client';
import { IconBox } from '@/components/icons';
import { PromptPayQrPanel } from '@/components/promptpay-qr-panel';

const STEPS = ['ที่อยู่จัดส่ง', 'วิธีการชำระเงิน', 'ยืนยันคำสั่งซื้อ'];

export function CheckoutView() {
  const router = useRouter();
  const { isInitializing } = useAuthContext();
  const user = useAuthStore((s) => s.user);
  const items = useCartStore((s) => s.items);
  const clear = useCartStore((s) => s.clear);
  const [step, setStep] = useState(0);
  const [payment, setPayment] = useState<'card' | 'promptpay' | 'cod'>('promptpay');
  const [address, setAddress] = useState({ name: '', phone: '', line: '', province: '', postal: '' });
  const [placed, setPlaced] = useState<{
    id: string;
    orderNumber: string;
    payment: 'card' | 'promptpay' | 'cod';
  } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const shipping = subtotal >= 990 || subtotal === 0 ? 0 : 40;
  const total = subtotal + shipping;

  if (isInitializing) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center text-sm text-slate-500">
        กำลังโหลด...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center gap-4 px-4 py-24 text-center">
        <p className="text-slate-600">กรุณาเข้าสู่ระบบก่อนชำระเงิน</p>
        <Link
          href="/login?redirect=/checkout"
          className="rounded-md bg-teal-700 px-6 py-2.5 text-sm font-semibold text-white hover:bg-teal-800"
        >
          เข้าสู่ระบบ
        </Link>
      </div>
    );
  }

  if (items.length === 0 && !placed) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <p className="text-slate-600">ไม่มีสินค้าในตะกร้า กรุณาเลือกสินค้าก่อนทำการชำระเงิน</p>
      </div>
    );
  }

  if (placed) {
    if (placed.payment === 'promptpay') {
      return (
        <div className="mx-auto max-w-lg px-4 py-10">
          <div className="mb-6 text-center">
            <h1 className="text-xl font-semibold text-slate-900">สั่งซื้อสำเร็จ — ชำระเงินด้วยพร้อมเพย์</h1>
            <p className="mt-1 text-sm text-slate-500">
              เลขที่คำสั่งซื้อ{' '}
              <span className="font-semibold text-teal-700">#{placed.orderNumber}</span>
            </p>
          </div>
          <PromptPayQrPanel orderId={placed.id} orderNumber={placed.orderNumber} />
          <div className="mt-6 flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={() => router.push('/orders')}
              className="rounded-md bg-teal-700 px-6 py-2.5 text-sm font-semibold text-white hover:bg-teal-800"
            >
              ไปที่คำสั่งซื้อของฉัน
            </button>
            <p className="text-xs text-slate-400">
              ปิดหน้านี้ได้ — กลับมาเปิด QR ได้จากหน้าคำสั่งซื้อ
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="mx-auto flex max-w-xl flex-col items-center gap-3 px-4 py-24 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          <IconBox size={32} />
        </span>
        <h1 className="text-xl font-semibold text-slate-900">สั่งซื้อสำเร็จแล้ว!</h1>
        <p className="text-sm text-slate-500">
          เลขที่คำสั่งซื้อของคุณคือ{' '}
          <span className="font-semibold text-teal-700">#{placed.orderNumber}</span>
        </p>
        {placed.payment === 'cod' && (
          <p className="text-sm text-slate-600">ชำระเงินปลายทางเมื่อได้รับสินค้า</p>
        )}
        <button
          type="button"
          onClick={() => router.push('/orders')}
          className="mt-3 rounded-md bg-teal-700 px-6 py-2.5 text-sm font-semibold text-white hover:bg-teal-800"
        >
          ดูคำสั่งซื้อของฉัน
        </button>
      </div>
    );
  }

  async function handlePlaceOrder() {
    setError(null);
    setSubmitting(true);
    try {
      const order = await checkoutFromClientCart(items, payment, {
        name: address.name,
        phone: address.phone,
        addressLine: address.line,
        province: address.province,
        postalCode: address.postal,
        country: 'TH',
      });
      clear();
      setPlaced({
        id: order.id,
        orderNumber: order.orderNumber,
        payment,
      });
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : 'สั่งซื้อไม่สำเร็จ กรุณาลองใหม่',
      );
    } finally {
      setSubmitting(false);
    }
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
            <span
              className={`hidden whitespace-nowrap sm:inline ${
                i <= step ? 'font-medium text-slate-900' : 'text-slate-400'
              }`}
            >
              {s}
            </span>
            {i < STEPS.length - 1 && (
              <div className="mx-1 h-px w-5 shrink-0 bg-slate-300 sm:mx-2 sm:w-8" />
            )}
          </div>
        ))}
      </div>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>
      )}

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          {step === 0 && (
            <div className="relative z-10 flex flex-col gap-4">
              <h2 className="text-sm font-semibold text-slate-900">ที่อยู่สำหรับจัดส่ง</h2>
              <p className="text-xs text-slate-500">กรอกข้อมูลผู้รับและที่อยู่เพื่อจัดส่งสินค้า</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <input
                  type="text"
                  name="shipping_name"
                  autoComplete="name"
                  placeholder="ชื่อ-นามสกุล"
                  value={address.name}
                  onChange={(e) => setAddress((a) => ({ ...a, name: e.target.value }))}
                  className="relative z-10 rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
                />
                <input
                  type="tel"
                  name="shipping_phone"
                  autoComplete="tel"
                  inputMode="tel"
                  placeholder="เบอร์โทรศัพท์"
                  value={address.phone}
                  onChange={(e) => setAddress((a) => ({ ...a, phone: e.target.value }))}
                  className="relative z-10 rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
                />
              </div>
              <input
                type="text"
                name="shipping_address"
                autoComplete="street-address"
                placeholder="ที่อยู่ (บ้านเลขที่ ถนน แขวง/ตำบล)"
                value={address.line}
                onChange={(e) => setAddress((a) => ({ ...a, line: e.target.value }))}
                className="relative z-10 rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <input
                  type="text"
                  name="shipping_province"
                  autoComplete="address-level1"
                  placeholder="จังหวัด"
                  value={address.province}
                  onChange={(e) => setAddress((a) => ({ ...a, province: e.target.value }))}
                  className="relative z-10 rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
                />
                <input
                  type="text"
                  name="shipping_postal"
                  autoComplete="postal-code"
                  inputMode="numeric"
                  placeholder="รหัสไปรษณีย์"
                  value={address.postal}
                  onChange={(e) => setAddress((a) => ({ ...a, postal: e.target.value }))}
                  className="relative z-10 rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  if (
                    !address.name.trim() ||
                    !address.phone.trim() ||
                    !address.line.trim() ||
                    !address.province.trim() ||
                    !address.postal.trim()
                  ) {
                    setError('กรุณากรอกที่อยู่จัดส่งให้ครบถ้วน');
                    return;
                  }
                  setError(null);
                  setStep(1);
                }}
                className="mt-2 w-fit rounded-md bg-teal-700 px-6 py-2.5 text-sm font-semibold text-white hover:bg-teal-800"
              >
                ถัดไป
              </button>
            </div>
          )}

          {step === 1 && (
            <div className="flex flex-col gap-3">
              <h2 className="mb-1 text-sm font-semibold text-slate-900">เลือกวิธีการชำระเงิน</h2>
              {(
                [
                  { key: 'promptpay' as const, label: 'พร้อมเพย์ / QR Code' },
                  { key: 'card' as const, label: 'บัตรเครดิต / เดบิต' },
                  { key: 'cod' as const, label: 'เก็บเงินปลายทาง' },
                ] as const
              ).map((m) => (
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
                    onChange={() => setPayment(m.key)}
                  />
                  <span className="font-medium text-slate-800">{m.label}</span>
                </label>
              ))}
              <div className="mt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(0)}
                  className="rounded-md border border-slate-300 px-6 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  ย้อนกลับ
                </button>
                <button
                  type="button"
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
                <p>{[address.line, address.province, address.postal].filter(Boolean).join(' ')}</p>
              </div>
              <ul className="flex flex-col gap-2 text-sm text-slate-600">
                {items.map((i) => (
                  <li key={i.productId} className="flex items-center justify-between gap-2">
                    <span className="flex min-w-0 items-center gap-2">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded bg-slate-100 text-slate-300">
                        {i.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={i.imageUrl} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <IconBox size={16} />
                        )}
                      </span>
                      <span className="truncate">
                        {i.name} × {i.quantity}
                      </span>
                    </span>
                    <span className="shrink-0">{formatCurrency(i.price * i.quantity)}</span>
                  </li>
                ))}
              </ul>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  disabled={submitting}
                  className="rounded-md border border-slate-300 px-6 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                >
                  ย้อนกลับ
                </button>
                <button
                  type="button"
                  onClick={handlePlaceOrder}
                  disabled={submitting}
                  className="rounded-md bg-orange-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-60"
                >
                  {submitting ? 'กำลังสั่งซื้อ...' : 'ยืนยันการสั่งซื้อ'}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="h-fit rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="mb-4 text-sm font-semibold text-slate-900">สรุปยอด</h2>
          <div className="flex flex-col gap-2 text-sm text-slate-600">
            <div className="flex justify-between">
              <span>ยอดรวมสินค้า</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>ค่าจัดส่ง</span>
              <span>{shipping === 0 ? 'ฟรี' : formatCurrency(shipping)}</span>
            </div>
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
