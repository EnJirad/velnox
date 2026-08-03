'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { formatCurrency, formatDate } from '@velnox/utils';
import { Badge } from '@velnox/ui';
import { apiClient } from '@/lib/api-client';
import { getAdminSocket } from '@/lib/ws-client';
import {
  orderStatusLabel,
  orderStatusTone,
  paymentStatusLabel,
} from '@/lib/order-status';
import { useLanguage } from '@/components/providers/language-provider';
import type { Order, OrderItem } from '@velnox/types';

type OrderRowItem = OrderItem & {
  product?: { id?: string; name?: string };
};

type OrderRow = Omit<Order, 'items'> & {
  items?: OrderRowItem[];
  user?: { name?: string; email?: string };
};

export default function OrdersPage() {
  const { t } = useLanguage();
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [live, setLive] = useState(false);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const data = await apiClient.get<OrderRow[]>('/orders');
      setOrders(Array.isArray(data) ? data : []);
      setError(null);
      setLastRefresh(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.loading'));
    } finally {
      if (!silent) setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    load(false);
    const s = getAdminSocket();
    const onConnect = () => setLive(true);
    const onDisconnect = () => setLive(false);
    const refresh = () => load(true);
    s.on('connect', onConnect);
    s.on('disconnect', onDisconnect);
    s.on('order:created', refresh);
    s.on('order:updated', refresh);
    if (s.connected) setLive(true);
    return () => {
      s.off('connect', onConnect);
      s.off('disconnect', onDisconnect);
      s.off('order:created', refresh);
      s.off('order:updated', refresh);
    };
  }, [load]);

  const q = search.trim().toLowerCase();
  const filtered = !q
    ? orders
    : orders.filter((o) => {
        if (o.id?.toLowerCase().includes(q)) return true;
        if (o.orderNumber?.toLowerCase().includes(q)) return true;
        if (o.user?.name?.toLowerCase().includes(q)) return true;
        if (o.user?.email?.toLowerCase().includes(q)) return true;
        if (
          o.items?.some((it) =>
            (it.productId ?? it.product?.id ?? '').toLowerCase().includes(q),
          )
        )
          return true;
        if (o.items?.some((it) => (it.product?.name ?? '').toLowerCase().includes(q)))
          return true;
        return false;
      });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">{t('admin.ordersTitle')}</h1>
          <p className="text-sm text-slate-500">
            {loading
              ? t('common.loading')
              : `${orders.length.toLocaleString()} ${t('admin.ordersCount')}`}
          </p>
          {lastRefresh && (
            <p className="mt-0.5 text-xs text-slate-400">
              อัปเดตล่าสุด {lastRefresh.toLocaleTimeString('th-TH')} ·{' '}
              {live ? (
                <span className="text-emerald-600">● Live (WebSocket)</span>
              ) : (
                <span className="text-amber-600">○ รอเชื่อมต่อ WS</span>
              )}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหา order / ลูกค้า / สินค้า..."
            className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-600"
          />
          <button
            type="button"
            onClick={() => load(false)}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
          >
            รีเฟรช
          </button>
        </div>
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
                <th className="px-4 py-3 font-medium">ลูกค้า</th>
                <th className="px-4 py-3 font-medium">{t('admin.colDate')}</th>
                <th className="px-4 py-3 font-medium">{t('admin.colTotal')}</th>
                <th className="px-4 py-3 font-medium">{t('admin.colPayment')}</th>
                <th className="px-4 py-3 font-medium">{t('admin.colStatus')}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    {t('admin.noOrders')}
                  </td>
                </tr>
              ) : (
                filtered.map((o) => (
                  <tr key={o.id} className="border-b border-slate-50 last:border-0">
                    <td className="px-4 py-3 font-medium text-slate-800">
                      <Link
                        href={`/admin/orders/${o.id}`}
                        className="text-teal-800 hover:underline"
                      >
                        #{o.orderNumber}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      <div>{o.user?.name ?? '—'}</div>
                      <div className="text-xs text-slate-400">{o.user?.email}</div>
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