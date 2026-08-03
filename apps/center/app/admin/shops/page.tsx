'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Badge } from '@velnox/ui';
import { apiClient } from '@/lib/api-client';
import { shopStatusLabel, shopStatusTone } from '@/lib/order-status';
import { useLanguage } from '@/components/providers/language-provider';
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

const STATUS_FILTERS: { value: '' | ShopStatus; label: string }[] = [
  { value: '', label: 'ทั้งหมด' },
  { value: 'ACTIVE', label: 'เปิดใช้งาน' },
  { value: 'INACTIVE', label: 'ปิดชั่วคราว' },
  { value: 'SUSPENDED', label: 'ระงับ' },
];

export default function ShopsPage() {
  const { t } = useLanguage();
  const [shops, setShops] = useState<ApiShop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'' | ShopStatus>('');

  useEffect(() => {
    apiClient
      .get<ApiShop[]>('/shops')
      .then(setShops)
      .catch((err) => setError(err instanceof Error ? err.message : t('common.loading')))
      .finally(() => setLoading(false));
  }, [t]);

  const q = search.trim().toLowerCase();
  const filtered = shops.filter((s) => {
    if (statusFilter && s.status !== statusFilter) return false;
    if (!q) return true;
    return (
      s.name.toLowerCase().includes(q) ||
      (s.merchant?.user?.name ?? '').toLowerCase().includes(q) ||
      (s.merchant?.user?.email ?? '').toLowerCase().includes(q) ||
      s.id.toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">{t('admin.shopsTitle')}</h1>
          <p className="text-sm text-slate-500">
            {loading
              ? t('common.loading')
              : `${shops.length} ${t('admin.shopsSubtitle')}`}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหาชื่อร้าน / เจ้าของ..."
            className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-600"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as '' | ShopStatus)}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-600"
          >
            {STATUS_FILTERS.map((f) => (
              <option key={f.value || 'all'} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>
      )}

      {loading ? (
        <div className="py-16 text-center text-sm text-slate-400">{t('common.loading')}</div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 p-12 text-center text-sm text-slate-500">
          {t('admin.noShops')}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((s) => {
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
                  {t('admin.owner')}: {s.merchant?.user?.name ?? '—'}
                </p>
                <p className="mt-2 line-clamp-2 text-xs text-slate-500">
                  {s.description || '—'}
                </p>

                <div className="mt-3 text-xs font-medium text-slate-700">
                  {productCount.toLocaleString()} {t('admin.productCount')}
                </div>

                <Link
                  href={`/admin/shops/${s.id}`}
                  className="mt-4 block w-full rounded-md border border-slate-300 py-1.5 text-center text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  {t('admin.viewShop')}
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}