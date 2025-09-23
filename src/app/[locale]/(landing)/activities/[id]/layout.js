import { headers } from 'next/headers';

async function getSiteOrigin() {
    const awaitedHeaders = await headers();
    const h = awaitedHeaders;
    const proto = h.get('x-forwarded-proto') || 'http';
    const host = h.get('x-forwarded-host') || h.get('host');
    if (host) return `${proto}://${host}`;
    return 'http://localhost:3000';
}

function toAbsoluteImageUrl(url) {
    if (!url) return null;
    if (/^https?:\/\//i.test(url)) return url;
    const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
    return `${base}${url.startsWith('/') ? '' : '/'}${url}`;
}

function stripHtml(html) {
    if (!html) return '';
    return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}

export async function generateMetadata({ params }) {
    const awaitedParam = await params;
    const { id, locale } = awaitedParam || {};

    let activity = null;
    try {
        const origin = await getSiteOrigin();
        const res = await fetch(`${origin}/api/activities/${id}`, { next: { revalidate: 60 } });
        if (res.ok) {
            const data = await res.json();
            activity = data?.activity || null;
        }
    } catch (e) {
        // ignore and fallback
    }

    const siteOrigin = await getSiteOrigin();
    const pagePath = `/${locale || 'en'}/activities/${id}`;
    const canonical = `${siteOrigin}${pagePath}`;

    const isZh = typeof locale === 'string' && /zh/i.test(locale);
    const titleRaw = activity ? (isZh ? activity.titleZh || activity.title : activity.title || activity.titleZh) : 'Activity';
    const descriptionRaw = activity
        ? (isZh
            ? activity.descriptionZh || stripHtml(activity.summaryZh) || activity.description || stripHtml(activity.summary)
            : activity.description || stripHtml(activity.summary) || activity.descriptionZh || stripHtml(activity.summaryZh))
        : 'Join FoodSport activities to move, connect, and earn.';

    const title = titleRaw || 'FoodSport Activity';
    const description = stripHtml(descriptionRaw).slice(0, 200) || 'Join FoodSport activities to move, connect, and earn.';

    const imageUrlAbs = toAbsoluteImageUrl(activity?.imageUrl);
    const siteName = 'FoodSport';
    const ogLocale = isZh ? 'zh_HK' : 'en_US';

    return {
        title,
        description,
        alternates: { canonical },
        openGraph: {
            title,
            description,
            url: canonical,
            siteName,
            type: 'website',
            locale: ogLocale,
            images: [
                {
                    url: imageUrlAbs,
                    secureUrl: imageUrlAbs,
                    width: 1200,
                    height: 630,
                    alt: `${title} – ${siteName}`,
                    type: 'image/jpeg',
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: [imageUrlAbs],
        },
        other: {
            'og:site_name': siteName,
            'og:locale:alternate': ogLocale,
            'foodsport:organization': activity?.organizationName || undefined,
        },
    };
}

export default function ActivityDetailsLayout({ children }) {
    return children;
}
