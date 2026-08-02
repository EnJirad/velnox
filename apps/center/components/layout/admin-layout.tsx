'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useLanguage } from '@/components/providers/language-provider';
import { useAuthContext } from '@/components/providers/auth-provider';
import { useAuthStore } from '@/stores/auth-store';
import { LanguageSwitcher } from './language-switcher';
import { LoadingScreen } from './loading-screen';
import { LogoutButton } from './logout-button';
import { apiClient } from '@/lib/api-client';

function IconChart({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 3v18h18" />
      <path d="M7 14l4-4 3 3 5-6" />
    </svg>
  );
}

function IconUsers({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87" />
      <path d="M16 3.13a4 4 0 010 7.75" />
    </svg>
  );
}

function IconStore({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 9l1-5h16l1 5" />
      <path d="M3 9h18v11a1 1 0 01-1 1H4a1 1 0 01-1-1V9z" />
      <path d="M9 22V12h6v10" />
    </svg>
  );
}

function IconShop({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 21V8l9-5 9 5v13" />
      <path d="M7 21v-8h10v8" />
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

function IconOrders({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 5h11M9 12h11M9 19h11" />
      <path d="M5 5h.01M5 12h.01M5 19h.01" />
    </svg>
  );
}

function IconReport({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <path d="M14 2v6h6" />
      <path d="M16 13H8" />
      <path d="M16 17H8" />
      <path d="M10 9H8" />
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

function IconSettings({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
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

type AdminNoti = {
  id: string;
  title: string;
  message: string;
  type: string;
  href: string;
  readAt: string | null;
  createdAt: string;
};

type NavLink = {
  href: string;
  label: string;
  Icon: (props: { className?: string }) => JSX.Element;
  badge?: number;
};

const READ_KEY = 'velcenter-noti-read-ids';

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

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useLanguage();
  const { isInitializing } = useAuthContext();
  const user = useAuthStore((s) => s.user);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [pendingMerchants, setPendingMerchants] = useState(0);
  const [pendingProducts, setPendingProducts] = useState(0);

  const [notiOpen, setNotiOpen] = useState(false);
  const [notifications, setNotifications] = useState<AdminNoti[]>([]);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const notiRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isInitializing) return;
    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
      router.push('/login');
    }
  }, [isInitializing, user, router]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    setReadIds(loadReadIds());
  }, []);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    apiClient
      .get<{ pendingMerchants: number; pendingProducts: number }>('/analytics/platform-stats')
      .then((s) => {
        if (cancelled) return;
        setPendingMerchants(s.pendingMerchants ?? 0);
        setPendingProducts(s.pendingProducts ?? 0);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [user]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    apiClient
      .get<{ notifications: AdminNoti[]; unreadCount: number }>('/analytics/admin/notifications')
      .then((res) => {
        if (cancelled) return;
        setNotifications(Array.isArray(res.notifications) ? res.notifications : []);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [user]);

  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (notiRef.current && !notiRef.current.contains(e.target as Node)) {
        setNotiOpen(false);
      }
    }
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  const unreadCount = notifications.filter((n) => !readIds.has(n.id) && !n.readAt).length;

  function markAllRead() {
    const next = new Set(readIds);
    notifications.forEach((n) => next.add(n.id));
    setReadIds(next);
    saveReadIds(next);
  }

  const NAV_GROUPS: { title: string; links: NavLink[] }[] = [
    {
      title: t('admin.overview'),
      links: [{ href: '/admin', label: t('admin.overview'), Icon: IconChart }],
    },
    {
      title: t('admin.merchants'),
      links: [
        { href: '/admin/users', label: t('admin.users'), Icon: IconUsers },
        {
          href: '/admin/merchants',
          label: t('admin.merchants'),
          Icon: IconStore,
          badge: pendingMerchants,
        },
        { href: '/admin/shops', label: t('admin.shops'), Icon: IconShop },
        {
          href: '/admin/products',
          label: t('admin.products'),
          Icon: IconBox,
          badge: pendingProducts,
        },
        { href: '/admin/orders', label: t('admin.orders'), Icon: IconOrders },
      ],
    },
    {
      title: t('admin.analytics'),
      links: [
        { href: '/admin/reports', label: t('admin.reports'), Icon: IconReport },
        { href: '/admin/analytics', label: t('admin.analytics'), Icon: IconAnalytics },
        { href: '/admin/settings', label: t('admin.settings'), Icon: IconSettings },
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
        <div className="min-w-0">
          <p className="text-sm font-semibold">VelCenter</p>
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

      <nav className="flex-1 overflow-y-auto p-3 text-sm">
        {NAV_GROUPS.map((group, groupIndex) => (
          <div key={`\( {group.title}- \){groupIndex}`} className="mb-4">
            <p className="mb-1 px-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              {group.title}
            </p>
            <div className="flex flex-col gap-1">
              {group.links.map((link) => {
                const active =
                  pathname === link.href ||
                  (link.href !== '/admin' && pathname.startsWith(link.href));
                const Icon = link.Icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center justify-between rounded-md px-3 py-2 font-medium ${
                      active ? 'bg-teal-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Icon className="shrink-0 opacity-90" />
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
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 lg:hidden"
              aria-label="Menu"
            >
              <IconMenu />
            </button>
            <div>
              <p className="text-sm font-semibold text-slate-900">แผงควบคุมผู้ดูแลระบบ</p>
              <p className="hidden text-xs text-slate-400 sm:block">Velnox Platform Operations</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <LanguageSwitcher />

            <div className="relative" ref={notiRef}>
              <button
                type="button"
                onClick={() => setNotiOpen((v) => !v)}
                className="relative rounded-full p-2 text-slate-600 hover:bg-slate-100"
                aria-label="Notifications"
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
                    <p className="text-sm font-semibold text-slate-900">การแจ้งเตือน</p>
                    {notifications.length > 0 && (
                      <button
                        type="button"
                        onClick={markAllRead}
                        className="text-xs font-medium text-teal-700 hover:underline"
                      >
                        อ่านทั้งหมด
                      </button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="px-4 py-8 text-center text-sm text-slate-400">ไม่มีการแจ้งเตือน</p>
                    ) : (
                      notifications.map((n) => {
                        const unread = !readIds.has(n.id) && !n.readAt;
                        return (
                          <Link
                            key={n.id}
                            href={n.href || '/admin'}
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
                            <p className="text-sm font-medium text-slate-900">{n.title}</p>
                            <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">{n.message}</p>
                            <p className="mt-1 text-[11px] text-slate-400">
                              {new Date(n.createdAt).toLocaleString('th-TH')}
                            </p>
                          </Link>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>

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