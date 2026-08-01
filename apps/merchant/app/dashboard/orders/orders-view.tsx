'use client';

import { useState } from 'react';
import { formatCurrency, formatDate } from '@velnox/utils';
import { Badge } from '@velnox/ui';
import { merchantOrders, orderStatusLabel, orderStatusTone } from '@/lib/mock-data';
import type { OrderStatus } from '@velnox/types';

const FILTERS: Array<{ key: OrderStatus | 'ALL'; label: string }> = [
  { key: 'ALL', label: 'ทั้งหมด' },
  { key: 'PENDING', label: 'รอยืนยัน' },
  { key: 'CONFIRMED', label: 'ยืนยันแล้ว' },
  { key: 'PROCESSING', label: 'กำลังจัดเตรียม' },
  { key: 'SHIPPED', label: 'จัดส่งแล้ว' },
  { key: 'DELIVERED', label: 'สำเร็จ' },
  { key: 'CANCELLED', label: 'ยกเลิก' },
];

export function OrdersView() {
  const [filter, setFilter] = useState<OrderStatus | 'ALL'>('ALL');
  const filtered = filter === 'ALL' ? merchantOrders : merchantOrders.filter((o) => o.status === filter);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">คำสั่งซื้อ</h1>
        <p className="text-sm text-slate-500">จัดการและติดตามคำสั่งซื้อของร้านคุณ</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium ${
              filter === f.key ? 'bg-teal-700 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs text-slate-500">
              <th className="px-4 py-3 font-medium">คำสั่งซื้อ</th>
              <th className="px-4 py-3 font-medium">วันที่</th>
              <th className="px-4 py-3 font-medium">ยอดรวม</th>
              <th className="px-4 py-3 font-medium">การชำระเงิน</th>
              <th className="px-4 py-3 font-medium">สถานะ</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((o) => (
              <tr key={o.id} className="border-b border-slate-50 last:border-0">
                <td className="px-4 py-3 font-medium text-slate-800">#{o.orderNumber}</td>
                <td className="px-4 py-3 text-slate-500">{formatDate(o.createdAt)}</td>
                <td className="px-4 py-3 text-slate-800">{formatCurrency(o.total)}</td>
                <td className="px-4 py-3 text-slate-500">{o.paymentStatus === 'PAID' ? 'ชำระแล้ว' : o.paymentStatus === 'REFUNDED' ? 'คืนเงินแล้ว' : 'รอชำระ'}</td>
                <td className="px-4 py-3"><Badge tone={orderStatusTone[o.status]}>{orderStatusLabel[o.status]}</Badge></td>
                <td className="px-4 py-3 text-right">
                  {o.status === 'PENDING' ? (
                    <button className="rounded-md bg-teal-700 px-3 py-1 text-xs font-medium text-white hover:bg-teal-800">
                      ยืนยันคำสั่งซื้อ
                    </button>
                  ) : (
                    <button className="text-xs font-medium text-teal-700 hover:underline">ดูรายละเอียด</button>
                  )}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-slate-400">ไม่มีคำสั่งซื้อในสถานะนี้</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
