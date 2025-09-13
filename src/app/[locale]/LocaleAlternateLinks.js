'use server';
import { buildAlternateLinkTags } from '@/i18n/seo';

export async function getAlternateLinksMetadata(locale, pathname = '/') {
	const links = buildAlternateLinkTags(locale, pathname);
	const languages = {};
	links.forEach((l) => {
		if (l.rel === 'alternate' && l.hrefLang) {
			languages[l.hrefLang] = l.href;
		}
	});
	const canonicalLink = links.find((l) => l.rel === 'canonical');
	return {
		alternates: {
			canonical: canonicalLink ? canonicalLink.href : undefined,
			languages,
		},
	};
}
