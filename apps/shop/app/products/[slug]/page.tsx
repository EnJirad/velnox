import Link from 'next/link';
import { notFound } from 'next/navigation';
import { formatCurrency } from '@velnox/utils';
import { products } from '@/lib/mock-data';
import { AddToCartButton } from '@/components/add-to-cart-button';

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export default function ProductDetailPage({ params }: { params: { slug: string } }) {
  const product = products.find((p) => p.slug === params.slug);
  if (!product) notFound();

  const related = products.filter((p) => p.categoryId === product.categoryId && p.id !== product.id).slice(0, 4);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <nav className="mb-4 text-xs text-slate-500">
        <Link href="/" className="hover:text-teal-700">หน้าแรก</Link> ·{' '}
        <Link href="/products" className="hover:text-teal-700">สินค้าทั้งหมด</Link> ·{' '}
        <span className="text-slate-700">{product.categoryName}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        <div className="flex h-80 items-center justify-center rounded-2xl bg-slate-50 text-[8rem]">
          {product.emoji}
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <span className="text-xs font-medium text-teal-700">{product.shopName}</span>
            <h1 className="mt-1 text-2xl font-semibold text-slate-900">{product.name}</h1>
            <div className="mt-2 flex items-center gap-3 text-sm text-slate-500">
              <span className="flex items-center gap-1 text-amber-500">⭐ {product.rating}</span>
              <span>{product.reviewCount} รีวิว</span>
              <span>·</span>
              <span>ขายแล้ว {product.soldCount}</span>
            </div>
          </div>

          <div className="rounded-xl bg-slate-50 p-4">
            <span className="text-3xl font-bold text-teal-700">{formatCurrency(product.price)}</span>
          </div>

          <p className="text-sm leading-relaxed text-slate-600">{product.description}</p>

          <div className="flex items-center gap-2 text-sm text-slate-600">
            <span>สต็อกคงเหลือ:</span>
            <span className={product.stock > 20 ? 'font-medium text-emerald-600' : 'font-medium text-amber-600'}>
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

          <div className="grid grid-cols-2 gap-3 rounded-xl border border-slate-200 p-4 text-xs text-slate-600">
            <span>🚚 จัดส่งภายใน 1-3 วันทำการ</span>
            <span>🛡️ รับประกันสินค้าแท้ 100%</span>
            <span>↩️ คืนสินค้าได้ภายใน 7 วัน</span>
            <span>💳 รองรับบัตรเครดิต / พร้อมเพย์</span>
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
                <div className="flex h-28 items-center justify-center bg-slate-50 text-5xl">{p.emoji}</div>
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
