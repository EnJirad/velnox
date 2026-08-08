'use client';

import { useCallback, useEffect, useState } from 'react';
import { formatCurrency } from '@velnox/utils';
import { apiClient } from '@/lib/api-client';

type SalesResponse = {
  totalRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
};

function toYmd(d: Date) {
  return d.toISOString().slice(0, 10);
}

/**
 * ประมาณการยอดที่จะโอนในรอบ 7 วัน
 * ใช้ analytics merchant/sales เป็นฐานจนกว่าจะมี settlement API จริง
 */
export default function PayoutPage() {
  const [today, setToday] = useState<SalesResponse | null>(null);
  const [week, setWeek] = useState<SalesResponse | null>(null);
  const [month, setMonth] = useState<SalesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const now = new Date();
      const end = toYmd(now);
      const dayStart = new Date(now);
      dayStart.setHours(0, 0, 0, 0);
      const weekStart = new Date(now);
      weekStart.setDate(weekStart.getDate() - 6);
      weekStart.setHours(0, 0, 0, 0);
      const monthStart = new Date(now);
      monthStart.setDate(monthStart.getDate() - 29);
      monthStart.setHours(0, 0, 0, 0);

      const [d, w, m] = await Promise.all([
        apiClient.get<SalesResponse>(`/analytics/merchant/sales?from=${toYmd(dayStart)}&to=${end}`),
        apiClient.get<SalesResponse>(`/analytics/merchant/sales?from=${toYmd(weekStart)}&to=${end}`),
        apiClient.get<SalesResponse>(`/analytics/merchant/sales?from=${toYmd(monthStart)}&to=${end}`),
      ]);
      setToday(d);
      setWeek(w);
      setMonth(m);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'โหลดไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  // สมมติ commission แพลตฟอร์ม 5% — ยอดสุทธิประมาณการ
  const commissionRate = 0.05;
  const weekGross = week?.totalRevenue ?? 0;
  const estimatedPayout = Math.max(0, weekGross * (1 - commissionRate));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">รายได้ที่จะโอน (7 วัน)</h1>
        <p className="text-sm text-slate-500">
          ประมาณการจากยอดขายในรอบสัปดาห์ · หักค่าธรรมเนียมแพลตฟอร์ม ~5%
        </p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>
      )}

      {loading ? (
        <div className="py-16 text-center text-sm text-slate-400">กำลังคำนวณ...</div>
      ) : (
        <>
          <div className="rounded-2xl border border-teal-100 bg-gradient-to-br from-teal-800 to-teal-600 p-6 text-white shadow-soft">
            <p className="text-sm opacity-90">ประมาณการยอดโอนรอบถัดไป</p>
            <p className="mt-1 text-3xl font-bold">{formatCurrency(estimatedPayout)}</p>
            <p className="mt-2 text-xs opacity-80">
              จากยอดขาย 7 วัน {formatCurrency(weekGross)} หักค่าธรรมเนียมประมาณ{' '}
              {formatCurrency(weekGross * commissionRate)}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { label: 'วันนี้', data: today },
              { label: '7 วัน', data: week },
              { label: '30 วัน', data: month },
            ].map((card) => (
              <div key={card.label} className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-xs font-medium text-slate-500">{card.label}</p>
                <p className="mt-1 text-xl font-bold text-slate-900">
                  {formatCurrency(card.data?.totalRevenue ?? 0)}
                </p>
                <p className="text-xs text-slate-500">{card.data?.totalOrders ?? 0} ออเดอร์</p>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-xs text-amber-900">
            ยังไม่มี settlement job จริง (โอนอัตโนมัติ / รายการรอโอน) — หน้านี้เป็นประมาณการจาก
            analytics เพื่อให้ร้านเห็นภาพรายได้ ขั้นถัดไป: ตาราง payout บน Neon + Center อนุมัติโอน
          </div>
        </>
      )}
    </div>
  );
}
