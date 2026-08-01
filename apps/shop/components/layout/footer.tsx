'use client';

import Link from 'next/link';
import { useLanguage } from '@/components/providers/language-provider';

export function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="mt-16 border-t border-slate-200 bg-slate-900 text-slate-300">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="mb-3 flex items-center gap-2 text-lg font-bold text-white">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-600">V</span>
            VelShop
          </div>
          <p className="text-sm text-slate-400">{t('footer.tagline')}</p>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold text-white">{t('footer.help')}</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/orders" className="hover:text-white">{t('footer.trackOrder')}</Link></li>
            <li><Link href="#" className="hover:text-white">{t('footer.shippingReturns')}</Link></li>
            <li><Link href="#" className="hover:text-white">{t('footer.helpCenter')}</Link></li>
            <li><Link href="#" className="hover:text-white">{t('footer.contactUs')}</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold text-white">{t('footer.about')}</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="#" className="hover:text-white">{t('footer.aboutUs')}</Link></li>
            <li><a href="https://velmerchant.vercel.app" className="hover:text-white">{t('footer.sellOnVelnox')}</a></li>
            <li><Link href="#" className="hover:text-white">{t('footer.careers')}</Link></li>
            <li><Link href="#" className="hover:text-white">{t('footer.privacy')}</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold text-white">{t('footer.paymentMethods')}</h4>
          <div className="flex flex-wrap gap-2 text-xs">
            {['บัตรเครดิต', 'พร้อมเพย์', 'โอนธนาคาร', 'เก็บเงินปลายทาง'].map((m) => (
              <span key={m} className="rounded border border-slate-700 px-2 py-1">{m}</span>
            ))}
          </div>
        </div>
      </div>
      <div className="border-t border-slate-800 py-4 text-center text-xs text-slate-500">
        © 2026 Velnox Commerce Co., Ltd. — {t('footer.rights')}
      </div>
    </footer>
  );
}
