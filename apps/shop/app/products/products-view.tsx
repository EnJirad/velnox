'use client';

import { useCallback, useEffect, useState } from 'react';
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

export function ProductsView({ initialCategory }: { initialCategory?: string }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string | undefined>(initialCategory);
  const [sort, setSort] = useState<SortKey>('newest');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

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
    setProducts(result.items.map(toCatalogProduct));
    setTotal(result.total);
    setLoading(false);
  }, [activeCategory, search, sort]);

  useEffect(() => {
    load();
  }, [load]);

  function applySearch(e: React.FormEvent) {
    e.preventDefault();
    setSearch(searchInput.trim());
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-1 text-xl font-semibold text-slate-900">สินค้าทั้งหมด</h1>
      <p className="mb-6 text-sm text-slate-500">
        {loading ? 'กำลังโหลด...' : `พบ ${total} รายการ`}
      </p>

      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        <aside className="flex flex-col gap-6">
          <div>
            <h3 className="mb-2 text-sm font-semibold text-slate-900">ค้นหา</h3>
            <form onSubmit={applySearch} className="flex flex-col gap-2">
              <input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="ชื่อสินค้า / SKU"
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-600"
              />
              <button
                type="submit"
                className="rounded-md bg-teal-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-teal-800"
              >
                ค้นหา
              </button>
            </form>
          </div>
          <div>
            <h3 className="mb-2 text-sm font-semibold text-slate-900">หมวดหมู่</h3>
            <div className="flex flex-col gap-1 text-sm">
              <button
                onClick={() => setActiveCategory(undefined)}
                className={`rounded-md px-2 py-1.5 text-left ${
                  !activeCategory
                    ? 'bg-teal-50 font-medium text-teal-700'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                ทั้งหมด
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setActiveCategory(c.slug)}
                  className={`rounded-md px-2 py-1.5 text-left ${
                    activeCategory === c.slug
                      ? 'bg-teal-50 font-medium text-teal-700'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>
        </aside>

        <div>
          <div className="mb-4 flex justify-end">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="rounded-md border border-slate-300 px-3 py-1.5 text-sm outline-none focus:border-teal-600"
            >
              <option value="newest">ใหม่ล่าสุด</option>
              <option value="price_asc">ราคา: ต่ำ-สูง</option>
              <option value="price_desc">ราคา: สูง-ต่ำ</option>
            </select>
          </div>

          {loading ? (
            <div className="rounded-lg border border-dashed border-slate-300 p-12 text-center text-sm text-slate-500">
              กำลังโหลดสินค้า...
            </div>
          ) : products.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-300 p-12 text-center text-sm text-slate-500">
              ไม่พบสินค้าที่ตรงกับเงื่อนไข
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {products.map((p) => (
                <div
                  key={p.id}
                  className="group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white transition hover:shadow-lg"
                >
                  <Link
                    href={`/products/${p.slug}`}
                    className="flex h-32 items-center justify-center bg-slate-50 text-slate-300"
                  >
                    <ProductImage src={p.imageUrl} alt={p.name} width={400} />
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
                    <span className="mt-1 text-base font-bold text-teal-700">
                      {formatCurrency(p.price)}
                    </span>
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