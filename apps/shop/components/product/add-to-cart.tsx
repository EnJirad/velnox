'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@velnox/ui';
import { useAuth } from '@/hooks/use-auth';
import { useCartStore } from '@/stores/cart-store';

export function AddToCart({ productId, stock }: { productId: string; stock: number }) {
  const [quantity, setQuantity] = useState(1);
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const { isAuthenticated } = useAuth();
  const addItem = useCartStore((s) => s.addItem);
  const router = useRouter();

  async function handleAdd() {
    if (!isAuthenticated) {
      router.push('/login?next=/cart');
      return;
    }
    setStatus('loading');
    try {
      await addItem(productId, quantity);
      setStatus('done');
      setTimeout(() => setStatus('idle'), 1800);
    } catch {
      setStatus('error');
    }
  }

  if (stock <= 0) {
    return (
      <Button variant="outline" disabled className="w-full">
        สินค้าหมด
      </Button>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <div className="flex items-center rounded-md border border-line">
          <button
            className="px-3 py-1.5 text-ink/60 hover:text-teal"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          >
            −
          </button>
          <span className="w-10 text-center font-mono text-sm">{quantity}</span>
          <button
            className="px-3 py-1.5 text-ink/60 hover:text-teal"
            onClick={() => setQuantity((q) => Math.min(stock, q + 1))}
          >
            +
          </button>
        </div>
        <span className="text-xs text-ink/50">เหลือ {stock} ชิ้น</span>
      </div>
      <Button onClick={handleAdd} isLoading={status === 'loading'} className="w-full">
        {status === 'done' ? 'เพิ่มลงตะกร้าแล้ว ✓' : 'เพิ่มลงตะกร้า'}
      </Button>
      {status === 'error' && (
        <p className="text-xs text-brick">ไม่สามารถเพิ่มสินค้าได้ ลองอีกครั้ง</p>
      )}
    </div>
  );
}
