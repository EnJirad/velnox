'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { StatCard, Badge } from '@velnox/ui';
import { formatCurrency } from '@velnox/utils';
import { productService, merchantOrderService } from '@/services/merchant.service';

interface Product {
  id: string;
  status: string;
  stock: number;
}

interface OrderItem {
  id: string;
  quantity: number;
  price: number | string;
  product: { name: string };
  order: { orderNumber: string; status: string; createdAt: string; user: { name: string } };
}

export default function DashboardHomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([productService.listMine(), merchantOrderService.listMine()])
      .then(([p, o]) => {
        setProducts(p as Product[]);
        setOrderItems(o as OrderItem[]);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const revenue = orderItems.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
  const activeProducts = products.filter((p) => p.status === 'ACTIVE').length;
  const lowStock = products.filter((p) => p.stock <= 5 && p.status === 'ACTIVE').length;
  const recentOrders = orderItems.slice(0, 6);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink">ภาพรวมร้านค้า</h1>
      <p className="mt-1 text-sm text-ink/60">สรุปข้อมูลสำคัญของร้านคุณวันนี้</p>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="ยอดขายสะสม" value={isLoading ? '—' : formatCurrency(revenue)} />
        <StatCard label="สินค้าที่ขายอยู่" value={isLoading ? '—' : String(activeProducts)} />
        <StatCard label="คำสั่งซื้อ" value={isLoading ? '—' : String(orderItems.length)} />
        <StatCard label="สินค้าใกล้หมด" value={isLoading ? '—' : String(lowStock)} hint="≤ 5 ชิ้น" />
      </div>

      <div className="mt-8 rounded-lg border border-line bg-white">
        <div className="flex items-center justify-between border-b border-line p-4">
          <h2 className="font-semibold text-ink">คำสั่งซื้อล่าสุด</h2>
          <Link href="/dashboard/orders" className="text-sm text-teal hover:underline">
            ดูทั้งหมด →
          </Link>
        </div>
        {recentOrders.length === 0 ? (
          <p className="p-6 text-sm text-ink/50">ยังไม่มีคำสั่งซื้อ</p>
        ) : (
          <div className="divide-y divide-line">
            {recentOrders.map((item) => (
              <div key={item.id} className="flex items-center justify-between px-4 py-3 text-sm">
                <div>
                  <div className="font-mono font-medium text-ink">{item.order.orderNumber}</div>
                  <div className="text-xs text-ink/50">
                    {item.product.name} × {item.quantity} · {item.order.user.name}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono">{formatCurrency(Number(item.price) * item.quantity)}</span>
                  <Badge tone="teal">{item.order.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
