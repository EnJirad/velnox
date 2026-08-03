'use client';

import { useEffect, useState } from 'react';
import { formatCurrency, formatDate } from '@velnox/utils';
import { Badge, Card } from '@velnox/ui';
import { apiClient } from '@/lib/api-client';
import {
  orderStatusLabel,
  orderStatusTone,
  paymentStatusLabel,
} from '@/lib/order-status';

type Overview = {
  stats: {
    gmv: number;
    gmvGrowth: number;
    activeUsers: number;
    activeMerchants: number;
    pendingMerchants: number;
    pendingProducts: number;
    openOrders: number;
    velrepeatActive: number;
  };
  revenueChart: { month: string; amount: number }[];
  ordersByStatus: { status: string; count: number }[];
  ordersByPayment: { status: string; count: number }[];
  recentPaidOrders: {
    id: string;
    orderNumber: string;
    total: number | string;
    createdAt: string;
    user?: { name: string; email: string };
  }[];
  topProducts: {
    productId: string;
    name: string;
    shopName: string;
    quantitySold: number;
    revenue: number;
  }[];
  topMerchants: {
    merchantId: string;
    name: string;
    owner: string;
    email: string;
    quantitySold: number;
    revenue: number;
  }[];
};

export default function ReportsPage() {
  const [data, setData] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiClient
      .get<Overview>('/analytics/reports-overview')
      .then(setData)
      .catch((err) => setError(err instanceof Error ? err.message : 'โหลดข้อมูลไม่สำเร็จ'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="py-20 text-center text-slate-500">กำลังโหลด...</div>;
  }

  if (error || !data) {
    return (
      <div className="rounded-lg bg-red-50 p-6 text-center text-red-600">
        {error || 'โหลดข้อมูลไม่สำเร็จ'}
      </div>
    );
  }

  const { stats, revenueChart } = data;
  const maxRevenue = Math.max(...revenueChart.map((r) => r.amount), 0.01);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">รายงาน</h1>
        <p className="text-sm text-slate-500">สรุปและวิเคราะห์จากฐานข้อมูลจริง</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <p className="text-xs text-slate-500">GMV รวม</p>
          <p className="mt-1 text-xl font-bold text-slate-900">{formatCurrency(stats.gmv)}</p>
          <p className="mt-1 text-xs text-emerald-600">▲ {stats.gmvGrowth}% จากเดือนก่อน</p>
        </Card>
        <Card>
          <p className="text-xs text-slate-500">คำสั่งซื้อที่ค้าง</p>
          <p className="mt-1 text-xl font-bold text-slate-900">{stats.openOrders}</p>
        </Card>
        <Card>
          <p className="text-xs text-slate-500">ผู้ใช้ / ร้านค้า</p>
          <p className="mt-1 text-xl font-bold text-slate-900">
            {stats.activeUsers.toLocaleString()} / {stats.activeMerchants}
          </p>
        </Card>
        <Card>
          <p className="text-xs text-slate-500">รอตรวจสอบ</p>
          <p className="mt-1 text-xl font-bold text-slate-900">
            {stats.pendingMerchants + stats.pendingProducts}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            ร้าน {stats.pendingMerchants} · สินค้า {stats.pendingProducts}
          </p>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <Card>
          <p className="mb-4 text-sm font-semibold text-slate-900">
            แนวโน้ม GMV รายเดือน (ล้านบาท)
          </p>
          {revenueChart.length === 0 ? (
            <p className="py-12 text-center text-sm text-slate-400">ยังไม่มีข้อมูล</p>
          ) : (
            <div className="flex h-52 items-end gap-4">
              {revenueChart.map((r) => (
                <div key={r.month} className="flex flex-1 flex-col items-center gap-2">
                  <span className="text-[10px] text-slate-400">฿{r.amount}M</span>
                  <div
                    className="w-full rounded-t-md bg-gradient-to-t from-teal-700 to-teal-400"
                    style={{ height: `${(r.amount / maxRevenue) * 100}%` }}
                  />
                  <span className="text-xs text-slate-500">{r.month}</span>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <p className="mb-3 text-sm font-semibold text-slate-900">สถานะออเดอร์</p>
          <ul className="flex flex-col gap-2">
            {data.ordersByStatus.map((row) => (
              <li key={row.status} className="flex items-center justify-between text-sm">
                <Badge
                  tone={
                    orderStatusTone[row.status as keyof typeof orderStatusTone] ?? 'neutral'
                  }
                >
                  {orderStatusLabel[row.status as keyof typeof orderStatusLabel] ?? row.status}
                </Badge>
                <span className="font-medium text-slate-800">{row.count}</span>
              </li>
            ))}
            {data.ordersByStatus.length === 0 && (
              <li className="text-sm text-slate-400">ยังไม่มีออเดอร์</li>
            )}
          </ul>
          <p className="mb-2 mt-4 text-sm font-semibold text-slate-900">การชำระเงิน</p>
          <ul className="flex flex-col gap-2">
            {data.ordersByPayment.map((row) => (
              <li key={row.status} className="flex items-center justify-between text-sm">
                <span className="text-slate-600">
                  {paymentStatusLabel[row.status] ?? row.status}
                </span>
                <span className="font-medium text-slate-800">{row.count}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white">
          <div className="border-b border-slate-100 px-4 py-3">
            <p className="text-sm font-semibold text-slate-900">สินค้าขายดี (Top 10)</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs text-slate-500">
                  <th className="px-4 py-2">สินค้า</th>
                  <th className="px-4 py-2">ขาย</th>
                  <th className="px-4 py-2">รายได้</th>
                </tr>
              </thead>
              <tbody>
                {data.topProducts.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-slate-400">
                      ยังไม่มีข้อมูล
                    </td>
                  </tr>
                ) : (
                  data.topProducts.map((p) => (
                    <tr key={p.productId} className="border-b border-slate-50 last:border-0">
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-800">{p.name}</div>
                        <div className="text-xs text-slate-400">{p.shopName}</div>
                      </td>
                      <td className="px-4 py-3">{p.quantitySold}</td>
                      <td className="px-4 py-3">{formatCurrency(p.revenue)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white">
          <div className="border-b border-slate-100 px-4 py-3">
            <p className="text-sm font-semibold text-slate-900">Merchant ยอดขายสูง (Top 10)</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs text-slate-500">
                  <th className="px-4 py-2">ร้าน / เจ้าของ</th>
                  <th className="px-4 py-2">ชิ้น</th>
                  <th className="px-4 py-2">รายได้</th>
                </tr>
              </thead>
              <tbody>
                {data.topMerchants.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-slate-400">
                      ยังไม่มีข้อมูล
                    </td>
                  </tr>
                ) : (
                  data.topMerchants.map((m) => (
                    <tr key={m.merchantId} className="border-b border-slate-50 last:border-0">
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-800">{m.name}</div>
                        <div className="text-xs text-slate-400">
                          {m.owner} · {m.email}
                        </div>
                      </td>
                      <td className="px-4 py-3">{m.quantitySold}</td>
                      <td className="px-4 py-3">{formatCurrency(m.revenue)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-100 px-4 py-3">
          <p className="text-sm font-semibold text-slate-900">ออเดอร์ที่ชำระแล้วล่าสุด</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs text-slate-500">
                <th className="px-4 py-2">คำสั่งซื้อ</th>
                <th className="px-4 py-2">ลูกค้า</th>
                <th className="px-4 py-2">วันที่</th>
                <th className="px-4 py-2">ยอด</th>
              </tr>
            </thead>
            <tbody>
              {data.recentPaidOrders.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-400">
                    ยังไม่มีออเดอร์ที่ชำระเงิน
                  </td>
                </tr>
              ) : (
                data.recentPaidOrders.map((o) => (
                  <tr key={o.id} className="border-b border-slate-50 last:border-0">
                    <td className="px-4 py-3 font-medium">#{o.orderNumber}</td>
                    <td className="px-4 py-3 text-slate-600">{o.user?.name ?? '—'}</td>
                    <td className="px-4 py-3 text-slate-500">{formatDate(o.createdAt)}</td>
                    <td className="px-4 py-3">{formatCurrency(Number(o.total))}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}