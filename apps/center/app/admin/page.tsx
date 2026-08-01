'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { StatCard, Badge } from '@velnox/ui';
import { formatCurrency } from '@velnox/utils';
import { adminService } from '@/services/admin.service';

interface Overview {
  totalUsers: number;
  totalMerchants: number;
  totalOrders: number;
  totalProducts: number;
  totalSales: number;
  pendingMerchants: number;
}

export default function AdminOverviewPage() {
  const [overview, setOverview] = useState<Overview | null>(null);

  useEffect(() => {
    adminService.overview().then((data) => setOverview(data as Overview));
  }, []);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink">ภาพรวมแพลตฟอร์ม</h1>
      <p className="mt-1 text-sm text-ink/60">สถานะโดยรวมของ Velnox ณ วันนี้</p>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <StatCard label="ผู้ใช้งานทั้งหมด" value={overview ? String(overview.totalUsers) : '—'} />
        <StatCard label="ร้านค้าที่อนุมัติแล้ว" value={overview ? String(overview.totalMerchants) : '—'} />
        <StatCard label="คำสั่งซื้อทั้งหมด" value={overview ? String(overview.totalOrders) : '—'} />
        <StatCard label="สินค้าที่เปิดขาย" value={overview ? String(overview.totalProducts) : '—'} />
        <StatCard label="ยอดขายรวม (ชำระแล้ว)" value={overview ? formatCurrency(overview.totalSales) : '—'} />
        <StatCard label="รออนุมัติ" value={overview ? String(overview.pendingMerchants) : '—'} hint="ผู้ขายรอตรวจสอบ" />
      </div>

      {overview && overview.pendingMerchants > 0 && (
        <div className="mt-6 flex items-center justify-between rounded-lg border border-marigold/40 bg-marigold/10 px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-ink">
            <Badge tone="marigold">แจ้งเตือน</Badge>
            มีผู้ขาย {overview.pendingMerchants} รายที่รอการอนุมัติ
          </div>
          <Link href="/admin/merchants" className="text-sm font-medium text-teal hover:underline">
            ตรวจสอบตอนนี้ →
          </Link>
        </div>
      )}
    </div>
  );
}
