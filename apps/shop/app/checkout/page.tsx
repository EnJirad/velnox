'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input } from '@velnox/ui';
import { formatCurrency } from '@velnox/utils';
import { useCartStore } from '@/stores/cart-store';
import { useAuth } from '@/hooks/use-auth';
import { orderApi } from '@/services/catalog.service';

const SHIPPING_FEE = 40;

export default function CheckoutPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const { items, fetchCart } = useCartStore();
  const [form, setForm] = useState({
    recipientName: '',
    phone: '',
    addressLine: '',
    city: '',
    province: '',
    postalCode: '',
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login?next=/checkout');
      return;
    }
    fetchCart();
  }, [isAuthenticated, fetchCart, router]);

  useEffect(() => {
    if (user?.name) setForm((f) => ({ ...f, recipientName: user.name }));
  }, [user]);

  const subtotal = items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
  const total = subtotal + SHIPPING_FEE;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');
    setError('');
    try {
      const order = await orderApi.checkout(form) as { id: string };
      router.push(`/orders/${order.id}`);
    } catch (err) {
      setError((err as Error).message);
      setStatus('error');
    }
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center text-ink/50">
        ตะกร้าของคุณว่างเปล่า — ไม่สามารถชำระเงินได้
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="mb-6 font-display text-2xl font-bold text-ink">ชำระเงิน</h1>
      <div className="grid gap-8 sm:grid-cols-3">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:col-span-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink/50">ที่อยู่จัดส่ง</h2>
          <Input
            label="ชื่อผู้รับ"
            required
            value={form.recipientName}
            onChange={(e) => setForm({ ...form, recipientName: e.target.value })}
          />
          <Input
            label="เบอร์โทรศัพท์"
            required
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
          <Input
            label="ที่อยู่"
            required
            value={form.addressLine}
            onChange={(e) => setForm({ ...form, addressLine: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="เขต/อำเภอ"
              required
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
            />
            <Input
              label="จังหวัด"
              required
              value={form.province}
              onChange={(e) => setForm({ ...form, province: e.target.value })}
            />
          </div>
          <Input
            label="รหัสไปรษณีย์"
            required
            value={form.postalCode}
            onChange={(e) => setForm({ ...form, postalCode: e.target.value })}
          />
          {error && <p className="text-sm text-brick">{error}</p>}
          <Button type="submit" isLoading={status === 'loading'} className="mt-2">
            ยืนยันคำสั่งซื้อ
          </Button>
        </form>

        <div className="h-fit rounded-lg border border-line bg-white p-5" style={{ borderLeft: '3px solid #0B4F4A' }}>
          <div className="text-xs font-semibold uppercase tracking-wide text-ink/50">สรุปคำสั่งซื้อ</div>
          <div className="mt-3 flex flex-col gap-1.5 text-sm">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between">
                <span className="text-ink/60">
                  {item.product.name} × {item.quantity}
                </span>
                <span className="font-mono">{formatCurrency(Number(item.price) * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="receipt-divider my-3" />
          <div className="flex justify-between text-sm">
            <span className="text-ink/60">ยอดรวมสินค้า</span>
            <span className="font-mono">{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-ink/60">ค่าจัดส่ง</span>
            <span className="font-mono">{formatCurrency(SHIPPING_FEE)}</span>
          </div>
          <div className="receipt-divider my-3" />
          <div className="flex justify-between font-mono text-base font-semibold text-teal">
            <span>รวมทั้งหมด</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
