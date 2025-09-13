import { locales, defaultLocale } from '@/i18n/config';

export function getLocaleFromPath(pathname) {
  if (!pathname) return defaultLocale;
  const seg = pathname.split('/').filter(Boolean)[0];
  if (seg && locales.some(l => l.toLowerCase() === seg.toLowerCase())) {
    return locales.find(l => l.toLowerCase() === seg.toLowerCase()) || defaultLocale;
  }
  return defaultLocale;
}