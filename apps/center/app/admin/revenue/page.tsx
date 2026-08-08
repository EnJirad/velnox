'use client';

import { useEffect, useState } from 'react';
import { formatCurrency } from '@velnox/utils';
import { apiClient } from '@/lib/api-client';

type PlatformStats = {
  totalRevenue?: number;
  monthRevenue?: number;
  openOrders?: number;
  activeMerchants?: number;
  pendingMerchants?: number;
  [key: string]: unknown;
};

type RevenuePoint = { month: string; amount: number };

type RecentOrder = {
  id: string;
  orderNumber?: string;
  status?: string;
  paymentStatus?: string;
  total?: number | string;
  createdAt?: string;
};

/**
 * รายได้บริษัท — ภาพรวมจาก analytics ที่มีอยู่
 * รายได้ที่ได้รับแล้ว vs กำลังดำเนินการ (ประมาณการจาก open orders)
 */
export default function CompanyRevenuePage() {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [chart, setChart] = useState<RevenuePoint[]>([]);
  const [recent, setRecent] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [s, c, o] = await Promise.allSettled([
          apiClient.get<PlatformStats>('/analytics/platform-stats'),
          apiClient.get<RevenuePoint[]>('/analytics/revenue-chart'),
          apiClient.get<RecentOrder[]>('/analytics/recent-orders'),
        ]);
        if (cancelled) return;
        if (s.status === 'fulfilled') setStats(s.value);
        if (c.status === 'fulfilled') setChart(Array.isArray(c.value) ? c.value : []);
        if (o.status === 'fulfilled') setRecent(Array.isArray(o.value) ? o.value : []);
        if (s.status === 'rejected' && c.status === 'rejected') {
          setError('โหลดข้อมูลรายได้ไม่สำเร็จ');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const maxAmount = Math.max(...chart.map((r) => r.amount), 1);
  const pipeline = recent.filter((o) => {
    const st = (o.status ?? '').toUpperCase();
    return st !== 'DELIVERED' && st !== 'CANCELLED';
  });
  const pipelineSum = pipeline.reduce((sum, o) => sum + Number(o.total ?? 0), 0);

  if (loading) {
    return <div className="py-20 text-center text-sm text-slate-400">กำลังโหลดรายได้...</div>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">รายได้บริษัท</h1>
        <p className="text-sm text-slate-500">
          รายได้จากคำสั่งซื้อที่สำเร็จ · และมูลค่าที่กำลังดำเนินการในระบบ
        </p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-teal-100 bg-teal-50 p-4">
          <p className="text-xs font-medium text-teal-800">รายได้รวม (แพลตฟอร์ม)</p>
          <p className="mt-1 text-2xl font-bold text-teal-900">
            {formatCurrency(Number(stats?.totalRevenue ?? 0))}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium text-slate-500">รายได้เดือนนี้</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">
            {formatCurrency(Number(stats?.monthRevenue ?? 0))}
          </p>
        </div>
        <div className="rounded-xl border border-amber-100 bg-amber-50 p-4">
          <p className="text-xs font-medium text-amber-800">มูลค่ากำลังดำเนินการ</p>
          <p className="mt-1 text-2xl font-bold text-amber-900">{formatCurrency(pipelineSum)}</p>
          <p className="text-[11px] text-amber-700">{pipeline.length} ออเดอร์ (จากรายการล่าสุด)</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium text-slate-500">ออเดอร์เปิดอยู่</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">
            {Number(stats?.openOrders ?? 0).toLocaleString('th-TH')}
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <p className="mb-4 text-sm font-semibold text-slate-900">แนวโน้มรายได้รายเดือน</p>
        {chart.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-400">ยังไม่มีข้อมูลกราฟ</p>
        ) : (
          <div className="flex h-48 items-end gap-3">
            {chart.map((r) => (
              <div key={r.month} className="flex flex-1 flex-col items-center gap-2">
                <span className="text-[10px] text-slate-400">{r.amount}</span>
                <div
                  className="w-full rounded-t-md bg-teal-600"
                  style={{ height: `${Math.max(4, (r.amount / maxAmount) * 100)}%` }}
                />
                <span className="text-xs text-slate-500">{r.month}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <p className="mb-3 text-sm font-semibold text-slate-900">ออเดอร์ล่าสุด (pipeline)</p>
        <ul className="divide-y divide-slate-50 text-sm">
          {pipeline.slice(0, 12).map((o) => (
            <li key={o.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
              <span className="font-mono text-xs text-slate-600">#{o.orderNumber ?? o.id.slice(0, 8)}</span>
              <span className="text-xs text-slate-500">{o.status}</span>
              <span className="font-medium text-slate-800">{formatCurrency(Number(o.total ?? 0))}</span>
            </li>
          ))}
          {pipeline.length === 0 && (
            <li className="py-6 text-center text-slate-400">ไม่มีออเดอร์ค้างในรายการล่าสุด</li>
          )}
        </ul>
      </div>
    </div>
  );
}
