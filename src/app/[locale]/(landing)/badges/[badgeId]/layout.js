import { headers } from 'next/headers';

const SITE_NAME = 'FoodSport';
const DEFAULT_DESCRIPTION_EN = 'Collect FoodSport badges by staying active, sharing calories, and redeeming rewards.';
const DEFAULT_DESCRIPTION_ZH = '透過參與 FoodSport 活動、分享卡路里與兌換獎賞來收集徽章。';

async function getSiteOrigin() {
  const awaitedHeaders = await headers();
  const proto = awaitedHeaders.get('x-forwarded-proto') || 'http';
  const host = awaitedHeaders.get('x-forwarded-host') || awaitedHeaders.get('host');
  if (host) return `${proto}://${host}`;
  return 'http://localhost:3000';
}

function toAbsoluteImageUrl(url) {
  if (!url) return null;
  if (/^https?:\/\//i.test(url)) return url;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return null;
  const needsSlash = url.startsWith('/') ? '' : '/';
  return `${base}${needsSlash}${url}`;
}

function stripHtml(html) {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}

function isZhLocale(locale) {
  return typeof locale === 'string' && locale.toLowerCase().startsWith('zh');
}

function pickLocalized(primary, secondary, locale) {
  if (isZhLocale(locale)) {
    return secondary || primary || secondary || '';
  }
  return primary || secondary || '';
}

function formatNumber(value, locale) {
  if (typeof value !== 'number') return null;
  try {
    return new Intl.NumberFormat(locale || 'en').format(value);
  } catch (error) {
    return String(value);
  }
}

function buildDescription(badge, locale) {
  const isZh = isZhLocale(locale);
  const base = stripHtml(pickLocalized(badge?.description, badge?.descriptionZh, locale))
    || (isZh ? DEFAULT_DESCRIPTION_ZH : DEFAULT_DESCRIPTION_EN);
  const parts = [base];

  if (badge?.isLimitedEdition) {
    parts.push(isZh ? '限量徽章' : 'Limited edition badge');
  }

  if (typeof badge?.fsPointsCost === 'number' && badge.fsPointsCost > 0) {
    const formattedCost = formatNumber(badge.fsPointsCost, locale);
    if (formattedCost) {
      parts.push(isZh ? `兌換成本：${formattedCost} FS Points` : `Cost: ${formattedCost} FS Points`);
    }
  } else if (typeof badge?.place === 'number' && badge.place > 0) {
    parts.push(isZh ? `徽章排名：#${badge.place}` : `Badge place #${badge.place}`);
  }

  if (badge?.activity) {
    const activityTitle = pickLocalized(badge.activity.title, badge.activity.titleZh, locale);
    if (activityTitle) {
      parts.push(isZh ? `相關活動：${activityTitle}` : `Earn via ${activityTitle}`);
    }
  }

  return parts.filter(Boolean).join(' · ');
}

async function fetchBadge(siteOrigin, badgeId) {
  if (!badgeId) return null;
  try {
    const res = await fetch(`${siteOrigin}/api/badges`, { next: { revalidate: 120 } });
    if (!res.ok) return null;
    const payload = await res.json();
    const badges = Array.isArray(payload?.badges) ? payload.badges : [];
    return badges.find((entry) => entry.id === badgeId) || null;
  } catch (error) {
    return null;
  }
}

export async function generateMetadata({ params }) {
  const awaitedParams = await params;
  const { badgeId, locale } = awaitedParams || {};
  const resolvedLocale = locale || 'en';
  const siteOrigin = await getSiteOrigin();
  const badge = await fetchBadge(siteOrigin, badgeId);

  const title = badge
    ? pickLocalized(badge.title, badge.titleZh, resolvedLocale) || SITE_NAME
    : `${SITE_NAME} Badge`;
  const description = badge ? buildDescription(badge, resolvedLocale)
    : (isZhLocale(resolvedLocale) ? DEFAULT_DESCRIPTION_ZH : DEFAULT_DESCRIPTION_EN);
  const ogLocale = isZhLocale(resolvedLocale) ? 'zh_HK' : 'en_US';
  const pagePath = `/${resolvedLocale}/badges/${badgeId || ''}`;
  const canonical = `${siteOrigin}${pagePath}`;
  const imageCandidate = badge?.imageUrl
    || badge?.activity?.bannerImageUrl
    || badge?.activity?.imageUrl
    || null;
  const imageUrlAbs = toAbsoluteImageUrl(imageCandidate);
  const openGraphImages = imageUrlAbs ? [{
    url: imageUrlAbs,
    secureUrl: imageUrlAbs.startsWith('https://') ? imageUrlAbs : undefined,
    width: 512,
    height: 512,
    alt: `${title} – ${SITE_NAME}`,
    type: 'image/png',
  }] : undefined;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: SITE_NAME,
      type: 'website',
      locale: ogLocale,
      images: openGraphImages,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: imageUrlAbs ? [imageUrlAbs] : undefined,
    },
    other: {
      'og:site_name': SITE_NAME,
      'og:locale:alternate': ogLocale,
      'foodsport:badge:id': badgeId,
      'foodsport:badge:limited': badge?.isLimitedEdition ? 'true' : 'false',
      'foodsport:badge:points': badge?.fsPointsCost ?? undefined,
    },
  };
}

export default function BadgeDetailsLayout({ children }) {
  return children;
}
