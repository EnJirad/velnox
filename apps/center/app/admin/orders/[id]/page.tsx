'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { formatCurrency, formatDate, parseGeoFromText, stripGeoFromText, mapsOpenUrl, osmOpenUrl } from '@velnox/utils';
import { Badge } from '@velnox/ui';
import { apiClient } from '@/lib/api-client';
import {
  orderStatusLabel,
  orderStatusTone,
  paymentStatusLabel,
} from '@/lib/order-status';
import type { OrderStatus } from '@velnox/types';

type AdminOrder = {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  paymentStatus: string;
  subtotal: number | string;
  shippingFee: number | string;
  total: number | string;
  createdAt: string;
  shippingName?: string | null;
  shippingPhone?: string | null;
  shippingAddressLine?: string | null;
  shippingProvince?: string | null;
  shippingPostalCode?: string | null;
  shippingCountry?: string | null;
  trackingNumber?: string | null;
  carrier?: string | null;
  user?: { id: string; name: string; email: string; phone?: string | null };
  payment?: {
    method: string;
    status: string;
    transactionId?: string | null;
    slipUrl?: string | null;
    slipUploadedAt?: string | null;
    amount?: number | string;
  } | null;
  items: {
    id: string;
    quantity: number;
    price: number | string;
    product?: {
      id: string;
      name: string;
      images?: { url: string }[];
    };
    merchant?: {
      id: string;
      user?: { name: string; email: string };
    };
  }[];
};

const STATUSES: OrderStatus[] = [
  'PENDING',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
];

