import { NextResponse } from 'next/server';
import { defaultLocale, LOCALE_COOKIE, locales } from '@@/src/i18n/config';

function isBypassed(pathname) {
  if (pathname.startsWith('/admin') || pathname.startsWith('/api')) return true;
  if (pathname.startsWith('/_next')) return true;
  return false;
}

function detectPreferredLocale(request) {
  const cookieLocale = request.cookies.get(LOCALE_COOKIE)?.value;
  if (cookieLocale && locales.includes(cookieLocale)) return cookieLocale;
  const header = request.headers.get('accept-language');
  if (header) {
    const ranked = header.split(',').map(part => {
      const [lang, qPart] = part.trim().split(';');
      const q = qPart ? parseFloat(qPart.split('=')[1]) : 1;
      return { lang: lang.toLowerCase(), q };
    }).sort((a, b) => b.q - a.q);
    for (const { lang } of ranked) {
      if (lang.startsWith('zh')) return 'zh-HK';
      if (lang === 'en' || lang.startsWith('en-')) return 'en';
    }
  }
  return defaultLocale;
}

export function middleware(request) {
  const url = request.nextUrl;
  const { pathname } = url;

  if (isBypassed(pathname)) {
    return NextResponse.next();
  }

  const staticAssetMatch = pathname.match(/^\/(en|zh-HK)\/(.+\.(?:png|jpe?g|gif|svg|webp|ico))$/i);
  if (staticAssetMatch) {
    const file = staticAssetMatch[2];
    const rewriteUrl = new URL('/' + file, request.url);
    return NextResponse.rewrite(rewriteUrl);
  }

  let token = null;
  for (const [name, value] of request.cookies) {
    if (name.startsWith('sb')) { token = value; break; }
  }

  const segments = pathname.split('/').filter(Boolean);
  const hasLocale = segments.length > 0 && locales.includes(segments[0]);
  let currentLocale = hasLocale ? segments[0] : null;

  if (!hasLocale) {
    currentLocale = detectPreferredLocale(request);
    const newPathname = `/${currentLocale}${pathname === '/' ? '' : pathname}`;
    const redirectUrl = new URL(newPathname + url.search, request.url);
    const res = NextResponse.redirect(redirectUrl);
    res.cookies.set(LOCALE_COOKIE, currentLocale, { path: '/', maxAge: 60 * 60 * 24 * 365 });
    return res;
  }

  const response = NextResponse.next();
  response.cookies.set(LOCALE_COOKIE, currentLocale, { path: '/', maxAge: 60 * 60 * 24 * 365 });

  const localePrefix = `/${currentLocale}`;
  const remainderPath = '/' + segments.slice(1).join('/');

  if (!token && remainderPath.startsWith('/my/activities/')) {
    const target = remainderPath.replace(/^\/my/, '');
    return NextResponse.redirect(new URL(`${localePrefix}${target}${url.search}`, request.url));
  }

  if (token && remainderPath.startsWith('/activities/')) {
    const target = '/my' + remainderPath;
    return NextResponse.redirect(new URL(`${localePrefix}${target}${url.search}`, request.url));
  }

  if (token) {
    if (pathname === `${localePrefix}/` || pathname === localePrefix) {
      return NextResponse.redirect(new URL(`${localePrefix}/my`, request.url));
    }
  } else {
    if (remainderPath.startsWith('/my') && !remainderPath.startsWith('/my/activities/')) {
      return NextResponse.redirect(new URL(`${localePrefix}/auth/login`, request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next|favicon.ico|robots.txt|admin).*)'],
};