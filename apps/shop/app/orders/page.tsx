'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { orderApi } from '@/services/catalog.service';
import { Badge, Button, EmptyState } from '@velnox/ui';
import { formatCurrency, formatDate } from '@velnox/utils';

interface OrderSummary {
  id: string;
  orderNumber: string;
  status: string;
  total: number | string;
  createdAt: string;
  items: { id: string }[];
}

const STATUS_LABEL: Record<string, string> = {
  PENDING: 'รอดำเนินการ',
  CONFIRMED: 'ยืนยันแล้ว',
  PROCESSING: 'กำลังเตรียมสินค้า',
  SHIPPED: 'จัดส่งแล้ว',
  DELIVERED: 'สำเร็จ',
  CANCELLED: 'ยกเลิก',
};

const STATUS_TONE: Record<string, 'neutral' | 'teal' | 'marigold' | 'brick' | 'success'> = {
  PENDING: 'marigold',
  CONFIRMED: 'teal',
  PROCESSING: 'teal',
  SHIPPED: 'teal',
  DELIVERED: 'success',
  CANCELLED: 'brick',
};

export default function OrdersPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login?next=/orders');
      return;
    }
    orderApi
      .listMine()
      .then((data) => setOrders(data as OrderSummary[]))
      .finally(() => setIsLoading(false));
  }, [isAuthenticated, router]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-6 font-display text-2xl font-bold text-ink">คำสั่งซื้อของฉัน</h1>

      {isLoading ? (
        <p className="text-ink/50">กำลังโหลด...</p>
      ) : orders.length === 0 ? (
        <EmptyState
          title="ยังไม่มีคำสั่งซื้อ"
          description="เมื่อคุณสั่งซื้อสินค้า รายการจะแสดงที่นี่"
          action={
            <Link href="/products">
              <Button>เลือกซื้อสินค้า</Button>
            </Link>
          }
        />
      ) : (
        <div className="flex flex-col gap-3">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/orders/${order.id}`}
              className="flex items-center justify-between rounded-lg border border-line bg-white p-4 hover:border-teal"
            >
              <div>
                <div className="font-mono text-sm font-semibold text-ink">{order.orderNumber}</div>
                <div className="text-xs text-ink/50">
                  {formatDate(order.createdAt)} · {order.items.length} รายการ
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm font-semibold text-teal">
                  {formatCurrency(Number(order.total))}
                </span>
                <Badge tone={STATUS_TONE[order.status] ?? 'neutral'}>
                  {STATUS_LABEL[order.status] ?? order.status}
                </Badge>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
