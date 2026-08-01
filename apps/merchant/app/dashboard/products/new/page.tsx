import { ProductForm } from '@/components/product/product-form';

export default function NewProductPage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink">เพิ่มสินค้าใหม่</h1>
      <p className="mt-1 text-sm text-ink/60">กรอกรายละเอียดสินค้าที่ต้องการวางขาย</p>
      <div className="mt-6">
        <ProductForm />
      </div>
    </div>
  );
}
