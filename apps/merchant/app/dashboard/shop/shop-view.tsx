'use client';

import { useEffect, useRef, useState } from 'react';
import { apiClient, uploadImage } from '@/lib/api-client';
import type { ApiShop } from '@/lib/api-types';

export function ShopView() {
  const [shop, setShop] = useState<ApiShop | null>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<'logo' | 'banner' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const logoRef = useRef<HTMLInputElement>(null);
  const bannerRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    apiClient
      .get<ApiShop[]>('/shops/me')
      .then((shops) => {
        if (shops[0]) {
          setShop(shops[0]);
          setName(shops[0].name);
          setDescription(shops[0].description ?? '');
          setLogoUrl(shops[0].logoUrl);
          setBannerUrl(shops[0].bannerUrl);
        }
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'โหลดข้อมูลไม่สำเร็จ'))
      .finally(() => setLoading(false));
  }, []);

  async function handleImageSelect(
    e: React.ChangeEvent<HTMLInputElement>,
    kind: 'logo' | 'banner',
  ) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(kind);
    setError(null);
    try {
      const result = await uploadImage(file, 'shops');
      if (kind === 'logo') setLogoUrl(result.url);
      else setBannerUrl(result.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'อัปโหลดไม่สำเร็จ');
    } finally {
      setUploading(null);
      e.target.value = '';
    }
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const payload = {
        name,
        description,
        logoUrl: logoUrl ?? undefined,
        bannerUrl: bannerUrl ?? undefined,
      };
      if (shop) {
        const updated = await apiClient.patch<ApiShop>(`/shops/${shop.id}`, payload);
        setShop(updated);
        setBannerUrl(updated.bannerUrl);
        setLogoUrl(updated.logoUrl);
      } else {
        const created = await apiClient.post<ApiShop>('/shops', payload);
        setShop(created);
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'บันทึกไม่สำเร็จ');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="py-20 text-center text-sm text-slate-400">กำลังโหลด...</div>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">ร้านค้าของฉัน</h1>
        <p className="text-sm text-slate-500">ชื่อ · คำอธิบาย · โลโก้ · ภาพปก (cover)</p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>
      )}

      {/* Cover preview */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="relative h-40 bg-gradient-to-r from-teal-800 via-teal-600 to-teal-400 sm:h-52">
          {bannerUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={bannerUrl} alt="Cover" className="h-full w-full object-cover" />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between gap-3">
            <div className="flex items-center gap-3">
              {logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logoUrl} alt="" className="h-14 w-14 rounded-xl border-2 border-white object-cover shadow" />
              ) : (
                <div className="flex h-14 w-14 items-center justify-center rounded-xl border-2 border-white bg-teal-100 text-lg font-bold text-teal-800 shadow">
                  {(name || 'V').slice(0, 2).toUpperCase()}
                </div>
              )}
              <div className="text-white drop-shadow">
                <p className="text-lg font-bold">{name || 'ชื่อร้าน'}</p>
                <p className="line-clamp-1 text-xs opacity-90">{description || 'คำอธิบายร้าน'}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <input ref={bannerRef} type="file" accept="image/*" className="hidden" onChange={(e) => void handleImageSelect(e, 'banner')} />
              <button
                type="button"
                onClick={() => bannerRef.current?.click()}
                disabled={uploading === 'banner'}
                className="rounded-lg bg-white/90 px-3 py-1.5 text-xs font-semibold text-slate-800 hover:bg-white disabled:opacity-60"
              >
                {uploading === 'banner' ? 'อัปโหลด...' : bannerUrl ? 'เปลี่ยนปก' : 'ใส่ภาพปก'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">ชื่อร้านค้า</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-600"
              placeholder="ชื่อที่ลูกค้าจะเห็น"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">คำอธิบายร้านค้า</label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-600"
              placeholder="เล่าเกี่ยวกับร้าน สินค้า จุดเด่น"
            />
          </div>
          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={saving || !name.trim()}
            className="w-fit rounded-lg bg-teal-700 px-6 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-60"
          >
            {saving ? 'กำลังบันทึก...' : saved ? 'บันทึกแล้ว' : shop ? 'บันทึกการเปลี่ยนแปลง' : 'สร้างร้านค้า'}
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="mb-3 text-sm font-semibold text-slate-900">โลโก้ร้านค้า</p>
            <div className="flex flex-col items-center gap-3">
              {logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logoUrl} alt="Logo" className="h-24 w-24 rounded-xl object-cover" />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-xl bg-teal-100 text-3xl font-bold text-teal-700">
                  {(name || 'V').slice(0, 2).toUpperCase()}
                </div>
              )}
              <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={(e) => void handleImageSelect(e, 'logo')} />
              <button
                type="button"
                onClick={() => logoRef.current?.click()}
                disabled={uploading === 'logo'}
                className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium hover:bg-slate-50 disabled:opacity-60"
              >
                {uploading === 'logo' ? 'กำลังอัปโหลด...' : 'เปลี่ยนโลโก้'}
              </button>
            </div>
          </div>
          {shop && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-800">
              ร้านค้าเปิดใช้งานบน VelShop แล้ว · ใช้ภาพปกเพื่อให้หน้าร้านดูเป็นเอกลักษณ์
            </div>
          )}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600">
            <p className="font-semibold text-slate-800">หมายเหตุ</p>
            <p className="mt-1">
              ที่อยู่ตีกลับ / บัญชีรับเงินร้าน อยู่ในแท็บ <strong>ตั้งค่าร้าน</strong> และ{' '}
              <strong>รายได้ 7 วัน</strong> (กำลังเชื่อม schema เพิ่มเติม)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
