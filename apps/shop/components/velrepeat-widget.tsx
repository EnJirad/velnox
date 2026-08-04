'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatCurrency } from '@velnox/utils';
import { useVelRepeatStore, type VelRepeatFrequency } from '@/stores/velrepeat-store';
import { useLanguage } from '@/components/providers/language-provider';
import type { CatalogProduct } from '@/lib/catalog';

type PackOption = {
  planCode: string;
  frequency: VelRepeatFrequency;
  totalUnits: number;
  unitsPerDelivery: number;
  discountPercent: number; // ส่วนลดจากราคาปกติ
  label: string;
  sublabel: string;
};

function buildPackOptions(sellPrice: number): (PackOption & {
  unitPrice: number;
  packPrice: number;
  saveAmount: number;
})[] {
  const base: PackOption[] = [
    {
      planCode: 'WEEKLY_4',
      frequency: 'WEEKLY',
      totalUnits: 4,
      unitsPerDelivery: 1,
      discountPercent: 5,
      label: 'ส่งทุกสัปดาห์ × 4',
      sublabel: '4 ชิ้น · ประหยัด 5%',
    },
    {
      planCode: 'WEEKLY_8',
      frequency: 'WEEKLY',
      totalUnits: 8,
      unitsPerDelivery: 1,
      discountPercent: 10,
      label: 'ส่งทุกสัปดาห์ × 8',
      sublabel: '8 ชิ้น · ประหยัด 10%',
    },
    {
      planCode: 'MONTHLY_3',
      frequency: 'MONTHLY',
      totalUnits: 3,
      unitsPerDelivery: 1,
      discountPercent: 8,
      label: 'ส่งทุกเดือน × 3',
      sublabel: '3 ชิ้น · ประหยัด 8%',
    },
    {
      planCode: 'MONTHLY_6',
      frequency: 'MONTHLY',
      totalUnits: 6,
      unitsPerDelivery: 1,
      discountPercent: 15,
      label: 'ส่งทุกเดือน × 6',
      sublabel: '6 ชิ้น · ประหยัด 15%',
    },
  ];

  return base.map((opt) => {
    const unitPrice = Math.round(sellPrice * (1 - opt.discountPercent / 100));
    const packPrice = unitPrice * opt.totalUnits;
    const saveAmount = sellPrice * opt.totalUnits - packPrice;
    return { ...opt, unitPrice, packPrice, saveAmount };
  });
}

export function VelRepeatWidget({ product }: { product: CatalogProduct }) {
  const { t } = useLanguage();
  const router = useRouter();
  const purchasePack = useVelRepeatStore((s) => s.purchasePack);

  const options = buildPackOptions(product.price);
  const [enabled, setEnabled] = useState(false);
  const [selected, setSelected] = useState(options[0].planCode);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const current = options.find((o) => o.planCode === selected) ?? options[0];

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
        freeShipping: true,
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
        จ่ายครั้งเดียว ได้เครดิตส่งของตามรอบ · ส่งฟรีทุกครั้ง
      </p>

      {enabled && !done && (
        <div className="mt-3 flex flex-col gap-3 border-t border-teal-100 pt-3">
          <div className="flex flex-col gap-2">
            {options.map((opt) => {
              const active = selected === opt.planCode;
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