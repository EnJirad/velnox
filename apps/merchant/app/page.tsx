import Link from 'next/link';

export default function MerchantLandingPage() {
  return (
    <section className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-2xl font-semibold text-slate-900">VelMerchant Portal</h1>
      <p className="text-slate-600">Manage your shop, products, and orders on Velnox.</p>
      <Link href="/dashboard" className="rounded-md bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800">
        Go to Dashboard
      </Link>
    </section>
  );
}
