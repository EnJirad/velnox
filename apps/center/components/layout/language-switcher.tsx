'use client';

import { useState } from 'react';
import { locales } from '@velnox/i18n';
import { useLanguage } from '@/components/providers/language-provider';

export function LanguageSwitcher() {
  const { locale, setLocale } = useLanguage();
  const [open, setOpen] = useState(false);
  const current = locales.find((l) => l.code === locale) ?? locales[0];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 rounded-md px-2 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
      >
        🌐 {current.nativeLabel}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-20 mt-1 w-36 overflow-hidden rounded-md border border-slate-200 bg-white shadow-lg">
            {locales.map((l) => (
              <button
                key={l.code}
                onClick={() => {
                  setLocale(l.code);
                  setOpen(false);
                }}
                className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-slate-50 ${
                  l.code === locale ? 'font-semibold text-teal-700' : 'text-slate-700'
                }`}
              >
                {l.nativeLabel}
                {l.code === locale && <span>✓</span>}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
