'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';

const NAV_LINKS = [
  { href: '/dashboard', label: 'ภาพรวม' },
  { href: '/dashboard/products', label: 'สินค้า' },
  { href: '/dashboard/inventory', label: 'คลังสินค้า' },
  { href: '/dashboard/orders', label: 'คำสั่งซื้อ' },
  { href: '/dashboard/analytics', label: 'ยอดขาย' },
  { href: '/dashboard/shop', label: 'ตั้งค่าร้าน' },
];

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-canvas">
      <aside className="flex w-60 shrink-0 flex-col border-r border-line bg-white p-4">
        <Link href="/dashboard" className="mb-8 font-display text-lg font-bold text-teal">
          Vel<span className="text-brick">Merchant</span>
        </Link>
        <nav className="flex flex-1 flex-col gap-1 text-sm font-medium">
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-md px-3 py-2 ${
                  active ? 'bg-teal text-white' : 'text-ink/70 hover:bg-black/5'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-6 border-t border-line pt-4">
          <div className="text-sm font-medium text-ink">{user?.name}</div>
          <div className="text-xs text-ink/50">{user?.email}</div>
          <button onClick={() => logout()} className="mt-2 text-xs text-brick hover:underline">
            ออกจากระบบ
          </button>
        </div>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
