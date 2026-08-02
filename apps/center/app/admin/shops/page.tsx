'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Badge } from '@velnox/ui';
import { apiClient } from '@/lib/api-client';
import { shopStatusLabel, shopStatusTone } from '@/lib/order-status';
import type { ShopStatus } from '@velnox/types';

type ApiShop = {
  id: string;
  name: string;
  description?: string | null;
  status: ShopStatus;
  merchant?: {
    status: string;
    user?: { name: string; email: string };
  };
  _count?: { products: number };
};

export default function ShopsPage() {
  const [shops, setShops] = useState<ApiShop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiClient
      .get<ApiShop[]>('/shops')
      .then(setShops)
      .catch((err) => setError(err instanceof Error ? err.message : 'โหลดข้อมูลไม่สำเร็จ'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">หน้าร้านค้าทั้งหมด</h1>
        <p className="text-sm text-slate-500">
          {loading ? 'กำลังโหลด...' : `${shops.length} ร้านบน VelShop`}
        </p>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>
      )}

      {loading ? (
        <div className="py-16 text-center text-sm text-slate-400">กำลังโหลด...</div>
      ) : shops.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 p-12 text-center text-sm text-slate-500">
          ยังไม่มีร้านค้าในระบบ
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {shops.map((s) => {
            const productCount = s._count?.products ?? 0;
            return (
              <div
                key={s.id}
                className="flex flex-col rounded-xl border border-slate-200 bg-white p-5"
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-100 text-sm font-semibold text-teal-700">
                    {s.name.slice(0, 2).toUpperCase()}
                  </span>
                  <Badge tone={shopStatusTone[s.status] ?? 'neutral'}>
                    {shopStatusLabel[s.status] ?? s.status}
                  </Badge>
                </div>

                <p className="text-sm font-semibold text-slate-900">{s.name}</p>
                <p className="mt-0.5 text-xs text-slate-400">
                  เจ้าของ: {s.merchant?.user?.name ?? '—'}
                </p>
                <p className="mt-2 line-clamp-2 text-xs text-slate-500">
                  {s.description || 'ไม่มีคำอธิบาย'}
                </p>

                <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                  <span className="font-medium text-slate-700">
                    {productCount.toLocaleString('th-TH')} สินค้า
                  </span>
                </div>

                <Link
                  href={`/admin/shops/${s.id}`}
                  className="mt-4 block w-full rounded-md border border-slate-300 py-1.5 text-center text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  ดูรายละเอียดร้านค้า
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}