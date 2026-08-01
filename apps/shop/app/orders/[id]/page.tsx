'use client';

import { useEffect, useState, use as usePromise } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { orderApi } from '@/services/catalog.service';
import { Badge } from '@velnox/ui';
import { formatCurrency, formatDate } from '@velnox/utils';

interface OrderItem {
  id: string;
  quantity: number;
  price: number | string;
  product: { name: string; slug: string; images: { url: string }[] };
}

interface OrderDetail {
  id: string;
  orderNumber: string;
  status: string;
  subtotal: number | string;
  shippingFee: number | string;
  total: number | string;
  paymentStatus: string;
  createdAt: string;
  items: OrderItem[];
}

const STATUS_LABEL: Record<string, string> = {
  PENDING: 'รอดำเนินการ',
  CONFIRMED: 'ยืนยันแล้ว',
  PROCESSING: 'กำลังเตรียมสินค้า',
  SHIPPED: 'จัดส่งแล้ว',
  DELIVERED: 'สำเร็จ',
  CANCELLED: 'ยกเลิก',
};

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = usePromise(params);
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace(`/login?next=/orders/${id}`);
      return;
    }
    orderApi
      .getOne(id)
      .then((data) => setOrder(data as OrderDetail))
      .catch((err) => setError(err.message));
  }, [isAuthenticated, id, router]);

  if (error) {
    return <div className="mx-auto max-w-lg px-4 py-20 text-center text-brick">{error}</div>;
  }

  if (!order) {
    return <div className="mx-auto max-w-lg px-4 py-20 text-center text-ink/50">กำลังโหลด...</div>;
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <Link href="/orders" className="text-sm text-teal hover:underline">
        ← กลับไปคำสั่งซื้อทั้งหมด
      </Link>

      <div className="mt-4 rounded-lg border border-line bg-white p-6" style={{ borderLeft: '3px solid #0B4F4A' }}>
        <div className="flex items-start justify-between">
          <div>
            <div className="font-mono text-lg font-semibold text-ink">{order.orderNumber}</div>
            <div className="text-xs text-ink/50">สั่งซื้อเมื่อ {formatDate(order.createdAt)}</div>
          </div>
          <Badge tone="teal">{STATUS_LABEL[order.status] ?? order.status}</Badge>
        </div>

        <div className="receipt-divider my-5" />

        <div className="flex flex-col gap-3">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center gap-3">
              <div className="h-14 w-14 shrink-0 overflow-hidden rounded-md bg-canvas">
                {item.product.images?.[0]?.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.product.images[0].url} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xl text-ink/15">🛍️</div>
                )}
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-ink">{item.product.name}</div>
                <div className="text-xs text-ink/50">จำนวน {item.quantity}</div>
              </div>
              <span className="font-mono text-sm">
                {formatCurrency(Number(item.price) * item.quantity)}
              </span>
            </div>
          ))}
        </div>

        <div className="receipt-divider my-5" />

        <div className="flex flex-col gap-1.5 text-sm">
          <div className="flex justify-between">
            <span className="text-ink/60">ยอดรวมสินค้า</span>
            <span className="font-mono">{formatCurrency(Number(order.subtotal))}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-ink/60">ค่าจัดส่ง</span>
            <span className="font-mono">{formatCurrency(Number(order.shippingFee))}</span>
          </div>
          <div className="flex justify-between text-base font-semibold text-teal">
            <span>รวมทั้งหมด</span>
            <span className="font-mono">{formatCurrency(Number(order.total))}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
