'use client';

import { useEffect, useState } from 'react';
import { Card } from '@velnox/ui';
import { apiClient } from '@/lib/api-client';

type RevenuePoint = { month: string; amount: number };
type ApiShop = { id: string; name: string };

export default function AnalyticsPage() {
  const [revenue, setRevenue] = useState<RevenuePoint[]>([]);
  const [shops, setShops] = useState<ApiShop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      apiClient.get<RevenuePoint[]>('/analytics/revenue-chart'),
      apiClient.get<ApiShop[]>('/shops'),
    ])
      .then(([rev, shopList]) => {
        setRevenue(rev);
        setShops(Array.isArray(shopList) ? shopList.slice(0, 5) : []);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'โหลดข้อมูลไม่สำเร็จ'))
      .finally(() => setLoading(false));
  }, []);

  const maxRevenue = Math.max(...revenue.map((r) => r.amount), 1);

  if (loading) {
    return <div className="py-20 text-center text-slate-500">กำลังโหลด...</div>;
  }

  if (error) {
    return <div className="rounded-lg bg-red-50 p-6 text-center text-red-600">{error}</div>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">วิเคราะห์ข้อมูลแพลตฟอร์ม</h1>
        <p className="text-sm text-slate-500">แนวโน้มและข้อมูลเชิงลึกจากฐานข้อมูลจริง</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <Card>
          <p className="mb-4 text-sm font-semibold text-slate-900">
            แนวโน้มมูลค่าซื้อขายรวม (ล้านบาท)
          </p>
          {revenue.length === 0 ? (
            <p className="py-12 text-center text-sm text-slate-400">ยังไม่มีข้อมูลยอดขาย</p>
          ) : (
            <div className="flex h-52 items-end gap-4">
              {revenue.map((r) => (
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
          <p className="mb-4 text-sm font-semibold text-slate-900">ร้านค้าล่าสุด</p>
          {shops.length === 0 ? (
            <p className="text-sm text-slate-400">ยังไม่มีร้านค้า</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {shops.map((s) => (
                <li key={s.id} className="rounded-lg border border-slate-100 px-3 py-2 text-sm text-slate-800">
                  {s.name}
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}