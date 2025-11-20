import test from 'node:test';
import assert from 'node:assert/strict';
import {
    awardBadgesForActivityProgress,
    awardPointsBadges,
    awardRedemptionBadges,
    awardInviteBadges,
    __ruleEvaluatorInternals,
} from '../src/lib/badges/ruleEvaluator.js';
import { awardSocialShareBadge } from '../src/lib/badges/awardSocialShare.js';

const {
    calculateCalorieConsecutiveDays,
    calculatePresenceConsecutiveDays,
    evaluateFrequencyRule,
} = __ruleEvaluatorInternals;

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

function createMockTx(overrides = {}) {
    const noopAsync = async () => undefined;
    const defaultTx = {
        badge: { findMany: async () => [] },
        userBadge: {
            create: noopAsync,
            findUnique: async () => null,
        },
        userActivity: {
            findMany: async () => [],
            count: async () => 0,
        },
        calorieSubmission: { findMany: async () => [] },
        calorieDonation: { findMany: async () => [] },
        user: { findUnique: async () => ({ totalPoints: 0 }) },
        badgeRedemption: {
            count: async () => 0,
            aggregate: async () => ({ _sum: { pointsPaid: 0 } }),
        },
        ticket: { count: async () => 0 },
    };

    return {
        ...defaultTx,
        ...overrides,
        badge: { ...defaultTx.badge, ...(overrides.badge || {}) },
        userBadge: { ...defaultTx.userBadge, ...(overrides.userBadge || {}) },
        userActivity: { ...defaultTx.userActivity, ...(overrides.userActivity || {}) },
        calorieSubmission: { ...defaultTx.calorieSubmission, ...(overrides.calorieSubmission || {}) },
        calorieDonation: { ...defaultTx.calorieDonation, ...(overrides.calorieDonation || {}) },
        user: { ...defaultTx.user, ...(overrides.user || {}) },
        badgeRedemption: { ...defaultTx.badgeRedemption, ...(overrides.badgeRedemption || {}) },
        ticket: { ...defaultTx.ticket, ...(overrides.ticket || {}) },
    };
}

function buildSubmissionDays(daysArray) {
    return daysArray.map((offset) => ({
        createdAt: new Date(Date.now() - offset * ONE_DAY_MS),
        submittedCalories: 250,
    }));
}

test('calculateCalorieConsecutiveDays respects per-day calorie minimums', async () => {
    const submissions = buildSubmissionDays([0, 1, 2, 5]);
    const tx = createMockTx({
        calorieSubmission: {
            findMany: async () => submissions,
        },
    });

    const streak = await calculateCalorieConsecutiveDays(tx, 'user-1', 3, {
        minDailyCalories: 200,
        source: 'burn',
    });

    assert.equal(streak, 3);
});

test('calculatePresenceConsecutiveDays counts attendance-only streaks', async () => {
    const activities = buildSubmissionDays([0, 1, 2]).map(({ createdAt }) => ({ joinedAt: createdAt }));
    const tx = createMockTx({
        userActivity: {
            findMany: async () => activities,
        },
    });

    const streak = await calculatePresenceConsecutiveDays(tx, 'user-legacy', 3);
    assert.equal(streak, 3);
});

function makeWeeklyActivities(weeks, occurrencesPerWeek) {
    const entries = [];
    for (let week = 0; week < weeks; week += 1) {
        for (let i = 0; i < occurrencesPerWeek; i += 1) {
            const daysAgo = week * 7 + i;
            entries.push({ joinedAt: new Date(Date.now() - daysAgo * ONE_DAY_MS) });
        }
    }
    return entries;
}

test('evaluateFrequencyRule passes when weekly participation meets requirement', async () => {
    const rule = {
        id: 'freq-weekly',
        ruleType: 'frequency_count',
        targetValue: 2,
        params: {
            timeframe: 'weekly',
            weeks: 2,
            timesPerWeek: 2,
        },
    };
    const tx = createMockTx({
        userActivity: {
            findMany: async () => makeWeeklyActivities(3, 3),
        },
    });

    const context = { userId: 'user-1' };
    const result = await evaluateFrequencyRule(tx, rule, context);
    assert.equal(result, true);
});

test('evaluateFrequencyRule fails when monthly calorie events are insufficient', async () => {
    const now = Date.now();
    const submissions = [
        { createdAt: new Date(now - 10 * ONE_DAY_MS), submittedCalories: 500 },
    ];
    const rule = {
        id: 'freq-monthly',
        ruleType: 'frequency_count',
        targetValue: 2,
        params: {
            timeframe: 'monthly',
            months: 2,
            timesPerMonth: 2,
            eventType: 'calorie_burn',
            minCaloriesPerEvent: 400,
        },
    };
    const tx = createMockTx({
        calorieSubmission: {
            findMany: async () => submissions,
        },
    });
    const context = { userId: 'user-1' };
    const result = await evaluateFrequencyRule(tx, rule, context);
    assert.equal(result, false);
});

