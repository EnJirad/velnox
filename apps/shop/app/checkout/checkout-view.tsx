'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { formatCurrency } from '@velnox/utils';
import { useCartStore } from '@/stores/cart-store';
import { useAuthStore } from '@/stores/auth-store';
import { useAuthContext } from '@/components/providers/auth-provider';
import { checkoutFromClientCart } from '@/lib/orders';
import { ApiError, apiClient } from '@/lib/api-client';
import { IconBox } from '@/components/icons';
import { PromptPayQrPanel } from '@/components/promptpay-qr-panel';
import {
  AddressLocationPicker,
  type GeoPoint,
  withGeoInAddressLine,
  parseGeoFromAddressLine,
} from '@/components/address-location-picker';

const STEPS = ['ที่อยู่จัดส่ง', 'วิธีการชำระเงิน', 'ยืนยันคำสั่งซื้อ'];

type SavedAddress = {
  id: string;
  name: string;
  phone: string;
  addressLine: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
};

type AddressForm = {
  name: string;
  phone: string;
  line: string;
  city: string;
  province: string;
  postal: string;
};

const emptyAddress: AddressForm = {
  name: '',
  phone: '',
  line: '',
  city: '',
  province: '',
  postal: '',
};

export function CheckoutView() {
  const { isInitializing } = useAuthContext();
  const user = useAuthStore((s) => s.user);
  const items = useCartStore((s) => s.items);
  const clear = useCartStore((s) => s.clear);
  const [step, setStep] = useState(0);
  const [payment, setPayment] = useState<'card' | 'promptpay' | 'cod'>('promptpay');
  const [address, setAddress] = useState<AddressForm>(emptyAddress);
  const [geo, setGeo] = useState<GeoPoint | null>(null);
  const [savedList, setSavedList] = useState<SavedAddress[]>([]);
  const [selectedId, setSelectedId] = useState<string | 'new' | null>(null);
  const [addrLoading, setAddrLoading] = useState(true);
  const [saveForNext, setSaveForNext] = useState(true);
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

  const applySaved = useCallback((row: SavedAddress) => {
    setSelectedId(row.id);
    setAddress({
      name: row.name,
      phone: row.phone,
      line: row.addressLine.replace(/\s*\|\s*GPS:[-\d.]+,[-\d.]+\s*$/i, '').trim(),
      city: row.city || '',
      province: row.province,
      postal: row.postalCode,
    });
    setGeo(parseGeoFromAddressLine(row.addressLine));
  }, []);

  // โหลดที่อยู่ที่บันทึกไว้ + เติมชื่อจากโปรไฟล์
  useEffect(() => {
    if (!user) {
      setAddrLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      setAddrLoading(true);
      try {
        const [list, profile] = await Promise.all([
          apiClient.get<SavedAddress[]>('/users/addresses').catch(() => [] as SavedAddress[]),
          apiClient
            .get<{ name: string; phone: string | null }>('/users/profile')
            .catch(() => null),
        ]);
        if (cancelled) return;
        const rows = Array.isArray(list) ? list : [];
        setSavedList(rows);
        const def = rows.find((a) => a.isDefault) ?? rows[0];
        if (def) {
          applySaved(def);
        } else {
          setSelectedId('new');
          setAddress((a) => ({
            ...a,
            name: a.name || profile?.name || user.name || '',
            phone: a.phone || profile?.phone || '',
          }));
        }
      } finally {
        if (!cancelled) setAddrLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, applySaved]);

  function startNewAddress() {
    setSelectedId('new');
    setAddress({
      name: user?.name ?? '',
      phone: '',
      line: '',
      city: '',
      province: '',
      postal: '',
    });
    setGeo(null);
  }

  function validateAddress(): string | null {
    if (!address.name.trim()) return 'กรุณากรอกชื่อผู้รับ';
    if (!address.phone.trim() || address.phone.trim().length < 8) return 'กรุณากรอกเบอร์โทรให้ถูกต้อง';
    if (!address.line.trim()) return 'กรุณากรอกที่อยู่';
    if (!address.province.trim()) return 'กรุณากรอกจังหวัด';
    if (!address.postal.trim() || address.postal.trim().length < 4) return 'กรุณากรอกรหัสไปรษณีย์';
    return null;
  }

  async function handlePlaceOrder() {
    const v = validateAddress();
    if (v) {
      setError(v);
      setStep(0);
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const addressLine = withGeoInAddressLine(address.line, geo);
      const order = await checkoutFromClientCart(items, payment, {
        name: address.name,
        phone: address.phone,
        addressLine,
        province: address.province,
        postalCode: address.postal,
        country: 'TH',
      });

      // บันทึกที่อยู่ใหม่ไว้ใช้ครั้งหน้า (ถ้าเลือก)
      if (saveForNext && selectedId === 'new') {
        try {
          await apiClient.post('/users/addresses', {
            name: address.name.trim(),
            phone: address.phone.trim(),
            addressLine,
            city: address.city.trim() || address.province.trim(),
            province: address.province.trim(),
            postalCode: address.postal.trim(),
            country: 'TH',
            isDefault: savedList.length === 0,
          });
        } catch {
          /* ไม่บล็อกการสั่งซื้อ */
        }
      }

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
            <h1 className="text-xl font-semibold text-slate-900">สั่งซื้อสำเร็จแล้ว!</h1>
            <p className="mt-1 text-sm text-slate-500">
              เลขที่คำสั่งซื้อ{' '}
              <span className="font-mono font-semibold text-teal-700">#{placed.orderNumber}</span>
            </p>
          </div>
          <PromptPayQrPanel orderId={placed.id} orderNumber={placed.orderNumber} />
          <div className="mt-6 text-center">
            <Link href="/orders" className="text-sm font-medium text-teal-700 hover:underline">
              ดูคำสั่งซื้อของฉัน
            </Link>
          </div>
        </div>
      );
    }
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <h1 className="text-xl font-semibold text-slate-900">สั่งซื้อสำเร็จแล้ว!</h1>
        <p className="mt-2 text-sm text-slate-500">
          เลขที่คำสั่งซื้อ{' '}
          <span className="font-mono font-semibold text-teal-700">#{placed.orderNumber}</span>
        </p>
        <Link
          href="/orders"
          className="mt-6 inline-block rounded-md bg-teal-700 px-6 py-2.5 text-sm font-semibold text-white hover:bg-teal-800"
        >
          ดูคำสั่งซื้อ
        </Link>
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

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          {step === 0 && (
            <div className="flex flex-col gap-4">
              <h2 className="text-sm font-semibold text-slate-900">ที่อยู่จัดส่ง</h2>

              {addrLoading ? (
                <p className="text-sm text-slate-400">กำลังโหลดที่อยู่ที่บันทึกไว้...</p>
              ) : (
                <>
                  {savedList.length > 0 && (
                    <div className="flex flex-col gap-2">
                      <p className="text-xs font-medium text-slate-500">เลือกจากที่อยู่ที่บันทึกไว้</p>
                      {savedList.map((row) => {
                        const active = selectedId === row.id;
                        return (
                          <button
                            key={row.id}
                            type="button"
                            onClick={() => applySaved(row)}
                            className={`rounded-xl border p-3 text-left text-sm transition ${
                              active
                                ? 'border-teal-600 bg-teal-50 ring-1 ring-teal-600'
                                : 'border-slate-200 hover:border-teal-200'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <p className="font-semibold text-slate-900">
                                  {row.name}{' '}
                                  {row.isDefault && (
                                    <span className="ml-1 rounded-full bg-teal-100 px-1.5 py-0.5 text-[10px] font-medium text-teal-800">
                                      ค่าเริ่มต้น
                                    </span>
                                  )}
                                </p>
                                <p className="text-xs text-slate-500">{row.phone}</p>
                                <p className="mt-1 text-xs text-slate-600">
                                  {row.addressLine.replace(/\s*\|\s*GPS:[-\d.]+,[-\d.]+\s*$/i, '')}
                                </p>
                                <p className="text-xs text-slate-500">
                                  {row.province} {row.postalCode}
                                </p>
                              </div>
                              {active && (
                                <span className="text-xs font-semibold text-teal-700">ใช้ที่อยู่นี้</span>
                              )}
                            </div>
                          </button>
                        );
                      })}
                      <button
                        type="button"
                        onClick={startNewAddress}
                        className={`rounded-xl border border-dashed p-3 text-left text-sm ${
                          selectedId === 'new'
                            ? 'border-teal-600 bg-teal-50 text-teal-900'
                            : 'border-slate-300 text-slate-600 hover:border-teal-300'
                        }`}
                      >
                        + ใช้ที่อยู่ใหม่
                      </button>
                    </div>
                  )}

                  {(selectedId === 'new' || savedList.length === 0) && (
                    <div className="flex flex-col gap-3">
                      {savedList.length === 0 && (
                        <p className="text-xs text-slate-500">
                          ยังไม่มีที่อยู่บันทึกไว้ — กรอกด้านล่าง (หรือเพิ่มในโปรไฟล์)
                        </p>
                      )}
                      <div className="grid gap-3 sm:grid-cols-2">
                        <input
                          type="text"
                          autoComplete="name"
                          placeholder="ชื่อผู้รับ *"
                          value={address.name}
                          onChange={(e) => setAddress((a) => ({ ...a, name: e.target.value }))}
                          className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
                        />
                        <input
                          type="tel"
                          autoComplete="tel"
                          placeholder="เบอร์โทรศัพท์ *"
                          value={address.phone}
                          onChange={(e) => setAddress((a) => ({ ...a, phone: e.target.value }))}
                          className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
                        />
                      </div>
                      <input
                        type="text"
                        autoComplete="street-address"
                        placeholder="ที่อยู่ (บ้านเลขที่ ถนน แขวง/ตำบล) *"
                        value={address.line}
                        onChange={(e) => setAddress((a) => ({ ...a, line: e.target.value }))}
                        className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
                      />
                      <div className="grid gap-3 sm:grid-cols-3">
                        <input
                          type="text"
                          placeholder="อำเภอ/เขต"
                          value={address.city}
                          onChange={(e) => setAddress((a) => ({ ...a, city: e.target.value }))}
                          className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-teal-600"
                        />
                        <input
                          type="text"
                          autoComplete="address-level1"
                          placeholder="จังหวัด *"
                          value={address.province}
                          onChange={(e) => setAddress((a) => ({ ...a, province: e.target.value }))}
                          className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-teal-600"
                        />
                        <input
                          type="text"
                          inputMode="numeric"
                          autoComplete="postal-code"
                          placeholder="รหัสไปรษณีย์ *"
                          value={address.postal}
                          onChange={(e) => setAddress((a) => ({ ...a, postal: e.target.value }))}
                          className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-teal-600"
                        />
                      </div>
                      <label className="flex items-center gap-2 text-xs text-slate-600">
                        <input
                          type="checkbox"
                          checked={saveForNext}
                          onChange={(e) => setSaveForNext(e.target.checked)}
                        />
                        บันทึกที่อยู่นี้ไว้ใช้ครั้งหน้า
                      </label>
                    </div>
                  )}

                  {/* แก้ไขฟอร์มได้แม้เลือกที่อยู่เดิม */}
                  {selectedId && selectedId !== 'new' && (
                    <div className="flex flex-col gap-3 border-t border-slate-100 pt-3">
                      <p className="text-xs font-medium text-slate-500">ปรับรายละเอียดก่อนสั่ง (ถ้าต้องการ)</p>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <input
                          type="text"
                          value={address.name}
                          onChange={(e) => setAddress((a) => ({ ...a, name: e.target.value }))}
                          className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-600"
                          placeholder="ชื่อผู้รับ"
                        />
                        <input
                          type="tel"
                          value={address.phone}
                          onChange={(e) => setAddress((a) => ({ ...a, phone: e.target.value }))}
                          className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-600"
                          placeholder="เบอร์โทร"
                        />
                      </div>
                      <input
                        type="text"
                        value={address.line}
                        onChange={(e) => setAddress((a) => ({ ...a, line: e.target.value }))}
                        className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-600"
                        placeholder="ที่อยู่"
                      />
                      <div className="grid gap-3 sm:grid-cols-2">
                        <input
                          type="text"
                          value={address.province}
                          onChange={(e) => setAddress((a) => ({ ...a, province: e.target.value }))}
                          className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-600"
                          placeholder="จังหวัด"
                        />
                        <input
                          type="text"
                          value={address.postal}
                          onChange={(e) => setAddress((a) => ({ ...a, postal: e.target.value }))}
                          className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-600"
                          placeholder="รหัสไปรษณีย์"
                        />
                      </div>
                    </div>
                  )}

                  <AddressLocationPicker
                    value={geo}
                    onChange={setGeo}
                    onAddressHint={(hint) => {
                      setAddress((a) => ({
                        ...a,
                        line:
                          a.line.trim() ||
                          [hint.road, hint.suburb].filter(Boolean).join(' ') ||
                          a.line,
                        city: a.city || hint.city || '',
                        province: a.province || hint.province || '',
                        postal: a.postal || hint.postcode || '',
                      }));
                    }}
                  />
                </>
              )}

              <button
                type="button"
                onClick={() => {
                  const v = validateAddress();
                  if (v) {
                    setError(v);
                    return;
                  }
                  setError(null);
                  setStep(1);
                }}
                className="mt-1 w-fit rounded-md bg-teal-700 px-6 py-2.5 text-sm font-semibold text-white hover:bg-teal-800"
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
                <p className="font-medium text-slate-800">ที่อยู่จัดส่ง</p>
                <p>
                  {address.name} · {address.phone}
                </p>
                <p>{address.line}</p>
                <p>
                  {address.province} {address.postal}
                </p>
                {geo && (
                  <p className="mt-1 font-mono text-[11px] text-teal-700">
                    พิกัด {geo.lat.toFixed(5)}, {geo.lng.toFixed(5)}
                  </p>
                )}
              </div>
              <ul className="flex flex-col gap-2 text-sm text-slate-700">
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
                  onClick={() => void handlePlaceOrder()}
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
