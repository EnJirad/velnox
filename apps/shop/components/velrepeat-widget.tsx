'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatCurrency } from '@velnox/utils';
import { useVelRepeatStore, type VelRepeatFrequency } from '@/stores/velrepeat-store';
import { useLanguage } from '@/components/providers/language-provider';
import type { CatalogProduct, CatalogVelRepeatPlan } from '@/lib/catalog';

type BuiltOption = {
  planCode: string;
  frequency: VelRepeatFrequency;
  totalUnits: number;
  unitsPerDelivery: number;
  unitPrice: number;
  packPrice: number;
  saveAmount: number;
  label: string;
  sublabel: string;
  freeShipping: boolean;
};

function freqLabel(f: string) {
  if (f === 'WEEKLY') return 'ส่งทุกสัปดาห์';
  if (f === 'BI_WEEKLY') return 'ส่งทุก 2 สัปดาห์';
  return 'ส่งทุกเดือน';
}

function buildFromPlans(
  sellPrice: number,
  plans: CatalogVelRepeatPlan[],
): BuiltOption[] {
  return plans.map((p) => {
    const discount = p.discountPercent ?? 0;
    const unitPrice = Math.round(sellPrice * (1 - discount / 100));
    const packPrice = unitPrice * p.totalUnits;
    const saveAmount = sellPrice * p.totalUnits - packPrice;
    return {
      planCode: p.planCode,
      frequency: p.frequency,
      totalUnits: p.totalUnits,
      unitsPerDelivery: p.unitsPerDelivery ?? 1,
      unitPrice,
      packPrice,
      saveAmount,
      freeShipping: p.freeShipping ?? true,
      label: `${freqLabel(p.frequency)} × ${p.totalUnits}`,
      sublabel:
        `${p.totalUnits} ชิ้น` +
        (discount > 0 ? ` · ประหยัด ${discount}%` : '') +
        (p.freeShipping !== false ? ' · ส่งฟรี' : ''),
    };
  });
}

export function VelRepeatWidget({ product }: { product: CatalogProduct }) {
  const { t } = useLanguage();
  const router = useRouter();
  const purchasePack = useVelRepeatStore((s) => s.purchasePack);

  const options = useMemo(() => {
    if (!product.velRepeatEnabled) return [];
    const plans = product.velRepeatPlans ?? [];
    if (plans.length === 0) return [];
    return buildFromPlans(product.price, plans);
  }, [product]);

  const [enabled, setEnabled] = useState(false);
  const [selected, setSelected] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ไม่เปิด / ไม่มีแผน → ไม่แสดง (ขายปกติอย่างเดียว)
  if (options.length === 0) return null;

  const current =
    options.find((o) => o.planCode === (selected || options[0].planCode)) ?? options[0];

  async function handlePurchase() {
    setLoading(true);
    setError(null);
    try {
      await purchasePack({
        productId: product.id,
        planCode: current.planCode,
        frequency: current.frequency,
        totalUnits: current.totalUnits,
        unitsPerDelivery: current.unitsPerDelivery,
        unitPrice: current.unitPrice,
        packPrice: current.packPrice,
        freeShipping: current.freeShipping,
      });
      setDone(true);
    } catch (e: any) {
      setError(e?.message ?? 'ซื้อแพ็กไม่สำเร็จ กรุณาเข้าสู่ระบบแล้วลองใหม่');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-teal-200 bg-teal-50/50 p-4">
      <label className="flex cursor-pointer items-center justify-between">
        <span className="text-sm font-semibold text-slate-900">
          {t('velrepeat.title') || 'VelRepeat แพ็กส่งประจำ'}
        </span>
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => {
            setEnabled(e.target.checked);
            setDone(false);
            setError(null);
          }}
          className="h-4 w-4 accent-teal-700"
        />
      </label>
      <p className="mt-1 text-xs text-slate-500">
        จ่ายครั้งเดียว ได้เครดิตส่งของตามรอบ · แผนตั้งโดยร้านค้า
      </p>

      {enabled && !done && (
        <div className="mt-3 flex flex-col gap-3 border-t border-teal-100 pt-3">
          <div className="flex flex-col gap-2">
            {options.map((opt) => {
              const active = current.planCode === opt.planCode;
              return (
                <label
                  key={opt.planCode}
                  className={
                    'flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition ' +
                    (active
                      ? 'border-teal-600 bg-white ring-1 ring-teal-600'
                      : 'border-slate-200 bg-white hover:border-teal-300')
                  }
                >
                  <input
                    type="radio"
                    name="velrepeat-pack"
                    checked={active}
                    onChange={() => setSelected(opt.planCode)}
                    className="mt-1 accent-teal-700"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium text-slate-900">{opt.label}</span>
                      <span className="text-sm font-bold text-teal-700">
                        {formatCurrency(opt.packPrice)}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-slate-500">{opt.sublabel}</p>
                    <p className="mt-0.5 text-xs text-emerald-700">
                      ราคาต่อชิ้น {formatCurrency(opt.unitPrice)}
                      {opt.saveAmount > 0 && (
                        <span> · ประหยัด {formatCurrency(opt.saveAmount)}</span>
                      )}
                    </p>
                  </div>
                </label>
              );
            })}
          </div>

          {error && <p className="text-xs text-red-600">{error}</p>}

          <button
            type="button"
            disabled={loading}
            onClick={handlePurchase}
            className="w-full rounded-md bg-teal-700 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-60"
          >
            {loading ? 'กำลังดำเนินการ...' : `จ่ายแพ็กนี้ ${formatCurrency(current.packPrice)}`}
          </button>
        </div>
      )}

      {done && (
        <div className="mt-3 flex flex-col gap-2 border-t border-teal-100 pt-3 text-sm">
          <p className="text-emerald-700">ซื้อแพ็กสำเร็จแล้ว</p>
          <button
            type="button"
            onClick={() => router.push('/subscriptions')}
            className="w-fit text-xs font-medium text-teal-700 hover:underline"
          >
            จัดการแพ็กของฉัน →
          </button>
        </div>
      )}
    </div>
  );
}