test('awardBadgesForActivityProgress grants single-event calorie badges', async () => {
    const createdBadges = [];
    const tx = createMockTx({
        badge: {
            findMany: async () => ([{
                id: 'badge-single-calorie',
                badgeRule: {
                    id: 'rule-single',
                    ruleType: 'calorie_single_activity',
                    targetValue: 500,
                    params: null,
                },
            }]),
        },
        userBadge: {
            create: async ({ data }) => { createdBadges.push(data); },
        },
    });

    const awards = await awardBadgesForActivityProgress(tx, {
        userId: 'user-activity',
        activityId: 'activity-1',
        caloriesDelta: 600,
        wasPresent: true,
        source: 'unit-test',
    });

    assert.equal(awards.length, 1);
    assert.equal(createdBadges[0].badgeId, 'badge-single-calorie');
});

test('awardBadgesForActivityProgress awards cumulative calorie milestones', async () => {
    const createdBadges = [];
    const tx = createMockTx({
        badge: {
            findMany: async () => ([{
                id: 'badge-cumulative-calorie',
                badgeRule: {
                    id: 'rule-cumulative',
                    ruleType: 'calorie_cumulative',
                    targetValue: 5000,
                    params: null,
                },
            }]),
        },
        userBadge: {
            create: async ({ data }) => { createdBadges.push(data); },
        },
    });

    const awards = await awardBadgesForActivityProgress(tx, {
        userId: 'user-activity',
        totalCaloriesBurned: 6000,
        wasPresent: true,
        source: 'unit-test',
    });

    assert.equal(awards.length, 1);
    assert.equal(createdBadges[0].badgeId, 'badge-cumulative-calorie');
});

test('awardBadgesForActivityProgress recognizes participation milestones', async () => {
    const createdBadges = [];
    const tx = createMockTx({
        badge: {
            findMany: async () => ([{
                id: 'badge-participation',
                badgeRule: {
                    id: 'rule-participation',
                    ruleType: 'activity_participation_count',
                    targetValue: 5,
                    params: null,
                },
            }]),
        },
        userBadge: {
            create: async ({ data }) => { createdBadges.push(data); },
        },
        userActivity: {
            count: async () => 5,
        },
    });

    const awards = await awardBadgesForActivityProgress(tx, {
        userId: 'user-activity',
        wasPresent: true,
        source: 'unit-test',
    });

    assert.equal(awards.length, 1);
    assert.equal(createdBadges[0].badgeId, 'badge-participation');
});

test('awardBadgesForActivityProgress handles activity-specific badges', async () => {
    const createdBadges = [];
    const tx = createMockTx({
        badge: {
            findMany: async () => ([{
                id: 'badge-activity-specific',
                activityId: 'activity-special',
                badgeRule: {
                    id: 'rule-specific',
                    ruleType: 'activity_specific_participation',
                    targetValue: 1,
                    params: null,
                },
            }]),
        },
        userBadge: {
            create: async ({ data }) => { createdBadges.push(data); },
        },
    });

    const awards = await awardBadgesForActivityProgress(tx, {
        userId: 'user-activity',
        activityId: 'activity-special',
        wasPresent: true,
        source: 'unit-test',
    });

    assert.equal(awards.length, 1);
    assert.equal(createdBadges[0].badgeId, 'badge-activity-specific');
});

test('awardBadgesForActivityProgress honors consecutive calorie days', async () => {
    const createdBadges = [];
    const tx = createMockTx({
        badge: {
            findMany: async () => ([{
                id: 'badge-streak',
                badgeRule: {
                    id: 'rule-streak',
                    ruleType: 'consecutive_days_calories',
                    targetValue: 3,
                    params: { minDailyCalories: 200, type: 'burn' },
                },
            }]),
        },
        userBadge: {
            create: async ({ data }) => { createdBadges.push(data); },
        },
        calorieSubmission: {
            findMany: async () => buildSubmissionDays([0, 1, 2]),
        },
    });

    const awards = await awardBadgesForActivityProgress(tx, {
        userId: 'user-streak',
        activityId: 'activity-streak',
        wasPresent: true,
        source: 'streak-test',
    });

    assert.equal(awards.length, 1);
    assert.equal(createdBadges[0].badgeId, 'badge-streak');
});

