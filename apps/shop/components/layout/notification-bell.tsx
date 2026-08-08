'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchMyOrders, orderStatusLabel } from '@/lib/orders';
import { useAuthStore } from '@/stores/auth-store';

type Noti = {
  id: string;
  orderId: string;
  orderNumber: string;
  title: string;
  body: string;
  createdAt: string;
};

const STORAGE_KEY = 'velshop_noti_read_v1';
const SNAPSHOT_KEY = 'velshop_order_snap_v1';

function loadRead(): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'));
  } catch {
    return new Set();
  }
}

function saveRead(ids: Set<string>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
}

export function NotificationBell() {
  const user = useAuthStore((s) => s.user);
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Noti[]>([]);
  const [readIds, setReadIds] = useState<Set<string>>(() => new Set());

  const refresh = useCallback(async () => {
    if (!user) {
      setItems([]);
      return;
    }
    try {
      const orders = await fetchMyOrders();
      const prevRaw = localStorage.getItem(SNAPSHOT_KEY);
      const prev: Record<string, string> = prevRaw ? JSON.parse(prevRaw) : {};
      const nextSnap: Record<string, string> = {};
      const notis: Noti[] = [];

      for (const o of orders) {
        const key = `${o.status}|${o.paymentStatus}|${(o as { trackingNumber?: string }).trackingNumber ?? ''}`;
        nextSnap[o.id] = key;
        const old = prev[o.id];
        if (old && old !== key) {
          const statusLabel = orderStatusLabel[o.status] ?? o.status;
          let body = `สถานะออเดอร์ #${o.orderNumber}: ${statusLabel}`;
          if (o.paymentStatus === 'PAID' && !old.includes('PAID')) {
            body = `ชำระเงินสำเร็จ — #${o.orderNumber}`;
          }
          if ((o as { trackingNumber?: string }).trackingNumber) {
            body = `มีเลขพัสดุแล้ว — #${o.orderNumber}: ${(o as { trackingNumber?: string }).trackingNumber}`;
          }
          notis.push({
            id: `${o.id}-${key}`,
            orderId: o.id,
            orderNumber: o.orderNumber,
            title: 'อัปเดตคำสั่งซื้อ',
            body,
            createdAt: o.createdAt,
          });
        }
      }
      localStorage.setItem(SNAPSHOT_KEY, JSON.stringify(nextSnap));
      // keep recent from previous session items + new
      setItems((prevItems) => {
        const merged = [...notis, ...prevItems].slice(0, 30);
        // dedupe by id
        const seen = new Set<string>();
        return merged.filter((n) => (seen.has(n.id) ? false : (seen.add(n.id), true)));
      });
      setReadIds(loadRead());
    } catch {
      // ignore
    }
  }, [user]);

  useEffect(() => {
    setReadIds(loadRead());
    refresh();
    const t = setInterval(refresh, 45000);
    return () => clearInterval(t);
  }, [refresh]);

  if (!user) return null;

  const unread = items.filter((n) => !readIds.has(n.id)).length;

  function markAllRead() {
    const next = new Set(readIds);
    items.forEach((n) => next.add(n.id));
    setReadIds(next);
    saveRead(next);
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative rounded-md p-2 text-slate-600 hover:bg-slate-100"
        aria-label="การแจ้งเตือน"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
          />
        </svg>
        {unread > 0 && (
          <span className="absolute right-1 top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>
      {open && (
        <>
          <button type="button" className="fixed inset-0 z-40 cursor-default" onClick={() => setOpen(false)} aria-label="close" />
          <div className="absolute right-0 z-50 mt-1 w-80 rounded-xl border border-slate-200 bg-white shadow-lg">
            <div className="flex items-center justify-between border-b border-slate-100 px-3 py-2">
              <p className="text-sm font-semibold text-slate-900">การแจ้งเตือน</p>
              {items.length > 0 && (
                <button type="button" onClick={markAllRead} className="text-xs text-teal-700 hover:underline">
                  อ่านทั้งหมด
                </button>
              )}
            </div>
            <ul className="max-h-80 overflow-y-auto">
              {items.length === 0 ? (
                <li className="px-3 py-8 text-center text-xs text-slate-400">ยังไม่มีการแจ้งเตือนใหม่</li>
              ) : (
                items.map((n) => (
                  <li key={n.id} className={!readIds.has(n.id) ? 'bg-teal-50/50' : ''}>
                    <Link
                      href="/orders"
                      onClick={() => {
                        const next = new Set(readIds);
                        next.add(n.id);
                        setReadIds(next);
                        saveRead(next);
                        setOpen(false);
                      }}
                      className="block px-3 py-2.5 hover:bg-slate-50"
                    >
                      <p className="text-xs font-semibold text-slate-800">{n.title}</p>
                      <p className="text-xs text-slate-600">{n.body}</p>
                    </Link>
                  </li>
                ))
              )}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
