'use client';

import { useState } from 'react';
import { formatCurrency, formatDate } from '@velnox/utils';
import { Badge } from '@velnox/ui';
import { adminMerchants, type AdminMerchant } from '@/lib/mock-data';

const statusTone = { PENDING: 'warning', APPROVED: 'success', REJECTED: 'danger', SUSPENDED: 'neutral' } as const;
const statusLabel = { PENDING: 'รอตรวจสอบ', APPROVED: 'อนุมัติแล้ว', REJECTED: 'ปฏิเสธแล้ว', SUSPENDED: 'ถูกระงับ' } as const;

export function MerchantsView() {
  const [merchants, setMerchants] = useState<AdminMerchant[]>(adminMerchants);

  function updateStatus(id: string, status: AdminMerchant['status']) {
    setMerchants((prev) => prev.map((m) => (m.id === id ? { ...m, status } : m)));
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">ร้านค้า / พ่อค้าแม่ค้า</h1>
        <p className="text-sm text-slate-500">ตรวจสอบและอนุมัติคำขอเปิดร้านค้าใหม่</p>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs text-slate-500">
              <th className="px-4 py-3 font-medium">ร้านค้า</th>
              <th className="px-4 py-3 font-medium">เจ้าของ</th>
              <th className="px-4 py-3 font-medium">สินค้า</th>
              <th className="px-4 py-3 font-medium">ยอดขายรวม</th>
              <th className="px-4 py-3 font-medium">วันที่สมัคร</th>
              <th className="px-4 py-3 font-medium">สถานะ</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {merchants.map((m) => (
              <tr key={m.id} className="border-b border-slate-50 last:border-0">
                <td className="px-4 py-3 font-medium text-slate-800">{m.shopName}</td>
                <td className="px-4 py-3 text-slate-500">{m.ownerName}</td>
                <td className="px-4 py-3 text-slate-600">{m.productsCount}</td>
                <td className="px-4 py-3 text-slate-600">{formatCurrency(m.totalSales)}</td>
                <td className="px-4 py-3 text-slate-500">{formatDate(m.appliedAt)}</td>
                <td className="px-4 py-3"><Badge tone={statusTone[m.status]}>{statusLabel[m.status]}</Badge></td>
                <td className="px-4 py-3 text-right">
                  {m.status === 'PENDING' ? (
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => updateStatus(m.id, 'APPROVED')}
                        className="rounded-md bg-teal-700 px-3 py-1 text-xs font-medium text-white hover:bg-teal-800"
                      >
                        อนุมัติ
                      </button>
                      <button
                        onClick={() => updateStatus(m.id, 'REJECTED')}
                        className="rounded-md border border-red-300 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                      >
                        ปฏิเสธ
                      </button>
                    </div>
                  ) : m.status === 'APPROVED' ? (
                    <button
                      onClick={() => updateStatus(m.id, 'SUSPENDED')}
                      className="text-xs font-medium text-red-600 hover:underline"
                    >
                      ระงับร้านค้า
                    </button>
                  ) : (
                    <button className="text-xs font-medium text-teal-700 hover:underline">ดูรายละเอียด</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
