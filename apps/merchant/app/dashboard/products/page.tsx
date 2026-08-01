'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Badge, Button, EmptyState } from '@velnox/ui';
import { formatCurrency } from '@velnox/utils';
import { productService } from '@/services/merchant.service';

interface Product {
  id: string;
  name: string;
  price: number | string;
  stock: number;
  status: string;
  images: { url: string }[];
}

const STATUS_TONE: Record<string, 'neutral' | 'teal' | 'marigold' | 'brick' | 'success'> = {
  DRAFT: 'neutral',
  ACTIVE: 'success',
  INACTIVE: 'marigold',
  ARCHIVED: 'brick',
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  function load() {
    setIsLoading(true);
    productService
      .listMine()
      .then((data) => setProducts(data as Product[]))
      .finally(() => setIsLoading(false));
  }

  useEffect(load, []);

  async function handleDelete(id: string) {
    if (!confirm('ต้องการเก็บสินค้านี้เข้าคลังเก่า (archive) หรือไม่?')) return;
    await productService.remove(id);
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">สินค้าของร้าน</h1>
          <p className="mt-1 text-sm text-ink/60">จัดการสินค้าทั้งหมดในร้านของคุณ</p>
        </div>
        <Link href="/dashboard/products/new">
          <Button>+ เพิ่มสินค้า</Button>
        </Link>
      </div>

      <div className="mt-6 rounded-lg border border-line bg-white">
        {isLoading ? (
          <p className="p-6 text-sm text-ink/50">กำลังโหลด...</p>
        ) : products.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title="ยังไม่มีสินค้า"
              description="เริ่มเพิ่มสินค้าชิ้นแรกของร้านคุณ"
              action={
                <Link href="/dashboard/products/new">
                  <Button>+ เพิ่มสินค้า</Button>
                </Link>
              }
            />
          </div>
        ) : (
          <div className="divide-y divide-line">
            {products.map((product) => (
              <div key={product.id} className="flex items-center gap-4 px-4 py-3">
                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md bg-canvas">
                  {product.images?.[0]?.url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={product.images[0].url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-lg text-ink/15">🛍️</div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-ink">{product.name}</div>
                  <div className="font-mono text-xs text-ink/50">
                    {formatCurrency(Number(product.price))} · สต็อก {product.stock}
                  </div>
                </div>
                <Badge tone={STATUS_TONE[product.status] ?? 'neutral'}>{product.status}</Badge>
                <div className="flex gap-2">
                  <Link
                    href={`/dashboard/products/${product.id}/edit`}
                    className="rounded-md border border-line px-3 py-1.5 text-xs font-medium text-ink hover:border-teal"
                  >
                    แก้ไข
                  </Link>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="rounded-md border border-line px-3 py-1.5 text-xs font-medium text-brick hover:border-brick"
                  >
                    เก็บเข้าคลัง
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
