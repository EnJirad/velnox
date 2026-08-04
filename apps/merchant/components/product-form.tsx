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

type PlanRow = {
  planCode: string;
  frequency: 'WEEKLY' | 'BI_WEEKLY' | 'MONTHLY';
  totalUnits: string;
  discountPercent: string;
  freeShipping: boolean;
};

const DEFAULT_PLANS: PlanRow[] = [
  {
    planCode: 'WEEKLY_4',
    frequency: 'WEEKLY',
    totalUnits: '4',
    discountPercent: '5',
    freeShipping: true,
  },
  {
    planCode: 'MONTHLY_3',
    frequency: 'MONTHLY',
    totalUnits: '3',
    discountPercent: '8',
    freeShipping: true,
  },
];

export function ProductForm({ mode, productId, initial }: ProductFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const categoryBoxRef = useRef<HTMLDivElement>(null);

  const [name, setName] = useState(initial?.name ?? '');
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? '');
  const [categoryQuery, setCategoryQuery] = useState(initial?.category?.name ?? '');
  const [suggestions, setSuggestions] = useState<ApiCategory[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [description, setDescription] = useState(initial?.description ?? '');
  const [price, setPrice] = useState(initial ? String(initial.price) : '');
  const [stock, setStock] = useState(initial ? String(initial.stock) : '');
  const [sellerSku, setSellerSku] = useState(initial?.sellerSku ?? '');
  const [status, setStatus] = useState<ApiProduct['status']>(initial?.status ?? 'ACTIVE');
  const [images, setImages] = useState<{ url: string }[]>(
    initial?.images?.map((img) => ({ url: img.url })) ?? [],
  );
  const [velRepeatEnabled, setVelRepeatEnabled] = useState(initial?.velRepeatEnabled ?? false);
  const [plans, setPlans] = useState<PlanRow[]>(() => {
    if (initial?.velRepeatPlans?.length) {
      return initial.velRepeatPlans.map((p) => ({
        planCode: p.planCode,
        frequency: p.frequency,
        totalUnits: String(p.totalUnits),
        discountPercent: String(p.discountPercent ?? 0),
        freeShipping: p.freeShipping ?? true,
      }));
    }
    return DEFAULT_PLANS;
  });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = categoryQuery.trim();
    if (!q) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(() => {
      apiClient
        .get<ApiCategory[]>(`/categories?search=${encodeURIComponent(q)}`)
        .then((data) => setSuggestions(Array.isArray(data) ? data : []))
        .catch(() => setSuggestions([]));
    }, 250);

    return () => clearTimeout(timer);
  }, [categoryQuery]);

  useEffect(() => {
    function onPointerDown(e: MouseEvent) {
      if (categoryBoxRef.current && !categoryBoxRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
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

  function selectCategory(cat: ApiCategory) {
    setCategoryId(cat.id);
    setCategoryQuery(cat.name);
    setSuggestions([]);
    setShowSuggestions(false);
  }

  async function resolveCategoryId(): Promise<string> {
    if (categoryId) return categoryId;

    const trimmed = categoryQuery.trim();
    if (trimmed.length < 2) {
      throw new Error('กรุณาระบุหมวดหมู่ (อย่างน้อย 2 ตัวอักษร)');
    }

    const cat = await apiClient.post<ApiCategory>('/categories/resolve', { name: trimmed });
    setCategoryId(cat.id);
    setCategoryQuery(cat.name);
    return cat.id;
  }

  function buildPlansPayload() {
    if (!velRepeatEnabled) return [];
    return plans
      .filter((p) => Number(p.totalUnits) >= 1)
      .map((p, i) => ({
        planCode: p.planCode.trim() || `${p.frequency}_${p.totalUnits}`,
        frequency: p.frequency,
        totalUnits: Number(p.totalUnits),
        unitsPerDelivery: 1,
        discountPercent: Number(p.discountPercent) || 0,
        freeShipping: p.freeShipping,
        isActive: true,
        sortOrder: i,
      }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !categoryQuery.trim() || !price || !stock) {
      setError('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }

    setSaving(true);
    try {
      const resolvedCategoryId = await resolveCategoryId();
      const sellerSkuValue = sellerSku.trim() || undefined;
      const plansPayload = buildPlansPayload();

      if (mode === 'create') {
        await apiClient.post('/products', {
          name: name.trim(),
          categoryId: resolvedCategoryId,
          description: description.trim() || undefined,
          price: Number(price),
          stock: Number(stock),
          sellerSku: sellerSkuValue,
          imageUrls: images.map((img) => img.url),
          velRepeatEnabled,
          velRepeatPlans: plansPayload,
        });
      } else if (productId) {
        await apiClient.patch(`/products/${productId}`, {
          name: name.trim(),
          description: description.trim() || undefined,
          price: Number(price),
          stock: Number(stock),
          status,
          sellerSku: sellerSku.trim() || '',
          ...(resolvedCategoryId ? { categoryId: resolvedCategoryId } : {}),
          velRepeatEnabled,
          velRepeatPlans: plansPayload,
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

      <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-6">
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
            {uploading ? (
              '...'
            ) : (
              <>
                <span className="text-xl">+</span>เพิ่มรูป
              </>
            )}
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-6">
        <h2 className="mb-4 text-sm font-semibold text-slate-900">ข้อมูลสินค้า</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1 sm:col-span-2">
            <label className="text-sm font-medium text-slate-700">ชื่อสินค้า</label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="เช่น หูฟังไร้สาย"
              className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-600"
            />
          </div>

          <div className="relative flex flex-col gap-1 sm:col-span-2" ref={categoryBoxRef}>
            <label className="text-sm font-medium text-slate-700">หมวดหมู่</label>
            <input
              required
              value={categoryQuery}
              onChange={(e) => {
                setCategoryQuery(e.target.value);
                setCategoryId('');
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              placeholder="พิมพ์เพื่อค้นหาหรือสร้างหมวดหมู่ เช่น เทคโนโลยี"
              className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-600"
              autoComplete="off"
            />
            {showSuggestions && categoryQuery.trim().length >= 1 && (
              <ul className="absolute top-full z-20 mt-1 max-h-52 w-full overflow-auto rounded-md border border-slate-200 bg-white shadow-lg">
                {suggestions.map((c) => (
                  <li key={c.id}>
                    <button
                      type="button"
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-teal-50"
                      onClick={() => selectCategory(c)}
                    >
                      <span className="text-teal-600">#</span>
                      <span>{c.name}</span>
                    </button>
                  </li>
                ))}
                {suggestions.length === 0 && (
                  <li className="px-3 py-2 text-sm text-slate-500">ไม่พบหมวดหมู่ที่ตรงกัน</li>
                )}
                <li className="border-t border-slate-100 px-3 py-2 text-xs text-slate-500">
                  กดบันทึกเพื่อใช้ “{categoryQuery.trim()}” — ระบบจะใช้หมวดหมู่ที่มีอยู่แล้ว หรือสร้างใหม่ให้แชร์กับร้านอื่น
                </li>
              </ul>
            )}
            {categoryId && <p className="text-xs text-teal-700">เลือกแล้ว: #{categoryQuery}</p>}
          </div>

          {mode === 'edit' && initial?.sku && (
            <div className="flex flex-col gap-1 sm:col-span-2">
              <label className="text-sm font-medium text-slate-700">SKU แพลตฟอร์ม</label>
              <input
                readOnly
                value={initial.sku}
                className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-sm text-slate-600 outline-none"
              />
              <p className="text-xs text-slate-400">ระบบสร้างให้อัตโนมัติ — แก้ไขไม่ได้</p>
            </div>
          )}

          <div className="flex flex-col gap-1 sm:col-span-2">
            <label className="text-sm font-medium text-slate-700">
              SKU ร้านค้า <span className="font-normal text-slate-400">(ไม่บังคับ)</span>
            </label>
            <input
              value={sellerSku}
              onChange={(e) => setSellerSku(e.target.value)}
              placeholder="เช่น SHIRT-RED-M / รหัสสต็อกของคุณ"
              maxLength={64}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-600"
            />
            <p className="text-xs text-slate-400">ใช้ผูกกับคลัง / Excel / บาร์โค้ดของร้านคุณ</p>
          </div>

          {mode === 'edit' && (
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700">สถานะ</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ApiProduct['status'])}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-600"
              >
                <option value="ACTIVE">เผยแพร่แล้ว (ขึ้นบน VelShop)</option>
                <option value="INACTIVE">ปิดการขาย</option>
                <option value="DRAFT">ฉบับร่าง</option>
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
              placeholder="รายละเอียดสินค้า วัสดุ ขนาด ฯลฯ"
              className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-600"
            />
          </div>
        </div>
      </div>

      {/* VelRepeat — ขายปกติยังใช้ได้คู่กัน */}
      <div className="rounded-xl border border-teal-200 bg-teal-50/40 p-4 sm:p-6">
        <label className="flex cursor-pointer items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-slate-900">เปิด VelRepeat (แพ็กส่งประจำ)</p>
            <p className="text-xs text-slate-500">
              ขายปกติยังใช้ได้ตามเดิม — เปิดแล้วลูกค้าเลือกแพ็กจ่ายก้อนเดียวได้เพิ่มบน VelShop
            </p>
          </div>
          <input
            type="checkbox"
            checked={velRepeatEnabled}
            onChange={(e) => setVelRepeatEnabled(e.target.checked)}
            className="h-4 w-4 shrink-0 accent-teal-700"
          />
        </label>

        {velRepeatEnabled && (
          <div className="mt-4 flex flex-col gap-3 border-t border-teal-100 pt-4">
            <p className="text-xs font-medium text-slate-600">แผนแพ็ก</p>
            {plans.map((plan, index) => (
              <div
                key={index}
                className="grid gap-2 rounded-lg border border-slate-200 bg-white p-3 sm:grid-cols-6"
              >
                <input
                  value={plan.planCode}
                  onChange={(e) => {
                    const next = [...plans];
                    next[index] = { ...plan, planCode: e.target.value };
                    setPlans(next);
                  }}
                  placeholder="รหัส เช่น WEEKLY_4"
                  className="rounded-md border border-slate-300 px-2 py-1.5 text-xs sm:col-span-2"
                />
                <select
                  value={plan.frequency}
                  onChange={(e) => {
                    const next = [...plans];
                    next[index] = {
                      ...plan,
                      frequency: e.target.value as PlanRow['frequency'],
                    };
                    setPlans(next);
                  }}
                  className="rounded-md border border-slate-300 px-2 py-1.5 text-xs"
                >
                  <option value="WEEKLY">รายสัปดาห์</option>
                  <option value="BI_WEEKLY">ทุก 2 สัปดาห์</option>
                  <option value="MONTHLY">รายเดือน</option>
                </select>
                <input
                  type="number"
                  min={1}
                  value={plan.totalUnits}
                  onChange={(e) => {
                    const next = [...plans];
                    next[index] = { ...plan, totalUnits: e.target.value };
                    setPlans(next);
                  }}
                  placeholder="จำนวนชิ้น"
                  className="rounded-md border border-slate-300 px-2 py-1.5 text-xs"
                />
                <input
                  type="number"
                  min={0}
                  max={50}
                  value={plan.discountPercent}
                  onChange={(e) => {
                    const next = [...plans];
                    next[index] = { ...plan, discountPercent: e.target.value };
                    setPlans(next);
                  }}
                  placeholder="% ส่วนลด"
                  className="rounded-md border border-slate-300 px-2 py-1.5 text-xs"
                />
                <button
                  type="button"
                  onClick={() => setPlans(plans.filter((_, i) => i !== index))}
                  className="text-left text-xs text-red-600 hover:underline sm:text-center"
                >
                  ลบ
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() =>
                setPlans([
                  ...plans,
                  {
                    planCode: '',
                    frequency: 'MONTHLY',
                    totalUnits: '3',
                    discountPercent: '5',
                    freeShipping: true,
                  },
                ])
              }
              className="w-fit text-xs font-medium text-teal-700 hover:underline"
            >
              + เพิ่มแผนแพ็ก
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-3">
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
            className="text-left text-sm font-medium text-red-600 hover:underline disabled:opacity-60 sm:text-right"
          >
            {deleting ? 'กำลังลบ...' : 'ลบสินค้านี้'}
          </button>
        )}
      </div>
    </form>
  );
}