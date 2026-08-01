import Link from 'next/link';
import type { Product } from '@velnox/types';
import { formatCurrency } from '@velnox/utils';

/**
 * Signature element: a "price tag" card with a clipped ticket-notch corner,
 * mono price, and a marigold underline sweep on hover.
 */
export function ProductCard({ product }: { product: Product & { shop?: { name: string } } }) {
  const image = product.images?.[0]?.url;

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-lg border border-line bg-white transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-canvas">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-4xl text-ink/15">
            🛍️
          </div>
        )}
        {/* ticket notch */}
        <div
          className="absolute -right-2 top-3 h-4 w-4 rotate-45 bg-canvas"
          style={{ boxShadow: 'inset 0 0 0 1px #E4DFCF' }}
        />
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3">
        {product.shop?.name && (
          <span className="text-[11px] font-medium uppercase tracking-wide text-ink/40">
            {product.shop.name}
          </span>
        )}
        <h3 className="line-clamp-2 text-sm font-medium text-ink">{product.name}</h3>
        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="font-mono text-base font-semibold text-teal">
            {formatCurrency(Number(product.price))}
          </span>
          <span className="h-0.5 w-6 origin-left scale-x-0 bg-marigold transition-transform group-hover:scale-x-100" />
        </div>
      </div>
    </Link>
  );
}
