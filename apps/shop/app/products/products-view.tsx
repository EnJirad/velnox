'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { formatCurrency } from '@velnox/utils';
import type { Category } from '@velnox/types';
import { AddToCartButton } from '@/components/add-to-cart-button';
import { ProductImage } from '@/components/product-image';
import {
  fetchCategories,
  fetchProducts,
  toCatalogProduct,
  type CatalogProduct,
} from '@/lib/catalog';

type SortKey = 'newest' | 'price_asc' | 'price_desc';

export function ProductsView({
  initialCategory,
  initialSearch,
}: {
  initialCategory?: string;
  initialSearch?: string;
}) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string | undefined>(initialCategory);
  const [sort, setSort] = useState<SortKey>('newest');
  const [search, setSearch] = useState(initialSearch ?? '');
  const [searchInput, setSearchInput] = useState(initialSearch ?? '');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const cats = await fetchCategories();
    setCategories(cats);

    const categoryId =
      activeCategory && cats.length
        ? cats.find((c) => c.slug === activeCategory || c.id === activeCategory)?.id
        : undefined;

    const result = await fetchProducts({
      search: search || undefined,
      categoryId,
      limit: 48,
      sort,
    });
    let items = result.items.map(toCatalogProduct);
    if (inStockOnly) items = items.filter((p) => (p.stock ?? 1) > 0);
    const min = priceMin ? Number(priceMin) : null;
    const max = priceMax ? Number(priceMax) : null;
    if (min != null && !Number.isNaN(min)) items = items.filter((p) => Number(p.price) >= min);
    if (max != null && !Number.isNaN(max)) items = items.filter((p) => Number(p.price) <= max);
    setProducts(items);
    setTotal(result.total);
    setLoading(false);
  }, [activeCategory, search, sort, inStockOnly, priceMin, priceMax]);

  useEffect(() => {
    load();
  }, [load]);

  function applySearch(e: React.FormEvent) {
    e.preventDefault();
    setSearch(searchInput.trim());
  }

  const activeFilterCount = useMemo(() => {
    let n = 0;
    if (activeCategory) n++;
    if (inStockOnly) n++;
    if (priceMin || priceMax) n++;
    if (search) n++;
    return n;
  }, [activeCategory, inStockOnly, priceMin, priceMax, search]);

  const filterPanel = (
    <div className="flex flex-col gap-5">
      <form onSubmit={applySearch} className="flex flex-col gap-2">
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">ค้นหา</label>
        <input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="ชื่อสินค้า / SKU"
          className="w-full rounded-xl border border-teal-100 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-teal-500/30"
        />
        <button
          type="submit"
          className="rounded-xl bg-teal-700 px-3 py-2 text-xs font-semibold text-white hover:bg-teal-800"
        >
          ค้นหา
        </button>
      </form>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">หมวดหมู่</p>
        <div className="flex flex-col gap-1 text-sm">
          <button
            type="button"
            onClick={() => setActiveCategory(undefined)}
            className={`rounded-lg px-2.5 py-1.5 text-left ${
              !activeCategory ? 'bg-teal-50 font-medium text-teal-800' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            ทั้งหมด
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setActiveCategory(c.slug)}
              className={`rounded-lg px-2.5 py-1.5 text-left ${
                activeCategory === c.slug
                  ? 'bg-teal-50 font-medium text-teal-800'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">ราคา (บาท)</p>
        <div className="flex items-center gap-2">
          <input
            inputMode="numeric"
            placeholder="ต่ำสุด"
            value={priceMin}
            onChange={(e) => setPriceMin(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
          />
          <span className="text-slate-400">–</span>
          <input
            inputMode="numeric"
            placeholder="สูงสุด"
            value={priceMax}
            onChange={(e) => setPriceMax(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
          />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input
          type="checkbox"
          checked={inStockOnly}
          onChange={(e) => setInStockOnly(e.target.checked)}
          className="rounded border-slate-300 text-teal-600 focus:ring-teal-600"
        />
        มีสินค้าในสต็อกเท่านั้น
      </label>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">เรียงลำดับ</p>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortKey)}
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
        >
          <option value="newest">ใหม่ล่าสุด</option>
          <option value="price_asc">ราคาต่ำ → สูง</option>
          <option value="price_desc">ราคาสูง → ต่ำ</option>
        </select>
      </div>

      <button
        type="button"
        onClick={() => {
          setActiveCategory(undefined);
          setSearch('');
          setSearchInput('');
          setInStockOnly(false);
          setPriceMin('');
          setPriceMax('');
          setSort('newest');
        }}
        className="text-xs font-medium text-teal-700 hover:underline"
      >
        ล้างตัวกรองทั้งหมด
      </button>
    </div>
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 md:py-8">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">สินค้าทั้งหมด</h1>
          <p className="text-sm text-slate-500">
            {loading ? 'กำลังโหลด...' : `แสดง ${products.length} จาก ${total} รายการ`}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setFilterOpen(true)}
          className="rounded-full border border-teal-200 bg-white px-4 py-2 text-sm font-medium text-teal-800 shadow-sm lg:hidden"
        >
          ตัวกรอง{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        <aside className="hidden rounded-2xl border border-teal-50 bg-white p-4 shadow-soft lg:block">
          {filterPanel}
        </aside>

        <div>
          {loading ? (
            <div className="py-20 text-center text-sm text-slate-400">กำลังโหลดสินค้า...</div>
          ) : products.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 py-16 text-center text-sm text-slate-500">
              ไม่พบสินค้าตามเงื่อนไข
            </div>
          ) : (
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 xl:grid-cols-4">
              {products.map((p) => (
                <li
                  key={p.id}
                  className="flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition hover:border-teal-100 hover:shadow-soft"
                >
                  <Link href={`/products/${p.slug || p.id}`} className="block">
                    <div className="aspect-square bg-slate-50">
                      <ProductImage src={p.imageUrl} alt={p.name} width={400} />
                    </div>
                    <div className="p-3">
                      <p className="line-clamp-2 min-h-[2.5rem] text-sm font-medium text-slate-800">
                        {p.name}
                      </p>
                      <p className="mt-1 text-base font-bold text-teal-700">
                        {formatCurrency(Number(p.price))}
                      </p>
                    </div>
                  </Link>
                  <div className="mt-auto border-t border-slate-50 p-2">
                    <AddToCartButton product={p} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* mobile filter sheet */}
      {filterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            onClick={() => setFilterOpen(false)}
            aria-label="close"
          />
          <div className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-2xl bg-white p-5 pb-24 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <p className="font-semibold text-slate-900">ตัวกรองสินค้า</p>
              <button
                type="button"
                onClick={() => setFilterOpen(false)}
                className="text-sm text-teal-700"
              >
                เสร็จสิ้น
              </button>
            </div>
            {filterPanel}
          </div>
        </div>
      )}
    </div>
  );
}
