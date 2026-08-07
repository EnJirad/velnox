'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { formatCurrency, formatDate } from '@velnox/utils';
import type { Order } from '@velnox/types';
import { Badge } from '@velnox/ui';
import {
  fetchMyOrders,
  orderStatusLabel,
  orderStatusTone,
  formatPaymentMethod,
  ORDER_STEPS,
} from '@/lib/orders';
import { ApiError } from '@/lib/api-client';
import { IconBox } from '@/components/icons';
import { PromptPayQrPanel } from '@/components/promptpay-qr-panel';

function needsPromptPayQr(order: Order): boolean {
  if (order.paymentStatus === 'PAID' || order.paymentStatus === 'REFUNDED') return false;
  if (order.status === 'CANCELLED') return false;
  const method = (order.payment?.method ?? '').toUpperCase();
  if (!method) return true;
  if (method.includes('PROMPT') || method === 'PROMPTPAY' || method === 'PROMPTPAY_QR') return true;
  if (method === 'COD' || method.includes('CARD')) return false;
  return method.includes('TRANSFER') || method.includes('BANK');
}

export function OrdersView() {
  const searchParams = useSearchParams();
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [qrOrder, setQrOrder] = useState<{ id: string; orderNumber: string } | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchMyOrders();
        if (!cancelled) setOrders(data);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : 'โหลดคำสั่งซื้อไม่สำเร็จ');
          setOrders([]);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!orders) return;
    const payId = searchParams.get('pay');
    if (!payId) return;
    const found = orders.find((o) => o.id === payId);
    if (found && needsPromptPayQr(found)) {
      setQrOrder({ id: found.id, orderNumber: found.orderNumber });
    }
  }, [orders, searchParams]);

  if (orders === null) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center text-sm text-slate-500">
        กำลังโหลดคำสั่งซื้อ...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-6 text-xl font-semibold text-slate-900">คำสั่งซื้อของฉัน</h1>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>
      )}

      {orders.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 p-12 text-center text-sm text-slate-500">
          คุณยังไม่มีคำสั่งซื้อ
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-slate-900">#{order.orderNumber}</p>
                  <p className="text-xs text-slate-400">{formatDate(order.createdAt)}</p>
                </div>
                <Badge tone={orderStatusTone[order.status] ?? 'neutral'}>
                  {orderStatusLabel[order.status] ?? order.status}
                </Badge>
              </div>

              {/* timeline สถานะ */}
              {order.status !== 'CANCELLED' && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {ORDER_STEPS.map((step, idx) => {
                    const statusOrder = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'];
                    const cur = statusOrder.indexOf(order.status === 'CONFIRMED' ? 'PROCESSING' : order.status);
                    const stepIdx = statusOrder.indexOf(step.key === 'PROCESSING' ? 'PROCESSING' : step.key);
                    // map simplified
                    const map: Record<string, number> = { PENDING: 0, CONFIRMED: 1, PROCESSING: 1, SHIPPED: 2, DELIVERED: 3 };
                    const curN = map[order.status] ?? 0;
                    const stepN = map[step.key] ?? idx;
                    const done = curN >= stepN;
                    const active = curN === stepN;
                    return (
                      <span
                        key={step.key}
                        className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                          active
                            ? 'bg-teal-700 text-white'
                            : done
                              ? 'bg-teal-100 text-teal-800'
                              : 'bg-slate-100 text-slate-400'
                        }`}
                      >
                        {step.label}
                      </span>
                    );
                  })}
                </div>
              )}

              {(order as { trackingNumber?: string | null }).trackingNumber && (
                <div className="mt-2 rounded-md bg-slate-50 px-3 py-2 text-sm text-slate-700">
                  <p className="text-xs text-slate-500">เลขพัสดุ</p>
                  <p className="font-mono font-semibold">
                    {(order as { trackingNumber?: string }).trackingNumber}
                    {(order as { carrier?: string | null }).carrier
                      ? ` · ${(order as { carrier?: string }).carrier}`
                      : ''}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    คาดว่าจะได้รับภายใน 3–7 วัน
                  </p>
                </div>
              )}

              {order.items && order.items.length > 0 && (
                <ul className="mt-3 flex flex-col gap-2 border-b border-slate-50 pb-3">
                  {order.items.map((item) => {
                    const img = item.product?.images?.[0]?.url;
                    return (
                      <li key={item.id} className="flex items-center gap-3 text-sm">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md bg-slate-50 text-slate-300">
                          {img ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={img} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <IconBox size={18} />
                          )}
                        </span>
                        <span className="min-w-0 flex-1 truncate text-slate-700">
                          {item.product?.name ?? 'สินค้า'} × {item.quantity}
                        </span>
                        <span className="shrink-0 font-medium text-slate-800">
                          {formatCurrency(Number(item.price) * item.quantity)}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}

              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm text-slate-500">
                <div>
                  ยอดรวม{' '}
                  <span className="font-semibold text-teal-700">
                    {formatCurrency(Number(order.total))}
                  </span>
                  {order.payment?.method && (
                    <>
                      {' · '}
                      {formatPaymentMethod(order.payment.method)}
                    </>
                  )}
                  {' · '}
                  <span
                    className={
                      order.paymentStatus === 'PAID'
                        ? 'font-medium text-emerald-600'
                        : 'font-medium text-amber-600'
                    }
                  >
                    {order.paymentStatus === 'PAID'
                      ? 'ชำระแล้ว'
                      : order.paymentStatus === 'REFUNDED'
                        ? 'คืนเงินแล้ว'
                        : 'รอชำระ'}
                  </span>
                </div>

                {needsPromptPayQr(order) && (
                  <button
                    type="button"
                    onClick={() =>
                      setQrOrder({ id: order.id, orderNumber: order.orderNumber })
                    }
                    className="rounded-md bg-teal-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-teal-800"
                  >
                    แสดง QR พร้อมเพย์
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {qrOrder && (
        <PromptPayQrPanel
          modal
          orderId={qrOrder.id}
          orderNumber={qrOrder.orderNumber}
          onClose={() => setQrOrder(null)}
        />
      )}
    </div>
  );
}
