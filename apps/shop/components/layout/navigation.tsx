'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useCartStore } from '@/stores/cart-store';
import { useEffect } from 'react';

export function Navigation() {
  const { user, isAuthenticated, logout } = useAuth();
  const items = useCartStore((s) => s.items);
  const fetchCart = useCartStore((s) => s.fetchCart);
  const router = useRouter();
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (isAuthenticated) fetchCart();
  }, [isAuthenticated, fetchCart]);

  const cartCount = items.reduce((sum, i) => sum + i.quantity, 0);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    router.push(query ? `/products?search=${encodeURIComponent(query)}` : '/products');
  }

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-canvas/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-6 px-4 py-3">
        <Link href="/" className="font-display text-xl font-bold tracking-tight text-teal">
          Vel<span className="text-marigold">Shop</span>
        </Link>

        <form onSubmit={handleSearch} className="hidden flex-1 md:flex">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ค้นหาสินค้า..."
            className="w-full rounded-md border border-line bg-white px-3 py-1.5 text-sm outline-none focus:border-teal focus:ring-1 focus:ring-teal"
          />
        </form>

        <nav className="ml-auto flex items-center gap-4 text-sm font-medium text-ink/80">
          <Link href="/products" className="hover:text-teal">
            สินค้า
          </Link>
          <Link href="/orders" className="hover:text-teal">
            คำสั่งซื้อ
          </Link>
          <Link href="/cart" className="relative flex items-center gap-1 hover:text-teal">
            ตะกร้า
            {cartCount > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-marigold px-1 font-mono text-[11px] font-bold text-ink">
                {cartCount}
              </span>
            )}
          </Link>
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <Link href="/profile" className="hover:text-teal">
                {user?.name?.split(' ')[0] ?? 'บัญชี'}
              </Link>
              <button onClick={() => logout()} className="text-ink/50 hover:text-brick">
                ออกจากระบบ
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="rounded-md bg-teal px-3 py-1.5 font-semibold text-white hover:bg-tealDeep"
            >
              เข้าสู่ระบบ
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
