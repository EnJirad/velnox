import Link from 'next/link';
import { formatCurrency } from '@velnox/utils';
import { categories, products } from '@/lib/mock-data';
import { AddToCartButton } from '@/components/add-to-cart-button';

const featured = products.slice(0, 8);

export default function HomePage() {
  return (
    <div>
      <section className="bg-gradient-to-br from-teal-700 via-teal-700 to-teal-900 text-white">
        <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-14 md:grid-cols-2">
          <div className="flex flex-col gap-4">
            <span className="w-fit rounded-full bg-white/15 px-3 py-1 text-xs font-medium">
              🎉 แคมเปญกลางปี ลดสูงสุด 50%
            </span>
            <h1 className="text-3xl font-bold leading-tight sm:text-4xl">
              ช้อปครบ จบในที่เดียว<br />กับร้านค้าคุณภาพทั่วไทย
            </h1>
            <p className="max-w-md text-teal-50">
              เลือกซื้อสินค้ากว่าหมื่นรายการจากร้านค้าที่ผ่านการคัดสรร พร้อมจัดส่งรวดเร็วทั่วประเทศ
            </p>
            <div className="flex gap-3">
              <Link href="/products" className="rounded-md bg-orange-500 px-6 py-3 text-sm font-semibold text-white hover:bg-orange-600">
                เริ่มช้อปเลย
              </Link>
              <a href="http://localhost:3001" className="rounded-md border border-white/40 px-6 py-3 text-sm font-semibold hover:bg-white/10">
                เปิดร้านค้ากับเรา
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
        <h2 className="mb-4 text-lg font-semibold text-slate-900">หมวดหมู่ยอดนิยม</h2>
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
          <h2 className="text-lg font-semibold text-slate-900">สินค้าแนะนำ</h2>
          <Link href="/products" className="text-sm font-medium text-teal-700 hover:underline">
            ดูทั้งหมด →
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
            { icon: '🚚', title: 'จัดส่งรวดเร็ว', desc: 'ทั่วประเทศภายใน 1-3 วัน' },
            { icon: '🛡️', title: 'ช้อปอย่างมั่นใจ', desc: 'คุ้มครองผู้ซื้อ 100%' },
            { icon: '↩️', title: 'คืนสินค้าง่าย', desc: 'คืนได้ภายใน 7 วัน' },
            { icon: '💬', title: 'ช่วยเหลือ 24/7', desc: 'ทีมงานพร้อมดูแลทุกวัน' },
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
