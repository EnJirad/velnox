'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useCartCount } from '@/stores/cart-store';
import { useAuthStore } from '@/stores/auth-store';
import { useLanguage } from '@/components/providers/language-provider';
import { LanguageSwitcher } from './language-switcher';

export function Navigation() {
  const cartCount = useCartCount();
  const user = useAuthStore((s) => s.user);
  const { t } = useLanguage();
  const [query, setQuery] = useState('');

  const NAV_LINKS = [
    { href: '/products', label: t('nav.products') },
    { href: '/orders', label: t('nav.orders') },
    { href: '/subscriptions', label: t('nav.subscriptions') },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="border-b border-slate-100 bg-teal-700 text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-1.5 text-xs">
          <span>🚚 ส่งฟรีทุกออเดอร์ตั้งแต่ 990 บาทขึ้นไป</span>
          <div className="hidden gap-4 sm:flex">
            <Link href="/orders" className="hover:underline">{t('nav.orders')}</Link>
            <span>ช่วยเหลือ · 02-000-0000</span>
          </div>
        </div>
      </div>
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold text-teal-700">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-700 text-white">V</span>
          VelShop
        </Link>

        <form
          className="hidden flex-1 items-center md:flex"
          onSubmit={(e) => e.preventDefault()}
        >
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ค้นหาสินค้า ร้านค้า หรือแบรนด์..."
            className="w-full rounded-l-md border border-slate-300 px-4 py-2 text-sm outline-none focus:border-teal-600"
          />
          <button
            type="submit"
            className="rounded-r-md bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800"
          >
            {t('common.search')}
          </button>
        </form>

        <nav className="ml-auto flex items-center gap-5 text-sm font-medium text-slate-700">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="hidden hover:text-teal-700 sm:inline">
              {link.label}
            </Link>
          ))}
          <Link href="/profile" className="hidden hover:text-teal-700 sm:inline">
            {user ? user.name.split(' ')[0] : t('nav.account')}
          </Link>
          <LanguageSwitcher />
          <Link href="/cart" className="relative flex items-center hover:text-teal-700">
            <span className="text-xl">🛒</span>
            {cartCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-orange-500 px-1 text-[11px] font-semibold text-white">
                {cartCount}
              </span>
            )}
          </Link>
        </nav>
      </div>
      <div className="border-t border-slate-100 bg-slate-50 md:hidden">
        <form className="mx-auto flex max-w-6xl px-4 py-2" onSubmit={(e) => e.preventDefault()}>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ค้นหาสินค้า..."
            className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm outline-none focus:border-teal-600"
          />
        </form>
      </div>
    </header>
  );
}
