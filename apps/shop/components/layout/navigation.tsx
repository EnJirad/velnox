'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useCartCount } from '@/stores/cart-store';
import { useAuthStore } from '@/stores/auth-store';
import { useLanguage } from '@/components/providers/language-provider';
import { LanguageSwitcher } from './language-switcher';
import { IconCart, IconClose, IconMenu, IconUser } from '@/components/icons';

export function Navigation() {
  const cartCount = useCartCount();
  const user = useAuthStore((s) => s.user);
  const { t } = useLanguage();
  const pathname = usePathname();
  const [query, setQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const NAV_LINKS = [
    { href: '/products', label: t('nav.products') },
    { href: '/orders', label: t('nav.orders') },
    { href: '/subscriptions', label: t('nav.subscriptions') },
  ];

  const accountHref = user ? '/profile' : '/login';
  const accountLabel = user ? user.name.split(' ')[0] : t('nav.account');

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="border-b border-slate-100 bg-teal-700 text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-1.5 text-xs">
          <span>ส่งฟรีทุกออเดอร์ตั้งแต่ 990 บาทขึ้นไป</span>
          <div className="hidden gap-4 sm:flex">
            <Link href="/orders" className="hover:underline">
              {t('nav.orders')}
            </Link>
            <span>ช่วยเหลือ · 02-000-0000</span>
          </div>
        </div>
      </div>

      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          className="rounded-md p-1.5 text-slate-600 hover:bg-slate-100 sm:hidden"
          aria-label="Menu"
        >
          {menuOpen ? <IconClose /> : <IconMenu />}
        </button>

        <Link href="/" className="flex items-center gap-2 text-xl font-bold text-teal-700">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-700 text-white">
            V
          </span>
          <span>VelShop</span>
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

        <nav className="ml-auto flex items-center gap-3 text-sm font-medium text-slate-700 sm:gap-5">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="hidden hover:text-teal-700 sm:inline">
              {link.label}
            </Link>
          ))}
          <Link href={accountHref} className="hidden hover:text-teal-700 sm:inline">
            {accountLabel}
          </Link>
          <div className="hidden sm:block">
            <LanguageSwitcher />
          </div>
          <Link
            href="/cart"
            className="relative flex items-center text-slate-700 hover:text-teal-700"
            aria-label="Cart"
          >
            <IconCart size={22} />
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

      {menuOpen && (
        <div className="border-t border-slate-200 bg-white sm:hidden">
          <nav className="flex flex-col divide-y divide-slate-100 text-sm font-medium text-slate-700">
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="px-4 py-3 hover:bg-slate-50">
                {link.label}
              </Link>
            ))}
            <Link
              href={accountHref}
              className="flex items-center gap-2 px-4 py-3 hover:bg-slate-50"
            >
              <IconUser size={16} />
              {accountLabel}
            </Link>
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-slate-500">{t('nav.language')}</span>
              <LanguageSwitcher />
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}