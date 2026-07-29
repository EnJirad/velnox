import Link from 'next/link';

export default function CenterLandingPage() {
  return (
    <section className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-2xl font-semibold text-slate-900">VelCenter</h1>
      <p className="text-slate-600">Velnox administration and operations center.</p>
      <Link href="/admin" className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800">
        Enter Admin
      </Link>
    </section>
  );
}
