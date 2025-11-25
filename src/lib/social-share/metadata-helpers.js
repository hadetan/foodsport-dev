const ACTIVITY_PATH_REGEX = /^\/(?:([a-z]{2}(?:-[A-Z]{2})?)\/)?activities\/([^\/]+)(?:\/.*)?$/i;

export function stripHtml(html) {
    if (!html) return '';
    return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}

export function toAbsoluteImageUrl(url, siteOrigin) {
    if (!url) return null;
    if (/^https?:\/\//i.test(url)) return url;
    const supabaseBase = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const base = supabaseBase || siteOrigin;
    if (!base) return null;
    const normalized = base.endsWith('/') ? base.slice(0, -1) : base;
    return `${normalized}${url.startsWith('/') ? '' : '/'}${url}`;
}

export function extractActivityTarget(redirectUrl) {
    if (!redirectUrl) return null;
    try {
        const parsed = new URL(redirectUrl);
        const match = parsed.pathname.match(ACTIVITY_PATH_REGEX);
        if (!match) return null;
        const [, localeRaw, activityId] = match;
        const locale = localeRaw || null;
        return { type: 'activity', activityId, locale };
    } catch (_err) {
        return null;
    }
}

export function buildActivityMetadataFields(activity, locale, siteOrigin) {
    if (!activity) return null;
    const isZh = typeof locale === 'string' && /zh/i.test(locale);
    const titleRaw = isZh
        ? activity.titleZh || activity.title
        : activity.title || activity.titleZh;
    const descriptionRaw = isZh
        ? activity.descriptionZh || stripHtml(activity.summaryZh) || activity.description || stripHtml(activity.summary)
        : activity.description || stripHtml(activity.summary) || activity.descriptionZh || stripHtml(activity.summaryZh);

    const title = titleRaw || 'FoodSport Activity';
    const description = stripHtml(descriptionRaw).slice(0, 200) || 'Join FoodSport activities to move, connect, and earn.';
    const imageUrlAbs = toAbsoluteImageUrl(activity.bannerImageUrl || activity.imageUrl, siteOrigin);
    const ogLocale = isZh ? 'zh_HK' : 'en_US';

    return { title, description, imageUrlAbs, ogLocale };
}
