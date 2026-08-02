'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient, uploadImage } from '@/lib/api-client';
import type { ApiCategory, ApiProduct } from '@/lib/api-types';

interface ProductFormProps {
  mode: 'create' | 'edit';
  productId?: string;
  initial?: ApiProduct;
}

export function ProductForm({ mode, productId, initial }: ProductFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [name, setName] = useState(initial?.name ?? '');
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [price, setPrice] = useState(initial ? String(initial.price) : '');
  const [stock, setStock] = useState(initial ? String(initial.stock) : '');
  const [status, setStatus] = useState<ApiProduct['status']>(initial?.status ?? 'ACTIVE');
  const [images, setImages] = useState<{ url: string }[]>(
    initial?.images?.map((img) => ({ url: img.url })) ?? [],
  );
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiClient.get<ApiCategory[]>('/categories').then((data) => {
      setCategories(data);
      if (!categoryId && data.length > 0) setCategoryId(data[0].id);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const result = await uploadImage(file, 'products');
      setImages((prev) => [...prev, { url: result.url }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'อัปโหลดรูปไม่สำเร็จ');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  function removeImage(index: number) {
    setImages((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !categoryId || !price || !stock) {
      setError('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }

    setSaving(true);
    try {
      if (mode === 'create') {
        await apiClient.post('/products', {
          name,
          categoryId,
          description: description || undefined,
          price: Number(price),
          stock: Number(stock),
          imageUrls: images.map((img) => img.url),
        });
      } else if (productId) {
        await apiClient.patch(`/products/${productId}`, {
          name,
          description: description || undefined,
          price: Number(price),
          stock: Number(stock),
          status,
        });
      }
      router.push('/dashboard/products');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'บันทึกสินค้าไม่สำเร็จ');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!productId) return;
    if (!window.confirm('ยืนยันการลบสินค้านี้?')) return;
    setDeleting(true);
    try {
      await apiClient.delete(`/products/${productId}`);
      router.push('/dashboard/products');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ลบสินค้าไม่สำเร็จ');
      setDeleting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {error && <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>}

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="mb-4 text-sm font-semibold text-slate-900">รูปภาพสินค้า</h2>
        <div className="flex flex-wrap gap-3">
          {images.map((img, i) => (
            <div key={img.url + i} className="relative h-24 w-24 overflow-hidden rounded-lg border border-slate-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt="" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-xs text-white"
              >
                ✕
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex h-24 w-24 flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-slate-300 text-xs text-slate-500 hover:border-teal-500 hover:text-teal-700 disabled:opacity-60"
          >
            {uploading ? '...' : <><span className="text-xl">+</span>เพิ่มรูป</>}
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="mb-4 text-sm font-semibold text-slate-900">ข้อมูลสินค้า</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1 sm:col-span-2">
            <label className="text-sm font-medium text-slate-700">ชื่อสินค้า</label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-600"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700">หมวดหมู่</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              disabled={mode === 'edit'}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-600 disabled:bg-slate-50 disabled:text-slate-400"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          {mode === 'edit' && (
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700">สถานะ</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ApiProduct['status'])}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-600"
              >
                <option value="ACTIVE">เผยแพร่แล้ว</option>
                <option value="INACTIVE">ปิดการขาย</option>
              </select>
            </div>
          )}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700">ราคา (บาท)</label>
            <input
              required
              type="number"
              min="0"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-600"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700">จำนวนสต็อก</label>
            <input
              required
              type="number"
              min="0"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-600"
            />
          </div>
          <div className="flex flex-col gap-1 sm:col-span-2">
            <label className="text-sm font-medium text-slate-700">คำอธิบายสินค้า</label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-600"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-teal-700 px-6 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-60"
          >
            {saving ? 'กำลังบันทึก...' : mode === 'create' ? 'เพิ่มสินค้า' : 'บันทึกการเปลี่ยนแปลง'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/dashboard/products')}
            className="rounded-md border border-slate-300 px-6 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            ยกเลิก
          </button>
        </div>
        {mode === 'edit' && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="text-sm font-medium text-red-600 hover:underline disabled:opacity-60"
          >
            {deleting ? 'กำลังลบ...' : 'ลบสินค้านี้'}
          </button>
        )}
      </div>
    </form>
  );
}
