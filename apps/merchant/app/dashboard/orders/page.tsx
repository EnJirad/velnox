'use client';

import { useEffect, useState } from 'react';
import { Badge, EmptyState } from '@velnox/ui';
import { formatCurrency, formatDate } from '@velnox/utils';
import { merchantOrderService } from '@/services/merchant.service';

interface OrderItem {
  id: string;
  quantity: number;
  price: number | string;
  product: { name: string; images: { url: string }[] };
  order: {
    id: string;
    orderNumber: string;
    status: string;
    createdAt: string;
    user: { name: string; email: string };
  };
}

const STATUS_OPTIONS = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

const STATUS_TONE: Record<string, 'neutral' | 'teal' | 'marigold' | 'brick' | 'success'> = {
  PENDING: 'marigold',
  CONFIRMED: 'teal',
  PROCESSING: 'teal',
  SHIPPED: 'teal',
  DELIVERED: 'success',
  CANCELLED: 'brick',
};

export default function MerchantOrdersPage() {
  const [items, setItems] = useState<OrderItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  function load() {
    setIsLoading(true);
    merchantOrderService
      .listMine()
      .then((data) => setItems(data as OrderItem[]))
      .finally(() => setIsLoading(false));
  }

  useEffect(load, []);

  async function handleStatusChange(orderId: string, status: string) {
    setUpdatingId(orderId);
    try {
      await merchantOrderService.updateStatus(orderId, status);
      load();
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink">คำสั่งซื้อ</h1>
      <p className="mt-1 text-sm text-ink/60">รายการสินค้าของร้านคุณที่มีลูกค้าสั่งซื้อ</p>

      <div className="mt-6 rounded-lg border border-line bg-white">
        {isLoading ? (
          <p className="p-6 text-sm text-ink/50">กำลังโหลด...</p>
        ) : items.length === 0 ? (
          <div className="p-6">
            <EmptyState title="ยังไม่มีคำสั่งซื้อ" description="เมื่อมีลูกค้าสั่งซื้อสินค้าของคุณ รายการจะแสดงที่นี่" />
          </div>
        ) : (
          <div className="divide-y divide-line">
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-4 px-4 py-3">
                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md bg-canvas">
                  {item.product.images?.[0]?.url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.product.images[0].url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-lg text-ink/15">🛍️</div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="font-mono text-xs text-ink/50">{item.order.orderNumber}</div>
                  <div className="text-sm font-medium text-ink">
                    {item.product.name} × {item.quantity}
                  </div>
                  <div className="text-xs text-ink/50">
                    {item.order.user.name} · {formatDate(item.order.createdAt)}
                  </div>
                </div>
                <span className="font-mono text-sm">
                  {formatCurrency(Number(item.price) * item.quantity)}
                </span>
                <Badge tone={STATUS_TONE[item.order.status] ?? 'neutral'}>{item.order.status}</Badge>
                <select
                  value={item.order.status}
                  disabled={updatingId === item.order.id}
                  onChange={(e) => handleStatusChange(item.order.id, e.target.value)}
                  className="rounded-md border border-line px-2 py-1.5 text-xs focus:border-teal focus:outline-none"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
