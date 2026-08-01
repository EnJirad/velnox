'use client';

import Link from 'next/link';
import { formatCurrency } from '@velnox/utils';
import { categories, products } from '@/lib/mock-data';
import { AddToCartButton } from '@/components/add-to-cart-button';
import { useLanguage } from '@/components/providers/language-provider';

const featured = products.slice(0, 8);

export default function HomePage() {
  const { t } = useLanguage();

  return (
    <div>
      <section className="bg-gradient-to-br from-teal-700 via-teal-700 to-teal-900 text-white">
        <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-14 md:grid-cols-2">
          <div className="flex flex-col gap-4">
            <span className="w-fit rounded-full bg-white/15 px-3 py-1 text-xs font-medium">
              🎉 {t('home.heroBadge')}
            </span>
            <h1 className="text-3xl font-bold leading-tight sm:text-4xl">{t('home.heroTitle')}</h1>
            <p className="max-w-md text-teal-50">{t('home.heroSubtitle')}</p>
            <div className="flex gap-3">
              <Link href="/products" className="rounded-md bg-orange-500 px-6 py-3 text-sm font-semibold text-white hover:bg-orange-600">
                {t('home.startShopping')}
              </Link>
              <a href="https://velmerchant.vercel.app" className="rounded-md border border-white/40 px-6 py-3 text-sm font-semibold hover:bg-white/10">
                {t('home.openShop')}
              </a>
            </div>
          </div>
          <div className="hidden justify-center md:flex">
            <div className="grid grid-cols-2 gap-4">
              {featured.slice(0, 4).map((p) => (
                <div key={p.id} className="flex h-28 w-28 items-center justify-center rounded-2xl bg-white/10 text-5xl backdrop-blur">
                  {p.emoji}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">{t('home.popularCategories')}</h2>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/products?category=${cat.slug}`}
              className="flex flex-col items-center gap-2 rounded-xl border border-slate-200 bg-white p-4 text-center transition hover:border-teal-600 hover:shadow-md"
            >
              <span className="text-2xl">🛍️</span>
              <span className="text-xs font-medium text-slate-700">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">{t('home.featuredProducts')}</h2>
          <Link href="/products" className="text-sm font-medium text-teal-700 hover:underline">
            {t('common.seeAll')} →
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {featured.map((p) => (
            <div key={p.id} className="group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white transition hover:shadow-lg">
              <Link href={`/products/${p.slug}`} className="flex h-36 items-center justify-center bg-slate-50 text-6xl">
                {p.emoji}
              </Link>
              <div className="flex flex-1 flex-col gap-1 p-3">
                <Link href={`/products/${p.slug}`} className="line-clamp-2 text-sm font-medium text-slate-900 group-hover:text-teal-700">
                  {p.name}
                </Link>
                <span className="text-xs text-slate-500">{p.shopName}</span>
                <div className="flex items-center gap-1 text-xs text-amber-500">
                  ⭐ {p.rating} <span className="text-slate-400">({p.reviewCount})</span>
                </div>
                <div className="mt-1 flex items-center justify-between">
                  <span className="text-base font-bold text-teal-700">{formatCurrency(p.price)}</span>
                </div>
                <AddToCartButton product={p} compact />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid gap-4 rounded-2xl bg-slate-50 p-6 sm:grid-cols-4">
          {[
            { icon: '🚚', title: t('home.fastShipping'), desc: t('home.fastShippingDesc') },
            { icon: '🛡️', title: t('home.buyerProtection'), desc: t('home.buyerProtectionDesc') },
            { icon: '↩️', title: t('home.easyReturns'), desc: t('home.easyReturnsDesc') },
            { icon: '💬', title: t('home.support'), desc: t('home.supportDesc') },
          ].map((f) => (
            <div key={f.title} className="flex flex-col items-center gap-1 text-center">
              <span className="text-3xl">{f.icon}</span>
              <span className="text-sm font-semibold text-slate-900">{f.title}</span>
              <span className="text-xs text-slate-500">{f.desc}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
