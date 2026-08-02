'use client';

import { useEffect, useState } from 'react';
import { formatCurrency, formatDate } from '@velnox/utils';
import { Badge } from '@velnox/ui';
import { apiClient } from '@/lib/api-client';
import {
  orderStatusLabel,
  orderStatusTone,
  paymentStatusLabel,
} from '@/lib/order-status';
import { useLanguage } from '@/components/providers/language-provider';
import type { Order } from '@velnox/types';

export default function OrdersPage() {
  const { t } = useLanguage();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiClient
      .get<Order[]>('/orders')
      .then(setOrders)
      .catch((err) =>
        setError(err instanceof Error ? err.message : t('common.loading')),
      )
      .finally(() => setLoading(false));
  }, [t]);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">{t('admin.ordersTitle')}</h1>
        <p className="text-sm text-slate-500">
          {loading
            ? t('common.loading')
            : `${orders.length.toLocaleString()} ${t('admin.ordersCount')}`}
        </p>
        {!loading && (
          <p className="mt-0.5 text-xs text-slate-400">{t('admin.ordersSubtitle')}</p>
        )}
      </div>

      {error && (
        <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>
      )}

      {loading ? (
        <div className="py-16 text-center text-sm text-slate-400">{t('common.loading')}</div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs text-slate-500">
                <th className="px-4 py-3 font-medium">{t('admin.colOrder')}</th>
                <th className="px-4 py-3 font-medium">{t('admin.colDate')}</th>
                <th className="px-4 py-3 font-medium">{t('admin.colTotal')}</th>
                <th className="px-4 py-3 font-medium">{t('admin.colPayment')}</th>
                <th className="px-4 py-3 font-medium">{t('admin.colStatus')}</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    {t('admin.noOrders')}
                  </td>
                </tr>
              ) : (
                orders.map((o) => (
                  <tr key={o.id} className="border-b border-slate-50 last:border-0">
                    <td className="px-4 py-3 font-medium text-slate-800">
                      #{o.orderNumber}
                    </td>
                    <td className="px-4 py-3 text-slate-500">{formatDate(o.createdAt)}</td>
                    <td className="px-4 py-3 text-slate-800">
                      {formatCurrency(o.total)}
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {paymentStatusLabel[o.paymentStatus] ?? o.paymentStatus}
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={orderStatusTone[o.status] ?? 'neutral'}>
                        {orderStatusLabel[o.status] ?? o.status}
                      </Badge>
                    </td>
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