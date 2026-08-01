'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input } from '@velnox/ui';
import { categoryService, productService, type ProductPayload } from '@/services/merchant.service';

interface Category {
  id: string;
  name: string;
}

export interface ProductFormValues extends ProductPayload {
  id?: string;
}

export function ProductForm({ initial }: { initial?: ProductFormValues }) {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState<ProductPayload>({
    name: initial?.name ?? '',
    categoryId: initial?.categoryId ?? '',
    description: initial?.description ?? '',
    price: initial?.price ?? 0,
    stock: initial?.stock ?? 0,
    status: initial?.status ?? 'DRAFT',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    categoryService.list().then((data) => {
      const cats = data as Category[];
      setCategories(cats);
      if (!form.categoryId && cats[0]) setForm((f) => ({ ...f, categoryId: cats[0].id }));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      if (initial?.id) {
        await productService.update(initial.id, form);
      } else {
        await productService.create(form);
      }
      router.push('/dashboard/products');
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-lg flex-col gap-4">
      <Input
        label="ชื่อสินค้า"
        required
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
      />

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-ink/80">หมวดหมู่</label>
        <select
          required
          value={form.categoryId}
          onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
          className="rounded-md border border-line bg-white px-3 py-2 text-sm outline-none focus:border-teal focus:ring-1 focus:ring-teal"
        >
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-ink/80">รายละเอียดสินค้า</label>
        <textarea
          rows={4}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="rounded-md border border-line bg-white px-3 py-2 text-sm outline-none focus:border-teal focus:ring-1 focus:ring-teal"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="ราคา (บาท)"
          type="number"
          min={0}
          step="0.01"
          required
          value={form.price}
          onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
        />
        <Input
          label="จำนวนสต็อก"
          type="number"
          min={0}
          required
          value={form.stock}
          onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-ink/80">สถานะ</label>
        <select
          value={form.status}
          onChange={(e) => setForm({ ...form, status: e.target.value as ProductPayload['status'] })}
          className="rounded-md border border-line bg-white px-3 py-2 text-sm outline-none focus:border-teal focus:ring-1 focus:ring-teal"
        >
          <option value="DRAFT">ฉบับร่าง (ยังไม่แสดงบนหน้าร้าน)</option>
          <option value="ACTIVE">เปิดขาย</option>
          <option value="INACTIVE">ปิดการขายชั่วคราว</option>
        </select>
      </div>

      {error && <p className="text-sm text-brick">{error}</p>}

      <Button type="submit" isLoading={isLoading} className="mt-2 w-fit">
        {initial?.id ? 'บันทึกการแก้ไข' : 'เพิ่มสินค้า'}
      </Button>
    </form>
  );
}
