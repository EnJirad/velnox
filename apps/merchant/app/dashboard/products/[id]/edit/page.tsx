'use client';

import { useEffect, useState, use as usePromise } from 'react';
import { ProductForm, type ProductFormValues } from '@/components/product/product-form';
import { productService } from '@/services/merchant.service';

interface RawProduct {
  id: string;
  name: string;
  categoryId: string;
  description: string | null;
  price: number | string;
  stock: number;
  status: ProductFormValues['status'];
}

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = usePromise(params);
  const [product, setProduct] = useState<ProductFormValues | null>(null);

  useEffect(() => {
    productService.listMine().then((data) => {
      const found = (data as RawProduct[]).find((p) => p.id === id);
      if (found) {
        setProduct({
          id: found.id,
          name: found.name,
          categoryId: found.categoryId,
          description: found.description ?? '',
          price: Number(found.price),
          stock: found.stock,
          status: found.status,
        });
      }
    });
  }, [id]);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink">แก้ไขสินค้า</h1>
      <p className="mt-1 text-sm text-ink/60">อัปเดตรายละเอียด ราคา หรือสต็อกสินค้า</p>
      <div className="mt-6">
        {product ? <ProductForm initial={product} /> : <p className="text-sm text-ink/50">กำลังโหลด...</p>}
      </div>
    </div>
  );
}
