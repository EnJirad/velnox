'use client';

import { useEffect, useState } from 'react';
import { formatDate } from '@velnox/utils';
import { Badge } from '@velnox/ui';
import { apiClient } from '@/lib/api-client';
import type { ApiMerchant } from '@/lib/api-types';
import { merchantStatusLabel, merchantStatusTone } from '@/lib/order-status';

export function MerchantsView() {
  const [merchants, setMerchants] = useState<ApiMerchant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    apiClient
      .get<ApiMerchant[]>('/merchants')
      .then(setMerchants)
      .catch((err) => setError(err instanceof Error ? err.message : 'โหลดข้อมูลไม่สำเร็จ'))
      .finally(() => setLoading(false));
  }, []);

  async function updateStatus(id: string, status: ApiMerchant['status']) {
    setBusyId(id);
    setError(null);
    try {
      const updated = await apiClient.patch<ApiMerchant>(`/merchants/${id}/status`, { status });
      setMerchants((prev) => prev.map((m) => (m.id === id ? { ...m, ...updated } : m)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'อัปเดตสถานะไม่สำเร็จ');
    } finally {
      setBusyId(null);
    }
  }

  const pendingCount = merchants.filter((m) => m.status === 'PENDING').length;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">ร้านค้า / พ่อค้าแม่ค้า</h1>
        <p className="text-sm text-slate-500">
          {loading
            ? 'กำลังโหลด...'
            : `ทั้งหมด ${merchants.length} รายการ · รออนุมัติ ${pendingCount} ร้าน`}
        </p>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>
      )}

      {loading ? (
        <div className="py-16 text-center text-sm text-slate-400">กำลังโหลด...</div>
      ) : merchants.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 p-12 text-center text-sm text-slate-500">
          ยังไม่มีคำขอเปิดร้านค้า
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs text-slate-500">
                <th className="px-4 py-3 font-medium">ผู้สมัคร</th>
                <th className="px-4 py-3 font-medium">ร้านค้า</th>
                <th className="px-4 py-3 font-medium">วันที่สมัคร</th>
                <th className="px-4 py-3 font-medium">สถานะ</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {merchants.map((m) => (
                <tr key={m.id} className="border-b border-slate-50 last:border-0">
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-800">{m.user?.name ?? '-'}</div>
                    <div className="text-xs text-slate-400">{m.user?.email}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {m.shops?.[0]?.name ?? '— ยังไม่ได้ตั้งค่าร้าน —'}
                  </td>
                  <td className="px-4 py-3 text-slate-500">{formatDate(m.createdAt)}</td>
                  <td className="px-4 py-3">
                    <Badge tone={merchantStatusTone[m.status] ?? 'neutral'}>
                      {merchantStatusLabel[m.status] ?? m.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {m.status === 'PENDING' ? (
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => updateStatus(m.id, 'APPROVED')}
                          disabled={busyId === m.id}
                          className="rounded-md bg-teal-700 px-3 py-1 text-xs font-medium text-white hover:bg-teal-800 disabled:opacity-60"
                        >
                          อนุมัติ
                        </button>
                        <button
                          type="button"
                          onClick={() => updateStatus(m.id, 'REJECTED')}
                          disabled={busyId === m.id}
                          className="rounded-md border border-red-300 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-60"
                        >
                          ปฏิเสธ
                        </button>
                      </div>
                    ) : m.status === 'APPROVED' ? (
                      <button
                        type="button"
                        onClick={() => updateStatus(m.id, 'SUSPENDED')}
                        disabled={busyId === m.id}
                        className="text-xs font-medium text-red-600 hover:underline disabled:opacity-60"
                      >
                        ระงับร้านค้า
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => updateStatus(m.id, 'APPROVED')}
                        disabled={busyId === m.id}
                        className="text-xs font-medium text-teal-700 hover:underline disabled:opacity-60"
                      >
                        อนุมัติอีกครั้ง
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}