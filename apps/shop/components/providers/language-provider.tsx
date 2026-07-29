'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';

export type Locale = 'th' | 'en' | 'my';

interface LanguageContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

const LanguageContext = createContext<LanguageContextValue>({
  locale: 'th',
  setLocale: () => undefined,
});

/**
 * Foundation language switcher. Actual translation dictionaries live in
 * packages/i18n once that package is scaffolded for feature work.
 */
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>('th');

  return (
    <LanguageContext.Provider value={{ locale, setLocale }}>{children}</LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
