import { EditProductView } from './edit-product-view';

export default function EditProductPage({ params }: { params: { id: string } }) {
  return <EditProductView productId={params.id} />;
}
