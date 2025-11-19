import { UserBadgeStatus } from '@prisma/client';
import { groupBadgesByRuleKey, prioritizeBadges } from './utils';
import { ACTIVITY_RULE_TYPES } from '@/app/constants/constants';

export async function awardBadgesForActivityProgress(tx, params) {
    const { userId } = params;
    if (!userId) {
        return [];
    }

    return awardBadgesForRules(tx, {
        ...params,
        ruleTypes: ACTIVITY_RULE_TYPES,
    });
}

export async function awardInviteBadges(tx, params) {
    const { userId } = params;
    if (!userId) {
        return [];
    }
    return awardBadgesForRules(tx, {
        ...params,
        ruleTypes: ['invite_count'],
    });
}

async function awardBadgesForRules(tx, { userId, ruleTypes, source, ...context }) {
    if (!ruleTypes?.length) {
        return [];
    }

    const now = new Date();
    const badges = await tx.badge.findMany({
        where: {
            isActive: true,
            badgeRule: {
                isActive: true,
                ruleType: { in: ruleTypes },
            },
        },
        include: {
            badgeRule: true,
        },
    });

    if (!badges.length) {
        return [];
    }

    const grouped = groupBadgesByRuleKey(badges);
    const awards = [];
    const evalContext = {
        ...context,
        userId,
    };

    for (const [, bucket] of grouped.entries()) {
        const prioritized = prioritizeBadges(bucket, now);
        if (!prioritized.length) {
            continue;
        }

        for (const badge of prioritized) {
            const matches = await doesBadgeMatchRule(tx, badge, evalContext);
            if (!matches) {
                continue;
            }
            const created = await ensureUserBadge(tx, userId, badge, source, computeEarnedValue(badge, evalContext));
            if (created) {
                awards.push({ badgeId: badge.id });
            }
            break;
        }
    }

    return awards;
}

async function doesBadgeMatchRule(tx, badge, context) {
    const rule = badge.badgeRule;
    const target = rule?.targetValue ?? 0;
    switch (rule?.ruleType) {
        case 'calorie_single_activity':
            return (context.caloriesDelta ?? 0) >= target;
        case 'calorie_cumulative':
            return (context.totalCaloriesBurned ?? 0) >= target;
        case 'activity_participation_count':
            if (context.participationCount == null) {
                context.participationCount = await tx.userActivity.count({
                    where: { userId: context.userId, wasPresent: true },
                });
            }
            return (context.participationCount ?? 0) >= target;
        case 'activity_specific_participation':
            return Boolean(badge.activityId)
                && Boolean(context.activityId)
                && badge.activityId === context.activityId
                && Boolean(context.wasPresent);
        case 'consecutive_days_calories':
            if (!target) {
                return false;
            }
            if (context.consecutiveDays == null) {
                context.consecutiveDays = await calculateConsecutiveDays(tx, context.userId, target);
            }
            return (context.consecutiveDays ?? 0) >= target;
        case 'invite_count':
            if (context.inviteSuccessCount == null) {
                context.inviteSuccessCount = await tx.ticket.count({
                    where: {
                        invitedUser: { inviterId: context.userId },
                        ticketUsed: true,
                    },
                });
            }
            return (context.inviteSuccessCount ?? 0) >= target;
        default:
            return false;
    }
}

async function calculateConsecutiveDays(tx, userId, requiredSpan) {
    if (!userId || !requiredSpan) {
        return 0;
    }
    const sinceDate = new Date();
    sinceDate.setDate(sinceDate.getDate() - requiredSpan - 5);
    const activities = await tx.userActivity.findMany({
        where: {
            userId,
            wasPresent: true,
            joinedAt: { gte: sinceDate },
        },
        select: { joinedAt: true },
        orderBy: { joinedAt: 'desc' },
    });

    const uniqueDays = Array.from(
        new Set(
            activities.map((entry) => truncateToDate(entry.joinedAt).getTime()),
        ),
    ).sort((a, b) => b - a);

    let streak = 0;
    let previous = null;
    for (const day of uniqueDays) {
        if (previous == null) {
            streak = 1;
        } else if (previous - day === ONE_DAY_IN_MS) {
            streak += 1;
        } else {
            break;
        }
        previous = day;
    }

    return streak;
}

function truncateToDate(value) {
    const date = new Date(value);
    date.setHours(0, 0, 0, 0);
    return date;
}

const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000;

function computeEarnedValue(badge, context) {
    const rule = badge.badgeRule;
    switch (rule?.ruleType) {
        case 'calorie_single_activity':
            return context.caloriesDelta ?? null;
        case 'calorie_cumulative':
            return context.totalCaloriesBurned ?? null;
        case 'activity_participation_count':
            return context.participationCount ?? null;
        case 'invite_count':
            return context.inviteSuccessCount ?? null;
        default:
            return null;
    }
}

async function ensureUserBadge(tx, userId, badge, source, earnedValue) {
    const existing = await tx.userBadge.findUnique({
        where: {
            userId_badgeId: {
                userId,
                badgeId: badge.id,
            },
        },
    });

    if (existing) {
        return false;
    }

    await tx.userBadge.create({
        data: {
            userId,
            badgeId: badge.id,
            status: UserBadgeStatus.earned,
            source,
            earnedValue,
        },
    });

    return true;
}
