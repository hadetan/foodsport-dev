"use client";

import { LOCALE_COOKIE, locales } from '@/i18n/config';
import Cookies from 'js-cookie';
import { usePathname, useRouter } from 'next/navigation';
import React from 'react';

// Simple locale switcher that toggles between 'zh-HK' and 'en'.
export default function LocaleSwitcher({ className = '' }) {
	const pathname = usePathname();
	const router = useRouter();

	function getCurrentLocaleFromPath(path) {
		if (!path) return null;
		const parts = path.split('/').filter(Boolean);
		if (!parts.length) return null;
		const first = parts[0];
		if (locales.map((l) => l.toLowerCase()).includes(first.toLowerCase())) {
			// return the canonical locale casing
			return locales.find((l) => l.toLowerCase() === first.toLowerCase());
		}
		return null;
	}

	const current =
		getCurrentLocaleFromPath(pathname) ||
		Cookies.get(LOCALE_COOKIE) ||
		'en';

	const other = current.toLowerCase() === 'en' ? 'zh-HK' : 'en';

	const label = current.toLowerCase() === 'en' ? '繁' : 'EN';

	const handleClick = (e) => {
		e.preventDefault();

		// Update cookie to keep consistency with middleware
		Cookies.set('NEXT_LOCALE', other, { path: '/', expires: 365 });

		// Build new pathname: replace leading locale segment if present, otherwise prefix
		const parts = pathname.split('/').filter(Boolean);
		const first = parts[0];
		let newParts;
		if (
			first &&
			locales.map((l) => l.toLowerCase()).includes(first.toLowerCase())
		) {
			newParts = [other, ...parts.slice(1)];
		} else {
			newParts = [other, ...parts];
		}
		const newPath =
			'/' + newParts.join('/') + (window.location.search || '');

		// Navigate (replace to avoid adding extra history entry)
		router.replace(newPath);
	};

	return (
		<button
			className={className}
			onClick={handleClick}
			aria-label='Switch language'
		>
			{label}
		</button>
	);
}
