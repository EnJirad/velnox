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
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    apiClient
      .get<ApiShop[]>('/shops/me')
      .then((shops) => {
        if (shops[0]) {
          setShop(shops[0]);
          setName(shops[0].name);
          setDescription(shops[0].description ?? '');
          setLogoUrl(shops[0].logoUrl);
        }
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'โหลดข้อมูลไม่สำเร็จ'))
      .finally(() => setLoading(false));
  }, []);

  async function handleLogoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const result = await uploadImage(file, 'shops');
      setLogoUrl(result.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'อัปโหลดโลโก้ไม่สำเร็จ');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      if (shop) {
        const updated = await apiClient.patch<ApiShop>(`/shops/${shop.id}`, { name, description, logoUrl: logoUrl ?? undefined });
        setShop(updated);
      } else {
        const created = await apiClient.post<ApiShop>('/shops', { name, description, logoUrl: logoUrl ?? undefined });
        setShop(created);
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'บันทึกไม่สำเร็จ');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="py-16 text-center text-sm text-slate-400">กำลังโหลด...</div>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">ร้านค้าของฉัน</h1>
        <p className="text-sm text-slate-500">
          {shop ? 'จัดการข้อมูลและการตั้งค่าของร้านค้า' : 'ตั้งค่าร้านค้าของคุณเป็นครั้งแรก'}
        </p>
      </div>

      {error && <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>}

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-6 rounded-xl border border-slate-200 bg-white p-6">
          <div>
            <h2 className="mb-3 text-sm font-semibold text-slate-900">ข้อมูลร้านค้า</h2>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700">ชื่อร้านค้า</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-600"
              />
            </div>
            <div className="mt-4 flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700">คำอธิบายร้านค้า</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-600"
              />
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saving || !name.trim()}
            className="w-fit rounded-md bg-teal-700 px-6 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-60"
          >
            {saving ? 'กำลังบันทึก...' : saved ? '✓ บันทึกแล้ว' : shop ? 'บันทึกการเปลี่ยนแปลง' : 'สร้างร้านค้า'}
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
                  {name.slice(0, 2).toUpperCase() || 'V'}
                </div>
              )}
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleLogoSelect} className="hidden" />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium hover:bg-slate-50 disabled:opacity-60"
              >
                {uploading ? 'กำลังอัปโหลด...' : 'เปลี่ยนโลโก้'}
              </button>
            </div>
          </div>
          {shop && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-800">
              ✅ ร้านค้าของคุณเปิดใช้งานอยู่บน VelShop
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
