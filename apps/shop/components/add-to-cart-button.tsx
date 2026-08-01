'use client';

import { useState } from 'react';
import { useCartStore } from '@/stores/cart-store';
import type { MockProduct } from '@/lib/mock-data';

export function AddToCartButton({
  product,
  compact = false,
  quantity = 1,
}: {
  product: MockProduct;
  compact?: boolean;
  quantity?: number;
}) {
  const addItem = useCartStore((s) => s.addItem);
  const [added, setAdded] = useState(false);

  function handleAdd() {
    addItem(
      {
        productId: product.id,
        name: product.name,
        price: product.price,
        emoji: product.emoji,
        shopName: product.shopName,
        stock: product.stock,
      },
      quantity,
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <button
      onClick={handleAdd}
      className={
        compact
          ? 'mt-1 w-full rounded-md border border-teal-700 py-1.5 text-xs font-medium text-teal-700 transition hover:bg-teal-700 hover:text-white'
          : 'w-full rounded-md bg-teal-700 py-3 text-sm font-semibold text-white transition hover:bg-teal-800'
      }
    >
      {added ? '✓ เพิ่มลงตะกร้าแล้ว' : compact ? 'เพิ่มลงตะกร้า' : '🛒 เพิ่มลงตะกร้า'}
    </button>
  );
}
