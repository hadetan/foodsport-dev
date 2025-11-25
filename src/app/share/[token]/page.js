import Link from 'next/link';
import Script from 'next/script';
import { headers } from 'next/headers';
import {
    buildRedirectUrl,
    findShareByToken,
    getActivityForShare,
    getBaseAppUrl,
    processShareVisit,
} from '@/lib/social-share/utils';
import {
    buildActivityMetadataFields,
    extractActivityTarget,
} from '@/lib/social-share/metadata-helpers';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const SITE_NAME = 'FoodSport';
const FALLBACK_META = {
    title: `${SITE_NAME} Share`,
    description: 'Join FoodSport activities to move, connect, and earn.',
    imageUrlAbs: null,
    ogLocale: 'en_US',
};

function getRequestHeaders() {
    try {
        return headers();
    } catch (_err) {
        return new Headers();
    }
}

function getSiteOrigin() {
    const h = getRequestHeaders();
    const proto = h.get('x-forwarded-proto') || 'http';
    const host = h.get('x-forwarded-host') || h.get('host');
    if (host) return `${proto}://${host}`;
    const base = getBaseAppUrl();
    return base || 'http://localhost:3000';
}

async function resolveShareMetadata(token, siteOrigin) {
    const share = token ? await findShareByToken(token) : null;
    if (!share) {
        return { meta: FALLBACK_META, share: null };
    }
    const target = extractActivityTarget(share.redirectUrl);
    if (target?.type === 'activity') {
        const activity = await getActivityForShare(target.activityId);
        if (activity) {
            const metaFields = buildActivityMetadataFields(activity, target.locale, siteOrigin);
            if (metaFields) {
                return { meta: metaFields, share };
            }
        }
    }
    return { meta: FALLBACK_META, share };
}

export async function generateMetadata({ params }) {
    const awaitedParams = await params;
    const token = awaitedParams?.token || '';
    const siteOrigin = getSiteOrigin();
    const { meta } = await resolveShareMetadata(token, siteOrigin);
    const canonical = `${siteOrigin}/share/${token}`;
    const ogImageUrl = meta.imageUrlAbs ? `${canonical}/image` : null;
    const images = ogImageUrl
        ? [
              {
                  url: ogImageUrl,
                  secureUrl: ogImageUrl.startsWith('https://') ? ogImageUrl : undefined,
                  width: 1200,
                  height: 630,
                  alt: `${meta.title} – ${SITE_NAME}`,
                  type: 'image/jpeg',
              },
          ]
        : undefined;

    return {
        title: meta.title,
        description: meta.description,
        alternates: { canonical },
        openGraph: {
            title: meta.title,
            description: meta.description,
            url: canonical,
            siteName: SITE_NAME,
            type: 'website',
            locale: meta.ogLocale || 'en_US',
            images,
        },
        twitter: {
            card: ogImageUrl ? 'summary_large_image' : 'summary',
            title: meta.title,
            description: meta.description,
            images: ogImageUrl ? [ogImageUrl] : undefined,
        },
        other: {
            'og:site_name': SITE_NAME,
            'og:locale:alternate': meta.ogLocale || 'en_US',
        },
    };
}

function ShareRedirectView({ redirectUrl }) {
    return (
        <div className="share-redirect-page">
            <div className="share-redirect-card">
                <p>Redirecting you to FoodSport...</p>
                <p>
                    If nothing happens,{' '}
                    <Link href={redirectUrl} prefetch={false}>
                        click here to continue
                    </Link>
                    .
                </p>
            </div>
            <Script id="share-redirect-script" strategy="afterInteractive">
                {`window.location.replace(${JSON.stringify(redirectUrl)});`}
            </Script>
            <noscript>
                <p>
                    JavaScript is disabled. Please{' '}
                    <a href={redirectUrl}>follow this link</a>.
                </p>
            </noscript>
        </div>
    );
}

export default async function ShareTokenPage({ params }) {
    const awaitedParams = await params;
    const token = awaitedParams?.token || '';
    const visitResult = await processShareVisit(token);
    const redirectUrl = visitResult?.redirectUrl || buildRedirectUrl();

    return <ShareRedirectView redirectUrl={redirectUrl} />;
}
