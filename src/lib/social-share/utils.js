import { prisma } from '@/lib/prisma/db';
import { awardSocialShareBadge } from '@/lib/badges/awardSocialShare';

export const DEFAULT_REDIRECT_PATH = '/';

function normalizeBaseUrl(base) {
    if (!base) return 'http://localhost:3000';
    return base.endsWith('/') ? base.slice(0, -1) : base;
}

export function getBaseAppUrl() {
    const base = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    return normalizeBaseUrl(base);
}

export function buildRedirectUrl(preferred) {
    const base = getBaseAppUrl();
    if (!preferred) {
        return `${base}${DEFAULT_REDIRECT_PATH}`;
    }
    try {
        const resolved = new URL(preferred);
        return resolved.toString();
    } catch (error) {
        try {
            const resolved = new URL(preferred, base);
            return resolved.toString();
        } catch (_err) {
            return `${base}${DEFAULT_REDIRECT_PATH}`;
        }
    }
}

export function sanitizeRedirectUrl(candidate) {
    const baseUrl = getBaseAppUrl();
    const fallback = `${baseUrl}${DEFAULT_REDIRECT_PATH}`;
    if (!candidate || typeof candidate !== 'string') {
        return fallback;
    }

    try {
        const resolved = new URL(candidate, baseUrl);
        const allowedOrigin = new URL(baseUrl).origin;
        if (resolved.origin !== allowedOrigin) {
            return fallback;
        }
        return resolved.toString();
    } catch (error) {
        console.warn('Invalid redirectUrl provided for social share:', error.message);
        return fallback;
    }
}

const SHARE_SELECT_FIELDS = {
    id: true,
    token: true,
    redirectUrl: true,
    status: true,
    userId: true,
};

const SHARE_ACTIVITY_FIELDS = {
    id: true,
    title: true,
    titleZh: true,
    description: true,
    descriptionZh: true,
    summary: true,
    summaryZh: true,
    bannerImageUrl: true,
    imageUrl: true,
};

export async function findShareByToken(token) {
    if (!token) return null;
    return prisma.socialShare.findUnique({
        where: { token },
        select: SHARE_SELECT_FIELDS,
    });
}

export async function getActivityForShare(activityId) {
    if (!activityId) return null;
    return prisma.activity.findUnique({
        where: { id: activityId },
        select: SHARE_ACTIVITY_FIELDS,
    });
}

export async function processShareVisit(token) {
    const fallbackRedirect = buildRedirectUrl();
    if (!token) {
        return { redirectUrl: fallbackRedirect, share: null };
    }

    try {
        return await prisma.$transaction(async (tx) => {
            const share = await tx.socialShare.findUnique({
                where: { token },
                select: SHARE_SELECT_FIELDS,
            });

            if (!share) {
                return { redirectUrl: fallbackRedirect, share: null };
            }

            const redirectUrl = sanitizeRedirectUrl(share.redirectUrl);
            const now = new Date();
            const updateData = {
                uniqueClicks: { increment: 1 },
                lastClickAt: now,
            };
            let shouldAward = false;
            if (share.status === 'pending') {
                updateData.status = 'verified';
                updateData.verifiedAt = now;
                shouldAward = true;
            }

            await tx.socialShare.update({
                where: { id: share.id },
                data: updateData,
            });

            if (shouldAward) {
                await awardSocialShareBadge(tx, share.userId);
            }

            return { redirectUrl, share };
        });
    } catch (error) {
        console.error('Failed processing social share token', error);
        return { redirectUrl: fallbackRedirect, share: null };
    }
}
