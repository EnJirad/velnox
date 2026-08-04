'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { formatCurrency } from '@velnox/utils';
import type { Category } from '@velnox/types';
import { AddToCartButton } from '@/components/add-to-cart-button';
import { useLanguage } from '@/components/providers/language-provider';
import {
  IconBox,
  IconChat,
  IconImage,
  IconReturn,
  IconShield,
  IconTag,
  IconTruck,
} from '@/components/icons';
import {
  fetchCategories,
  fetchProducts,
  toCatalogProduct,
  type CatalogProduct,
} from '@/lib/catalog';

export default function HomePage() {
  const { t } = useLanguage();
  const [categories, setCategories] = useState<Category[]>([]);
  const [featured, setFeatured] = useState<CatalogProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [cats, prods] = await Promise.all([
        fetchCategories(),
        fetchProducts({ limit: 8, sort: 'newest' }),
      ]);
      if (cancelled) return;
      setCategories(cats);
      setFeatured(prods.items.map(toCatalogProduct));
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div>
      <section className="bg-gradient-to-br from-teal-700 via-teal-700 to-teal-900 text-white">
        <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-14 md:grid-cols-2">
          <div className="flex flex-col gap-4">
            <span className="w-fit rounded-full bg-white/15 px-3 py-1 text-xs font-medium">
              {t('home.heroBadge')}
            </span>
            <h1 className="text-3xl font-bold leading-tight sm:text-4xl">{t('home.heroTitle')}</h1>
            <p className="max-w-md text-teal-50">{t('home.heroSubtitle')}</p>
            <div className="flex gap-3">
              <Link
                href="/products"
                className="rounded-md bg-orange-500 px-6 py-3 text-sm font-semibold text-white hover:bg-orange-600"
              >
                {t('home.startShopping')}
              </Link>
              <a
                href="https://velmerchant.vercel.app"
                className="rounded-md border border-white/40 px-6 py-3 text-sm font-semibold hover:bg-white/10"
              >
                {t('home.openShop')}
              </a>
            </div>
          </div>
          <div className="hidden justify-center md:flex">
            <div className="grid grid-cols-2 gap-4">
              {(featured.length > 0 ? featured.slice(0, 4) : [1, 2, 3, 4]).map((item, i) => {
                const p = typeof item === 'object' ? item : null;
                return (
                  <div
                    key={p?.id ?? i}
                    className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-2xl bg-white/10 backdrop-blur"
                  >
                    {p?.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.imageUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <IconBox className="text-white/70" size={36} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">{t('home.popularCategories')}</h2>
        {loading && categories.length === 0 ? (
          <p className="text-sm text-slate-500">กำลังโหลดหมวดหมู่...</p>
        ) : categories.length === 0 ? (
          <p className="text-sm text-slate-500">ยังไม่มีหมวดหมู่</p>
        ) : (
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/products?category=${cat.slug}`}
                className="flex flex-col items-center gap-2 rounded-xl border border-slate-200 bg-white p-4 text-center transition hover:border-teal-600 hover:shadow-md"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-50 text-teal-700">
                  <IconTag size={20} />
                </span>
                <span className="text-xs font-medium text-slate-700">{cat.name}</span>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="mx-auto max-w-6xl px-4 py-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">{t('home.featuredProducts')}</h2>
          <Link href="/products" className="text-sm font-medium text-teal-700 hover:underline">
            {t('common.seeAll')} →
          </Link>
        </div>
        {loading ? (
          <p className="text-sm text-slate-500">กำลังโหลดสินค้า...</p>
        ) : featured.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-300 p-12 text-center text-sm text-slate-500">
            ยังไม่มีสินค้า — ตรวจสอบว่า Backend เชื่อมต่อแล้ว
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {featured.map((p) => (
              <div
                key={p.id}
                className="group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white transition hover:shadow-lg"
              >
                <Link
                  href={`/products/${p.slug}`}
                  className="flex h-36 items-center justify-center bg-slate-50 text-slate-300"
                >
                  {p.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.imageUrl} alt={p.name} className="h-full w-full object-cover" />
                  ) : (
                    <IconImage size={40} />
                  )}
                </Link>
                <div className="flex flex-1 flex-col gap-1 p-3">
                  <Link
                    href={`/products/${p.slug}`}
                    className="line-clamp-2 text-sm font-medium text-slate-900 group-hover:text-teal-700"
                  >
                    {p.name}
                  </Link>
                  <span className="text-xs text-slate-500">{p.shopName}</span>
                  {p.sku && <span className="font-mono text-[10px] text-slate-400">{p.sku}</span>}
                  <div className="mt-1">
                    <span className="text-base font-bold text-teal-700">{formatCurrency(p.price)}</span>
                  </div>
                  <AddToCartButton product={p} compact />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid gap-4 rounded-2xl bg-slate-50 p-6 sm:grid-cols-4">
          {[
            { Icon: IconTruck, title: t('home.fastShipping'), desc: t('home.fastShippingDesc') },
            { Icon: IconShield, title: t('home.buyerProtection'), desc: t('home.buyerProtectionDesc') },
            { Icon: IconReturn, title: t('home.easyReturns'), desc: t('home.easyReturnsDesc') },
            { Icon: IconChat, title: t('home.support'), desc: t('home.supportDesc') },
          ].map((f) => (
            <div key={f.title} className="flex flex-col items-center gap-2 text-center text-teal-700">
              <f.Icon size={28} />
              <span className="text-sm font-semibold text-slate-900">{f.title}</span>
              <span className="text-xs text-slate-500">{f.desc}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}