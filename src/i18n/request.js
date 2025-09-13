import { getRequestConfig } from 'next-intl/server';
import { LOCALE_COOKIE, locales } from '@/i18n/config';
import { cookies } from 'next/headers';

export default getRequestConfig(async () => {
  const store = await cookies();
  const locale = store.get(LOCALE_COOKIE)?.value || 'en';

  return {
    locale: locale,
    messages: (await import(`./messages/${locale}.json`)).default
  };
});

export { locales };