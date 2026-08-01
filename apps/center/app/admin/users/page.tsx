'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@velnox/ui';
import { formatDate } from '@velnox/utils';
import { adminService } from '@/services/admin.service';

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
  status: string;
  createdAt: string;
}

const STATUS_TONE: Record<string, 'neutral' | 'teal' | 'marigold' | 'brick' | 'success'> = {
  ACTIVE: 'success',
  INACTIVE: 'marigold',
  BANNED: 'brick',
};

export default function UsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  function load() {
    setIsLoading(true);
    adminService.users
      .list()
      .then((data) => setUsers(data as AdminUser[]))
      .finally(() => setIsLoading(false));
  }

  useEffect(load, []);

  async function toggleStatus(user: AdminUser) {
    setUpdatingId(user.id);
    const next = user.status === 'BANNED' ? 'ACTIVE' : 'BANNED';
    try {
      await adminService.users.updateStatus(user.id, next);
      load();
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink">ผู้ใช้งาน</h1>
      <p className="mt-1 text-sm text-ink/60">ผู้ใช้งานทั้งหมดในระบบ Velnox</p>

      <div className="mt-6 overflow-hidden rounded-lg border border-line bg-white">
        {isLoading ? (
          <p className="p-6 text-sm text-ink/50">กำลังโหลด...</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-line bg-canvas text-left text-xs uppercase tracking-wide text-ink/50">
              <tr>
                <th className="px-4 py-3 font-medium">ชื่อ</th>
                <th className="px-4 py-3 font-medium">อีเมล</th>
                <th className="px-4 py-3 font-medium">บทบาท</th>
                <th className="px-4 py-3 font-medium">สถานะ</th>
                <th className="px-4 py-3 font-medium">สมัครเมื่อ</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-4 py-3 font-medium text-ink">{user.name}</td>
                  <td className="px-4 py-3 text-ink/60">{user.email}</td>
                  <td className="px-4 py-3">
                    <Badge tone="neutral">{user.role}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={STATUS_TONE[user.status] ?? 'neutral'}>{user.status}</Badge>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-ink/50">{formatDate(user.createdAt)}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      disabled={updatingId === user.id || user.role !== 'CUSTOMER'}
                      onClick={() => toggleStatus(user)}
                      className="rounded-md border border-line px-3 py-1 text-xs font-medium text-ink hover:border-brick hover:text-brick disabled:opacity-30"
                    >
                      {user.status === 'BANNED' ? 'ปลดแบน' : 'ระงับบัญชี'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
