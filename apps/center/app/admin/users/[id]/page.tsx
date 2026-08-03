'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { formatCurrency, formatDate } from '@velnox/utils';
import { Badge } from '@velnox/ui';
import { apiClient } from '@/lib/api-client';
import {
  orderStatusLabel,
  orderStatusTone,
  userRoleLabel,
  userStatusLabel,
  userStatusTone,
} from '@/lib/order-status';

type UserDetail = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: 'CUSTOMER' | 'MERCHANT' | 'ADMIN' | 'SUPER_ADMIN';
  status: 'ACTIVE' | 'INACTIVE' | 'BANNED';
  createdAt: string;
  profile?: { avatarUrl?: string | null } | null;
  addresses?: {
    id: string;
    name: string;
    phone: string;
    addressLine: string;
    city: string;
    province: string;
    postalCode: string;
    isDefault: boolean;
  }[];
  orders?: {
    id: string;
    orderNumber: string;
    total: number | string;
    status: string;
    createdAt: string;
    items?: { product?: { id: string; name: string }; quantity: number }[];
  }[];
  merchant?: {
    id: string;
    status: string;
    shops?: { id: string; name: string }[];
  } | null;
  orderStats?: { totalOrders: number; totalSpent: number };
};

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = String(params.id ?? '');

  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');

  useEffect(() => {
    if (!id) return;
    apiClient
      .get<UserDetail>(`/users/${id}`)
      .then((data) => {
        setUser(data);
        setEditName(data.name);
        setEditPhone(data.phone ?? '');
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'โหลดไม่สำเร็จ'))
      .finally(() => setLoading(false));
  }, [id]);

  async function saveProfile() {
    if (!user) return;
    setBusy(true);
    setError(null);
    try {
      const updated = await apiClient.patch<UserDetail>(`/users/${user.id}`, {
        name: editName,
        phone: editPhone,
      });
      setUser((prev) => (prev ? { ...prev, ...updated } : prev));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'บันทึกไม่สำเร็จ');
    } finally {
      setBusy(false);
    }
  }

  async function toggleBan() {
    if (!user || user.role === 'SUPER_ADMIN') return;
    setBusy(true);
    setError(null);
    try {
      const next = user.status === 'BANNED' ? 'ACTIVE' : 'BANNED';
      const updated = await apiClient.patch<UserDetail>(`/users/${user.id}/status`, {
        status: next,
      });
      setUser((prev) => (prev ? { ...prev, status: updated.status } : prev));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'อัปเดตสถานะไม่สำเร็จ');
    } finally {
      setBusy(false);
    }
  }

  async function removeUser() {
    if (!user || user.role === 'SUPER_ADMIN') return;
    if (!confirm(`ลบผู้ใช้ ${user.name} ออกจากระบบถาวร? การกระทำนี้ย้อนกลับไม่ได้`)) return;
    setBusy(true);
    setError(null);
    try {
      await apiClient.delete(`/users/${user.id}`);
      router.push('/admin/users');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ลบไม่สำเร็จ');
      setBusy(false);
    }
  }

  if (loading) {
    return <div className="py-16 text-center text-sm text-slate-400">กำลังโหลด...</div>;
  }

  if (!user) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm text-red-600">{error || 'ไม่พบผู้ใช้'}</p>
        <Link href="/admin/users" className="text-sm text-teal-700 hover:underline">
          ← กลับรายการผู้ใช้
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link href="/admin/users" className="text-xs text-teal-700 hover:underline">
            ← ผู้ใช้งาน
          </Link>
          <h1 className="mt-1 text-xl font-semibold text-slate-900">{user.name}</h1>
          <p className="text-sm text-slate-500">{user.email}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge tone={userStatusTone[user.status] ?? 'neutral'}>
            {userStatusLabel[user.status] ?? user.status}
          </Badge>
          <Badge tone="info">{userRoleLabel[user.role] ?? user.role}</Badge>
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 lg:col-span-1">
          <p className="mb-3 text-sm font-semibold text-slate-900">ข้อมูลผู้ใช้</p>
          <div className="grid gap-3">
            <div>
              <label className="text-xs text-slate-500">ชื่อ</label>
              <input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-600"
              />
            </div>
            <div>
              <label className="text-xs text-slate-500">เบอร์โทร</label>
              <input
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-600"
              />
            </div>
            <p className="text-xs text-slate-400">
              สมัครเมื่อ {formatDate(user.createdAt)}
            </p>
            <button
              type="button"
              onClick={saveProfile}
              disabled={busy}
              className="rounded-md bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-60"
            >
              บันทึกข้อมูล
            </button>
          </div>

          {user.role !== 'SUPER_ADMIN' && (
            <div className="mt-6 flex flex-col gap-2 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={toggleBan}
                disabled={busy}
                className={`rounded-md border px-4 py-2 text-sm font-medium disabled:opacity-60 ${
                  user.status === 'BANNED'
                    ? 'border-teal-300 text-teal-700 hover:bg-teal-50'
                    : 'border-amber-300 text-amber-700 hover:bg-amber-50'
                }`}
              >
                {user.status === 'BANNED' ? 'ยกเลิกการแบน' : 'แบนผู้ใช้'}
              </button>
              <button
                type="button"
                onClick={removeUser}
                disabled={busy}
                className="rounded-md border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-60"
              >
                ลบผู้ใช้ออกจากระบบ
              </button>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4 lg:col-span-2">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs text-slate-500">จำนวนคำสั่งซื้อ (ที่โหลด)</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">
                {user.orderStats?.totalOrders ?? user.orders?.length ?? 0}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs text-slate-500">ยอดซื้อรวมโดยประมาณ</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">
                {formatCurrency(user.orderStats?.totalSpent ?? 0)}
              </p>
            </div>
          </div>

          {user.merchant && (
            <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm">
              <p className="font-semibold text-slate-900">บัญชีร้านค้า</p>
              <p className="mt-1 text-slate-600">สถานะ: {user.merchant.status}</p>
              <p className="text-slate-500">
                ร้าน:{' '}
                {user.merchant.shops?.map((s) => s.name).join(', ') || '— ยังไม่มีร้าน —'}
              </p>
            </div>
          )}

          {user.addresses && user.addresses.length > 0 && (
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="mb-2 text-sm font-semibold text-slate-900">ที่อยู่</p>
              <ul className="flex flex-col gap-2 text-sm text-slate-600">
                {user.addresses.map((a) => (
                  <li key={a.id} className="rounded-md bg-slate-50 px-3 py-2">
                    {a.name} · {a.phone}
                    <br />
                    {a.addressLine}, {a.city}, {a.province} {a.postalCode}
                    {a.isDefault && (
                      <span className="ml-2 text-xs text-teal-700">ค่าเริ่มต้น</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="rounded-xl border border-slate-200 bg-white">
            <div className="border-b border-slate-100 px-4 py-3">
              <p className="text-sm font-semibold text-slate-900">ประวัติคำสั่งซื้อ</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-left text-xs text-slate-500">
                    <th className="px-4 py-2 font-medium">คำสั่งซื้อ</th>
                    <th className="px-4 py-2 font-medium">วันที่</th>
                    <th className="px-4 py-2 font-medium">ยอด</th>
                    <th className="px-4 py-2 font-medium">สถานะ</th>
                  </tr>
                </thead>
                <tbody>
                  {!user.orders?.length ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-slate-400">
                        ยังไม่มีคำสั่งซื้อ
                      </td>
                    </tr>
                  ) : (
                    user.orders.map((o) => (
                      <tr key={o.id} className="border-b border-slate-50 last:border-0">
                        <td className="px-4 py-3 font-medium text-slate-800">
                          #{o.orderNumber}
                        </td>
                        <td className="px-4 py-3 text-slate-500">
                          {formatDate(o.createdAt)}
                        </td>
                        <td className="px-4 py-3">{formatCurrency(Number(o.total))}</td>
                        <td className="px-4 py-3">
                          <Badge tone={orderStatusTone[o.status as keyof typeof orderStatusTone] ?? 'neutral'}>
                            {orderStatusLabel[o.status as keyof typeof orderStatusLabel] ?? o.status}
                          </Badge>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
