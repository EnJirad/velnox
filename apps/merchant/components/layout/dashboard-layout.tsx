'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { dashboardStats } from '@/lib/mock-data';
import { useLanguage } from '@/components/providers/language-provider';
import { useAuthContext } from '@/components/providers/auth-provider';
import { useAuthStore } from '@/stores/auth-store';
import { LanguageSwitcher } from './language-switcher';

interface NavLink {
  href: string;
  label: string;
  icon: string;
  badge?: number;
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useLanguage();
  const { isInitializing } = useAuthContext();
  const user = useAuthStore((s) => s.user);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (isInitializing) return;
    if (!user) {
      router.push('/login');
    } else if (user.role !== 'MERCHANT') {
      router.push('/apply');
    }
  }, [isInitializing, user, router]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const NAV_LINKS: NavLink[] = [
    { href: '/dashboard', label: t('merchant.overview'), icon: '📊' },
    { href: '/dashboard/shop', label: t('merchant.myShop'), icon: '🏪' },
    { href: '/dashboard/products', label: t('merchant.products'), icon: '📦' },
    { href: '/dashboard/inventory', label: t('merchant.inventory'), icon: '🗃️' },
    { href: '/dashboard/orders', label: t('merchant.orders'), icon: '🧾', badge: dashboardStats.pendingOrders },
    { href: '/dashboard/analytics', label: t('merchant.analytics'), icon: '📈' },
  ];

  if (isInitializing || !user || user.role !== 'MERCHANT') {
    return <div className="flex min-h-screen items-center justify-center text-sm text-slate-400">กำลังโหลด...</div>;
  }

  const sidebarContent = (
    <>
      <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-4">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-700 text-white font-bold">V</span>
        <div>
          <p className="text-sm font-semibold text-slate-900">VelMerchant</p>
          <p className="text-xs text-slate-400">{user.name}</p>
        </div>
        <button onClick={() => setMobileOpen(false)} className="ml-auto text-slate-400 lg:hidden">✕</button>
      </div>
      <nav className="flex flex-1 flex-col gap-1 p-3 text-sm font-medium">
        {NAV_LINKS.map((link) => {
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center justify-between rounded-md px-3 py-2 ${
                active ? 'bg-teal-50 text-teal-700' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span className="flex items-center gap-2">
                <span>{link.icon}</span>
                {link.label}
              </span>
              {!!link.badge && (
                <span className="rounded-full bg-orange-500 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                  {link.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-slate-100 p-3">
        <Link href="/" className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-slate-500 hover:bg-slate-50">
          ↩️ {t('merchant.logout')}
        </Link>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 flex-col border-r border-slate-200 bg-white lg:flex">{sidebarContent}</aside>

      {/* Mobile sidebar drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <aside className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white shadow-xl">{sidebarContent}</aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileOpen(true)} className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 lg:hidden">
              ☰
            </button>
            <div>
              <p className="text-sm font-semibold text-slate-900">สวัสดี, {user.name} 👋</p>
              <p className="hidden text-xs text-slate-400 sm:block">ยอดขายวันนี้ปรับตัวดีขึ้น {dashboardStats.revenueGrowth}%</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <LanguageSwitcher />
            <button className="relative rounded-full p-2 hover:bg-slate-100">
              🔔
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-orange-500" />
            </button>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-100 text-sm font-semibold text-teal-700">
              {user.name.slice(0, 2).toUpperCase()}
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-x-hidden p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