test('awardInviteBadges tracks invite milestones based on used tickets', async () => {
    const createdBadges = [];
    const tx = createMockTx({
        badge: {
            findMany: async () => ([{
                id: 'badge-invite',
                badgeRule: {
                    id: 'rule-invite',
                    ruleType: 'invite_count',
                    targetValue: 3,
                    params: null,
                },
            }]),
        },
        userBadge: {
            create: async ({ data }) => { createdBadges.push(data); },
        },
        ticket: {
            count: async () => 4,
        },
    });

    const awards = await awardInviteBadges(tx, {
        userId: 'inviter-user',
        source: 'invite:activity',
    });

    assert.equal(awards.length, 1);
    assert.equal(createdBadges[0].badgeId, 'badge-invite');
});

test('awardPointsBadges grants badge when total points meet threshold', async () => {
    const createdBadges = [];
    const tx = createMockTx({
        badge: {
            findMany: async () => ([{
                id: 'badge-points',
                badgeRule: {
                    id: 'rule-points',
                    ruleType: 'points_cumulative',
                    targetValue: 1000,
                    params: null,
                },
            }]),
        },
        userBadge: {
            create: async ({ data }) => {
                createdBadges.push(data);
            },
        },
    });

    const awards = await awardPointsBadges(tx, {
        userId: 'user-2',
        totalPoints: 1500,
        source: 'unit-test',
    });

    assert.equal(awards.length, 1);
    assert.equal(createdBadges[0].badgeId, 'badge-points');
});

test('awardRedemptionBadges handles first redeem and cumulative totals', async () => {
    const createdBadges = [];
    const tx = createMockTx({
        badge: {
            findMany: async () => ([
                {
                    id: 'badge-first',
                    badgeRule: {
                        id: 'rule-first',
                        ruleType: 'redeem_first',
                        targetValue: 1,
                        params: null,
                    },
                },
                {
                    id: 'badge-cumulative',
                    badgeRule: {
                        id: 'rule-cumulative',
                        ruleType: 'redeem_points_cumulative',
                        targetValue: 5000,
                        params: null,
                    },
                },
            ]),
        },
        userBadge: {
            create: async ({ data }) => {
                createdBadges.push(data);
            },
        },
    });

    const awards = await awardRedemptionBadges(tx, {
        userId: 'user-3',
        source: 'redeem:test',
        redemptionCount: 1,
        redeemedPointsTotal: 6000,
    });

    assert.equal(awards.length, 2);
    const badgeIds = createdBadges.map((row) => row.badgeId).sort();
    assert.deepEqual(badgeIds, ['badge-cumulative', 'badge-first']);
});

test('awardSocialShareBadge grants badge on first verified share', async () => {
    const createdBadges = [];
    const tx = createMockTx({
        badge: {
            findMany: async () => ([{
                id: 'badge-social',
                badgeRule: {
                    id: 'rule-social',
                    ruleType: 'social_share',
                    targetValue: 1,
                    params: null,
                },
            }]),
        },
        userBadge: {
            create: async ({ data }) => { createdBadges.push(data); },
        },
    });

    const result = await awardSocialShareBadge(tx, 'user-share');

    assert.equal(result.awarded, true);
    assert.equal(createdBadges[0].badgeId, 'badge-social');
});

test('seasonal badges are prioritized when multiple rules share a bucket', async () => {
    const createdBadges = [];
    const now = new Date();
    const earlier = new Date(now.getTime() - 7 * ONE_DAY_MS);
    const later = new Date(now.getTime() + 7 * ONE_DAY_MS);
    const tx = createMockTx({
        badge: {
            findMany: async () => ([
                {
                    id: 'badge-seasonal',
                    isSeasonal: true,
                    seasonalStartDate: earlier,
                    seasonalEndDate: later,
                    badgeRule: {
                        id: 'rule-seasonal',
                        ruleType: 'points_cumulative',
                        targetValue: 500,
                        params: null,
                    },
                },
                {
                    id: 'badge-regular',
                    isSeasonal: false,
                    badgeRule: {
                        id: 'rule-regular',
                        ruleType: 'points_cumulative',
                        targetValue: 500,
                        params: null,
                    },
                },
            ]),
        },
        userBadge: {
            create: async ({ data }) => { createdBadges.push(data); },
        },
    });

    const awards = await awardPointsBadges(tx, {
        userId: 'user-seasonal',
        totalPoints: 800,
        source: 'seasonal-test',
    });

    assert.equal(awards.length, 1);
    assert.equal(createdBadges[0].badgeId, 'badge-seasonal');
});