export default function AdminOrderDetailPage() {
  const params = useParams();
  const id = String(params.id ?? '');
  const [order, setOrder] = useState<AdminOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [slipBusy, setSlipBusy] = useState(false);
  const [slipMsg, setSlipMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    apiClient
      .get<AdminOrder>(`/orders/admin/${id}`)
      .then(setOrder)
      .catch((err) => setError(err instanceof Error ? err.message : 'โหลดไม่สำเร็จ'))
      .finally(() => setLoading(false));
  }, [id]);

  async function changeStatus(status: OrderStatus) {
    if (!order) return;
    setBusy(true);
    setError(null);
    try {
      const updated = await apiClient.patch<{ status: OrderStatus }>(
        `/orders/${order.id}/status`,
        { status },
      );
      setOrder((prev) => (prev ? { ...prev, status: updated.status } : prev));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'อัปเดตสถานะไม่สำเร็จ');
    } finally {
      setBusy(false);
    }
  }


  async function approvePayment() {
    if (!order) return;
    setSlipBusy(true);
    setSlipMsg(null);
    setError(null);
    try {
      await apiClient.patch(`/payments/admin/orders/${order.id}/approve`, {});
      setOrder((prev) =>
        prev
          ? {
              ...prev,
              paymentStatus: 'PAID',
              status:
                prev.status === 'PENDING' || prev.status === 'CONFIRMED'
                  ? 'PROCESSING'
                  : prev.status,
              payment: prev.payment
                ? { ...prev.payment, status: 'PAID' }
                : prev.payment,
            }
          : prev,
      );
      setSlipMsg('อนุมัติแล้ว — สถานะกำลังจัดเตรียม และแจ้งร้านค้าแล้ว');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'อนุมัติไม่สำเร็จ');
    } finally {
      setSlipBusy(false);
    }
  }

  async function rejectSlip() {
    if (!order) return;
    const reason = window.prompt('เหตุผลที่สลิปไม่ผ่าน (ลูกค้าจะเห็นเมื่ออัปโหลดใหม่)', 'สลิปไม่ชัดเจนหรือยอดไม่ตรง');
    if (reason === null) return;
    setSlipBusy(true);
    setSlipMsg(null);
    setError(null);
    try {
      await apiClient.patch(`/payments/admin/orders/${order.id}/reject-slip`, {
        reason: reason || undefined,
      });
      setOrder((prev) =>
        prev
          ? {
              ...prev,
              payment: prev.payment
                ? {
                    ...prev.payment,
                    slipUrl: null,
                    slipUploadedAt: null,
                    transactionId: reason ? `NEEDS_RESLIP:${reason}` : 'NEEDS_RESLIP',
                  }
                : prev.payment,
            }
          : prev,
      );
      setSlipMsg('แจ้งลูกค้าให้อัปโหลดสลิปใหม่แล้ว');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ปฏิเสธสลิปไม่สำเร็จ');
    } finally {
      setSlipBusy(false);
    }
  }

  if (loading) {
    return <div className="py-16 text-center text-sm text-slate-400">กำลังโหลด...</div>;
  }

  if (!order) {
    return (
      <div className="flex flex-col gap-3">
        <Link href="/admin/orders" className="text-sm text-teal-700 hover:underline">
          ← กลับรายการออเดอร์
        </Link>
        <p className="text-sm text-red-600">{error || 'ไม่พบออเดอร์'}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link href="/admin/orders" className="text-xs text-teal-700 hover:underline">
            ← ออเดอร์
          </Link>
          <h1 className="mt-1 text-xl font-semibold text-slate-900">#{order.orderNumber}</h1>
          <p className="text-sm text-slate-500">{formatDate(order.createdAt)}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge tone={orderStatusTone[order.status] ?? 'neutral'}>
            {orderStatusLabel[order.status] ?? order.status}
          </Badge>
          <Badge tone="neutral">
            {paymentStatusLabel[order.paymentStatus] ?? order.paymentStatus}
          </Badge>
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>
      )}

      <div className="flex flex-wrap gap-2 rounded-xl border border-slate-200 bg-white p-4">
        <p className="w-full text-xs font-medium text-slate-500">เปลี่ยนสถานะ</p>
        {STATUSES.map((s) => (
          <button
            key={s}
            type="button"
            disabled={busy || order.status === s}
            onClick={() => changeStatus(s)}
            className={`rounded-md border px-3 py-1.5 text-xs font-medium disabled:opacity-50 ${
              order.status === s
                ? 'border-teal-600 bg-teal-50 text-teal-800'
                : 'border-slate-300 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {orderStatusLabel[s]}
          </button>
        ))}
      </div>

      {/* ที่อยู่จัดส่ง + พิกัด (Center / อนาคตแอปขนส่งเท่านั้น) */}
      {(order.shippingName || order.shippingAddressLine) && (
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-sm font-semibold text-slate-900">ที่อยู่จัดส่ง</p>
          <div className="mt-2 text-sm text-slate-700">
            {order.shippingName && <p className="font-medium">{order.shippingName}</p>}
            {order.shippingPhone && <p className="text-slate-500">{order.shippingPhone}</p>}
            {order.shippingAddressLine && (
              <p className="mt-1">{stripGeoFromText(order.shippingAddressLine)}</p>
            )}
            <p className="text-slate-500">
              {[order.shippingProvince, order.shippingPostalCode, order.shippingCountry]
                .filter(Boolean)
                .join(' ')}
            </p>
            {order.trackingNumber && (
              <p className="mt-2 font-mono text-xs text-slate-600">
                พัสดุ: {order.trackingNumber}
                {order.carrier ? ` · ${order.carrier}` : ''}
              </p>
            )}
          </div>
          {(() => {
            const geo = parseGeoFromText(order.shippingAddressLine);
            if (!geo) {
              return (
                <p className="mt-3 text-xs text-amber-700">ยังไม่มีพิกัดจากลูกค้า</p>
              );
            }
            return (
              <div className="mt-3 rounded-lg border border-teal-100 bg-teal-50/50 p-3">
                <p className="text-xs font-semibold text-teal-900">พิกัดจัดส่ง (เฉพาะ Center)</p>
                <p className="mt-1 font-mono text-xs text-slate-700">
                  {geo.lat.toFixed(6)}, {geo.lng.toFixed(6)}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <a
                    href={mapsOpenUrl(geo)}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-md bg-teal-700 px-2.5 py-1 text-[11px] font-medium text-white hover:bg-teal-800"
                  >
                    เปิด Google Maps
                  </a>
                  <a
                    href={osmOpenUrl(geo)}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-md border border-teal-200 bg-white px-2.5 py-1 text-[11px] font-medium text-teal-800 hover:bg-teal-50"
                  >
                    OpenStreetMap
                  </a>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-500">ยอดรวม</p>
          <p className="mt-1 text-2xl font-bold">{formatCurrency(Number(order.total))}</p>
          <p className="mt-1 text-xs text-slate-400">
            สินค้า {formatCurrency(Number(order.subtotal))} · ส่ง{' '}
            {formatCurrency(Number(order.shippingFee))}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-500">ลูกค้า</p>
          <p className="mt-1 text-sm font-semibold">{order.user?.name ?? '—'}</p>
          <p className="text-xs text-slate-400">{order.user?.email}</p>
          <p className="text-xs text-slate-400">{order.user?.phone || '—'}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-500">การชำระเงิน</p>
          <p className="mt-1 text-sm font-semibold">{order.payment?.method ?? '—'}</p>
          <p className="text-xs text-slate-400">
            {paymentStatusLabel[order.payment?.status ?? order.paymentStatus] ??
              order.paymentStatus}
          </p>
        </div>
      </div>


      {/* สลิปโอนเงิน */}
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <p className="text-sm font-semibold text-slate-900">สลิป / การชำระเงิน</p>
        {slipMsg && (
          <p className="mt-2 text-sm font-medium text-emerald-600">{slipMsg}</p>
        )}
        {order.payment?.slipUrl ? (
          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-start">
            <a
              href={order.payment.slipUrl}
              target="_blank"
              rel="noreferrer"
              className="block max-w-xs shrink-0"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={order.payment.slipUrl}
                alt="สลิปโอนเงิน"
                className="max-h-80 w-full rounded-lg border border-slate-200 object-contain"
              />
            </a>
            <div className="flex flex-col gap-2 text-sm">
              <p className="text-slate-600">
                กดที่รูปเพื่อเปิดขนาดเต็ม
                {order.payment.slipUploadedAt && (
                  <span className="block text-xs text-slate-400">
                    อัปโหลด: {formatDate(order.payment.slipUploadedAt)}
                  </span>
                )}
              </p>
              {order.paymentStatus !== 'PAID' && (
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={slipBusy}
                    onClick={() => void approvePayment()}
                    className="rounded-md bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                  >
                    อนุมัติชำระเงิน
                  </button>
                  <button
                    type="button"
                    disabled={slipBusy}
                    onClick={() => void rejectSlip()}
                    className="rounded-md border border-red-300 px-4 py-2 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
                  >
                    สลิปไม่ถูกต้อง — แจ้งอัปโหลดใหม่
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <p className="mt-2 text-sm text-slate-400">
            {order.payment?.transactionId?.startsWith('NEEDS_RESLIP')
              ? 'รอลูกค้าอัปโหลดสลิปใหม่ (สลิปก่อนหน้าถูกปฏิเสธ)'
              : order.paymentStatus === 'PAID'
                ? 'ชำระแล้ว'
                : 'ยังไม่มีสลิปจากลูกค้า'}
          </p>
        )}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-100 px-4 py-3">
          <p className="text-sm font-semibold">รายการสินค้า</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs text-slate-500">
                <th className="px-4 py-2">สินค้า</th>
                <th className="px-4 py-2">Merchant</th>
                <th className="px-4 py-2">จำนวน</th>
                <th className="px-4 py-2">ราคา</th>
                <th className="px-4 py-2">รวม</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((it) => (
                <tr key={it.id} className="border-b border-slate-50 last:border-0">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {it.product?.images?.[0]?.url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={it.product.images[0].url}
                          alt=""
                          className="h-9 w-9 rounded-lg object-cover"
                        />
                      ) : (
                        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-xs text-slate-400">
                          —
                        </span>
                      )}
                      <span className="font-medium">{it.product?.name ?? it.id}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {it.merchant?.user?.name ?? '—'}
                  </td>
                  <td className="px-4 py-3">{it.quantity}</td>
                  <td className="px-4 py-3">{formatCurrency(Number(it.price))}</td>
                  <td className="px-4 py-3">
                    {formatCurrency(Number(it.price) * it.quantity)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}