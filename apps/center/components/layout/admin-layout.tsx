'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';

const NAV_LINKS = [
  { href: '/admin', label: 'ภาพรวม' },
  { href: '/admin/users', label: 'ผู้ใช้งาน' },
  { href: '/admin/merchants', label: 'ผู้ขาย' },
  { href: '/admin/shops', label: 'ร้านค้า' },
  { href: '/admin/products', label: 'สินค้า' },
  { href: '/admin/orders', label: 'คำสั่งซื้อ' },
  { href: '/admin/reports', label: 'รายงาน' },
  { href: '/admin/settings', label: 'ตั้งค่า' },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-canvas">
      <aside className="flex w-64 shrink-0 flex-col bg-ink p-4 text-white">
        <Link href="/admin" className="mb-8 font-display text-lg font-bold">
          Vel<span className="text-marigold">Center</span>
        </Link>
        <nav className="flex flex-1 flex-col gap-1 text-sm font-medium">
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-md px-3 py-2 ${
                  active ? 'bg-teal text-white' : 'text-white/70 hover:bg-white/10'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-6 border-t border-white/10 pt-4">
          <div className="text-sm font-medium">{user?.name}</div>
          <div className="text-xs text-white/50">{user?.role}</div>
          <button onClick={() => logout()} className="mt-2 text-xs text-marigold hover:underline">
            ออกจากระบบ
          </button>
        </div>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
