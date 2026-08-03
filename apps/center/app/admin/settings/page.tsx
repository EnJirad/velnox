'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import type { PlatformSettings, UpdatePlatformSettingsPayload } from '@/lib/api-types';

const TABS = [
  { key: 'general', label: 'ทั่วไป' },
  { key: 'payments', label: 'การชำระเงิน' },
  { key: 'roles', label: 'สิทธิ์การเข้าถึง' },
] as const;

type TabKey = (typeof TABS)[number]['key'];

export default function SettingsPage() {
  const [tab, setTab] = useState<TabKey>('general');
  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const [form, setForm] = useState<UpdatePlatformSettingsPayload>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    apiClient
      .get<PlatformSettings>('/platform-settings')
      .then((data) => {
        setSettings(data);
        setForm({
          platformName: data.platformName,
          commissionPercent: data.commissionPercent,
          autoApproveMerchants: data.autoApproveMerchants,
          requireProductReview: data.requireProductReview,
          paymentCreditCard: data.paymentCreditCard,
          paymentPromptPay: data.paymentPromptPay,
          paymentBankTransfer: data.paymentBankTransfer,
          paymentCod: data.paymentCod,
        });
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'โหลดการตั้งค่าไม่สำเร็จ'))
      .finally(() => setLoading(false));
  }, []);

  function updateField<K extends keyof UpdatePlatformSettingsPayload>(
    key: K,
    value: UpdatePlatformSettingsPayload[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSuccess(null);
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const updated = await apiClient.patch<PlatformSettings>('/platform-settings', form);
      setSettings(updated);
      setForm({
        platformName: updated.platformName,
        commissionPercent: updated.commissionPercent,
        autoApproveMerchants: updated.autoApproveMerchants,
        requireProductReview: updated.requireProductReview,
        paymentCreditCard: updated.paymentCreditCard,
        paymentPromptPay: updated.paymentPromptPay,
        paymentBankTransfer: updated.paymentBankTransfer,
        paymentCod: updated.paymentCod,
      });
      setSuccess('บันทึกการตั้งค่าเรียบร้อยแล้ว');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'บันทึกการตั้งค่าไม่สำเร็จ');
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
        <h1 className="text-xl font-semibold text-slate-900">ตั้งค่าระบบ</h1>
        <p className="text-sm text-slate-500">จัดการการตั้งค่าระดับแพลตฟอร์มของ Velnox</p>
      </div>

      {error && <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>}
      {success && (
        <div className="rounded-md bg-teal-50 px-3 py-2 text-sm text-teal-700">{success}</div>
      )}

      <div className="flex gap-2 border-b border-slate-200">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`border-b-2 px-4 py-2 text-sm font-medium ${
              tab === t.key
                ? 'border-teal-700 text-teal-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'general' && (
        <div className="max-w-xl rounded-xl border border-slate-200 bg-white p-6">
          <div className="grid gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700">ชื่อแพลตฟอร์ม</label>
              <input
                value={form.platformName ?? ''}
                onChange={(e) => updateField('platformName', e.target.value)}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-600"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700">ค่าคอมมิชชั่นแพลตฟอร์ม (%)</label>
              <input
                type="number"
                min={0}
                max={100}
                step={0.01}
                value={form.commissionPercent ?? 0}
                onChange={(e) => updateField('commissionPercent', Number(e.target.value))}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-600"
              />
            </div>
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={!!form.autoApproveMerchants}
                onChange={(e) => updateField('autoApproveMerchants', e.target.checked)}
              />
              เปิดใช้งานการอนุมัติร้านค้าอัตโนมัติ
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={!!form.requireProductReview}
                onChange={(e) => updateField('requireProductReview', e.target.checked)}
              />
              ต้องตรวจสอบสินค้าใหม่ก่อนเผยแพร่
            </label>
          </div>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="mt-4 rounded-md bg-teal-700 px-6 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-60"
          >
            {saving ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่า'}
          </button>
          {settings?.updatedAt && (
            <p className="mt-2 text-xs text-slate-400">
              อัปเดตล่าสุด: {new Date(settings.updatedAt).toLocaleString('th-TH')}
            </p>
          )}
        </div>
      )}

      {tab === 'payments' && (
        <div className="max-w-xl rounded-xl border border-slate-200 bg-white p-6">
          <p className="mb-3 text-sm font-semibold text-slate-900">ช่องทางการชำระเงินที่เปิดใช้งาน</p>
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={!!form.paymentCreditCard}
                onChange={(e) => updateField('paymentCreditCard', e.target.checked)}
              />
              บัตรเครดิต/เดบิต
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={!!form.paymentPromptPay}
                onChange={(e) => updateField('paymentPromptPay', e.target.checked)}
              />
              พร้อมเพย์
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={!!form.paymentBankTransfer}
                onChange={(e) => updateField('paymentBankTransfer', e.target.checked)}
              />
              โอนผ่านธนาคาร
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={!!form.paymentCod}
                onChange={(e) => updateField('paymentCod', e.target.checked)}
              />
              เก็บเงินปลายทาง
            </label>
          </div>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="mt-4 rounded-md bg-teal-700 px-6 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-60"
          >
            {saving ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่า'}
          </button>
        </div>
      )}

      {tab === 'roles' && (
        <div className="max-w-xl rounded-xl border border-slate-200 bg-white p-6">
          <p className="mb-3 text-sm font-semibold text-slate-900">บทบาทผู้ดูแลระบบ</p>
          <div className="flex flex-col divide-y divide-slate-100 text-sm">
            {[
              { role: 'SUPER_ADMIN', desc: 'เข้าถึงและจัดการได้ทุกส่วนของระบบ' },
              { role: 'ADMIN', desc: 'จัดการร้านค้า สินค้า และคำสั่งซื้อ' },
            ].map((r) => (
              <div key={r.role} className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium text-slate-800">{r.role}</p>
                  <p className="text-xs text-slate-500">{r.desc}</p>
                </div>
                <span className="text-xs text-slate-400">อ่านอย่างเดียว</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
