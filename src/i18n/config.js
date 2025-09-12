export const locales = ['en', 'zh-HK'];
export const defaultLocale = 'en';
export const LOCALE_COOKIE = 'NEXT_LOCALE';

// Simple helper to choose localized value based on a cookie-provided locale (case-insensitive)
export function pickLocalized({ locale, zh, en }) {
  const lc = (locale || '').toLowerCase();
  if (lc === 'zh-hk' && zh && typeof zh === 'string' && zh.trim()) return zh;
  return en;
}