import th, { type Dictionary } from './dictionaries/th';
import en from './dictionaries/en';
import my from './dictionaries/my';

export type Locale = 'th' | 'en' | 'my';

export type { Dictionary };

// New languages (docs/01_Project_Overview.md section 10 lists Chinese,
// Vietnamese, Lao, Khmer as future additions) only need: (1) a new
// dictionaries/<code>.ts implementing Dictionary, and (2) one line here.
// No other app code needs to change.
export const dictionaries: Record<Locale, Dictionary> = { th, en, my };

export const locales: { code: Locale; label: string; nativeLabel: string }[] = [
  { code: 'th', label: 'Thai', nativeLabel: 'ไทย' },
  { code: 'en', label: 'English', nativeLabel: 'English' },
  { code: 'my', label: 'Myanmar', nativeLabel: 'မြန်မာ' },
];

export const defaultLocale: Locale = 'th';

type NestedKeyOf<T> = {
  [K in keyof T & string]: T[K] extends Record<string, unknown> ? `${K}.${NestedKeyOf<T[K]>}` : K;
}[keyof T & string];

export type TranslationKey = NestedKeyOf<Dictionary>;

function getPath(dict: Dictionary, path: string): string {
  const value = path.split('.').reduce<unknown>((acc, key) => {
    if (acc && typeof acc === 'object' && key in acc) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, dict);
  return typeof value === 'string' ? value : path;
}

/** Look up a translation key (e.g. "nav.products") for the given locale. */
export function translate(locale: Locale, key: TranslationKey): string {
  return getPath(dictionaries[locale] ?? dictionaries[defaultLocale], key);
}

export const LOCALE_STORAGE_KEY = 'velnox-locale';

export function isLocale(value: string | null | undefined): value is Locale {
  return !!value && (value === 'th' || value === 'en' || value === 'my');
}
