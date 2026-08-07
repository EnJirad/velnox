'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useCartCount } from '@/stores/cart-store';
import { useAuthStore } from '@/stores/auth-store';
import { LanguageSwitcher } from './language-switcher';
import { NotificationBell } from './notification-bell';

export function Navigation() {
  const cartCount = useCartCount();
  const user = useAuthStore((s) => s.user);
  const pathname = usePathname();
  const router = useRouter();
  const [query, setQuery] = useState('');

  function onSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/products?q=${encodeURIComponent(q)}` : '/products');
  }

  return (
    <header className="sticky top-0 z-40 border-b border-teal-100/80 bg-white/90 backdrop-blur">
      {/* thin brand bar */}
      <div className="bg-gradient-to-r from-teal-800 via-teal-700 to-teal-600 text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-1 text-[11px]">
          <span>ส่งฟรีเมื่อสั่งครบ 990 บาท</span>
          <span className="hidden sm:inline opacity-90">Velnox · ช้อปมั่นใจ</span>
        </div>
      </div>

      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-2.5">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-teal-800 text-sm font-bold text-white shadow-soft">
            V
          </span>
          <span className="hidden text-lg font-bold tracking-tight text-teal-800 sm:inline">
            VelShop
          </span>
        </Link>

        <form onSubmit={onSearch} className="flex min-w-0 flex-1">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ค้นหาสินค้า..."
            className="w-full rounded-full border border-teal-100 bg-teal-50/40 px-4 py-2 text-sm outline-none ring-teal-600/30 placeholder:text-slate-400 focus:bg-white focus:ring-2"
          />
        </form>

        {/* desktop only actions */}
        <div className="hidden items-center gap-1 md:flex">
          <Link
            href="/products"
            className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
              pathname.startsWith('/products')
                ? 'bg-teal-50 text-teal-800'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            สินค้า
          </Link>
          <Link
            href="/orders"
            className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
              pathname.startsWith('/orders')
                ? 'bg-teal-50 text-teal-800'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            คำสั่งซื้อ
          </Link>
          <NotificationBell />
          <Link
            href="/cart"
            className="relative rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            ตะกร้า
            {cartCount > 0 && (
              <span className="ml-1 rounded-full bg-teal-600 px-1.5 text-[10px] font-bold text-white">
                {cartCount}
              </span>
            )}
          </Link>
          <Link
            href={user ? '/profile' : '/login'}
            className="rounded-lg bg-teal-700 px-3 py-1.5 text-sm font-semibold text-white hover:bg-teal-800"
          >
            {user ? user.name.split(' ')[0] : 'เข้าสู่ระบบ'}
          </Link>
          <LanguageSwitcher />
        </div>

        {/* mobile: only bell */}
        <div className="flex items-center md:hidden">
          {user && <NotificationBell />}
        </div>
      </div>
    </header>
  );
}
