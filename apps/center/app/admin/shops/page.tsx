'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@velnox/ui';
import { adminService } from '@/services/admin.service';

interface Shop {
  id: string;
  name: string;
  status: string;
  merchant: { user: { name: string; email: string } };
}

const STATUS_TONE: Record<string, 'neutral' | 'teal' | 'marigold' | 'brick' | 'success'> = {
  ACTIVE: 'success',
  INACTIVE: 'marigold',
  SUSPENDED: 'brick',
};

export default function ShopsPage() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    adminService.shops
      .list()
      .then((data) => setShops(data as Shop[]))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink">ร้านค้า</h1>
      <p className="mt-1 text-sm text-ink/60">ร้านค้าทั้งหมดบนแพลตฟอร์ม</p>

      <div className="mt-6 overflow-hidden rounded-lg border border-line bg-white">
        {isLoading ? (
          <p className="p-6 text-sm text-ink/50">กำลังโหลด...</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-line bg-canvas text-left text-xs uppercase tracking-wide text-ink/50">
              <tr>
                <th className="px-4 py-3 font-medium">ร้านค้า</th>
                <th className="px-4 py-3 font-medium">เจ้าของ</th>
                <th className="px-4 py-3 font-medium">สถานะ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {shops.map((shop) => (
                <tr key={shop.id}>
                  <td className="px-4 py-3 font-medium text-ink">{shop.name}</td>
                  <td className="px-4 py-3 text-ink/60">{shop.merchant.user.email}</td>
                  <td className="px-4 py-3">
                    <Badge tone={STATUS_TONE[shop.status] ?? 'neutral'}>{shop.status}</Badge>
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
