'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { formatCurrency } from '@velnox/utils';
import { categories, products } from '@/lib/mock-data';
import { AddToCartButton } from '@/components/add-to-cart-button';

type SortKey = 'popular' | 'price-asc' | 'price-desc' | 'rating';

export function ProductsView({ initialCategory }: { initialCategory?: string }) {
  const [activeCategory, setActiveCategory] = useState<string | undefined>(initialCategory);
  const [sort, setSort] = useState<SortKey>('popular');
  const [maxPrice, setMaxPrice] = useState(3000);
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    let list = products.filter((p) => p.price <= maxPrice);
    if (activeCategory) list = list.filter((p) => p.categoryId === activeCategory || categories.find((c) => c.slug === activeCategory)?.id === p.categoryId);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q) || p.shopName.toLowerCase().includes(q));
    }
    switch (sort) {
      case 'price-asc':
        return [...list].sort((a, b) => a.price - b.price);
      case 'price-desc':
        return [...list].sort((a, b) => b.price - a.price);
      case 'rating':
        return [...list].sort((a, b) => b.rating - a.rating);
      default:
        return [...list].sort((a, b) => b.soldCount - a.soldCount);
    }
  }, [activeCategory, sort, maxPrice, search]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-1 text-xl font-semibold text-slate-900">สินค้าทั้งหมด</h1>
      <p className="mb-6 text-sm text-slate-500">พบ {filtered.length} รายการ</p>

      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        <aside className="flex flex-col gap-6">
          <div>
            <h3 className="mb-2 text-sm font-semibold text-slate-900">ค้นหา</h3>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ชื่อสินค้า หรือร้านค้า"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-600"
            />
          </div>
          <div>
            <h3 className="mb-2 text-sm font-semibold text-slate-900">หมวดหมู่</h3>
            <div className="flex flex-col gap-1 text-sm">
              <button
                onClick={() => setActiveCategory(undefined)}
                className={`rounded-md px-2 py-1.5 text-left ${!activeCategory ? 'bg-teal-50 font-medium text-teal-700' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                ทั้งหมด
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setActiveCategory(c.slug)}
                  className={`rounded-md px-2 py-1.5 text-left ${activeCategory === c.slug ? 'bg-teal-50 font-medium text-teal-700' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>
          <div>
            <h3 className="mb-2 text-sm font-semibold text-slate-900">
              ราคาสูงสุด: {formatCurrency(maxPrice)}
            </h3>
            <input
              type="range"
              min={300}
              max={3000}
              step={100}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-teal-700"
            />
          </div>
        </aside>

        <div>
          <div className="mb-4 flex justify-end">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="rounded-md border border-slate-300 px-3 py-1.5 text-sm outline-none focus:border-teal-600"
            >
              <option value="popular">ยอดนิยม</option>
              <option value="rating">คะแนนสูงสุด</option>
              <option value="price-asc">ราคา: ต่ำ-สูง</option>
              <option value="price-desc">ราคา: สูง-ต่ำ</option>
            </select>
          </div>

          {filtered.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-300 p-12 text-center text-sm text-slate-500">
              ไม่พบสินค้าที่ตรงกับเงื่อนไข ลองปรับตัวกรองดูนะ
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {filtered.map((p) => (
                <div key={p.id} className="group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white transition hover:shadow-lg">
                  <Link href={`/products/${p.slug}`} className="flex h-32 items-center justify-center bg-slate-50 text-5xl">
                    {p.emoji}
                  </Link>
                  <div className="flex flex-1 flex-col gap-1 p-3">
                    <Link href={`/products/${p.slug}`} className="line-clamp-2 text-sm font-medium text-slate-900 group-hover:text-teal-700">
                      {p.name}
                    </Link>
                    <span className="text-xs text-slate-500">{p.shopName}</span>
                    <div className="flex items-center gap-1 text-xs text-amber-500">
                      ⭐ {p.rating} <span className="text-slate-400">· ขายแล้ว {p.soldCount}</span>
                    </div>
                    <span className="mt-1 text-base font-bold text-teal-700">{formatCurrency(p.price)}</span>
                    <AddToCartButton product={p} compact />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
