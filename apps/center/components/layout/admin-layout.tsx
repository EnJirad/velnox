import Link from 'next/link';

const NAV_LINKS = [
  { href: '/admin', label: 'Overview' },
  { href: '/admin/users', label: 'Users' },
  { href: '/admin/merchants', label: 'Merchants' },
  { href: '/admin/shops', label: 'Shops' },
  { href: '/admin/products', label: 'Products' },
  { href: '/admin/orders', label: 'Orders' },
  { href: '/admin/reports', label: 'Reports' },
  { href: '/admin/analytics', label: 'Analytics' },
  { href: '/admin/settings', label: 'Settings' },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 border-r border-slate-200 bg-slate-900 p-4 text-white">
        <div className="mb-6 text-lg font-semibold">VelCenter</div>
        <nav className="flex flex-col gap-1 text-sm font-medium text-slate-200">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="rounded-md px-3 py-2 hover:bg-slate-800">
              {link.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 bg-slate-50 p-8">{children}</main>
    </div>
  );
}
