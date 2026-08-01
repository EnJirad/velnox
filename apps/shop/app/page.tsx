import Link from 'next/link';
import { catalogService } from '@/services/catalog.service';
import { ProductCard } from '@/components/product/product-card';
import { CategoryChip } from '@/components/common/category-chip';

export default async function HomePage() {
  const [{ data: products }, categories] = await Promise.all([
    catalogService.listProducts({ page: 1 }).catch(() => ({ data: [] })),
    catalogService.listCategories().catch(() => []),
  ]);

  return (
    <div>
      {/* Hero */}
      <section className="border-b border-line bg-white">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-16 sm:grid-cols-2 sm:items-center">
          <div>
            <span className="font-mono text-xs uppercase tracking-widest text-marigold">
              ตลาดของร้านค้าอิสระ
            </span>
            <h1 className="mt-3 font-display text-4xl font-bold leading-tight text-ink sm:text-5xl">
              ของดีจากร้านค้าเล็กๆ<br />ทั่วประเทศ ในที่เดียว
            </h1>
            <p className="mt-4 max-w-md text-ink/60">
              VelShop รวมร้านค้าอิสระที่ผ่านการตรวจสอบไว้ในตลาดเดียว สั่งง่าย จ่ายชัดเจน
              ส่งตรงถึงบ้านคุณ
            </p>
            <div className="mt-6 flex gap-3">
              <Link
                href="/products"
                className="rounded-md bg-teal px-5 py-2.5 font-semibold text-white hover:bg-tealDeep"
              >
                เลือกซื้อสินค้า
              </Link>
              <a
                href="http://localhost:3001"
                className="rounded-md border border-line px-5 py-2.5 font-semibold text-ink hover:border-teal"
              >
                เปิดร้านค้าของคุณ
              </a>
            </div>
          </div>
          <div className="relative">
            <div className="rounded-lg border border-line bg-canvas p-6" style={{ borderLeft: '3px solid #E8A33D' }}>
              <div className="font-mono text-xs text-ink/50">ใบเสร็จตัวอย่าง</div>
              <div className="receipt-divider my-3" />
              <div className="flex justify-between font-mono text-sm">
                <span>ข้าวหอมมะลิ 5kg</span><span>฿199.00</span>
              </div>
              <div className="flex justify-between font-mono text-sm">
                <span>น้ำดื่มแพ็ค 12 ขวด</span><span>฿89.00</span>
              </div>
              <div className="receipt-divider my-3" />
              <div className="flex justify-between font-mono text-sm font-semibold text-teal">
                <span>รวมทั้งหมด</span><span>฿288.00</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-10">
          <h2 className="mb-4 font-display text-lg font-semibold text-ink">หมวดหมู่สินค้า</h2>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {categories.map((category) => (
              <CategoryChip key={category.id} category={category} />
            ))}
          </div>
        </section>
      )}

      {/* Featured products */}
      <section className="mx-auto max-w-6xl px-4 pb-16">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-ink">สินค้าล่าสุด</h2>
          <Link href="/products" className="text-sm font-medium text-teal hover:underline">
            ดูทั้งหมด →
          </Link>
        </div>
        {products.length === 0 ? (
          <p className="text-ink/50">ยังไม่มีสินค้าในระบบ — ลองรัน `pnpm db:seed`</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
