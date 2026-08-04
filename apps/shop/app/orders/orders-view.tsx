'use client';

import { useEffect, useState } from 'react';
import { formatCurrency, formatDate } from '@velnox/utils';
import type { Order } from '@velnox/types';
import { Badge } from '@velnox/ui';
import {
  fetchMyOrders,
  orderStatusLabel,
  orderStatusTone,
  paymentMethodLabel,
} from '@/lib/orders';
import { ApiError } from '@/lib/api-client';
import { IconBox } from '@/components/icons';

export function OrdersView() {
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [error, setError] = useState<string | null>(null);

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
            <div key={order.id} className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    คำสั่งซื้อ #{order.orderNumber}
                  </p>
                  <p className="text-xs text-slate-500">
                    สั่งซื้อเมื่อ {formatDate(order.createdAt)}
                  </p>
                </div>
                <Badge tone={orderStatusTone[order.status]}>
                  {orderStatusLabel[order.status]}
                </Badge>
              </div>

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
                      {paymentMethodLabel[order.payment.method] ?? order.payment.method}
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
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
