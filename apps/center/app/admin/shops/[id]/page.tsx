'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { formatCurrency } from '@velnox/utils';
import { Badge } from '@velnox/ui';
import { apiClient } from '@/lib/api-client';
import {
  productStatusLabel,
  productStatusTone,
  shopStatusLabel,
  shopStatusTone,
} from '@/lib/order-status';
import { useLanguage } from '@/components/providers/language-provider';
import type { ProductStatus, ShopStatus } from '@velnox/types';

type ShopProduct = {
  id: string;
  name: string;
  price: number | string;
  stock: number;
  status: ProductStatus;
  description?: string | null;
  images?: { url: string }[];
  category?: { name: string } | null;
};

type ShopDetail = {
  id: string;
  name: string;
  description?: string | null;
  status: ShopStatus;
  createdAt: string;
  merchant?: {
    status: string;
    user?: { name: string; email: string };
  };
  products: ShopProduct[];
  _count?: { products: number };
};

export default function ShopDetailPage() {
  const params = useParams();
  const id = String(params.id ?? '');
  const { t } = useLanguage();

  const [shop, setShop] = useState<ShopDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    apiClient
      .get<ShopDetail>(`/shops/${id}`)
      .then(setShop)
      .catch((err) =>
        setError(err instanceof Error ? err.message : t('admin.shopNotFound')),
      )
      .finally(() => setLoading(false));
  }, [id, t]);

  if (loading) {
    return (
      <div className="py-20 text-center text-sm text-slate-400">{t('common.loading')}</div>
    );
  }

  if (error || !shop) {
    return (
      <div className="flex flex-col gap-4">
        <Link href="/admin/shops" className="text-sm font-medium text-teal-700 hover:underline">
          ← {t('admin.backToShops')}
        </Link>
        <div className="rounded-lg bg-red-50 p-6 text-center text-red-600">
          {error || t('admin.shopNotFound')}
        </div>
      </div>
    );
  }

  const products = shop.products ?? [];
  const totalProducts = shop._count?.products ?? products.length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link href="/admin/shops" className="text-xs font-medium text-teal-700 hover:underline">
            ← {t('admin.backToShops')}
          </Link>
          <h1 className="mt-2 text-xl font-semibold text-slate-900">{shop.name}</h1>
          <p className="mt-1 text-sm text-slate-500">
            {shop.description || '—'}
          </p>
        </div>
        <Badge tone={shopStatusTone[shop.status] ?? 'neutral'}>
          {shopStatusLabel[shop.status] ?? shop.status}
        </Badge>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-500">{t('admin.productCount')}</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">
            {totalProducts.toLocaleString()}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-500">{t('admin.owner')}</p>
          <p className="mt-1 text-sm font-semibold text-slate-900">
            {shop.merchant?.user?.name ?? '—'}
          </p>
          <p className="text-xs text-slate-400">{shop.merchant?.user?.email}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-500">{t('admin.merchantStatus')}</p>
          <p className="mt-1 text-sm font-semibold text-slate-900">
            {shop.merchant?.status ?? '—'}
          </p>
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold text-slate-900">
          {t('admin.productsInShop')} ({products.length})
        </h2>

        {products.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500">
            {t('admin.noProductsInShop')}
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs text-slate-500">
                  <th className="px-4 py-3 font-medium">{t('admin.products')}</th>
                  <th className="px-4 py-3 font-medium">หมวดหมู่</th>
                  <th className="px-4 py-3 font-medium">ราคา</th>
                  <th className="px-4 py-3 font-medium">สต็อก</th>
                  <th className="px-4 py-3 font-medium">{t('admin.colStatus')}</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="border-b border-slate-50 last:border-0">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {p.images?.[0]?.url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={p.images[0].url}
                            alt=""
                            className="h-10 w-10 rounded-lg object-cover"
                          />
                        ) : (
                          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-xs text-slate-400">
                            —
                          </span>
                        )}
                        <div>
                          <p className="font-medium text-slate-800">{p.name}</p>
                          {p.description && (
                            <p className="line-clamp-1 text-xs text-slate-400">{p.description}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{p.category?.name ?? '—'}</td>
                    <td className="px-4 py-3 text-slate-800">
                      {formatCurrency(Number(p.price))}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{p.stock}</td>
                    <td className="px-4 py-3">
                      <Badge tone={productStatusTone[p.status] ?? 'neutral'}>
                        {productStatusLabel[p.status] ?? p.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}