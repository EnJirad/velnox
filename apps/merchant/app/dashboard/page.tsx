'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { formatCurrency, formatDate } from '@velnox/utils';
import { Badge, Card } from '@velnox/ui';
import { apiClient } from '@/lib/api-client';
import { useLanguage } from '@/components/providers/language-provider';

type Dash = {
  revenueToday: number;
  revenueYesterday: number;
  ordersToday: number;
  ordersYesterday: number;
  pendingOrders: number;
  lowStockCount: number;
  productCount: number;
  salesLast7Days: { date: string; label: string; amount: number }[];
  recentItems: {
    id: string;
    orderNumber: string;
    productName: string;
    quantity: number;
    amount: number;
    status: string;
    createdAt: string;
  }[];
};

const STATUS_KEY: Record<string, 'statusPending' | 'statusConfirmed' | 'statusProcessing' | 'statusShipped' | 'statusDelivered' | 'statusCancelled'> = {
  PENDING: 'statusPending',
  CONFIRMED: 'statusConfirmed',
  PROCESSING: 'statusProcessing',
  SHIPPED: 'statusShipped',
  DELIVERED: 'statusDelivered',
  CANCELLED: 'statusCancelled',
};

const statusTone: Record<string, 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'primary'> = {
  PENDING: 'warning',
  CONFIRMED: 'info',
  PROCESSING: 'primary',
  SHIPPED: 'info',
  DELIVERED: 'success',
  CANCELLED: 'danger',
};

function pctChange(current: number, previous: number) {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

export default function DashboardHomePage() {
  const { t } = useLanguage();
  const [data, setData] = useState<Dash | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    apiClient
      .get<Dash>('/analytics/merchant/dashboard')
      .then((res) => {
        if (!cancelled) setData(res);
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

  if (loading) {
    return <div className="py-20 text-center text-sm text-slate-400">{t('common.loading')}</div>;
  }

  if (error || !data) {
    return (
      <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
        {error ?? t('merchant.noOrdersYet')}
      </div>
    );
  }

  const revPct = pctChange(data.revenueToday, data.revenueYesterday);
  const ordPct = pctChange(data.ordersToday, data.ordersYesterday);
  const maxSales = Math.max(1, ...data.salesLast7Days.map((d) => d.amount));
  const hasSales = data.salesLast7Days.some((d) => d.amount > 0);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">{t('merchant.dashboardTitle')}</h1>
        <p className="text-sm text-slate-500">{t('merchant.dashboardSubtitle')}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <p className="text-xs text-slate-500">{t('merchant.revenueToday')}</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{formatCurrency(data.revenueToday)}</p>
          <p className={`mt-1 text-xs font-medium ${revPct >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            {revPct >= 0 ? '+' : ''}
            {revPct}% {t('merchant.vsYesterday')}
          </p>
        </Card>
        <Card>
          <p className="text-xs text-slate-500">{t('merchant.ordersToday')}</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{data.ordersToday}</p>
          <p className={`mt-1 text-xs font-medium ${ordPct >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            {ordPct >= 0 ? '+' : ''}
            {ordPct}% {t('merchant.vsYesterday')}
          </p>
        </Card>
        <Card>
          <p className="text-xs text-slate-500">{t('merchant.pendingOrders')}</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{data.pendingOrders}</p>
        </Card>
        <Card>
          <p className="text-xs text-slate-500">{t('merchant.lowStock')}</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{data.lowStockCount}</p>
          <p className="mt-1 text-xs text-slate-500">
            {t('merchant.productsInShop')}: {data.productCount}
          </p>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <Card>
          <p className="mb-4 text-sm font-semibold text-slate-900">{t('merchant.salesLast7Days')}</p>
          {!hasSales ? (
            <p className="py-12 text-center text-sm text-slate-400">{t('merchant.noSalesInPeriod')}</p>
          ) : (
            <div className="flex h-48 items-end gap-2 sm:gap-3">
              {data.salesLast7Days.map((d) => (
                <div key={d.date} className="flex flex-1 flex-col items-center gap-2">
                  <div
                    className="w-full min-h-[4px] rounded-t-md bg-teal-600"
                    style={{ height: `${Math.max(4, (d.amount / maxSales) * 100)}%` }}
                    title={formatCurrency(d.amount)}
                  />
                  <span className="text-[10px] text-slate-500 sm:text-xs">{d.label}</span>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <p className="mb-4 text-sm font-semibold text-slate-900">{t('merchant.todos')}</p>
          <ul className="flex flex-col gap-3 text-sm">
            <li className="flex items-center justify-between gap-2">
              <span className="text-slate-600">{t('merchant.pendingOrders')}</span>
              <Badge tone="warning">{data.pendingOrders}</Badge>
            </li>
            <li className="flex items-center justify-between gap-2">
              <span className="text-slate-600">{t('merchant.lowStock')}</span>
              <Badge tone="danger">{data.lowStockCount}</Badge>
            </li>
            <li className="flex items-center justify-between gap-2">
              <span className="text-slate-600">{t('merchant.productsInShop')}</span>
              <Badge tone="neutral">{data.productCount}</Badge>
            </li>
          </ul>
        </Card>
      </div>

      <Card className="p-0">
        <div className="flex items-center justify-between border-b border-slate-100 p-4">
          <p className="text-sm font-semibold text-slate-900">{t('merchant.recentSales')}</p>
          <Link href="/dashboard/orders" className="text-xs font-medium text-teal-700 hover:underline">
            {t('common.seeAll')}
          </Link>
        </div>
        {data.recentItems.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-slate-400">{t('merchant.noOrdersYet')}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs text-slate-500">
                  <th className="px-4 py-2 font-medium">{t('merchant.orderCol')}</th>
                  <th className="px-4 py-2 font-medium">{t('merchant.productCol')}</th>
                  <th className="px-4 py-2 font-medium">{t('merchant.amountCol')}</th>
                  <th className="px-4 py-2 font-medium">{t('merchant.statusCol')}</th>
                </tr>
              </thead>
              <tbody>
                {data.recentItems.map((row) => {
                  const statusKey = STATUS_KEY[row.status];
                  return (
                    <tr key={row.id} className="border-b border-slate-50 last:border-0">
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-800">#{row.orderNumber}</p>
                        <p className="text-xs text-slate-400">{formatDate(row.createdAt)}</p>
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {row.productName} × {row.quantity}
                      </td>
                      <td className="px-4 py-3 text-slate-800">{formatCurrency(row.amount)}</td>
                      <td className="px-4 py-3">
                        <Badge tone={statusTone[row.status] ?? 'neutral'}>
                          {statusKey ? t(`merchant.${statusKey}`) : row.status}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}