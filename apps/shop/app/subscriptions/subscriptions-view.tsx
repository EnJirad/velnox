'use client';

import Link from 'next/link';
import { formatCurrency } from '@velnox/utils';
import { useVelRepeatStore, type VelRepeatFrequency } from '@/stores/velrepeat-store';
import { useLanguage } from '@/components/providers/language-provider';
import { IconBox } from '@/components/icons';

const statusTone = {
  ACTIVE: 'bg-emerald-100 text-emerald-700',
  PAUSED: 'bg-amber-100 text-amber-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

export function SubscriptionsView() {
  const { t, locale } = useLanguage();
  const subscriptions = useVelRepeatStore((s) => s.subscriptions);
  const pause = useVelRepeatStore((s) => s.pause);
  const resume = useVelRepeatStore((s) => s.resume);
  const cancel = useVelRepeatStore((s) => s.cancel);

  const statusLabel = {
    ACTIVE: t('velrepeat.active'),
    PAUSED: t('velrepeat.paused'),
    CANCELLED: t('velrepeat.cancelled'),
  };
  const frequencyLabel: Record<VelRepeatFrequency, string> = {
    WEEKLY: t('velrepeat.weekly'),
    BI_WEEKLY: t('velrepeat.biweekly'),
    MONTHLY: t('velrepeat.monthly'),
    CUSTOM: t('velrepeat.custom'),
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-1 text-xl font-semibold text-slate-900">{t('velrepeat.title')}</h1>
      <p className="mb-6 text-sm text-slate-500">{t('velrepeat.subtitle')}</p>

      {subscriptions.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-lg border border-dashed border-slate-300 p-12 text-center text-sm text-slate-500">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
            <IconBox size={24} />
          </span>
          <p>{t('velrepeat.empty')}</p>
          <Link
            href="/products"
            className="rounded-md bg-teal-700 px-6 py-2.5 text-sm font-semibold text-white hover:bg-teal-800"
          >
            {t('home.startShopping')}
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {subscriptions.map((sub) => (
            <div
              key={sub.id}
              className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-50 text-slate-300">
                  {sub.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={sub.imageUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <IconBox size={22} />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-sm font-medium text-slate-900">{sub.productName}</p>
                    <span
                      className={
                        'rounded-full px-2 py-0.5 text-[10px] font-semibold ' + statusTone[sub.status]
                      }
                    >
                      {statusLabel[sub.status]}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {frequencyLabel[sub.frequency]} · {t('velrepeat.quantity')} {sub.quantity} ·{' '}
                    {formatCurrency(sub.price * sub.quantity)}
                  </p>
                  {sub.status === 'ACTIVE' && (
                    <p className="mt-0.5 text-xs text-teal-700">
                      {t('velrepeat.nextDelivery')}:{' '}
                      {new Date(sub.nextOrderDate).toLocaleDateString(
                        locale === 'th' ? 'th-TH' : locale === 'my' ? 'my-MM' : 'en-US',
                      )}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex shrink-0 gap-2 sm:ml-auto">
                {sub.status === 'ACTIVE' && (
                  <button
                    type="button"
                    onClick={() => pause(sub.id)}
                    className="flex-1 rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium hover:bg-slate-50 sm:flex-none"
                  >
                    {t('velrepeat.pause')}
                  </button>
                )}
                {sub.status === 'PAUSED' && (
                  <button
                    type="button"
                    onClick={() => resume(sub.id)}
                    className="flex-1 rounded-md bg-teal-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-teal-800 sm:flex-none"
                  >
                    {t('velrepeat.resume')}
                  </button>
                )}
                {sub.status !== 'CANCELLED' && (
                  <button
                    type="button"
                    onClick={() => cancel(sub.id)}
                    className="flex-1 rounded-md border border-red-300 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 sm:flex-none"
                  >
                    {t('velrepeat.cancelSub')}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}