import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/db';
import { awardSocialShareBadge } from '@/lib/badges/awardSocialShare';

const DEFAULT_REDIRECT_PATH = '/';

function getBaseAppUrl() {
    const base = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    return base.endsWith('/') ? base.slice(0, -1) : base;
}

function buildRedirectUrl(preferred) {
    const base = getBaseAppUrl();
    if (!preferred) {
        return `${base}${DEFAULT_REDIRECT_PATH}`;
    }
    try {
        const resolved = new URL(preferred);
        return resolved.toString();
    } catch (error) {
        return `${base}${DEFAULT_REDIRECT_PATH}`;
    }
}

export async function GET(_request, { params }) {
    const token = params?.token;
    const fallbackRedirect = buildRedirectUrl();
    if (!token) {
        return NextResponse.redirect(fallbackRedirect);
    }

    let redirectUrl = fallbackRedirect;

    try {
        await prisma.$transaction(async (tx) => {
            const share = await tx.socialShare.findUnique({
                where: { token },
                select: {
                    id: true,
                    redirectUrl: true,
                    status: true,
                    userId: true,
                },
            });

            if (!share) {
                return;
            }

            redirectUrl = buildRedirectUrl(share.redirectUrl);
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
        });
    } catch (error) {
        console.error('Failed processing social share token', error);
    }

    return NextResponse.redirect(redirectUrl);
}
