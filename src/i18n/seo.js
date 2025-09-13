import { locales, defaultLocale } from '@/i18n/config';
import LOCALE_PATTERN from '@@/src/utils/localePattern';

export function buildMetadataAlternates(locale, pathname = '/') {
  const pathNoLocale = pathname.replace(new RegExp(`^\\/(${LOCALE_PATTERN})`), '') || '/';
  const buildHref = (loc) => `/${loc}${pathNoLocale === '/' ? '' : pathNoLocale}`;
  const languages = Object.fromEntries(locales.map(l => [l, buildHref(l)]));
  return {
    canonical: buildHref(locale),
    languages,
    default: buildHref(defaultLocale)
  };
}

export function buildAlternateLinkTags(locale, pathname = '/') {
  const pathNoLocale = pathname.replace(new RegExp(`^\\/(${LOCALE_PATTERN})`), '') || '/';
  const current = `/${locale}${pathNoLocale === '/' ? '' : pathNoLocale}`;
  const links = [];
  links.push({ rel: 'canonical', href: current });
  locales.forEach(l => {
    links.push({ rel: 'alternate', hrefLang: l, href: `/${l}${pathNoLocale === '/' ? '' : pathNoLocale}` });
  });
  links.push({ rel: 'alternate', hrefLang: 'x-default', href: `/${defaultLocale}${pathNoLocale === '/' ? '' : pathNoLocale}` });
  return links;
}