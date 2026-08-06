'use client';

import { useRouter } from 'next/navigation';
import { useCartStore } from '@/stores/cart-store';
import type { CatalogProduct } from '@/lib/catalog';

export function BuyNowButton({
  product,
  quantity = 1,
}: {
  product: CatalogProduct;
  quantity?: number;
}) {
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const outOfStock = !product.stock || product.stock <= 0;

  function handleBuy() {
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
    router.push('/checkout');
  }

  return (
    <button
      type="button"
      onClick={handleBuy}
      disabled={outOfStock}
      className="flex-1 rounded-md bg-orange-500 py-3 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-slate-300"
    >
      {outOfStock ? 'สินค้าหมด' : 'ซื้อเลย'}
    </button>
  );
}
