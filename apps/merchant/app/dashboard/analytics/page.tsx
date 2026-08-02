'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { formatCurrency } from '@velnox/utils';
import { Card } from '@velnox/ui';
import { apiClient } from '@/lib/api-client';
import { useLanguage } from '@/components/providers/language-provider';

type Period = 'day' | 'week' | 'month' | 'year' | 'custom';

type SalesResponse = {
  totalRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
  series: { date: string; amount: number }[];
  topProducts: { productId: string; name: string; qty: number; revenue: number }[];
};

function toYmd(d: Date) {
  return d.toISOString().slice(0, 10);
}

function rangeForPeriod(period: Period): { from: string; to: string } {
  const to = new Date();
  to.setHours(23, 59, 59, 999);
  const from = new Date(to);

  switch (period) {
    case 'day':
      from.setHours(0, 0, 0, 0);
      break;
    case 'week':
      from.setDate(from.getDate() - 6);
      from.setHours(0, 0, 0, 0);
      break;
    case 'month':
      from.setDate(from.getDate() - 29);
      from.setHours(0, 0, 0, 0);
      break;
    case 'year':
      from.setFullYear(from.getFullYear() - 1);
      from.setHours(0, 0, 0, 0);
      break;
    default:
      from.setDate(from.getDate() - 29);
      from.setHours(0, 0, 0, 0);
  }

  return { from: toYmd(from), to: toYmd(to) };
}

export default function AnalyticsPage() {
  const { t } = useLanguage();
  const [period, setPeriod] = useState<Period>('week');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [data, setData] = useState<SalesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (from: string, to: string) => {
      setLoading(true);
      setError(null);
      try {
        const qs = new URLSearchParams({ from, to });
        const res = await apiClient.get<SalesResponse>(`/analytics/merchant/sales?${qs.toString()}`);
        setData(res);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Error');
        setData(null);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    if (period === 'custom') return;
    const { from, to } = rangeForPeriod(period);
    void load(from, to);
  }, [period, load]);

  function applyCustom() {
    if (!customFrom || !customTo) return;
    void load(customFrom, customTo);
  }

  const maxAmount = useMemo(
    () => Math.max(1, ...(data?.series.map((s) => s.amount) ?? [0])),
    [data],
  );

  const periods: { key: Period; label: string }[] = [
    { key: 'day', label: t('merchant.periodDay') },
    { key: 'week', label: t('merchant.periodWeek') },
    { key: 'month', label: t('merchant.periodMonth') },
    { key: 'year', label: t('merchant.periodYear') },
    { key: 'custom', label: t('merchant.periodCustom') },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">{t('merchant.analyticsTitle')}</h1>
        <p className="text-sm text-slate-500">{t('merchant.analyticsSubtitle')}</p>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap gap-2">
          {periods.map((p) => (
            <button
              key={p.key}
              type="button"
              onClick={() => setPeriod(p.key)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                period === p.key
                  ? 'bg-teal-700 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {period === 'custom' && (
          <div className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-end">
            <div className="flex flex-1 flex-col gap-1">
              <label className="text-xs font-medium text-slate-600">{t('merchant.fromDate')}</label>
              <input
                type="date"
                value={customFrom}
                onChange={(e) => setCustomFrom(e.target.value)}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-600"
              />
            </div>
            <div className="flex flex-1 flex-col gap-1">
              <label className="text-xs font-medium text-slate-600">{t('merchant.toDate')}</label>
              <input
                type="date"
                value={customTo}
                onChange={(e) => setCustomTo(e.target.value)}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-600"
              />
            </div>
            <button
              type="button"
              onClick={applyCustom}
              disabled={!customFrom || !customTo}
              className="rounded-md bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800 disabled:opacity-50"
            >
              {t('merchant.applyRange')}
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="py-16 text-center text-sm text-slate-400">{t('common.loading')}</div>
      ) : error ? (
        <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      ) : !data ? (
        <p className="py-12 text-center text-sm text-slate-400">{t('merchant.noAnalyticsData')}</p>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <p className="text-xs text-slate-500">{t('merchant.totalRevenue')}</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">
                {formatCurrency(data.totalRevenue)}
              </p>
            </Card>
            <Card>
              <p className="text-xs text-slate-500">{t('merchant.totalOrders')}</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{data.totalOrders}</p>
            </Card>
            <Card>
              <p className="text-xs text-slate-500">{t('merchant.avgOrderValue')}</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">
                {formatCurrency(data.avgOrderValue)}
              </p>
            </Card>
          </div>

          <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
            <Card>
              <p className="mb-4 text-sm font-semibold text-slate-900">{t('merchant.salesTrend')}</p>
              {data.series.every((s) => s.amount === 0) ? (
                <p className="py-12 text-center text-sm text-slate-400">
                  {t('merchant.noAnalyticsData')}
                </p>
              ) : (
                <div className="flex h-56 items-end gap-0.5 overflow-x-auto sm:gap-1">
                  {data.series.map((s) => (
                    <div
                      key={s.date}
                      className="flex min-w-[8px] flex-1 flex-col items-center gap-1 sm:min-w-[12px]"
                      title={`${s.date}: ${formatCurrency(s.amount)}`}
                    >
                      <div
                        className="w-full min-h-[2px] rounded-t bg-gradient-to-t from-teal-700 to-teal-400"
                        style={{ height: `${Math.max(2, (s.amount / maxAmount) * 100)}%` }}
                      />
                    </div>
                  ))}
                </div>
              )}
              {data.series.length > 0 && (
                <div className="mt-2 flex justify-between text-[10px] text-slate-400">
                  <span>{data.series[0]?.date}</span>
                  <span>{data.series[data.series.length - 1]?.date}</span>
                </div>
              )}
            </Card>

            <Card>
              <p className="mb-4 text-sm font-semibold text-slate-900">{t('merchant.topProducts')}</p>
              {data.topProducts.length === 0 ? (
                <p className="py-8 text-center text-sm text-slate-400">
                  {t('merchant.noAnalyticsData')}
                </p>
              ) : (
                <ul className="flex flex-col gap-3">
                  {data.topProducts.map((p, i) => (
                    <li key={p.productId} className="flex items-start gap-3">
                      <span className="w-5 shrink-0 text-xs font-semibold text-slate-400">
                        {i + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-slate-800">{p.name}</p>
                        <p className="text-xs text-slate-400">
                          {t('merchant.soldQty')}: {p.qty} · {formatCurrency(p.revenue)}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>
        </>
      )}
    </div>
  );
}