import { NextResponse } from 'next/server';
import { LOCALE_COOKIE, locales, defaultLocale } from '@/i18n/config';
import { LOCALE_PATTERN } from '@/utils/localePattern';

function isBypassed(pathname) {
	if (pathname.startsWith('/admin') || pathname.startsWith('/api'))
		return true;
	if (pathname.startsWith('/_next')) return true;
	const staticExtRe = /\.(?:png|jpe?g|gif|svg|webp|ico|css|js|woff2?|ttf|eot)$/i;
	if (staticExtRe.test(pathname)) return true;

	return false;
}

function detectPreferredLocale(request) {
	const cookieLocale = request.cookies.get(LOCALE_COOKIE)?.value;
	if (cookieLocale) {
		const cookieLocaleLower = cookieLocale.toLowerCase();
		if (locales.some((l) => l.toLowerCase() === cookieLocaleLower)) {
			return locales.find((l) => l.toLowerCase() === cookieLocaleLower);
		}
	}
	const header = request.headers.get('accept-language');
	if (header) {
		const ranked = header
			.split(',')
			.map((part) => {
				const [lang, qPart] = part.trim().split(';');
				const q = qPart ? parseFloat(qPart.split('=')[1]) : 1;
				return { lang: lang.toLowerCase(), q };
			})
			.sort((a, b) => b.q - a.q);
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

	// CORS for API routes (temporary permissive wildcard for local/ngrok testing)
	// if (pathname.startsWith('/api')) {
	// 	const reqHeaders = request.headers.get('access-control-request-headers');
	// 	const corsHeaders = {
	// 		'Access-Control-Allow-Origin': '*',
	// 		'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
	// 		'Access-Control-Allow-Headers': reqHeaders || 'Content-Type, Authorization, X-Requested-With',
	// 	};
	// 	if (request.method === 'OPTIONS') {
	// 		return new NextResponse(null, { status: 204, headers: corsHeaders });
	// 	}
	// 	const res = NextResponse.next();
	// 	Object.entries(corsHeaders).forEach(([k, v]) => res.headers.set(k, v));
	// 	return res;
	// }

	const localeAdminMatch = pathname.match(new RegExp(`^\\/(${LOCALE_PATTERN})\\/(admin(?:\\/.*)?)`));
	if (localeAdminMatch) {
		const adminRemainder = '/' + localeAdminMatch[2];
		const redirectUrl = new URL(adminRemainder + url.search, request.url);
		return NextResponse.redirect(redirectUrl);
	}

	if (isBypassed(pathname)) {
		return NextResponse.next();
	}

	let token = null;
	for (const [name, value] of request.cookies) {
		if (name.startsWith('sb')) {
			token = value;
			break;
		}
	}

	const segments = pathname.split('/').filter(Boolean);
	const seg0 = segments[0];
	const seg0Lower = seg0 ? seg0.toLowerCase() : '';
	const zhAliases = ['z', 'zh', 'zh-', 'zh-h'];
	if (seg0 && zhAliases.includes(seg0Lower) && seg0Lower !== 'zh-hk') {
		const rest = segments.slice(1).join('/');
		const corrected = `/zh-HK${rest ? '/' + rest : ''}`;
		const redirectUrl = new URL(corrected + url.search, request.url);
		const res = NextResponse.redirect(redirectUrl);
		res.cookies.set(LOCALE_COOKIE, 'zh-HK', { path: '/', maxAge: 60 * 60 * 24 * 365 });
		return res;
	}

	const enAliases = ['e', 'en'];
	if (seg0 && enAliases.includes(seg0Lower) && seg0Lower !== 'en') {
		const rest = segments.slice(1).join('/');
		const corrected = `/en${rest ? '/' + rest : ''}`;
		const redirectUrl = new URL(corrected + url.search, request.url);
		const res = NextResponse.redirect(redirectUrl);
		res.cookies.set(LOCALE_COOKIE, 'en', { path: '/', maxAge: 60 * 60 * 24 * 365 });
		return res;
	}

	const hasLocale = segments.length > 0 && seg0 && locales.some((l) => l.toLowerCase() === seg0.toLowerCase());
	let currentLocale = hasLocale ? locales.find((l) => l.toLowerCase() === seg0.toLowerCase()) || defaultLocale : null;

	if (!hasLocale) {
		currentLocale = detectPreferredLocale(request);
		const newPathname = `/${currentLocale}${
			pathname === '/' ? '' : pathname
		}`;
		const redirectUrl = new URL(newPathname + url.search, request.url);
		const res = NextResponse.redirect(redirectUrl);
		res.cookies.set(LOCALE_COOKIE, currentLocale, {
			path: '/',
			maxAge: 60 * 60 * 24 * 365,
		});
		return res;
	}

	const response = NextResponse.next();
	response.cookies.set(LOCALE_COOKIE, currentLocale, {
		path: '/',
		maxAge: 60 * 60 * 24 * 365,
	});

	const localePrefix = `/${currentLocale}`;
	const remainderPath = '/' + segments.slice(1).join('/');

	if (!token && remainderPath.startsWith('/my/activities/')) {
		const target = remainderPath.replace(/^\/my/, '');
		return NextResponse.redirect(new URL(`${localePrefix}${target}${url.search}`, request.url));
	}

	if (token && remainderPath.startsWith('/activities/')) {
		const target = '/my' + remainderPath;
		return NextResponse.redirect(
			new URL(`${localePrefix}${target}${url.search}`, request.url)
		);
	}

	if (token) {
		if (pathname === `${localePrefix}/` || pathname === localePrefix) {
			return NextResponse.redirect(
				new URL(`${localePrefix}/my`, request.url)
			);
		}
	} else {
		if (remainderPath.startsWith('/my') && !remainderPath.startsWith('/my/activities/')) {
			return NextResponse.redirect(
				new URL(`${localePrefix}/auth/login`, request.url)
			);
		}
	}

	return response;
}

export const config = {
	matcher: ['/((?!_next|favicon.ico|robots.txt|admin).*)'],
};
