'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { formatCurrency } from '@velnox/utils';
import { Badge } from '@velnox/ui';
import { apiClient } from '@/lib/api-client';
import type { ApiProduct } from '@/lib/api-types';

const statusTone = { ACTIVE: 'success', DRAFT: 'neutral', INACTIVE: 'danger', ARCHIVED: 'neutral' } as const;
const statusLabel = { ACTIVE: 'เผยแพร่แล้ว', DRAFT: 'ฉบับร่าง', INACTIVE: 'ปิดการขาย', ARCHIVED: 'เก็บถาวร' } as const;

export function ProductsView() {
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiClient
      .get<ApiProduct[]>('/products/me')
      .then(setProducts)
      .catch((err) => setError(err instanceof Error ? err.message : 'โหลดข้อมูลไม่สำเร็จ'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">สินค้าของฉัน</h1>
          <p className="text-sm text-slate-500">จัดการรายการสินค้าในร้าน {products.length} รายการ</p>
        </div>
        <Link
          href="/dashboard/products/new"
          className="rounded-md bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800"
        >
          + เพิ่มสินค้าใหม่
        </Link>
      </div>

      {error && <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>}

      {loading ? (
        <div className="py-16 text-center text-sm text-slate-400">กำลังโหลด...</div>
      ) : products.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 p-12 text-center text-sm text-slate-500">
          ยังไม่มีสินค้าในร้าน — เริ่มเพิ่มสินค้าแรกของคุณกันเลย
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs text-slate-500">
                <th className="px-4 py-3 font-medium">สินค้า</th>
                <th className="px-4 py-3 font-medium">ราคา</th>
                <th className="px-4 py-3 font-medium">สต็อก</th>
                <th className="px-4 py-3 font-medium">สถานะ</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {p.images[0] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.images[0].url} alt="" className="h-10 w-10 rounded-lg object-cover" />
                      ) : (
                        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-50 text-lg">📦</span>
                      )}
                      <span className="font-medium text-slate-800">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-800">{formatCurrency(Number(p.price))}</td>
                  <td className="px-4 py-3">
                    <span className={p.stock === 0 ? 'font-medium text-red-600' : p.stock <= 10 ? 'font-medium text-amber-600' : 'text-slate-600'}>
                      {p.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3"><Badge tone={statusTone[p.status]}>{statusLabel[p.status]}</Badge></td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/dashboard/products/${p.id}/edit`} className="text-xs font-medium text-teal-700 hover:underline">
                      แก้ไข
                    </Link>
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
