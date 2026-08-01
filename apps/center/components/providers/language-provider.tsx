'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import {
  defaultLocale,
  isLocale,
  LOCALE_STORAGE_KEY,
  translate,
  type Locale,
  type TranslationKey,
} from '@velnox/i18n';

interface LanguageContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextValue>({
  locale: defaultLocale,
  setLocale: () => undefined,
  t: (key) => key,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale);

  useEffect(() => {
    const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY);
    if (isLocale(stored)) {
      setLocaleState(stored);
    }
  }, []);

  function setLocale(next: Locale) {
    setLocaleState(next);
    window.localStorage.setItem(LOCALE_STORAGE_KEY, next);
  }

  const t = (key: TranslationKey) => translate(locale, key);

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>{children}</LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
