import { ProductsView } from './products-view';

export default function ProductsPage({
  searchParams,
}: {
  searchParams: { category?: string };
}) {
  return <ProductsView initialCategory={searchParams.category} />;
}
