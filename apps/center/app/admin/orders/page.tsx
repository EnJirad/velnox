'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@velnox/ui';
import { formatCurrency, formatDate } from '@velnox/utils';
import { adminService } from '@/services/admin.service';

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  total: number | string;
  paymentStatus: string;
  createdAt: string;
  user: { name: string; email: string };
  items: { id: string }[];
}

const STATUS_TONE: Record<string, 'neutral' | 'teal' | 'marigold' | 'brick' | 'success'> = {
  PENDING: 'marigold',
  CONFIRMED: 'teal',
  PROCESSING: 'teal',
  SHIPPED: 'teal',
  DELIVERED: 'success',
  CANCELLED: 'brick',
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    adminService.orders
      .list()
      .then((data) => setOrders(data as Order[]))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink">คำสั่งซื้อ</h1>
      <p className="mt-1 text-sm text-ink/60">คำสั่งซื้อทั้งหมดในระบบ</p>

      <div className="mt-6 overflow-hidden rounded-lg border border-line bg-white">
        {isLoading ? (
          <p className="p-6 text-sm text-ink/50">กำลังโหลด...</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-line bg-canvas text-left text-xs uppercase tracking-wide text-ink/50">
              <tr>
                <th className="px-4 py-3 font-medium">เลขที่คำสั่งซื้อ</th>
                <th className="px-4 py-3 font-medium">ลูกค้า</th>
                <th className="px-4 py-3 font-medium">ยอดรวม</th>
                <th className="px-4 py-3 font-medium">การชำระเงิน</th>
                <th className="px-4 py-3 font-medium">สถานะ</th>
                <th className="px-4 py-3 font-medium">วันที่</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {orders.map((order) => (
                <tr key={order.id}>
                  <td className="px-4 py-3 font-mono text-ink">{order.orderNumber}</td>
                  <td className="px-4 py-3 text-ink/60">{order.user.name}</td>
                  <td className="px-4 py-3 font-mono">{formatCurrency(Number(order.total))}</td>
                  <td className="px-4 py-3">
                    <Badge tone={order.paymentStatus === 'PAID' ? 'success' : 'marigold'}>
                      {order.paymentStatus}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={STATUS_TONE[order.status] ?? 'neutral'}>{order.status}</Badge>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-ink/50">{formatDate(order.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
