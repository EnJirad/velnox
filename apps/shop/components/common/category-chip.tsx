import Link from 'next/link';
import type { Category } from '@velnox/types';

export function CategoryChip({ category }: { category: Category }) {
  return (
    <Link
      href={`/products?categoryId=${category.id}`}
      className="flex shrink-0 flex-col items-center gap-2 rounded-lg border border-line bg-white px-5 py-4 text-center transition-colors hover:border-teal"
    >
      <span className="text-2xl">🧺</span>
      <span className="text-sm font-medium text-ink">{category.name}</span>
    </Link>
  );
}
