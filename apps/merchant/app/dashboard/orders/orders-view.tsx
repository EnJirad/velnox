'use client';

import { useCallback, useEffect, useState } from 'react';
import { formatCurrency, formatDate } from '@velnox/utils';
import { Badge } from '@velnox/ui';
import { apiClient } from '@/lib/api-client';
import { getMerchantSocket } from '@/lib/ws-client';
import type { ApiOrderItem } from '@/lib/api-types';

const orderStatusLabel: Record<string, string> = {
  PENDING: 'รอยืนยัน',
  CONFIRMED: 'ยืนยันแล้ว',
  PROCESSING: 'กำลังจัดเตรียม',
  SHIPPED: 'จัดส่งแล้ว',
  DELIVERED: 'สำเร็จ',
  CANCELLED: 'ยกเลิก',
};

const orderStatusTone: Record<
  string,
  'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'primary'
> = {
  PENDING: 'warning',
  CONFIRMED: 'info',
  PROCESSING: 'primary',
  SHIPPED: 'info',
  DELIVERED: 'success',
  CANCELLED: 'danger',
};

const FILTERS = ['ALL', 'PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

export function OrdersView() {
  const [items, setItems] = useState<ApiOrderItem[]>([]);
  const [filter, setFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [live, setLive] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const data = await apiClient.get<ApiOrderItem[]>('/orders/merchant');
      setItems(Array.isArray(data) ? data : []);
      setError(null);
      setLastRefresh(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'โหลดข้อมูลไม่สำเร็จ');
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(false);
    const s = getMerchantSocket();
    const onConnect = () => setLive(true);
    const onDisconnect = () => setLive(false);
    const refresh = () => void load(true);
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

  const filtered = filter === 'ALL' ? items : items.filter((i) => i.order?.status === filter);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">คำสั่งซื้อ</h1>
          <p className="text-sm text-slate-500">รายการสินค้าของคุณที่มีลูกค้าสั่งซื้อ</p>
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
        <button
          type="button"
          onClick={() => load(false)}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
        >
          รีเฟรช
        </button>
      </div>

      {error && <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>}

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium ${
              filter === f ? 'bg-teal-700 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {f === 'ALL' ? 'ทั้งหมด' : orderStatusLabel[f]}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-16 text-center text-sm text-slate-400">กำลังโหลด...</div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs text-slate-500">
                <th className="px-4 py-3 font-medium">คำสั่งซื้อ</th>
                <th className="px-4 py-3 font-medium">สินค้า</th>
                <th className="px-4 py-3 font-medium">จำนวน</th>
                <th className="px-4 py-3 font-medium">วันที่</th>
                <th className="px-4 py-3 font-medium">สถานะ</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id} className="border-b border-slate-50 last:border-0">
                  <td className="px-4 py-3 font-medium text-slate-800">#{item.order?.orderNumber}</td>
                  <td className="px-4 py-3 text-slate-600">{item.product?.name ?? '-'}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {item.quantity} × {formatCurrency(Number(item.price))}
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {item.order ? formatDate(item.order.createdAt) : '-'}
                  </td>
                  <td className="px-4 py-3">
                    {item.order && (
                      <Badge tone={orderStatusTone[item.order.status] ?? 'neutral'}>
                        {orderStatusLabel[item.order.status] ?? item.order.status}
                      </Badge>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-sm text-slate-400">
                    ไม่มีคำสั่งซื้อในสถานะนี้
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
