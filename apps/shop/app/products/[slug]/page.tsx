import { notFound } from 'next/navigation';
import { catalogService } from '@/services/catalog.service';
import { AddToCart } from '@/components/product/add-to-cart';
import { formatCurrency } from '@velnox/utils';

interface ProductDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { slug } = await params;

  const product = await catalogService.getProduct(slug).catch(() => null);
  if (!product) notFound();

  const image = product.images?.[0]?.url;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="grid gap-10 sm:grid-cols-2">
        <div className="aspect-square overflow-hidden rounded-lg border border-line bg-white">
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={image} alt={product.name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-6xl text-ink/15">
              🛍️
            </div>
          )}
        </div>

        <div>
          {product.shop?.name && (
            <span className="text-xs font-medium uppercase tracking-wide text-ink/40">
              จำหน่ายโดย {product.shop.name}
            </span>
          )}
          <h1 className="mt-2 font-display text-2xl font-bold text-ink">{product.name}</h1>
          <div className="mt-3 font-mono text-3xl font-bold text-teal">
            {formatCurrency(Number(product.price))}
          </div>

          <div className="receipt-divider my-6" />

          <p className="whitespace-pre-line text-sm leading-relaxed text-ink/70">
            {product.description || 'ผู้ขายยังไม่ได้เพิ่มรายละเอียดสินค้า'}
          </p>

          <div className="mt-8 max-w-xs">
            <AddToCart productId={product.id} stock={product.stock} />
          </div>
        </div>
      </div>
    </div>
  );
}
