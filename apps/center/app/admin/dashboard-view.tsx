'use client';

import { useEffect, useState } from 'react';
import { formatCurrency, formatDate } from '@velnox/utils';
import { Badge, Card } from '@velnox/ui';
import { apiClient } from '@/lib/api-client';
import { orderStatusLabel, orderStatusTone } from '@/lib/mock-data';
import type { Order } from '@velnox/types';

interface Stats {
  gmv: number;
  gmvGrowth: number;
  activeUsers: number;
  activeUsersGrowth: number;
  activeMerchants: number;
  pendingMerchants: number;
  pendingProducts: number;
  openOrders: number;
  velrepeatActive: number;
  velrepeatPaused: number;
}

interface RevenuePoint {
  month: string;
  amount: number;
}

export default function DashboardView() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [revenue, setRevenue] = useState<RevenuePoint[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const [statsData, revenueData, ordersData] = await Promise.all([
          apiClient.get<Stats>('/analytics/platform-stats'),
          apiClient.get<RevenuePoint[]>('/analytics/revenue-chart'),
          apiClient.get<Order[]>('/analytics/recent-orders'),
        ]);
        setStats(statsData);
        setRevenue(revenueData);
        setOrders(ordersData);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        setError('ไม่สามารถโหลดข้อมูล Dashboard ได้');
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  if (loading) {
    return <div className="py-20 text-center text-slate-500">กำลังโหลดข้อมูล Dashboard...</div>;
  }

  if (error || !stats) {
    return (
      <div className="rounded-lg bg-red-50 p-6 text-center text-red-600">
        {error || 'เกิดข้อผิดพลาดในการโหลดข้อมูล'}
      </div>
    );
  }

  const maxRevenue = Math.max(...revenue.map((r) => r.amount), 1);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card>
          <p className="text-xs text-slate-500">มูลค่าซื้อขายรวม (GMV)</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{formatCurrency(stats.gmv)}</p>
          <p className="mt-1 text-xs font-medium text-emerald-600">▲ {stats.gmvGrowth}% จากเดือนก่อน</p>
        </Card>
        <Card>
          <p className="text-xs text-slate-500">ผู้ใช้งานทั้งหมด</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{stats.activeUsers.toLocaleString('th-TH')}</p>
          <p className="mt-1 text-xs font-medium text-emerald-600">▲ {stats.activeUsersGrowth}% จากเดือนก่อน</p>
        </Card>
        <Card>
          <p className="text-xs text-slate-500">ร้านค้าที่เปิดใช้งาน</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{stats.activeMerchants}</p>
          <p className="mt-1 text-xs text-amber-600">รออนุมัติ {stats.pendingMerchants} ร้าน</p>
        </Card>
        <Card>
          <p className="text-xs text-slate-500">คำสั่งซื้อที่รอดำเนินการ</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{stats.openOrders}</p>
          <p className="mt-1 text-xs text-slate-400">กำลังดำเนินการอยู่</p>
        </Card>
        <Card>
          <p className="text-xs text-slate-500">🔁 VelRepeat ที่ใช้งาน</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{stats.velrepeatActive.toLocaleString('th-TH')}</p>
          <p className="mt-1 text-xs text-slate-400">พักไว้ {stats.velrepeatPaused} รายการ</p>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <Card>
          <p className="mb-4 text-sm font-semibold text-slate-900">มูลค่าซื้อขายรวมรายเดือน (ล้านบาท)</p>
          <div className="flex h-48 items-end gap-4">
            {revenue.map((r) => (
              <div key={r.month} className="flex flex-1 flex-col items-center gap-2">
                <span className="text-[10px] text-slate-400">฿{r.amount}M</span>
                <div className="w-full rounded-t-md bg-teal-600" style={{ height: `${(r.amount / maxRevenue) * 100}%` }} />
                <span className="text-xs text-slate-500">{r.month}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <p className="mb-4 text-sm font-semibold text-slate-900">การแจ้งเตือนระบบ</p>
          <ul className="flex flex-col gap-3">
            {stats.pendingMerchants > 0 && (
              <li className="flex items-center justify-between text-sm">
                <span className="text-slate-600">มีร้านค้า {stats.pendingMerchants} แห่งรออนุมัติ</span>
                <Badge tone="warning">ตรวจสอบ</Badge>
              </li>
            )}
            {stats.pendingProducts > 0 && (
              <li className="flex items-center justify-between text-sm">
                <span className="text-slate-600">มีสินค้า {stats.pendingProducts} รายการรอตรวจ</span>
                <Badge tone="warning">ตรวจสอบ</Badge>
              </li>
            )}
            {stats.pendingMerchants === 0 && stats.pendingProducts === 0 && (
              <li className="text-sm text-slate-400">ไม่มีรายการรอตรวจสอบ</li>
            )}
          </ul>
          <a href="/admin/merchants" className="mt-4 block text-center text-xs font-medium text-teal-700 hover:underline">
            ไปที่หน้าจัดการ →
          </a>
        </Card>
      </div>

      <Card className="p-0">
        <div className="flex items-center justify-between border-b border-slate-100 p-4">
          <p className="text-sm font-semibold text-slate-900">คำสั่งซื้อล่าสุดในระบบ</p>
          <a href="/admin/orders" className="text-xs font-medium text-teal-700 hover:underline">ดูทั้งหมด →</a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs text-slate-500">
                <th className="px-4 py-2 font-medium">คำสั่งซื้อ</th>
                <th className="px-4 py-2 font-medium">วันที่</th>
                <th className="px-4 py-2 font-medium">ยอดรวม</th>
                <th className="px-4 py-2 font-medium">สถานะ</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-400">ยังไม่มีคำสั่งซื้อในระบบ</td>
                </tr>
              )}
              {orders.map((o) => (
                <tr key={o.id} className="border-b border-slate-50 last:border-0">
                  <td className="px-4 py-3 font-medium text-slate-800">#{o.orderNumber}</td>
                  <td className="px-4 py-3 text-slate-500">{formatDate(o.createdAt)}</td>
                  <td className="px-4 py-3 text-slate-800">{formatCurrency(o.total)}</td>
                  <td className="px-4 py-3">
                    <Badge tone={orderStatusTone[o.status] || 'neutral'}>
                      {orderStatusLabel[o.status] || o.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
