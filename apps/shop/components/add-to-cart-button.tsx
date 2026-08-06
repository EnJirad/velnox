'use client';

import { useState } from 'react';
import { useCartStore } from '@/stores/cart-store';
import type { CatalogProduct } from '@/lib/catalog';

export function AddToCartButton({
  product,
  compact = false,
  quantity = 1,
}: {
  product: CatalogProduct;
  compact?: boolean;
  quantity?: number;
}) {
  const addItem = useCartStore((s) => s.addItem);
  const [added, setAdded] = useState(false);
  const outOfStock = !product.stock || product.stock <= 0;

  function handleAdd(e?: React.MouseEvent) {
    e?.preventDefault();
    e?.stopPropagation();
    if (outOfStock) return;
    addItem(
      {
        productId: product.id,
        name: product.name,
        price: Number(product.price) || 0,
        shopName: product.shopName || '',
        stock: product.stock,
        imageUrl: product.imageUrl,
      },
      quantity,
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <button
      type="button"
      onClick={handleAdd}
      disabled={outOfStock}
      className={
        compact
          ? 'mt-1 w-full rounded-md border border-teal-700 py-1.5 text-xs font-medium text-teal-700 transition hover:bg-teal-700 hover:text-white disabled:cursor-not-allowed disabled:border-slate-300 disabled:text-slate-400 disabled:hover:bg-transparent'
          : 'w-full rounded-md bg-teal-700 py-3 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-slate-300'
      }
    >
      {outOfStock ? 'สินค้าหมด' : added ? 'เพิ่มลงตะกร้าแล้ว' : 'เพิ่มลงตะกร้า'}
    </button>
  );
}
