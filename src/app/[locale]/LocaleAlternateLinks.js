'use client';
import Head from 'next/head';
import { usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';
import { buildAlternateLinkTags } from '@/i18n/seo';

export default function LocaleAlternateLinks() {
  const pathname = usePathname() || '/';
  const locale = useLocale();
  const links = buildAlternateLinkTags(locale, pathname);
  return (
    <Head>
      {links.map(l => (
        <link key={l.rel + l.href + (l.hrefLang || '')} rel={l.rel} href={l.href} {...(l.hrefLang ? { hrefLang: l.hrefLang } : {})} />
      ))}
    </Head>
  );
}