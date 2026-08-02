'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import type { ApiProduct } from '@/lib/api-types';
import { ProductForm } from '@/components/product-form';

export function EditProductView({ productId }: { productId: string }) {
  const [product, setProduct] = useState<ApiProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiClient
      .get<ApiProduct[]>('/products/me')
      .then((products) => {
        const found = products.find((p) => p.id === productId);
        if (!found) {
          setError('ไม่พบสินค้านี้');
        } else {
          setProduct(found);
        }
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'โหลดข้อมูลไม่สำเร็จ'))
      .finally(() => setLoading(false));
  }, [productId]);

  if (loading) {
    return <div className="py-16 text-center text-sm text-slate-400">กำลังโหลด...</div>;
  }

  if (error || !product) {
    return <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error ?? 'ไม่พบสินค้านี้'}</div>;
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">แก้ไขสินค้า</h1>
        <p className="text-sm text-slate-500">{product.name}</p>
      </div>
      <ProductForm mode="edit" productId={product.id} initial={product} />
    </div>
  );
}
