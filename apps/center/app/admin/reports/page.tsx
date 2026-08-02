'use client';

import { useEffect, useState } from 'react';
import { formatCurrency } from '@velnox/utils';
import { Card } from '@velnox/ui';
import { apiClient } from '@/lib/api-client';

type Stats = {
  gmv: number;
  openOrders: number;
  pendingMerchants: number;
  pendingProducts: number;
};

export default function ReportsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiClient
      .get<Stats>('/analytics/platform-stats')
      .then(setStats)
      .catch((err) => setError(err instanceof Error ? err.message : 'โหลดข้อมูลไม่สำเร็จ'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="py-20 text-center text-slate-500">กำลังโหลด...</div>;
  }

  if (error || !stats) {
    return (
      <div className="rounded-lg bg-red-50 p-6 text-center text-red-600">
        {error || 'โหลดข้อมูลไม่สำเร็จ'}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">รายงาน</h1>
        <p className="text-sm text-slate-500">สรุปการดำเนินงานจากฐานข้อมูลจริง</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <p className="text-xs text-slate-500">GMV รวม</p>
          <p className="mt-1 text-xl font-bold text-slate-900">{formatCurrency(stats.gmv)}</p>
        </Card>
        <Card>
          <p className="text-xs text-slate-500">คำสั่งซื้อที่ค้างอยู่</p>
          <p className="mt-1 text-xl font-bold text-slate-900">{stats.openOrders}</p>
        </Card>
        <Card>
          <p className="text-xs text-slate-500">รายการรอตรวจสอบ</p>
          <p className="mt-1 text-xl font-bold text-slate-900">
            {stats.pendingMerchants + stats.pendingProducts}
          </p>
        </Card>
      </div>

      <p className="text-sm text-slate-500">
        รายงานดาวน์โหลดแบบละเอียดจะเพิ่มในรอบถัดไป — ตอนนี้แสดงตัวเลขสดจากระบบ
      </p>
    </div>
  );
}