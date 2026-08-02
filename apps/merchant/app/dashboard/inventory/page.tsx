'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Badge } from '@velnox/ui';
import { apiClient } from '@/lib/api-client';
import type { ApiProduct } from '@/lib/api-types';
import { useLanguage } from '@/components/providers/language-provider';

export default function InventoryPage() {
  const { t } = useLanguage();
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    apiClient
      .get<ApiProduct[]>('/products/me')
      .then((data) => {
        if (!cancelled) {
          const list = Array.isArray(data) ? data : [];
          setProducts(list.filter((p) => p.status !== 'ARCHIVED'));
        }
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Error');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const lowStock = useMemo(
    () => products.filter((p) => p.stock > 0 && p.stock <= 10),
    [products],
  );
  const outOfStock = useMemo(() => products.filter((p) => p.stock === 0), [products]);

  function stockMeta(stock: number) {
    if (stock === 0) {
      return { tone: 'danger' as const, label: t('merchant.stockOut'), bar: 'bg-red-500', pct: 0 };
    }
    if (stock <= 10) {
      return {
        tone: 'warning' as const,
        label: t('merchant.stockLow'),
        bar: 'bg-amber-500',
        pct: Math.min(100, (stock / 20) * 100),
      };
    }
    return {
      tone: 'success' as const,
      label: t('merchant.stockOk'),
      bar: 'bg-emerald-500',
      pct: Math.min(100, (stock / 100) * 100),
    };
  }

  if (loading) {
    return <div className="py-20 text-center text-sm text-slate-400">{t('common.loading')}</div>;
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">{t('merchant.inventoryTitle')}</h1>
        <p className="text-sm text-slate-500">{t('merchant.inventorySubtitle')}</p>
      </div>

      {(lowStock.length > 0 || outOfStock.length > 0) && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {t('merchant.stockLow')}: {lowStock.length} · {t('merchant.stockOut')}: {outOfStock.length}
        </div>
      )}

      {products.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <p className="text-sm text-slate-600">{t('merchant.noProducts')}</p>
          <Link
            href="/dashboard/products/new"
            className="mt-4 inline-flex rounded-md bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800"
          >
            + {t('merchant.products')}
          </Link>
        </div>
      ) : (
        <>
          {/* Mobile cards */}
          <div className="flex flex-col gap-3 sm:hidden">
            {products.map((p) => {
              const meta = stockMeta(p.stock);
              return (
                <div key={p.id} className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                  <div className="flex gap-3">
                    {p.images[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p.images[0].url}
                        alt=""
                        className="h-14 w-14 shrink-0 rounded-lg object-cover"
                      />
                    ) : (
                      <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-400">
                        —
                      </span>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-slate-900">{p.name}</p>
                      <p className="mt-0.5 text-sm text-slate-600">
                        {t('merchant.stockCurrent')}: {p.stock} {t('merchant.units')}
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                          <div className={`h-full \( {meta.bar}`} style={{ width: ` \){meta.pct}%` }} />
                        </div>
                        <Badge tone={meta.tone}>{meta.label}</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 border-t border-slate-100 pt-2 text-right">
                    <Link
                      href={`/dashboard/products/${p.id}/edit`}
                      className="text-xs font-medium text-teal-700 hover:underline"
                    >
                      {t('common.edit')}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop table */}
          <div className="hidden overflow-x-auto rounded-xl border border-slate-200 bg-white sm:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs text-slate-500">
                  <th className="px-4 py-3 font-medium">{t('merchant.productCol')}</th>
                  <th className="px-4 py-3 font-medium">{t('merchant.stockCurrent')}</th>
                  <th className="px-4 py-3 font-medium">{t('merchant.stockLevel')}</th>
                  <th className="px-4 py-3 font-medium">{t('merchant.statusCol')}</th>
                  <th className="px-4 py-3 font-medium" />
                </tr>
              </thead>
              <tbody>
                {products.map((p) => {
                  const meta = stockMeta(p.stock);
                  return (
                    <tr key={p.id} className="border-b border-slate-50 last:border-0">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {p.images[0] ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={p.images[0].url}
                              alt=""
                              className="h-9 w-9 rounded-lg object-cover"
                            />
                          ) : (
                            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-xs text-slate-400">
                              —
                            </span>
                          )}
                          <span className="font-medium text-slate-800">{p.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {p.stock} {t('merchant.units')}
                      </td>
                      <td className="px-4 py-3">
                        <div className="h-2 w-28 overflow-hidden rounded-full bg-slate-100 sm:w-32">
                          <div className={`h-full \( {meta.bar}`} style={{ width: ` \){meta.pct}%` }} />
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge tone={meta.tone}>{meta.label}</Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/dashboard/products/${p.id}/edit`}
                          className="text-xs font-medium text-teal-700 hover:underline"
                        >
                          {t('common.edit')}
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}