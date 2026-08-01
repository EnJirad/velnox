'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useCartStore } from '@/stores/cart-store';
import { useAuth } from '@/hooks/use-auth';
import { Button, EmptyState } from '@velnox/ui';
import { formatCurrency } from '@velnox/utils';

export default function CartPage() {
  const { isAuthenticated } = useAuth();
  const { items, isLoading, fetchCart, updateItem, removeItem } = useCartStore();

  useEffect(() => {
    if (isAuthenticated) fetchCart();
  }, [isAuthenticated, fetchCart]);

  const subtotal = items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16">
        <EmptyState
          title="เข้าสู่ระบบเพื่อดูตะกร้าของคุณ"
          description="ตะกร้าสินค้าจะถูกบันทึกไว้กับบัญชีของคุณ"
          action={
            <Link href="/login?next=/cart">
              <Button>เข้าสู่ระบบ</Button>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="mb-6 font-display text-2xl font-bold text-ink">ตะกร้าสินค้า</h1>

      {isLoading && items.length === 0 ? (
        <p className="text-ink/50">กำลังโหลด...</p>
      ) : items.length === 0 ? (
        <EmptyState
          title="ตะกร้าของคุณว่างเปล่า"
          description="เลือกดูสินค้าจากร้านค้าอิสระทั่วประเทศ"
          action={
            <Link href="/products">
              <Button>เลือกซื้อสินค้า</Button>
            </Link>
          }
        />
      ) : (
        <div className="grid gap-8 sm:grid-cols-3">
          <div className="flex flex-col gap-4 sm:col-span-2">
            {items.map((item) => (
              <div key={item.id} className="flex gap-4 rounded-lg border border-line bg-white p-4">
                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-md bg-canvas">
                  {item.product.images?.[0]?.url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.product.images[0].url}
                      alt={item.product.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-2xl text-ink/15">🛍️</div>
                  )}
                </div>
                <div className="flex flex-1 flex-col">
                  <Link href={`/products/${item.product.slug}`} className="text-sm font-medium text-ink hover:text-teal">
                    {item.product.name}
                  </Link>
                  {item.product.shop?.name && (
                    <span className="text-xs text-ink/40">{item.product.shop.name}</span>
                  )}
                  <div className="mt-auto flex items-center justify-between">
                    <div className="flex items-center rounded-md border border-line">
                      <button
                        className="px-2.5 py-1 text-ink/60 hover:text-teal"
                        onClick={() => updateItem(item.id, Math.max(1, item.quantity - 1))}
                      >
                        −
                      </button>
                      <span className="w-8 text-center font-mono text-sm">{item.quantity}</span>
                      <button
                        className="px-2.5 py-1 text-ink/60 hover:text-teal"
                        onClick={() => updateItem(item.id, item.quantity + 1)}
                      >
                        +
                      </button>
                    </div>
                    <span className="font-mono text-sm font-semibold text-teal">
                      {formatCurrency(Number(item.price) * item.quantity)}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => removeItem(item.id)}
                  className="self-start text-xs text-ink/40 hover:text-brick"
                  aria-label="ลบสินค้า"
                >
                  ลบ
                </button>
              </div>
            ))}
          </div>

          <div className="h-fit rounded-lg border border-line bg-white p-5" style={{ borderLeft: '3px solid #0B4F4A' }}>
            <div className="text-xs font-semibold uppercase tracking-wide text-ink/50">สรุปคำสั่งซื้อ</div>
            <div className="mt-3 flex justify-between text-sm">
              <span className="text-ink/60">ยอดรวมสินค้า</span>
              <span className="font-mono">{formatCurrency(subtotal)}</span>
            </div>
            <div className="mt-1 flex justify-between text-sm">
              <span className="text-ink/60">ค่าจัดส่ง</span>
              <span className="font-mono">คำนวณตอนชำระเงิน</span>
            </div>
            <div className="receipt-divider my-3" />
            <div className="flex justify-between font-mono text-base font-semibold text-teal">
              <span>รวม</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <Link href="/checkout">
              <Button className="mt-4 w-full">ดำเนินการชำระเงิน</Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
