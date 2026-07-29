import Link from 'next/link';

const NAV_LINKS = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/dashboard/shop', label: 'Shop' },
  { href: '/dashboard/products', label: 'Products' },
  { href: '/dashboard/inventory', label: 'Inventory' },
  { href: '/dashboard/orders', label: 'Orders' },
  { href: '/dashboard/analytics', label: 'Analytics' },
];

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-60 border-r border-slate-200 bg-white p-4">
        <div className="mb-6 text-lg font-semibold text-teal-700">VelMerchant</div>
        <nav className="flex flex-col gap-2 text-sm font-medium text-slate-700">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="rounded-md px-3 py-2 hover:bg-slate-100">
              {link.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 bg-slate-50 p-8">{children}</main>
    </div>
  );
}
