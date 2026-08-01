'use client';

import { useEffect, useMemo, useState } from 'react';
import { StatCard } from '@velnox/ui';
import { formatCurrency } from '@velnox/utils';
import { merchantOrderService, productService } from '@/services/merchant.service';

interface OrderItem {
  id: string;
  quantity: number;
  price: number | string;
  product: { name: string };
  order: { status: string; createdAt: string };
}

interface Product {
  id: string;
  name: string;
  status: string;
}

export default function AnalyticsPage() {
  const [items, setItems] = useState<OrderItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([merchantOrderService.listMine(), productService.listMine()])
      .then(([o, p]) => {
        setItems(o as OrderItem[]);
        setProducts(p as Product[]);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const revenue = items.reduce((sum, i) => sum + Number(i.price) * i.quantity, 0);
  const delivered = items.filter((i) => i.order.status === 'DELIVERED').length;
  const cancelled = items.filter((i) => i.order.status === 'CANCELLED').length;
  const avgOrderValue = items.length > 0 ? revenue / items.length : 0;

  const topProducts = useMemo(() => {
    const totals = new Map<string, number>();
    for (const item of items) {
      totals.set(item.product.name, (totals.get(item.product.name) ?? 0) + item.quantity);
    }
    return Array.from(totals.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [items]);

  const maxQty = topProducts[0]?.[1] ?? 1;

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink">ยอดขาย</h1>
      <p className="mt-1 text-sm text-ink/60">ภาพรวมยอดขายและสินค้าขายดีของร้านคุณ</p>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="ยอดขายรวม" value={isLoading ? '—' : formatCurrency(revenue)} />
        <StatCard label="มูลค่าเฉลี่ยต่อรายการ" value={isLoading ? '—' : formatCurrency(avgOrderValue)} />
        <StatCard label="จัดส่งสำเร็จ" value={isLoading ? '—' : String(delivered)} />
        <StatCard label="ยกเลิก" value={isLoading ? '—' : String(cancelled)} />
      </div>

      <div className="mt-8 rounded-lg border border-line bg-white p-5">
        <h2 className="mb-4 font-semibold text-ink">สินค้าขายดี</h2>
        {topProducts.length === 0 ? (
          <p className="text-sm text-ink/50">ยังไม่มีข้อมูลยอดขาย</p>
        ) : (
          <div className="flex flex-col gap-3">
            {topProducts.map(([name, qty]) => (
              <div key={name} className="flex items-center gap-3">
                <span className="w-32 shrink-0 truncate text-sm text-ink/70">{name}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-canvas">
                  <div
                    className="h-full rounded-full bg-teal"
                    style={{ width: `${(qty / maxQty) * 100}%` }}
                  />
                </div>
                <span className="w-10 shrink-0 text-right font-mono text-sm text-ink/70">{qty}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <p className="mt-4 text-xs text-ink/40">
        มีสินค้าทั้งหมด {products.length} รายการในร้าน
      </p>
    </div>
  );
}
