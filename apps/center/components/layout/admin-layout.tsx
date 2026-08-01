'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { platformStats } from '@/lib/mock-data';

interface NavLink {
  href: string;
  label: string;
  icon: string;
  badge?: number;
}

const NAV_GROUPS: { title: string; links: NavLink[] }[] = [
  {
    title: 'ภาพรวม',
    links: [{ href: '/admin', label: 'แดชบอร์ด', icon: '📊' }],
  },
  {
    title: 'การจัดการแพลตฟอร์ม',
    links: [
      { href: '/admin/users', label: 'ผู้ใช้งาน', icon: '👤' },
      { href: '/admin/merchants', label: 'ร้านค้า/พ่อค้า', icon: '🏬', badge: platformStats.pendingMerchants },
      { href: '/admin/shops', label: 'หน้าร้าน', icon: '🏪' },
      { href: '/admin/products', label: 'สินค้า', icon: '📦', badge: platformStats.pendingProducts },
      { href: '/admin/orders', label: 'คำสั่งซื้อ', icon: '🧾' },
    ],
  },
  {
    title: 'ข้อมูลเชิงลึก',
    links: [
      { href: '/admin/reports', label: 'รายงาน', icon: '📄' },
      { href: '/admin/analytics', label: 'วิเคราะห์ข้อมูล', icon: '📈' },
      { href: '/admin/settings', label: 'ตั้งค่าระบบ', icon: '⚙️' },
    ],
  },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-slate-100">
      <aside className="flex w-64 flex-col bg-slate-900 text-white">
        <div className="flex items-center gap-2 border-b border-slate-800 px-5 py-4">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-600 font-bold">V</span>
          <div>
            <p className="text-sm font-semibold">VelCenter</p>
            <p className="text-xs text-slate-400">ศูนย์ควบคุมแพลตฟอร์ม</p>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto p-3 text-sm">
          {NAV_GROUPS.map((group) => (
            <div key={group.title} className="mb-4">
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
          <Link href="/" className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-slate-400 hover:bg-slate-800">
            ↩️ ออกจากระบบ
          </Link>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3">
          <div>
            <p className="text-sm font-semibold text-slate-900">แผงควบคุมผู้ดูแลระบบ</p>
            <p className="text-xs text-slate-400">Velnox Platform Operations</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative rounded-full p-2 hover:bg-slate-100">
              🔔
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-orange-500" />
            </button>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
              AD
            </div>
          </div>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
