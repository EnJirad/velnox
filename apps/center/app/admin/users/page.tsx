'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { formatDate } from '@velnox/utils';
import { Badge } from '@velnox/ui';
import { apiClient } from '@/lib/api-client';
import type { ApiUser } from '@/lib/api-types';
import {
  userRoleLabel,
  userStatusLabel,
  userStatusTone,
} from '@/lib/order-status';
import { useLanguage } from '@/components/providers/language-provider';

export default function UsersPage() {
  const { t } = useLanguage();
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    apiClient
      .get<ApiUser[]>('/users')
      .then(setUsers)
      .catch((err) => setError(err instanceof Error ? err.message : t('common.loading')))
      .finally(() => setLoading(false));
  }, [t]);

  async function toggleBan(user: ApiUser) {
    setBusyId(user.id);
    try {
      const nextStatus = user.status === 'BANNED' ? 'ACTIVE' : 'BANNED';
      const updated = await apiClient.patch<ApiUser>(`/users/${user.id}/status`, {
        status: nextStatus,
      });
      setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, ...updated } : u)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'อัปเดตสถานะไม่สำเร็จ');
    } finally {
      setBusyId(null);
    }
  }

  const q = search.trim().toLowerCase();
  const filtered = users.filter((u) => {
    if (!q) return true;
    return (
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.phone ?? '').toLowerCase().includes(q) ||
      u.id.toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">{t('admin.users')}</h1>
          <p className="text-sm text-slate-500">
            {users.length.toLocaleString('th-TH')} {t('admin.usersInSystem')}
          </p>
        </div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="ค้นหาชื่อ / อีเมล / เบอร์โทร..."
          className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-600"
        />
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
                <th className="px-4 py-3 font-medium">{t('admin.colName')}</th>
                <th className="px-4 py-3 font-medium">{t('admin.colEmail')}</th>
                <th className="px-4 py-3 font-medium">เบอร์โทร</th>
                <th className="px-4 py-3 font-medium">{t('admin.colRole')}</th>
                <th className="px-4 py-3 font-medium">{t('admin.colJoined')}</th>
                <th className="px-4 py-3 font-medium">{t('admin.colStatus')}</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    {t('admin.noUsers')}
                  </td>
                </tr>
              ) : (
                filtered.map((u) => (
                  <tr key={u.id} className="border-b border-slate-50 last:border-0">
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/users/${u.id}`}
                        className="flex items-center gap-3 hover:opacity-80"
                      >
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-100 text-xs font-semibold text-teal-700">
                          {u.name.slice(0, 1)}
                        </span>
                        <span className="font-medium text-teal-800 underline-offset-2 hover:underline">
                          {u.name}
                        </span>
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{u.email}</td>
                    <td className="px-4 py-3 text-slate-500">{u.phone || '—'}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {userRoleLabel[u.role] ?? u.role}
                    </td>
                    <td className="px-4 py-3 text-slate-500">{formatDate(u.createdAt)}</td>
                    <td className="px-4 py-3">
                      <Badge tone={userStatusTone[u.status] ?? 'neutral'}>
                        {userStatusLabel[u.status] ?? u.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-3">
                        <Link
                          href={`/admin/users/${u.id}`}
                          className="text-xs font-medium text-teal-700 hover:underline"
                        >
                          ดูรายละเอียด
                        </Link>
                        {u.role !== 'SUPER_ADMIN' && (
                          <button
                            type="button"
                            onClick={() => toggleBan(u)}
                            disabled={busyId === u.id}
                            className={`text-xs font-medium hover:underline disabled:opacity-60 ${
                              u.status === 'BANNED' ? 'text-teal-700' : 'text-red-600'
                            }`}
                          >
                            {u.status === 'BANNED' ? t('admin.unban') : t('admin.ban')}
                          </button>
                        )}
                      </div>
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
