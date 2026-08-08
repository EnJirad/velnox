'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { formatCurrency, formatDate } from '@velnox/utils';
import { useLanguage } from '@/components/providers/language-provider';
import { useAuthContext } from '@/components/providers/auth-provider';
import { useAuthStore } from '@/stores/auth-store';
import { LanguageSwitcher } from './language-switcher';
import { apiClient } from '@/lib/api-client';
import { logout as authLogout } from '@/lib/auth';

type Noti = {
  id: string;
  orderId: string;
  orderNumber: string;
  productName: string;
  quantity: number;
  amount: number;
  status: string;
  createdAt: string;
};

const READ_KEY = 'velmerchant-noti-read-ids';

function IconChart({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 3v18h18" />
      <path d="M7 14l4-4 3 3 5-6" />
    </svg>
  );
}
function IconShop({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 9l1-5h16l1 5" />
      <path d="M3 9h18v11a1 1 0 01-1 1H4a1 1 0 01-1-1V9z" />
      <path d="M9 22V12h6v10" />
    </svg>
  );
}
function IconBox({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 8l-9-5-9 5 9 5 9-5z" />
      <path d="M3 8v8l9 5 9-5V8" />
    </svg>
  );
}
function IconWarehouse({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 21V8l9-5 9 5v13" />
      <path d="M7 21v-8h10v8" />
    </svg>
  );
}
function IconOrders({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 5h11M9 12h11M9 19h11" />
      <path d="M5 5h.01M5 12h.01M5 19h.01" />
    </svg>
  );
}
function IconAnalytics({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 19V5" />
      <path d="M4 19h16" />
      <path d="M8 17V10" />
      <path d="M12 17V7" />
      <path d="M16 17v-5" />
    </svg>
  );
}
function IconBell({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 8a6 6 0 10-12 0c0 7-3 7-3 7h18s-3 0-3-7" />
      <path d="M13.7 21a2 2 0 01-3.4 0" />
    </svg>
  );
}
function IconMenu({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

function IconSettings({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  );
}
function IconPayout({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M2 10h20" />
      <path d="M12 15h4" />
    </svg>
  );
}
function IconLogout({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
      <path d="M16 17l5-5-5-5" />
      <path d="M21 12H9" />
    </svg>
  );
}

function loadReadIds(): Set<string> {
  try {
    const raw = localStorage.getItem(READ_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as string[]);
  } catch {
    return new Set();
  }
}

function saveReadIds(ids: Set<string>) {
  localStorage.setItem(READ_KEY, JSON.stringify([...ids]));
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useLanguage();
  const { isInitializing } = useAuthContext();
  const user = useAuthStore((s) => s.user);
  const clearUser = useAuthStore((s) => s.clearUser);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notiOpen, setNotiOpen] = useState(false);
  const [notifications, setNotifications] = useState<Noti[]>([]);
  const [pendingOrders, setPendingOrders] = useState(0);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const notiRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isInitializing) return;
    if (!user) router.push('/login');
    else if (user.role !== 'MERCHANT') router.push('/apply');
  }, [isInitializing, user, router]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    setReadIds(loadReadIds());
  }, []);

  useEffect(() => {
    let cancelled = false;
    apiClient
      .get<{
        pendingOrders: number;
        notifications: Noti[];
      }>('/analytics/merchant/dashboard')
      .then((res) => {
        if (cancelled) return;
        setPendingOrders(res.pendingOrders ?? 0);
        setNotifications(Array.isArray(res.notifications) ? res.notifications : []);
      })
      .catch(() => {
        /* keep zeros */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (notiRef.current && !notiRef.current.contains(e.target as Node)) {
        setNotiOpen(false);
      }
    }
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  const unreadCount = notifications.filter((n) => !readIds.has(n.id)).length;

  function markAllRead() {
    const next = new Set(readIds);
    notifications.forEach((n) => next.add(n.id));
    setReadIds(next);
    saveReadIds(next);
  }

  function openNoti() {
    setNotiOpen((v) => !v);
  }

  async function handleLogout() {
    await authLogout();
    clearUser();
    router.push('/login');
  }

  const NAV_LINKS = [
    { href: '/dashboard', label: t('merchant.overview'), Icon: IconChart },
    { href: '/dashboard/shop', label: t('merchant.myShop'), Icon: IconShop },
    { href: '/dashboard/products', label: 'สินค้าและคลัง', Icon: IconBox },
    { href: '/dashboard/orders', label: t('merchant.orders'), Icon: IconOrders, badge: pendingOrders },
    { href: '/dashboard/payout', label: 'รายได้ 7 วัน', Icon: IconPayout },
    { href: '/dashboard/analytics', label: t('merchant.analytics'), Icon: IconAnalytics },
    { href: '/dashboard/settings', label: 'ตั้งค่าร้าน', Icon: IconSettings },
  ];

  if (isInitializing || !user || user.role !== 'MERCHANT') {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-slate-400">
        {t('common.loading')}
      </div>
    );
  }

  const sidebarContent = (
    <>
      <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-4">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-700 text-sm font-bold text-white">
          V
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-900">VelMerchant</p>
          <p className="truncate text-xs text-slate-400">{user.name}</p>
        </div>
        <button
          type="button"
          onClick={() => setMobileOpen(false)}
          className="ml-auto text-slate-400 lg:hidden"
          aria-label="Close"
        >
          ×
        </button>
      </div>
      <nav className="flex flex-1 flex-col gap-1 p-3 text-sm font-medium">
        {NAV_LINKS.map((link) => {
          const active = pathname === link.href || (link.href !== '/dashboard' && pathname.startsWith(link.href));
          const Icon = link.Icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center justify-between rounded-md px-3 py-2 ${
                active ? 'bg-teal-50 text-teal-700' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span className="flex items-center gap-2">
                <Icon className="shrink-0 opacity-80" />
                {link.label}
              </span>
              {!!link.badge && link.badge > 0 && (
                <span className="rounded-full bg-orange-500 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                  {link.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-slate-100 p-3">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-slate-500 hover:bg-slate-50"
        >
          <IconLogout />
          {t('merchant.logout')}
        </button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="hidden w-64 flex-col border-r border-slate-200 bg-white lg:flex">
        {sidebarContent}
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <aside className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white shadow-xl">
            {sidebarContent}
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 lg:hidden"
              aria-label="Menu"
            >
              <IconMenu />
            </button>
            <div>
              <p className="text-sm font-semibold text-slate-900">
                {t('merchant.greeting')}, {user.name}
              </p>
              <p className="hidden text-xs text-slate-400 sm:block">VelMerchant</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <LanguageSwitcher />

            <div className="relative" ref={notiRef}>
              <button
                type="button"
                onClick={openNoti}
                className="relative rounded-full p-2 text-slate-600 hover:bg-slate-100"
                aria-label={t('merchant.notifications')}
              >
                <IconBell />
                {unreadCount > 0 && (
                  <span className="absolute right-1 top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-orange-500 px-1 text-[10px] font-semibold text-white">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {notiOpen && (
                <div className="absolute right-0 z-50 mt-2 w-[min(100vw-2rem,22rem)] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
                  <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                    <p className="text-sm font-semibold text-slate-900">{t('merchant.notifications')}</p>
                    {notifications.length > 0 && (
                      <button
                        type="button"
                        onClick={markAllRead}
                        className="text-xs font-medium text-teal-700 hover:underline"
                      >
                        {t('merchant.markAllRead')}
                      </button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="px-4 py-8 text-center text-sm text-slate-400">
                        {t('merchant.noNotifications')}
                      </p>
                    ) : (
                      notifications.map((n) => {
                        const unread = !readIds.has(n.id);
                        return (
                          <Link
                            key={n.id}
                            href="/dashboard/orders"
                            onClick={() => {
                              const next = new Set(readIds);
                              next.add(n.id);
                              setReadIds(next);
                              saveReadIds(next);
                              setNotiOpen(false);
                            }}
                            className={`block border-b border-slate-50 px-4 py-3 hover:bg-slate-50 ${
                              unread ? 'bg-teal-50/40' : ''
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-sm font-medium text-slate-800">
                                {t('merchant.boughtItem')}: {n.productName}
                              </p>
                              {unread && (
                                <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-orange-500" />
                              )}
                            </div>
                            <p className="mt-0.5 text-xs text-slate-500">
                              #{n.orderNumber} · {t('merchant.qty')} {n.quantity} ·{' '}
                              {formatCurrency(n.amount)}
                            </p>
                            <p className="mt-0.5 text-[11px] text-slate-400">{formatDate(n.createdAt)}</p>
                          </Link>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>

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