'use client';

import Link from 'next/link';
import { formatCurrency } from '@velnox/utils';
import { useCartStore } from '@/stores/cart-store';
import { IconBox, IconCart } from '@/components/icons';

export function CartView() {
  const items = useCartStore((s) => s.items);
  const setQuantity = useCartStore((s) => s.setQuantity);
  const removeItem = useCartStore((s) => s.removeItem);

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const shipping = subtotal === 0 || subtotal >= 990 ? 0 : 40;
  const total = subtotal + shipping;

  if (items.length === 0) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 px-4 py-24 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
          <IconCart size={32} />
        </span>
        <h1 className="text-xl font-semibold text-slate-900">ตะกร้าของคุณว่างเปล่า</h1>
        <p className="text-sm text-slate-500">เลือกช้อปสินค้าที่ใช่ แล้วกลับมาที่นี่อีกครั้ง</p>
        <Link
          href="/products"
          className="rounded-md bg-teal-700 px-6 py-2.5 text-sm font-semibold text-white hover:bg-teal-800"
        >
          เริ่มช้อปเลย
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 text-xl font-semibold text-slate-900">
        ตะกร้าสินค้า ({items.length} รายการ)
      </h1>
      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
          {items.map((item) => (
            <div key={item.productId} className="flex items-center gap-4 p-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-50 text-slate-300">
                {item.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.imageUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <IconBox size={24} />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-900">{item.name}</p>
                <p className="text-xs text-slate-500">{item.shopName}</p>
                <button
                  type="button"
                  onClick={() => removeItem(item.productId)}
                  className="mt-1 text-xs text-red-600 hover:underline"
                >
                  ลบ
                </button>
              </div>
              <div className="flex items-center rounded-md border border-slate-300">
                <button
                  type="button"
                  onClick={() => setQuantity(item.productId, item.quantity - 1)}
                  className="px-2.5 py-1 text-sm text-slate-600 hover:bg-slate-50"
                >
                  −
                </button>
                <span className="w-8 text-center text-sm">{item.quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(item.productId, item.quantity + 1)}
                  className="px-2.5 py-1 text-sm text-slate-600 hover:bg-slate-50"
                  disabled={item.quantity >= item.stock}
                >
                  +
                </button>
              </div>
              <span className="w-24 shrink-0 text-right text-sm font-semibold text-teal-700">
                {formatCurrency(item.price * item.quantity)}
              </span>
            </div>
          ))}
        </div>

        <div className="h-fit rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="mb-4 text-sm font-semibold text-slate-900">สรุปคำสั่งซื้อ</h2>
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
          <Link
            href="/checkout"
            className="mt-4 block rounded-md bg-orange-500 py-3 text-center text-sm font-semibold text-white hover:bg-orange-600"
          >
            ดำเนินการชำระเงิน
          </Link>
          <Link href="/products" className="mt-2 block text-center text-sm text-teal-700 hover:underline">
            เลือกซื้อสินค้าเพิ่ม
          </Link>
        </div>
      </div>
    </div>
  );
}