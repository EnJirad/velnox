'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { formatCurrency } from '@velnox/utils';
import {
  useVelRepeatStore,
  type VelRepeatFrequency,
  type VelRepeatPackStatus,
} from '@/stores/velrepeat-store';
import { useLanguage } from '@/components/providers/language-provider';
import { IconBox } from '@/components/icons';

const statusTone: Record<VelRepeatPackStatus, string> = {
  ACTIVE: 'bg-emerald-100 text-emerald-700',
  PAUSED: 'bg-amber-100 text-amber-700',
  COMPLETED: 'bg-slate-100 text-slate-600',
  CANCELLED: 'bg-red-100 text-red-700',
};

export function SubscriptionsView() {
  const { t, locale } = useLanguage();
  const packs = useVelRepeatStore((s) => s.packs);
  const loading = useVelRepeatStore((s) => s.loading);
  const fetchMine = useVelRepeatStore((s) => s.fetchMine);
  const pause = useVelRepeatStore((s) => s.pause);
  const resume = useVelRepeatStore((s) => s.resume);
  const cancel = useVelRepeatStore((s) => s.cancel);

  useEffect(() => {
    void fetchMine();
  }, [fetchMine]);

  const statusLabel: Record<VelRepeatPackStatus, string> = {
    ACTIVE: t('velrepeat.active') || 'ใช้งานอยู่',
    PAUSED: t('velrepeat.paused') || 'หยุดชั่วคราว',
    COMPLETED: 'ครบแพ็กแล้ว',
    CANCELLED: t('velrepeat.cancelled') || 'ยกเลิกแล้ว',
  };

  const frequencyLabel: Record<VelRepeatFrequency, string> = {
    WEEKLY: t('velrepeat.weekly') || 'รายสัปดาห์',
    BI_WEEKLY: t('velrepeat.biweekly') || 'ทุก 2 สัปดาห์',
    MONTHLY: t('velrepeat.monthly') || 'รายเดือน',
  };

  const dateLocale =
    locale === 'th' ? 'th-TH' : locale === 'my' ? 'my-MM' : 'en-US';

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-1 text-xl font-semibold text-slate-900">
        {t('velrepeat.title') || 'VelRepeat ของฉัน'}
      </h1>
      <p className="mb-6 text-sm text-slate-500">
        แพ็กที่จ่ายแล้ว · ดูเครดิตคงเหลือและวันส่งถัดไป
      </p>

      {loading && packs.length === 0 ? (
        <p className="text-sm text-slate-500">กำลังโหลด...</p>
      ) : packs.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-lg border border-dashed border-slate-300 p-12 text-center text-sm text-slate-500">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
            <IconBox size={24} />
          </span>
          <p>{t('velrepeat.empty') || 'ยังไม่มีแพ็ก'}</p>
          <Link
            href="/products"
            className="rounded-md bg-teal-700 px-6 py-2.5 text-sm font-semibold text-white hover:bg-teal-800"
          >
            {t('home.startShopping') || 'เลือกสินค้า'}
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {packs.map((pack) => {
            const imageUrl = pack.product?.images?.[0]?.url;
            const name = pack.product?.name ?? pack.planCode;
            const progress =
              pack.totalUnits > 0
                ? Math.round(
                    ((pack.totalUnits - pack.remainingUnits) / pack.totalUnits) * 100,
                  )
                : 0;

            return (
              <div
                key={pack.id}
                className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center"
              >
                <div className="flex min-w-0 flex-1 items-center gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-50 text-slate-300">
                    {imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={imageUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <IconBox size={22} />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-sm font-medium text-slate-900">{name}</p>
                      <span
                        className={
                          'rounded-full px-2 py-0.5 text-[10px] font-semibold ' +
                          statusTone[pack.status]
                        }
                      >
                        {statusLabel[pack.status]}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {frequencyLabel[pack.frequency]} · {pack.planCode} ·{' '}
                      {formatCurrency(pack.packPrice)}
                    </p>
                    <p className="mt-0.5 text-xs font-medium text-teal-700">
                      เหลือ {pack.remainingUnits}/{pack.totalUnits} ชิ้น
                    </p>
                    <div className="mt-1.5 h-1.5 w-full max-w-[200px] overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-teal-600"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    {pack.status === 'ACTIVE' && (
                      <p className="mt-1 text-xs text-slate-500">
                        ส่งครั้งถัดไป:{' '}
                        {new Date(pack.nextDeliveryDate).toLocaleDateString(dateLocale)}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex shrink-0 gap-2 sm:ml-auto">
                  {pack.status === 'ACTIVE' && (
                    <button
                      type="button"
                      onClick={() => void pause(pack.id)}
                      className="flex-1 rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium hover:bg-slate-50 sm:flex-none"
                    >
                      {t('velrepeat.pause') || 'หยุดชั่วคราว'}
                    </button>
                  )}
                  {pack.status === 'PAUSED' && (
                    <button
                      type="button"
                      onClick={() => void resume(pack.id)}
                      className="flex-1 rounded-md bg-teal-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-teal-800 sm:flex-none"
                    >
                      {t('velrepeat.resume') || 'กลับมาใช้'}
                    </button>
                  )}
                  {(pack.status === 'ACTIVE' || pack.status === 'PAUSED') && (
                    <button
                      type="button"
                      onClick={() => void cancel(pack.id)}
                      className="flex-1 rounded-md border border-red-300 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 sm:flex-none"
                    >
                      {t('velrepeat.cancelSub') || 'ยกเลิก'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}