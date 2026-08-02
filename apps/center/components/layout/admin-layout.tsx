'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { platformStats } from '@/lib/mock-data';
import { useLanguage } from '@/components/providers/language-provider';
import { useAuthContext } from '@/components/providers/auth-provider';
import { useAuthStore } from '@/stores/auth-store';
import { LanguageSwitcher } from './language-switcher';
import { LoadingScreen } from './loading-screen';
import { LogoutButton } from './logout-button';

interface NavLink {
  href: string;
  label: string;
  icon: string;
  badge?: number;
}

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useLanguage();
  const { isInitializing } = useAuthContext();
  const user = useAuthStore((s) => s.user);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (isInitializing) return;
    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
      router.push('/login');
    }
  }, [isInitializing, user, router]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const NAV_GROUPS: { title: string; links: NavLink[] }[] = [
    {
      title: t('admin.overview'),
      links: [{ href: '/admin', label: t('admin.overview'), icon: '📊' }],
    },
    {
      title: t('admin.merchants'),
      links: [
        { href: '/admin/users', label: t('admin.users'), icon: '👤' },
        { href: '/admin/merchants', label: t('admin.merchants'), icon: '🏬', badge: platformStats.pendingMerchants },
        { href: '/admin/shops', label: t('admin.shops'), icon: '🏪' },
        { href: '/admin/products', label: t('admin.products'), icon: '📦', badge: platformStats.pendingProducts },
        { href: '/admin/orders', label: t('admin.orders'), icon: '🧾' },
      ],
    },
    {
      title: t('admin.analytics'),
      links: [
        { href: '/admin/reports', label: t('admin.reports'), icon: '📄' },
        { href: '/admin/analytics', label: t('admin.analytics'), icon: '📈' },
        { href: '/admin/settings', label: t('admin.settings'), icon: '⚙️' },
      ],
    },
  ];

  if (isInitializing || !user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
    return <LoadingScreen />;
  }

  const sidebarContent = (
    <>
      <div className="flex items-center gap-2 border-b border-slate-800 px-5 py-4">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-600 font-bold">V</span>
        <div>
          <p className="text-sm font-semibold">VelCenter</p>
          <p className="text-xs text-slate-400">{user.name}</p>
        </div>
        <button onClick={() => setMobileOpen(false)} className="ml-auto text-slate-400 lg:hidden">✕</button>
      </div>
      <nav className="flex-1 overflow-y-auto p-3 text-sm">
        {NAV_GROUPS.map((group, groupIndex) => (
          <div key={`${group.title}-${groupIndex}`} className="mb-4">
            <p className="mb-1 px-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              {group.title}
            </p>
            <div className="flex flex-col gap-1">
              {group.links.map((link) => {
                const active = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center justify-between rounded-md px-3 py-2 font-medium ${
                      active ? 'bg-teal-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span>{link.icon}</span>
                      {link.label}
                    </span>
                    {!!link.badge && (
                      <span className="rounded-full bg-orange-500 px-1.5 py-0.5 text-[10px] font-semibold">
                        {link.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
      <div className="border-t border-slate-800 p-3">
        <LogoutButton />
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-slate-100">
      <aside className="hidden w-64 flex-col bg-slate-900 text-white lg:flex">{sidebarContent}</aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <aside className="fixed inset-y-0 left-0 flex w-64 flex-col bg-slate-900 text-white shadow-xl">
            {sidebarContent}
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileOpen(true)} className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 lg:hidden">
              ☰
            </button>
            <div>
              <p className="text-sm font-semibold text-slate-900">แผงควบคุมผู้ดูแลระบบ</p>
              <p className="hidden text-xs text-slate-400 sm:block">Velnox Platform Operations</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <LanguageSwitcher />
            <button className="relative rounded-full p-2 hover:bg-slate-100">
              🔔
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-orange-500" />
            </button>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
              {user.name.slice(0, 2).toUpperCase()}
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-x-hidden p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
