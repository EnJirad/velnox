'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { dashboardStats } from '@/lib/mock-data';

interface NavLink {
  href: string;
  label: string;
  icon: string;
  badge?: number;
}

const NAV_LINKS: NavLink[] = [
  { href: '/dashboard', label: 'ภาพรวม', icon: '📊' },
  { href: '/dashboard/shop', label: 'ร้านค้าของฉัน', icon: '🏪' },
  { href: '/dashboard/products', label: 'สินค้า', icon: '📦' },
  { href: '/dashboard/inventory', label: 'คลังสินค้า', icon: '🗃️' },
  { href: '/dashboard/orders', label: 'คำสั่งซื้อ', icon: '🧾', badge: dashboardStats.pendingOrders },
  { href: '/dashboard/analytics', label: 'วิเคราะห์ยอดขาย', icon: '📈' },
];

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="flex w-64 flex-col border-r border-slate-200 bg-white">
        <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-4">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-700 text-white font-bold">V</span>
          <div>
            <p className="text-sm font-semibold text-slate-900">VelMerchant</p>
            <p className="text-xs text-slate-400">Urban Thread Shop</p>
          </div>
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
            ↩️ ออกจากระบบ
          </Link>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3">
          <div>
            <p className="text-sm font-semibold text-slate-900">สวัสดี, ร้าน Urban Thread 👋</p>
            <p className="text-xs text-slate-400">ยอดขายวันนี้ปรับตัวดีขึ้น {dashboardStats.revenueGrowth}%</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative rounded-full p-2 hover:bg-slate-100">
              🔔
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-orange-500" />
            </button>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-100 text-sm font-semibold text-teal-700">
              UT
            </div>
          </div>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
