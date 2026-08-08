'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { formatCurrency, formatDate } from '@velnox/utils';
import { Badge } from '@velnox/ui';
import { apiClient } from '@/lib/api-client';
import { getMerchantSocket } from '@/lib/ws-client';
import type { ApiOrderItem } from '@/lib/api-types';

const CARRIERS = ['Flash Express', 'Kerry Express', 'Thailand Post', 'J&T', 'SPX', 'อื่นๆ'];

const orderStatusLabel: Record<string, string> = {
  PENDING: 'รอดำเนินการ',
  CONFIRMED: 'กำลังจัดเตรียม',
  PROCESSING: 'กำลังจัดเตรียม',
  SHIPPED: 'กำลังจัดส่ง',
  DELIVERED: 'ส่งสำเร็จ',
  CANCELLED: 'ยกเลิก',
};

const orderStatusTone: Record<
  string,
  'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'primary'
> = {
  PENDING: 'warning',
  CONFIRMED: 'primary',
  PROCESSING: 'primary',
  SHIPPED: 'info',
  DELIVERED: 'success',
  CANCELLED: 'danger',
};

type Row = ApiOrderItem & {
  order?: ApiOrderItem['order'] & {
    paymentStatus?: string;
    trackingNumber?: string | null;
    carrier?: string | null;
    shippingName?: string | null;
    payment?: { status?: string; method?: string } | null;
  };
};

const FILTERS = ['ALL', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'PENDING', 'CANCELLED'];

