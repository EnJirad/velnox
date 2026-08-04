'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, notFound } from 'next/navigation';
import { formatCurrency } from '@velnox/utils';
import { AddToCartButton } from '@/components/add-to-cart-button';
import { VelRepeatWidget } from '@/components/velrepeat-widget';
import { IconImage, IconReturn, IconShield, IconTruck } from '@/components/icons';
import {
  fetchProductBySlug,
  fetchProducts,
  toCatalogProduct,
  type CatalogProduct,
} from '@/lib/catalog';

export default function ProductDetailPage() {
  const params = useParams();
  const slug = typeof params.slug === 'string' ? params.slug : '';
  const [product, setProduct] = useState<CatalogProduct | null | undefined>(undefined);
  const [related, setRelated] = useState<CatalogProduct[]>([]);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    (async () => {
      const p = await fetchProductBySlug(slug);
      if (cancelled) return;
      setProduct(p);
      if (p?.categoryId) {
        const res = await fetchProducts({ categoryId: p.categoryId, limit: 5 });
        if (cancelled) return;
        setRelated(
          res.items
            .filter((x) => x.id !== p.id)
            .slice(0, 4)
            .map(toCatalogProduct),
        );
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (product === undefined) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 text-center text-sm text-slate-500">
        กำลังโหลดสินค้า...
      </div>
    );
  }

  if (product === null) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <nav className="mb-4 text-xs text-slate-500">
        <Link href="/" className="hover:text-teal-700">
          หน้าแรก
        </Link>{' '}
        ·{' '}
        <Link href="/products" className="hover:text-teal-700">
          สินค้าทั้งหมด
        </Link>{' '}
        · <span className="text-slate-700">{product.categoryName || product.category?.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        <div className="flex h-80 items-center justify-center overflow-hidden rounded-2xl bg-slate-50 text-slate-300">
          {product.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.imageUrl} alt={product.name} className="h-full w-full object-contain" />
          ) : (
            <IconImage size={64} />
          )}
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <span className="text-xs font-medium text-teal-700">{product.shopName}</span>
            <h1 className="mt-1 text-2xl font-semibold text-slate-900">{product.name}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-slate-500">
              <span className="font-mono text-xs text-slate-400">SKU: {product.sku}</span>
              {product.sellerSku && (
                <span className="text-xs text-slate-400">Seller: {product.sellerSku}</span>
              )}
            </div>
          </div>

          <div className="rounded-xl bg-slate-50 p-4">
            <span className="text-3xl font-bold text-teal-700">{formatCurrency(product.price)}</span>
          </div>

          <p className="text-sm leading-relaxed text-slate-600">{product.description}</p>

          <div className="flex items-center gap-2 text-sm text-slate-600">
            <span>สต็อกคงเหลือ:</span>
            <span
              className={
                product.stock > 20 ? 'font-medium text-emerald-600' : 'font-medium text-amber-600'
              }
            >
              {product.stock} ชิ้น
            </span>
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <AddToCartButton product={product} />
            </div>
            <button className="flex-1 rounded-md bg-orange-500 py-3 text-sm font-semibold text-white transition hover:bg-orange-600">
              ซื้อเลย
            </button>
          </div>

          <VelRepeatWidget product={product} />

          <div className="grid grid-cols-2 gap-3 rounded-xl border border-slate-200 p-4 text-xs text-slate-600">
            <span className="flex items-center gap-2">
              <IconTruck size={16} className="text-teal-700" /> จัดส่ง 1-3 วันทำการ
            </span>
            <span className="flex items-center gap-2">
              <IconShield size={16} className="text-teal-700" /> สินค้าแท้ 100%
            </span>
            <span className="flex items-center gap-2">
              <IconReturn size={16} className="text-teal-700" /> คืนได้ภายใน 7 วัน
            </span>
            <span className="text-slate-600">รองรับบัตร / พร้อมเพย์</span>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-14">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">สินค้าที่เกี่ยวข้อง</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {related.map((p) => (
              <Link
                key={p.id}
                href={`/products/${p.slug}`}
                className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white transition hover:shadow-lg"
              >
                <div className="flex h-28 items-center justify-center bg-slate-50 text-slate-300">
                  {p.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.imageUrl} alt={p.name} className="h-full w-full object-cover" />
                  ) : (
                    <IconImage size={32} />
                  )}
                </div>
                <div className="flex flex-col gap-1 p-3">
                  <span className="line-clamp-2 text-sm font-medium text-slate-900">{p.name}</span>
                  <span className="text-sm font-bold text-teal-700">{formatCurrency(p.price)}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}