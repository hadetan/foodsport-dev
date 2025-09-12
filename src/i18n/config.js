export const locales = ['en', 'zh-HK'];
export const defaultLocale = 'en';
export const LOCALE_COOKIE = 'NEXT_LOCALE';

export function isLocale(value) {
  return locales.includes(value);
}

// Returns localized value with fallback to English
export function pickLocalized({ locale, zh, en }) {
  if (locale === 'zh-HK' && zh && typeof zh === 'string' && zh.trim()) return zh;
  return en;
}