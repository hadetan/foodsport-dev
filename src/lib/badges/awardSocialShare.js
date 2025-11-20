import { UserBadgeStatus } from '@prisma/client';
import { prioritizeBadges } from './utils';

const SOCIAL_SHARE_SOURCE = 'social_share';

export async function awardSocialShareBadge(tx, userId) {
    const now = new Date();
    const badges = await tx.badge.findMany({
        where: {
            isActive: true,
            badgeRules: {
                some: {
                    isActive: true,
                    ruleType: 'social_share',
                },
            },
        },
        include: {
            badgeRules: {
                where: {
                    isActive: true,
                },
                orderBy: { createdAt: 'asc' },
            },
        },
    });

    const eligible = badges.filter((badge) => badge.badgeRules?.length
        && badge.badgeRules.every((rule) => rule.ruleType === 'social_share'));
    const prioritized = prioritizeBadges(eligible, now);
    const targetBadge = prioritized[0];
    if (!targetBadge) {
        return { awarded: false };
    }

    const existing = await tx.userBadge.findUnique({
        where: {
            userId_badgeId: {
                userId,
                badgeId: targetBadge.id,
            },
        },
    });

    if (existing) {
        return { awarded: false };
    }

    await tx.userBadge.create({
        data: {
            userId,
            badgeId: targetBadge.id,
            status: UserBadgeStatus.earned,
            source: SOCIAL_SHARE_SOURCE,
        },
    });

    return { awarded: true, badgeId: targetBadge.id };
}

export { SOCIAL_SHARE_SOURCE };
