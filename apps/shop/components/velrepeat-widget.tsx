'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useVelRepeatStore, type VelRepeatFrequency } from '@/stores/velrepeat-store';
import { useLanguage } from '@/components/providers/language-provider';
import type { CatalogProduct } from '@/lib/catalog';

export function VelRepeatWidget({ product }: { product: CatalogProduct }) {
  const { t } = useLanguage();
  const router = useRouter();
  const subscribe = useVelRepeatStore((s) => s.subscribe);
  const [enabled, setEnabled] = useState(false);
  const [frequency, setFrequency] = useState<VelRepeatFrequency>('MONTHLY');
  const [quantity, setQuantity] = useState(1);
  const [done, setDone] = useState(false);

  const FREQUENCIES: { key: VelRepeatFrequency; label: string }[] = [
    { key: 'WEEKLY', label: t('velrepeat.weekly') },
    { key: 'BI_WEEKLY', label: t('velrepeat.biweekly') },
    { key: 'MONTHLY', label: t('velrepeat.monthly') },
  ];

  function handleSubscribe() {
    subscribe({
      productId: product.id,
      productName: product.name,
      imageUrl: product.imageUrl,
      price: product.price,
      frequency,
      quantity,
    });
    setDone(true);
  }

  return (
    <div className="rounded-xl border border-teal-200 bg-teal-50/50 p-4">
      <label className="flex cursor-pointer items-center justify-between">
        <span className="text-sm font-semibold text-slate-900">{t('velrepeat.title')}</span>
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => {
            setEnabled(e.target.checked);
            setDone(false);
          }}
          className="h-4 w-4 accent-teal-700"
        />
      </label>
      <p className="mt-1 text-xs text-slate-500">{t('velrepeat.subtitle')}</p>

      {enabled && !done && (
        <div className="mt-3 flex flex-col gap-3 border-t border-teal-100 pt-3">
          <div>
            <p className="mb-1 text-xs font-medium text-slate-600">{t('velrepeat.frequency')}</p>
            <div className="flex gap-2">
              {FREQUENCIES.map((f) => (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setFrequency(f.key)}
                  className={
                    'rounded-full px-3 py-1 text-xs font-medium ' +
                    (frequency === f.key
                      ? 'bg-teal-700 text-white'
                      : 'bg-white text-slate-600 ring-1 ring-slate-200')
                  }
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-600">{t('velrepeat.quantity')}</span>
            <div className="flex items-center rounded-md border border-slate-300 bg-white">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="px-2 py-1 text-sm"
              >
                −
              </button>
              <span className="w-6 text-center text-sm">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                className="px-2 py-1 text-sm"
              >
                +
              </button>
            </div>
          </div>
          <button
            type="button"
            onClick={handleSubscribe}
            className="w-full rounded-md bg-teal-700 py-2 text-sm font-semibold text-white hover:bg-teal-800"
          >
            {t('velrepeat.subscribeButton')}
          </button>
        </div>
      )}

      {done && (
        <div className="mt-3 flex flex-col gap-2 border-t border-teal-100 pt-3 text-sm">
          <p className="text-emerald-700">
            {t('velrepeat.subscribeButton')} — {t('velrepeat.active')}
          </p>
          <button
            type="button"
            onClick={() => router.push('/subscriptions')}
            className="w-fit text-xs font-medium text-teal-700 hover:underline"
          >
            {t('velrepeat.manage')} →
          </button>
        </div>
      )}
    </div>
  );
}