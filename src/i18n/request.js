import { getRequestConfig } from 'next-intl/server';
import { locales, defaultLocale, isLocale } from '@@/src/i18n/config';

export default getRequestConfig(async ({ locale }) => {
  const target = isLocale(locale) ? locale : defaultLocale;
  return {
    locale: target,
    messages: (await import(`./messages/${target}.json`)).default
  };
});

export { locales };