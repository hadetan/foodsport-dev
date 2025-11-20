import { UserBadgeStatus } from '@prisma/client';
import { groupBadgesByRuleSetKey, prioritizeBadges } from './utils';
import { ACTIVITY_RULE_TYPES, POINT_RULE_TYPES, REDEMPTION_RULE_TYPES } from '../../app/constants/constants';

const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000;

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

export async function awardPointsBadges(tx, params) {
    const { userId } = params;
    if (!userId) {
        return [];
    }
    return awardBadgesForRules(tx, {
        ...params,
        ruleTypes: POINT_RULE_TYPES,
    });
}

export async function awardRedemptionBadges(tx, params) {
    const { userId } = params;
    if (!userId) {
        return [];
    }
    return awardBadgesForRules(tx, {
        ...params,
        ruleTypes: REDEMPTION_RULE_TYPES,
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
            badgeRules: {
                some: {
                    isActive: true,
                    ruleType: { in: ruleTypes },
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

    const candidateBadges = badges
        .map((badge) => {
            const relevantRules = (badge.badgeRules ?? []).filter((rule) => ruleTypes.includes(rule.ruleType));
            return {
                ...badge,
                badgeRules: relevantRules,
                __totalRuleCount: badge.badgeRules?.length ?? 0,
            };
        })
        .filter((badge) => badge.badgeRules.length && badge.badgeRules.length === badge.__totalRuleCount)
        .map(({ __totalRuleCount, ...rest }) => rest);
    if (!candidateBadges.length) {
        return [];
    }

    const grouped = groupBadgesByRuleSetKey(candidateBadges);
    const awards = [];
    const evalContext = {
        ...context,
        userId,
    };
    const awardedBadgeIds = new Set();

    for (const [, bucket] of grouped.entries()) {
        const prioritized = prioritizeBadges(bucket, now);
        if (!prioritized.length) {
            continue;
        }

        for (const badge of prioritized) {
            if (awardedBadgeIds.has(badge.id)) {
                continue;
            }
            const matches = await doesBadgeMatchAllRules(tx, badge, evalContext);
            if (!matches) {
                continue;
            }
            const earnedValue = computeBadgeEarnedValue(badge, evalContext);
            const created = await ensureUserBadge(tx, userId, badge, source, earnedValue);
            awardedBadgeIds.add(badge.id);
            if (created) {
                awards.push({ badgeId: badge.id });
            }
            break;
        }
    }

    return awards;
}

async function doesBadgeMatchAllRules(tx, badge, context) {
    const rules = badge?.badgeRules ?? [];
    if (!rules.length) {
        return false;
    }
    for (const rule of rules) {
        const matches = await doesBadgeRuleMatch(tx, badge, rule, context);
        if (!matches) {
            return false;
        }
    }
    return true;
}

async function doesBadgeRuleMatch(tx, badge, rule, context) {
    const target = rule?.targetValue ?? 0;
    // const params = rule?.params ?? {};
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
            return evaluateConsecutiveRule(tx, rule, context, target);
        case 'frequency_count':
            return evaluateFrequencyRule(tx, rule, context);
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
        case 'points_cumulative': {
            const totalPoints = await resolveUserTotalPoints(tx, context);
            setRuleEarnedValue(context, rule.id, totalPoints ?? null);
            return (totalPoints ?? 0) >= target;
        }
        case 'redeem_first': {
            const redemptionCount = await resolveRedemptionCount(tx, context);
            setRuleEarnedValue(context, rule.id, redemptionCount);
            const threshold = Math.max(target || 1, 1);
            return redemptionCount >= threshold;
        }
        case 'redeem_points_cumulative': {
            const redeemedPointsTotal = await resolveRedeemedPointsTotal(tx, context);
            setRuleEarnedValue(context, rule.id, redeemedPointsTotal);
            return (redeemedPointsTotal ?? 0) >= target;
        }
        default:
            return false;
    }
}

async function evaluateConsecutiveRule(tx, rule, context, target) {
    const params = rule?.params ?? {};
    const minDailyCalories = Number(params?.minDailyCalories) || null;
    const source = params?.type || params?.source || 'presence';
    let streak = 0;

    if (minDailyCalories && source !== 'presence') {
        const calorieSource = source === 'donation' ? 'donation' : 'burn';
        streak = await calculateCalorieConsecutiveDays(tx, context.userId, target, {
            minDailyCalories,
            source: calorieSource,
        });
    } else {
        streak = await calculatePresenceConsecutiveDays(tx, context.userId, target);
    }

    setRuleEarnedValue(context, rule.id, streak);
    return streak >= target;
}

async function evaluateFrequencyRule(tx, rule, context) {
    const cache = ensureMap(context, '__frequencyCache');
    if (cache.has(rule.id)) {
        return cache.get(rule.id).meetsRequirement;
    }

    const params = rule?.params ?? {};
    const timeframe = params.timeframe === 'monthly' ? 'monthly' : 'weekly';
    const targetValue = Number(rule?.targetValue ?? 0) || 0;
    const rawPeriodCount = timeframe === 'weekly'
        ? Number(params.weeks ?? params.windows ?? targetValue ?? 0)
        : Number(params.months ?? params.windows ?? targetValue ?? 0);
    const rawOccurrences = timeframe === 'weekly'
        ? Number(params.timesPerWeek ?? params.timesPerWindow ?? params.times ?? 0)
        : Number(params.timesPerMonth ?? params.timesPerWindow ?? params.times ?? 0);
    const periodCount = Math.max(rawPeriodCount || 0, 1);
    const occurrencesPerPeriod = Math.max(rawOccurrences || 0, 1);
    const eventType = params.eventType === 'calorie_donation'
        ? 'calorie_donation'
        : params.eventType === 'calorie_burn'
            ? 'calorie_burn'
            : 'presence';

    if (!context.userId || !periodCount) {
        cache.set(rule.id, { meetsRequirement: false, satisfiedPeriods: 0 });
        setRuleEarnedValue(context, rule.id, 0);
        return false;
    }

    const referenceDate = new Date();
    const requiredPeriods = buildPeriodSequence(referenceDate, timeframe, periodCount);
    const sequenceStartDate = new Date(requiredPeriods[0].anchor);

    const counts = new Map();
    if (eventType === 'presence') {
        const activities = await tx.userActivity.findMany({
            where: {
                userId: context.userId,
                wasPresent: true,
                joinedAt: { gte: sequenceStartDate },
            },
            select: { joinedAt: true },
        });
        activities.forEach((entry) => {
            const periodKey = formatPeriodKey(entry.joinedAt, timeframe);
            counts.set(periodKey, (counts.get(periodKey) ?? 0) + 1);
        });
    } else {
        const minCaloriesPerEvent = Number(params.minCaloriesPerEvent ?? params.minDailyCalories ?? 0);
        const calorieSource = eventType === 'calorie_donation' ? 'donation' : 'burn';
        const dailyTotals = await getDailyCalorieTotals(tx, context.userId, sequenceStartDate, calorieSource);
        for (const [dayKey, total] of dailyTotals.entries()) {
            if (total >= minCaloriesPerEvent) {
                const periodKey = formatPeriodKey(new Date(dayKey), timeframe);
                counts.set(periodKey, (counts.get(periodKey) ?? 0) + 1);
            }
        }
    }

    let satisfiedPeriods = 0;
    const meetsRequirement = requiredPeriods.every((periodMeta) => {
        const actual = counts.get(periodMeta.key) ?? 0;
        const meets = actual >= occurrencesPerPeriod;
        if (meets) {
            satisfiedPeriods += 1;
        }
        return meets;
    });

    cache.set(rule.id, { meetsRequirement, satisfiedPeriods });
    setRuleEarnedValue(context, rule.id, satisfiedPeriods);
    return meetsRequirement;
}

async function calculatePresenceConsecutiveDays(tx, userId, requiredSpan) {
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

    const uniqueDays = Array.from(new Set(activities.map((entry) => truncateToDate(entry.joinedAt).getTime()))).sort((a, b) => b - a);

    return countConsecutiveDays(uniqueDays);
}

async function calculateCalorieConsecutiveDays(tx, userId, requiredSpan, options) {
    if (!userId || !requiredSpan || !options?.minDailyCalories) {
        return 0;
    }
    const bufferDays = requiredSpan + 10;
    const sinceDate = new Date();
    sinceDate.setDate(sinceDate.getDate() - bufferDays);
    const totals = await getDailyCalorieTotals(tx, userId, sinceDate, options.source);
    const qualifiedDays = Array.from(totals.entries())
        .filter(([, total]) => total >= options.minDailyCalories)
        .map(([dayKey]) => Number(dayKey))
        .sort((a, b) => b - a);
    return countConsecutiveDays(qualifiedDays);
}

function countConsecutiveDays(sortedDayKeys) {
    if (!sortedDayKeys.length) {
        return 0;
    }
    let streak = 0;
    let previous = null;
    for (const day of sortedDayKeys) {
        if (previous == null) {
            streak = 1;
        } else if (previous - day === ONE_DAY_IN_MS) {
            streak += 1;
        } else if (previous === day) {
            continue;
        } else {
            break;
        }
        previous = day;
    }
    return streak;
}

async function getDailyCalorieTotals(tx, userId, sinceDate, source = 'burn') {
    const totals = new Map();
    if (!userId) {
        return totals;
    }

    if (source === 'donation') {
        const donations = await tx.calorieDonation.findMany({
            where: {
                userId,
                createdAt: { gte: sinceDate },
            },
            select: { createdAt: true, caloriesDonated: true },
        });
        donations.forEach((entry) => {
            if (!entry.createdAt) {
                return;
            }
            const key = truncateToDate(entry.createdAt).getTime();
            const amount = Number(entry.caloriesDonated ?? 0) || 0;
            totals.set(key, (totals.get(key) ?? 0) + amount);
        });
        return totals;
    }

    const submissions = await tx.calorieSubmission.findMany({
        where: {
            userId,
            createdAt: { gte: sinceDate },
        },
        select: { createdAt: true, submittedCalories: true },
    });
    submissions.forEach((entry) => {
        if (!entry.createdAt) return;
        const key = truncateToDate(entry.createdAt).getTime();
        const amount = Number(entry.submittedCalories ?? 0) || 0;
        totals.set(key, (totals.get(key) ?? 0) + amount);
    });
    return totals;
}

function truncateToDate(value) {
    const date = new Date(value);
    date.setHours(0, 0, 0, 0);
    return date;
}

function ensureMap(context, key) {
    if (!context[key]) {
        context[key] = new Map();
    }
    return context[key];
}

function setRuleEarnedValue(context, ruleId, value) {
    if (!ruleId) {
        return;
    }
    const map = ensureMap(context, '__earnedValues');
    map.set(ruleId, value);
}

function getRuleEarnedValue(context, ruleId) {
    return context?.__earnedValues?.get(ruleId);
}

function computeBadgeEarnedValue(badge, context) {
    for (const rule of badge.badgeRules ?? []) {
        const value = computeRuleEarnedValue(rule, badge, context);
        if (value != null) {
            return value;
        }
    }
    return null;
}

function computeRuleEarnedValue(rule, badge, context) {
    const cached = getRuleEarnedValue(context, rule?.id);
    if (cached != null) {
        return cached;
    }
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

function formatPeriodKey(date, timeframe) {
    if (timeframe === 'monthly') {
        const monthStart = startOfMonth(date);
        return `${monthStart.getUTCFullYear()}-${String(monthStart.getUTCMonth() + 1).padStart(2, '0')}`;
    }
    const weekStart = startOfWeek(date);
    return `${weekStart.getUTCFullYear()}-W${String(getWeekNumber(weekStart)).padStart(2, '0')}`;
}

function buildPeriodSequence(referenceDate, timeframe, count) {
    const periods = [];
    let cursor = timeframe === 'monthly' ? startOfMonth(referenceDate) : startOfWeek(referenceDate);
    for (let i = 0; i < count; i += 1) {
        const key = formatPeriodKey(cursor, timeframe);
        periods.unshift({ key, anchor: cursor.toISOString() });
        cursor = timeframe === 'monthly' ? addMonths(cursor, -1) : addWeeks(cursor, -1);
    }
    return periods;
}

function startOfWeek(date) {
    const d = new Date(date);
    const day = d.getUTCDay();
    const diff = (day === 0 ? -6 : 1) - day;
    d.setUTCDate(d.getUTCDate() + diff);
    return truncateToDate(d);
}

function startOfMonth(date) {
    const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
    return d;
}

function addWeeks(date, count) {
    const d = new Date(date);
    d.setUTCDate(d.getUTCDate() + count * 7);
    return startOfWeek(d);
}

function addMonths(date, count) {
    const d = new Date(date);
    d.setUTCMonth(d.getUTCMonth() + count);
    return startOfMonth(d);
}

function getWeekNumber(date) {
    const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((d - yearStart) / ONE_DAY_IN_MS) + 1) / 7);
    return weekNo;
}

async function resolveUserTotalPoints(tx, context) {
    if (context.totalPoints != null) {
        return context.totalPoints;
    }
    if (!context.userId) {
        return null;
    }
    const user = await tx.user.findUnique({
        where: { id: context.userId },
        select: { totalPoints: true },
    });
    context.totalPoints = user?.totalPoints ?? 0;
    return context.totalPoints;
}

async function resolveRedemptionCount(tx, context) {
    if (context.redemptionCount != null) {
        return context.redemptionCount;
    }
    if (!context.userId) {
        context.redemptionCount = 0;
        return 0;
    }
    context.redemptionCount = await tx.badgeRedemption.count({ where: { userId: context.userId } });
    return context.redemptionCount;
}

async function resolveRedeemedPointsTotal(tx, context) {
    if (context.redeemedPointsTotal != null) {
        return context.redeemedPointsTotal;
    }
    if (!context.userId) {
        context.redeemedPointsTotal = 0;
        return 0;
    }
    const aggregate = await tx.badgeRedemption.aggregate({
        where: { userId: context.userId },
        _sum: { pointsPaid: true },
    });
    context.redeemedPointsTotal = aggregate?._sum?.pointsPaid ?? 0;
    return context.redeemedPointsTotal;
}

export const __ruleEvaluatorInternals = {
    calculateCalorieConsecutiveDays,
    calculatePresenceConsecutiveDays,
    evaluateFrequencyRule,
    getDailyCalorieTotals,
    truncateToDate,
    doesBadgeRuleMatch,
};
