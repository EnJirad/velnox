'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@velnox/ui';
import { formatCurrency } from '@velnox/utils';
import { adminService } from '@/services/admin.service';

interface Product {
  id: string;
  name: string;
  price: number | string;
  stock: number;
  status: string;
  shop: { name: string };
  category: { name: string };
}

const STATUS_TONE: Record<string, 'neutral' | 'teal' | 'marigold' | 'brick' | 'success'> = {
  DRAFT: 'neutral',
  ACTIVE: 'success',
  INACTIVE: 'marigold',
  ARCHIVED: 'brick',
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    adminService.products
      .list()
      .then((data) => setProducts(data as Product[]))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink">สินค้า</h1>
      <p className="mt-1 text-sm text-ink/60">สินค้าทั้งหมดจากทุกร้านค้าบนแพลตฟอร์ม</p>

      <div className="mt-6 overflow-hidden rounded-lg border border-line bg-white">
        {isLoading ? (
          <p className="p-6 text-sm text-ink/50">กำลังโหลด...</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-line bg-canvas text-left text-xs uppercase tracking-wide text-ink/50">
              <tr>
                <th className="px-4 py-3 font-medium">สินค้า</th>
                <th className="px-4 py-3 font-medium">ร้านค้า</th>
                <th className="px-4 py-3 font-medium">หมวดหมู่</th>
                <th className="px-4 py-3 font-medium">ราคา</th>
                <th className="px-4 py-3 font-medium">สต็อก</th>
                <th className="px-4 py-3 font-medium">สถานะ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {products.map((product) => (
                <tr key={product.id}>
                  <td className="px-4 py-3 font-medium text-ink">{product.name}</td>
                  <td className="px-4 py-3 text-ink/60">{product.shop.name}</td>
                  <td className="px-4 py-3 text-ink/60">{product.category?.name}</td>
                  <td className="px-4 py-3 font-mono">{formatCurrency(Number(product.price))}</td>
                  <td className="px-4 py-3 font-mono">{product.stock}</td>
                  <td className="px-4 py-3">
                    <Badge tone={STATUS_TONE[product.status] ?? 'neutral'}>{product.status}</Badge>
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
