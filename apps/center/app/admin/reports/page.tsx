'use client';

import { useEffect, useMemo, useState } from 'react';
import { StatCard } from '@velnox/ui';
import { formatCurrency } from '@velnox/utils';
import { adminService } from '@/services/admin.service';

interface Order {
  id: string;
  status: string;
  total: number | string;
  paymentStatus: string;
}

interface Shop {
  id: string;
  name: string;
}

interface Product {
  id: string;
  shop: { name: string };
  price: number | string;
  stock: number;
}

export default function ReportsPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([adminService.orders.list(), adminService.products.list(), adminService.shops.list()])
      .then(([o, p, s]) => {
        setOrders(o as Order[]);
        setProducts(p as Product[]);
        setShops(s as Shop[]);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const totalRevenue = orders
    .filter((o) => o.paymentStatus === 'PAID')
    .reduce((sum, o) => sum + Number(o.total), 0);

  const statusBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const order of orders) counts[order.status] = (counts[order.status] ?? 0) + 1;
    return counts;
  }, [orders]);

  const lowStock = products.filter((p) => p.stock <= 5).length;

  const maxStatus = Math.max(1, ...Object.values(statusBreakdown));

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink">รายงาน</h1>
      <p className="mt-1 text-sm text-ink/60">สรุปภาพรวมยอดขายและสถานะการดำเนินงานทั้งแพลตฟอร์ม</p>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="ยอดขายรวม" value={isLoading ? '—' : formatCurrency(totalRevenue)} />
        <StatCard label="ร้านค้าทั้งหมด" value={isLoading ? '—' : String(shops.length)} />
        <StatCard label="คำสั่งซื้อทั้งหมด" value={isLoading ? '—' : String(orders.length)} />
        <StatCard label="สินค้าใกล้หมด" value={isLoading ? '—' : String(lowStock)} hint="≤ 5 ชิ้น" />
      </div>

      <div className="mt-8 rounded-lg border border-line bg-white p-5">
        <h2 className="mb-4 font-semibold text-ink">สถานะคำสั่งซื้อ</h2>
        {Object.keys(statusBreakdown).length === 0 ? (
          <p className="text-sm text-ink/50">ยังไม่มีข้อมูลคำสั่งซื้อ</p>
        ) : (
          <div className="flex flex-col gap-3">
            {Object.entries(statusBreakdown).map(([status, count]) => (
              <div key={status} className="flex items-center gap-3">
                <span className="w-32 shrink-0 text-sm text-ink/70">{status}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-canvas">
                  <div
                    className="h-full rounded-full bg-teal"
                    style={{ width: `${(count / maxStatus) * 100}%` }}
                  />
                </div>
                <span className="w-8 shrink-0 text-right font-mono text-sm text-ink/70">{count}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
