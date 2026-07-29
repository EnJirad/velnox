import Link from 'next/link';

const NAV_LINKS = [
  { href: '/products', label: 'Products' },
  { href: '/cart', label: 'Cart' },
  { href: '/orders', label: 'Orders' },
  { href: '/profile', label: 'Profile' },
];

export function Navigation() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-lg font-semibold text-teal-700">
          VelShop
        </Link>
        <nav className="flex gap-6 text-sm font-medium text-slate-700">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-teal-700">
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
