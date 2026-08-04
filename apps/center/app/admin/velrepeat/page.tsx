'use client';

import { useCallback, useEffect, useState } from 'react';
import { formatCurrency, formatDate } from '@velnox/utils';
import { apiClient } from '@/lib/api-client';

type PackStatus = 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED' | '';

type PackRow = {
  id: string;
  planCode: string;
  frequency: string;
  totalUnits: number;
  remainingUnits: number;
  unitsPerDelivery: number;
  unitPrice: string | number;
  packPrice: string | number;
  freeShipping: boolean;
  status: string;
  nextDeliveryDate: string;
  createdAt: string;
  product?: {
    id: string;
    name: string;
    images?: { url: string }[];
    shop?: { id: string; name: string };
  };
  user?: { id: string; name: string; email: string };
  deliveries?: { id: string; scheduledAt: string; deliveredAt?: string | null; units: number }[];
};

type Summary = {
  active: number;
  paused: number;
  completed: number;
  cancelled: number;
  total: number;
  totalRevenue?: number;
};

const STATUS_LABEL: Record<string, string> = {
  ACTIVE: 'ใช้งาน',
  PAUSED: 'พัก',
  COMPLETED: 'ครบแล้ว',
  CANCELLED: 'ยกเลิก',
};

const STATUS_CLASS: Record<string, string> = {
  ACTIVE: 'bg-emerald-50 text-emerald-700',
  PAUSED: 'bg-amber-50 text-amber-700',
  COMPLETED: 'bg-slate-100 text-slate-600',
  CANCELLED: 'bg-red-50 text-red-600',
};

const FREQ_LABEL: Record<string, string> = {
  WEEKLY: 'รายสัปดาห์',
  BI_WEEKLY: 'ทุก 2 สัปดาห์',
  MONTHLY: 'รายเดือน',
};

export default function AdminVelRepeatPage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [packs, setPacks] = useState<PackRow[]>([]);
  const [status, setStatus] = useState<PackStatus>('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const qs = status ? `?status=${status}` : '';
      const [sum, list] = await Promise.all([
        apiClient.get<Summary>('/velrepeat/summary'),
        apiClient.get<PackRow[]>(`/velrepeat/admin/packs${qs}`),
      ]);
      setSummary(sum);
      setPacks(Array.isArray(list) ? list : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'โหลดไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    void load();
  }, [load]);

  const q = search.trim().toLowerCase();
  const filtered = !q
    ? packs
    : packs.filter((p) => {
        const hay = [
          p.planCode,
          p.product?.name,
          p.product?.shop?.name,
          p.user?.name,
          p.user?.email,
          p.id,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        return hay.includes(q);
      });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">VelRepeat แพ็กส่งประจำ</h1>
          <p className="text-sm text-slate-500">
            ตรวจสอบแพ็กทั้งแพลตฟอร์ม · สถานะ · รายได้ · รอบส่งถัดไป
          </p>
        </div>
        <button
          type="button"
          onClick={() => load()}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
        >
          รีเฟรช
        </button>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {[
          { label: 'ทั้งหมด', value: summary?.total ?? '—', tone: 'text-slate-900' },
          { label: 'ใช้งาน', value: summary?.active ?? '—', tone: 'text-emerald-700' },
          { label: 'พัก', value: summary?.paused ?? '—', tone: 'text-amber-700' },
          { label: 'ครบแล้ว', value: summary?.completed ?? '—', tone: 'text-slate-600' },
          {
            label: 'รายได้แพ็ก (รวม)',
            value: summary ? formatCurrency(summary.totalRevenue ?? 0) : '—',
            tone: 'text-teal-700',
          },
        ].map((c) => (
          <div
            key={c.label}
            className="rounded-xl border border-slate-200 bg-white px-4 py-3"
          >
            <p className="text-xs text-slate-500">{c.label}</p>
            <p className={`mt-1 text-xl font-bold ${c.tone}`}>{c.value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {(
          [
            { key: '', label: 'ทุกสถานะ' },
            { key: 'ACTIVE', label: 'ใช้งาน' },
            { key: 'PAUSED', label: 'พัก' },
            { key: 'COMPLETED', label: 'ครบแล้ว' },
            { key: 'CANCELLED', label: 'ยกเลิก' },
          ] as { key: PackStatus; label: string }[]
        ).map((f) => (
          <button
            key={f.key || 'all'}
            type="button"
            onClick={() => setStatus(f.key)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium ${
              status === f.key
                ? 'bg-teal-700 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {f.label}
          </button>
        ))}
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="ค้นหาสินค้า / ลูกค้า / ร้าน / แผน..."
          className="ml-auto min-w-[200px] flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-600 sm:max-w-xs"
        />
      </div>

      {loading ? (
        <div className="py-16 text-center text-sm text-slate-400">กำลังโหลด...</div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs text-slate-500">
                <th className="px-4 py-3 font-medium">สินค้า / แผน</th>
                <th className="px-4 py-3 font-medium">ลูกค้า</th>
                <th className="px-4 py-3 font-medium">ร้าน</th>
                <th className="px-4 py-3 font-medium">เครดิต</th>
                <th className="px-4 py-3 font-medium">ราคาแพ็ก</th>
                <th className="px-4 py-3 font-medium">ส่งถัดไป</th>
                <th className="px-4 py-3 font-medium">สถานะ</th>
                <th className="px-4 py-3 font-medium">ซื้อเมื่อ</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    ยังไม่มีแพ็ก
                  </td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p.id} className="border-b border-slate-50 last:border-0">
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-800">
                        {p.product?.name ?? '—'}
                      </div>
                      <div className="text-xs text-slate-400">
                        {p.planCode} · {FREQ_LABEL[p.frequency] ?? p.frequency}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      <div>{p.user?.name ?? '—'}</div>
                      <div className="text-xs text-slate-400">{p.user?.email}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {p.product?.shop?.name ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {p.remainingUnits}/{p.totalUnits}
                      <span className="block text-xs text-slate-400">
                        ส่งครั้งละ {p.unitsPerDelivery}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-800">
                      {formatCurrency(Number(p.packPrice))}
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {p.status === 'ACTIVE' || p.status === 'PAUSED'
                        ? formatDate(p.nextDeliveryDate)
                        : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                          STATUS_CLASS[p.status] ?? 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {STATUS_LABEL[p.status] ?? p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{formatDate(p.createdAt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
