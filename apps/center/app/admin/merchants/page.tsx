'use client';

import { useEffect, useState } from 'react';
import { Badge, Button, EmptyState } from '@velnox/ui';
import { formatDate } from '@velnox/utils';
import { adminService } from '@/services/admin.service';

interface Merchant {
  id: string;
  status: string;
  createdAt: string;
  user: { name: string; email: string };
  shops: { name: string; description: string | null }[];
}

const STATUS_TONE: Record<string, 'neutral' | 'teal' | 'marigold' | 'brick' | 'success'> = {
  PENDING: 'marigold',
  APPROVED: 'success',
  REJECTED: 'brick',
  SUSPENDED: 'brick',
};

export default function MerchantsPage() {
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actingId, setActingId] = useState<string | null>(null);

  function load() {
    setIsLoading(true);
    adminService.merchants
      .list()
      .then((data) => setMerchants(data as Merchant[]))
      .finally(() => setIsLoading(false));
  }

  useEffect(load, []);

  async function handleApprove(id: string) {
    setActingId(id);
    try {
      await adminService.merchants.approve(id);
      load();
    } finally {
      setActingId(null);
    }
  }

  async function handleReject(id: string) {
    setActingId(id);
    try {
      await adminService.merchants.reject(id);
      load();
    } finally {
      setActingId(null);
    }
  }

  const pending = merchants.filter((m) => m.status === 'PENDING');
  const others = merchants.filter((m) => m.status !== 'PENDING');

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink">ผู้ขาย</h1>
      <p className="mt-1 text-sm text-ink/60">อนุมัติคำขอเปิดร้านค้าใหม่ และดูสถานะผู้ขายทั้งหมด</p>

      <h2 className="mb-3 mt-8 text-sm font-semibold uppercase tracking-wide text-ink/50">
        รออนุมัติ ({pending.length})
      </h2>
      {isLoading ? (
        <p className="text-sm text-ink/50">กำลังโหลด...</p>
      ) : pending.length === 0 ? (
        <EmptyState title="ไม่มีคำขอรออนุมัติ" />
      ) : (
        <div className="flex flex-col gap-3">
          {pending.map((merchant) => (
            <div key={merchant.id} className="flex items-center justify-between rounded-lg border border-line bg-white p-4">
              <div>
                <div className="font-medium text-ink">{merchant.shops[0]?.name}</div>
                <div className="text-xs text-ink/50">
                  {merchant.user.name} · {merchant.user.email} · สมัครเมื่อ {formatDate(merchant.createdAt)}
                </div>
                {merchant.shops[0]?.description && (
                  <p className="mt-1 max-w-md text-sm text-ink/60">{merchant.shops[0].description}</p>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  disabled={actingId === merchant.id}
                  onClick={() => handleReject(merchant.id)}
                >
                  ปฏิเสธ
                </Button>
                <Button
                  isLoading={actingId === merchant.id}
                  onClick={() => handleApprove(merchant.id)}
                >
                  อนุมัติ
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <h2 className="mb-3 mt-10 text-sm font-semibold uppercase tracking-wide text-ink/50">ผู้ขายทั้งหมด</h2>
      <div className="overflow-hidden rounded-lg border border-line bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-line bg-canvas text-left text-xs uppercase tracking-wide text-ink/50">
            <tr>
              <th className="px-4 py-3 font-medium">ร้านค้า</th>
              <th className="px-4 py-3 font-medium">เจ้าของ</th>
              <th className="px-4 py-3 font-medium">สถานะ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {others.map((merchant) => (
              <tr key={merchant.id}>
                <td className="px-4 py-3 font-medium text-ink">{merchant.shops[0]?.name}</td>
                <td className="px-4 py-3 text-ink/60">{merchant.user.email}</td>
                <td className="px-4 py-3">
                  <Badge tone={STATUS_TONE[merchant.status] ?? 'neutral'}>{merchant.status}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
