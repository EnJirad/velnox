'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import type { ApiShop } from '@/lib/api-types';

/**
 * ตั้งค่าร้าน: ที่อยู่ตีกลับ + ช่องทางรับเงิน
 * หมายเหตุ: ฟิลด์ return/bank ยังไม่มีใน Prisma Shop/Merchant
 * บันทึกชั่วคราวใน localStorage ต่อ shopId จนกว่าจะ migrate schema
 */
type PayoutPrefs = {
  returnName: string;
  returnPhone: string;
  returnAddress: string;
  returnProvince: string;
  returnPostal: string;
  bankName: string;
  bankAccountName: string;
  bankAccountNumber: string;
  promptPayId: string;
};

const empty: PayoutPrefs = {
  returnName: '',
  returnPhone: '',
  returnAddress: '',
  returnProvince: '',
  returnPostal: '',
  bankName: '',
  bankAccountName: '',
  bankAccountNumber: '',
  promptPayId: '',
};

function storageKey(shopId: string) {
  return `velmerchant_shop_prefs_${shopId}`;
}

export default function MerchantSettingsPage() {
  const [shop, setShop] = useState<ApiShop | null>(null);
  const [prefs, setPrefs] = useState<PayoutPrefs>(empty);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiClient
      .get<ApiShop[]>('/shops/me')
      .then((shops) => {
        const s = shops[0] ?? null;
        setShop(s);
        if (s) {
          try {
            const raw = localStorage.getItem(storageKey(s.id));
            if (raw) setPrefs({ ...empty, ...JSON.parse(raw) });
          } catch {
            /* ignore */
          }
        }
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'โหลดไม่สำเร็จ'))
      .finally(() => setLoading(false));
  }, []);

  function setField<K extends keyof PayoutPrefs>(key: K, value: string) {
    setPrefs((p) => ({ ...p, [key]: value }));
  }

  function handleSave() {
    if (!shop) return;
    localStorage.setItem(storageKey(shop.id), JSON.stringify(prefs));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (loading) {
    return <div className="py-20 text-center text-sm text-slate-400">กำลังโหลด...</div>;
  }

  if (!shop) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 py-12 text-center text-sm text-slate-500">
        สร้างร้านค้าก่อนที่แท็บ «ร้านค้าของฉัน»
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">ตั้งค่าร้าน</h1>
        <p className="text-sm text-slate-500">ที่อยู่ตีกลับ · บัญชีรับเงิน / PromptPay</p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>
      )}

      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="mb-3 text-sm font-semibold text-slate-900">ที่อยู่สำหรับตีกลับพัสดุ</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-xs text-slate-600">
            ชื่อผู้รับ
            <input
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={prefs.returnName}
              onChange={(e) => setField('returnName', e.target.value)}
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-slate-600">
            เบอร์โทร
            <input
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={prefs.returnPhone}
              onChange={(e) => setField('returnPhone', e.target.value)}
            />
          </label>
          <label className="col-span-full flex flex-col gap-1 text-xs text-slate-600">
            ที่อยู่
            <textarea
              rows={2}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={prefs.returnAddress}
              onChange={(e) => setField('returnAddress', e.target.value)}
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-slate-600">
            จังหวัด
            <input
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={prefs.returnProvince}
              onChange={(e) => setField('returnProvince', e.target.value)}
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-slate-600">
            รหัสไปรษณีย์
            <input
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={prefs.returnPostal}
              onChange={(e) => setField('returnPostal', e.target.value)}
            />
          </label>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="mb-3 text-sm font-semibold text-slate-900">ช่องทางรับเงินจากแพลตฟอร์ม</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-xs text-slate-600">
            ธนาคาร
            <input
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={prefs.bankName}
              onChange={(e) => setField('bankName', e.target.value)}
              placeholder="เช่น กสิกรไทย"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-slate-600">
            ชื่อบัญชี
            <input
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={prefs.bankAccountName}
              onChange={(e) => setField('bankAccountName', e.target.value)}
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-slate-600">
            เลขบัญชี
            <input
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-mono"
              value={prefs.bankAccountNumber}
              onChange={(e) => setField('bankAccountNumber', e.target.value)}
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-slate-600">
            PromptPay (เบอร์/เลขบัตร)
            <input
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-mono"
              value={prefs.promptPayId}
              onChange={(e) => setField('promptPayId', e.target.value)}
            />
          </label>
        </div>
        <p className="mt-3 text-[11px] text-amber-700">
          ข้อมูลนี้บันทึกในเบราว์เซอร์ชั่วคราว — ต้องเพิ่มคอลัมน์ใน Neon ก่อนซิงค์เซิร์ฟเวอร์
        </p>
      </section>

      <button
        type="button"
        onClick={handleSave}
        className="w-fit rounded-lg bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-800"
      >
        {saved ? 'บันทึกแล้ว' : 'บันทึกการตั้งค่า'}
      </button>
    </div>
  );
}
