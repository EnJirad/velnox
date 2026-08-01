import { catalogService } from '@/services/catalog.service';
import { ProductCard } from '@/components/product/product-card';
import Link from 'next/link';

interface ProductsPageProps {
  searchParams: Promise<{ search?: string; categoryId?: string; page?: string }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const page = params.page ? Number(params.page) : 1;

  const [{ data: products, meta }, categories] = await Promise.all([
    catalogService.listProducts({ search: params.search, categoryId: params.categoryId, page }),
    catalogService.listCategories().catch(() => []),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">สินค้าทั้งหมด</h1>
          {params.search && (
            <p className="mt-1 text-sm text-ink/60">
              ผลการค้นหาสำหรับ “{params.search}” — {meta.total} รายการ
            </p>
          )}
        </div>
      </div>

      {categories.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2">
          <Link
            href="/products"
            className={`rounded-full border px-3 py-1 text-sm ${
              !params.categoryId ? 'border-teal bg-teal text-white' : 'border-line text-ink/70 hover:border-teal'
            }`}
          >
            ทั้งหมด
          </Link>
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/products?categoryId=${category.id}`}
              className={`rounded-full border px-3 py-1 text-sm ${
                params.categoryId === category.id
                  ? 'border-teal bg-teal text-white'
                  : 'border-line text-ink/70 hover:border-teal'
              }`}
            >
              {category.name}
            </Link>
          ))}
        </div>
      )}

      {products.length === 0 ? (
        <div className="rounded-lg border border-dashed border-line py-20 text-center text-ink/50">
          ไม่พบสินค้าที่ตรงกับเงื่อนไข
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {meta.totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2 font-mono text-sm">
              {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map((p) => (
                <Link
                  key={p}
                  href={{
                    pathname: '/products',
                    query: { ...params, page: p },
                  }}
                  className={`flex h-8 w-8 items-center justify-center rounded-md border ${
                    p === meta.page ? 'border-teal bg-teal text-white' : 'border-line text-ink/70 hover:border-teal'
                  }`}
                >
                  {p}
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