function csvEscape(v: string) {
  if (/[",\n]/.test(v)) return `"${v.replace(/"/g, '""')}"`;
  return v;
}

export function OrdersView() {
  const [items, setItems] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('ALL');
  const [live, setLive] = useState(false);
  const [trackingDraft, setTrackingDraft] = useState<Record<string, string>>({});
  const [carrierDraft, setCarrierDraft] = useState<Record<string, string>>({});
  const [busyId, setBusyId] = useState<string | null>(null);
  const [bulkCarrier, setBulkCarrier] = useState('Flash Express');

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const data = await apiClient.get<Row[]>('/orders/merchant');
      setItems(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'โหลดไม่สำเร็จ');
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(false);
    const s = getMerchantSocket();
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

  const needPack = useMemo(
    () =>
      items.filter(
        (i) =>
          i.order &&
          (i.order.status === 'PROCESSING' || i.order.status === 'CONFIRMED') &&
          (i.order.paymentStatus === 'PAID' || i.order.payment?.status === 'PAID') &&
          !i.order.trackingNumber,
      ),
    [items],
  );

  // unique orders for packing (dedupe by order id)
  const packOrders = useMemo(() => {
    const map = new Map<string, Row>();
    for (const i of needPack) {
      if (i.order?.id) map.set(i.order.id, i);
    }
    return Array.from(map.values());
  }, [needPack]);

  const filtered =
    filter === 'ALL' ? items : items.filter((i) => i.order?.status === filter);

  function applyBulkCarrier() {
    const next: Record<string, string> = { ...carrierDraft };
    for (const row of packOrders) {
      if (row.order?.id) next[row.order.id] = bulkCarrier;
    }
    setCarrierDraft(next);
  }

  function downloadCsvTemplate() {
    const header = ['order_id', 'order_number', 'customer_name', 'product', 'qty', 'carrier', 'tracking_number'];
    const lines = [header.join(',')];
    const seen = new Set<string>();
    for (const row of needPack) {
      const o = row.order;
      if (!o?.id || seen.has(o.id)) continue;
      seen.add(o.id);
      lines.push(
        [
          o.id,
          o.orderNumber,
          o.shippingName ?? '',
          row.product?.name ?? '',
          String(row.quantity),
          carrierDraft[o.id] ?? bulkCarrier,
          trackingDraft[o.id] ?? '',
        ]
          .map((x) => csvEscape(String(x)))
          .join(','),
      );
    }
    const blob = new Blob(['\ufeff' + lines.join('\n')], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `velnox-tracking-template-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  async function confirmShip(orderId: string) {
    const tn = (trackingDraft[orderId] ?? '').trim();
    if (tn.length < 3) {
      setError('กรุณากรอกเลขพัสดุอย่างน้อย 3 ตัวอักษร');
      return;
    }
    setBusyId(orderId);
    setError(null);
    try {
      // ใช้ POST กันบาง proxy ที่ไม่รองรับ PATCH
      await apiClient.post(`/orders/merchant/${orderId}/ship`, {
        trackingNumber: tn,
        carrier: (carrierDraft[orderId] ?? '').trim() || undefined,
      });
      await load(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'บันทึกเลขพัสดุไม่สำเร็จ');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">คำสั่งซื้อ</h1>
          <p className="text-xs text-slate-400">
            {live ? (
              <span className="text-emerald-600">● Live</span>
            ) : (
              <span className="text-amber-600">○ รอเชื่อมต่อ</span>
            )}
          </p>
        </div>
        <button
          type="button"
          onClick={() => load(false)}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
        >
          รีเฟรช
        </button>
      </div>

      {packOrders.length > 0 && (
        <div className="rounded-lg border border-teal-200 bg-teal-50 px-4 py-3 text-sm text-teal-900">
          <p className="font-semibold">
            มี {packOrders.length} ออเดอร์ที่ชำระแล้ว — กรุณาจัดเตรียมพัสดุแล้วกรอกเลขพัสดุ
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <select
              value={bulkCarrier}
              onChange={(e) => setBulkCarrier(e.target.value)}
              className="rounded border border-teal-300 bg-white px-2 py-1.5 text-xs"
            >
              {CARRIERS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={applyBulkCarrier}
              className="rounded bg-teal-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-teal-800"
            >
              ใช้ขนส่งนี้กับทุกรายการที่รอจัดส่ง
            </button>
            <button
              type="button"
              onClick={downloadCsvTemplate}
              className="rounded border border-teal-600 px-3 py-1.5 text-xs font-semibold text-teal-800 hover:bg-white"
            >
              ดาวน์โหลด CSV เทมเพลตเลขพัสดุ
            </button>
          </div>
          <p className="mt-2 text-xs text-teal-800">
            CSV มี order_id / ชื่อผู้รับ — กรอก tracking_number ใน Excel แล้วคัดลอกกลับมากรอก หรือกรอกทีละรายการด้านล่าง
          </p>
        </div>
      )}

      {error && (
        <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>
      )}

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              filter === f
                ? 'bg-teal-700 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
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
                <th className="px-4 py-3">ออเดอร์</th>
                <th className="px-4 py-3">ผู้รับ / สินค้า</th>
                <th className="px-4 py-3">ยอด</th>
                <th className="px-4 py-3">สถานะ</th>
                <th className="px-4 py-3">เลขพัสดุ / ขนส่ง</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => {
                const o = item.order;
                const canShip =
                  o &&
                  (o.status === 'PROCESSING' || o.status === 'CONFIRMED') &&
                  (o.paymentStatus === 'PAID' || o.payment?.status === 'PAID') &&
                  !o.trackingNumber;
                return (
                  <tr key={item.id} className="border-b border-slate-50 align-top last:border-0">
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-800">#{o?.orderNumber}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{o?.id?.slice(0, 8)}…</p>
                      <p className="text-xs text-slate-400">{o ? formatDate(o.createdAt) : '-'}</p>
                    </td>
                    <td className="px-4 py-3">
                      {o?.shippingName && (
                        <p className="text-xs font-medium text-slate-700">{o.shippingName}</p>
                      )}
                      <p className="text-slate-700">{item.product?.name ?? item.productId}</p>
                      <p className="text-xs text-slate-400">× {item.quantity}</p>
                    </td>
                    <td className="px-4 py-3">
                      {formatCurrency(Number(item.price) * item.quantity)}
                    </td>
                    <td className="px-4 py-3">
                      {o && (
                        <Badge tone={orderStatusTone[o.status] ?? 'neutral'}>
                          {orderStatusLabel[o.status] ?? o.status}
                        </Badge>
                      )}
                      {(o?.paymentStatus === 'PAID' || o?.payment?.status === 'PAID') && (
                        <p className="mt-1 text-[10px] font-medium text-emerald-600">ชำระแล้ว</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {o?.trackingNumber ? (
                        <div className="text-xs">
                          <p className="font-mono font-medium text-slate-800">{o.trackingNumber}</p>
                          {o.carrier && <p className="text-slate-500">{o.carrier}</p>}
                        </div>
                      ) : canShip && o ? (
                        <div className="flex min-w-[220px] flex-col gap-2">
                          <div className="flex flex-wrap gap-1">
                            {CARRIERS.map((c) => {
                              const active = (carrierDraft[o.id] ?? '') === c;
                              return (
                                <button
                                  key={c}
                                  type="button"
                                  onClick={() =>
                                    setCarrierDraft((d) => ({
                                      ...d,
                                      [o.id]: active ? '' : c,
                                    }))
                                  }
                                  className={`rounded-full px-2.5 py-1 text-[10px] font-medium transition ${
                                    active
                                      ? 'bg-teal-700 text-white'
                                      : 'border border-slate-200 bg-white text-slate-600 hover:border-teal-300'
                                  }`}
                                >
                                  {c}
                                </button>
                              );
                            })}
                          </div>
                          <input
                            placeholder="เลขพัสดุ *"
                            value={trackingDraft[o.id] ?? ''}
                            onChange={(e) =>
                              setTrackingDraft((d) => ({ ...d, [o.id]: e.target.value }))
                            }
                            className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20"
                          />
                          <button
                            type="button"
                            disabled={busyId === o.id}
                            onClick={() => void confirmShip(o.id)}
                            className="rounded-lg bg-teal-700 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-teal-800 disabled:opacity-50"
                          >
                            {busyId === o.id ? 'กำลังบันทึก...' : 'ยืนยันจัดส่ง'}
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
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
