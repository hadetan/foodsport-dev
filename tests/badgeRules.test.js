import test from 'node:test';
import assert from 'node:assert/strict';
import {
    awardBadgesForActivityProgress,
    awardPointsBadges,
    awardRedemptionBadges,
    awardInviteBadges,
    __ruleEvaluatorInternals,
    awardBadgesForCustomRuleTypes,
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
            count: async () => 0,
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
        socialShare: { count: async () => 0 },
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
        socialShare: { ...defaultTx.socialShare, ...(overrides.socialShare || {}) },
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

function buildBadgeConfig(id, badgeRules, extra = {}) {
    return { id, badgeRules, ...extra };
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
                badgeRules: [{
                    id: 'rule-single',
                    ruleType: 'calorie_single_activity',
                    targetValue: 500,
                    params: null,
                }],
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
                badgeRules: [{
                    id: 'rule-cumulative',
                    ruleType: 'calorie_cumulative',
                    targetValue: 5000,
                    params: null,
                }],
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
                badgeRules: [{
                    id: 'rule-participation',
                    ruleType: 'activity_participation_count',
                    targetValue: 5,
                    params: null,
                }],
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
                badgeRules: [{
                    id: 'rule-specific',
                    ruleType: 'activity_specific_participation',
                    targetValue: 1,
                    params: null,
                }],
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
                badgeRules: [{
                    id: 'rule-streak',
                    ruleType: 'consecutive_days_calories',
                    targetValue: 3,
                    params: { minDailyCalories: 200, type: 'burn' },
                }],
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

test('awardBadgesForActivityProgress requires all rules to match before awarding', async () => {
    const createdBadges = [];
    const tx = createMockTx({
        badge: {
            findMany: async () => ([{
                id: 'badge-multi-rule',
                activityId: 'activity-special',
                badgeRules: [
                    {
                        id: 'rule-activity',
                        ruleType: 'activity_specific_participation',
                        targetValue: 1,
                        params: null,
                    },
                    {
                        id: 'rule-calories',
                        ruleType: 'calorie_single_activity',
                        targetValue: 500,
                        params: null,
                    },
                ],
            }]),
        },
        userBadge: {
            create: async ({ data }) => { createdBadges.push(data); },
        },
    });

    const awards = await awardBadgesForActivityProgress(tx, {
        userId: 'user-multi',
        activityId: 'activity-special',
        wasPresent: true,
        caloriesDelta: 600,
        source: 'unit-test',
    });

    assert.equal(awards.length, 1);
    assert.equal(createdBadges.length, 1);
    assert.equal(createdBadges[0].badgeId, 'badge-multi-rule');
});

test('calorie_single_activity combined with activity_specific_participation + invite_count + social_share awards when all satisfied', async () => {
    const createdBadges = [];
    const badge = {
        id: 'badge-calorie-activity-invite-social',
        activityId: 'activity-combo',
        badgeRules: [
            { id: 'r1', ruleType: 'activity_specific_participation', targetValue: null, params: null },
            { id: 'r2', ruleType: 'calorie_single_activity', targetValue: 400, params: null },
            { id: 'r3', ruleType: 'invite_count', targetValue: 2, params: null },
            { id: 'r4', ruleType: 'social_share', targetValue: 1, params: null },
        ],
    };

    const tx = createMockTx({
        badge: { findMany: async () => [badge] },
        userBadge: { create: async ({ data }) => createdBadges.push(data), findUnique: async () => null },
        ticket: { count: async () => 2 },
        socialShare: { count: async () => 1 },
    });

    const awards = await awardBadgesForCustomRuleTypes(tx, {
        userId: 'combo-user',
        ruleTypes: ['calorie_single_activity', 'activity_specific_participation', 'invite_count', 'social_share'],
        activityId: 'activity-combo',
        wasPresent: true,
        caloriesDelta: 500,
        source: 'combo-test',
    });

    assert.equal(awards.length, 1);
    assert.equal(createdBadges[0].badgeId, badge.id);
});

test('calorie_single_activity + activity_specific_participation awards when both satisfied', async () => {
    const createdBadges = [];
    const badge = {
        id: 'badge-calorie-activity',
        activityId: 'activity-combo',
        badgeRules: [
            { id: 'r1', ruleType: 'activity_specific_participation', targetValue: null, params: null },
            { id: 'r2', ruleType: 'calorie_single_activity', targetValue: 350, params: null },
        ],
    };

    const tx = createMockTx({
        badge: { findMany: async () => [badge] },
        userBadge: { create: async ({ data }) => createdBadges.push(data), findUnique: async () => null },
    });

    const awards = await awardBadgesForCustomRuleTypes(tx, {
        userId: 'combo-user-activity',
        ruleTypes: ['calorie_single_activity', 'activity_specific_participation'],
        activityId: 'activity-combo',
        wasPresent: true,
        caloriesDelta: 500,
        source: 'combo-test',
    });

    assert.equal(awards.length, 1);
    assert.equal(createdBadges[0].badgeId, badge.id);
});

test('calorie_single_activity + activity_specific_participation + invite_count awards when all satisfied', async () => {
    const createdBadges = [];
    const badge = {
        id: 'badge-calorie-activity-invite',
        activityId: 'activity-combo',
        badgeRules: [
            { id: 'r1', ruleType: 'activity_specific_participation', targetValue: null, params: null },
            { id: 'r2', ruleType: 'calorie_single_activity', targetValue: 400, params: null },
            { id: 'r3', ruleType: 'invite_count', targetValue: 2, params: null },
        ],
    };

    const tx = createMockTx({
        badge: { findMany: async () => [badge] },
        userBadge: { create: async ({ data }) => createdBadges.push(data), findUnique: async () => null },
        ticket: { count: async () => 3 },
    });

    const awards = await awardBadgesForCustomRuleTypes(tx, {
        userId: 'combo-user-activity-invite',
        ruleTypes: ['calorie_single_activity', 'activity_specific_participation', 'invite_count'],
        activityId: 'activity-combo',
        wasPresent: true,
        caloriesDelta: 500,
        source: 'combo-test',
    });

    assert.equal(awards.length, 1);
    assert.equal(createdBadges[0].badgeId, badge.id);
});

test('calorie_single_activity + activity_specific_participation + invite_count fails if invites insufficient', async () => {
    const createdBadges = [];
    const badge = {
        id: 'badge-calorie-activity-invite',
        activityId: 'activity-combo-2',
        badgeRules: [
            { id: 'r1', ruleType: 'activity_specific_participation', targetValue: null, params: null },
            { id: 'r2', ruleType: 'calorie_single_activity', targetValue: 400, params: null },
            { id: 'r3', ruleType: 'invite_count', targetValue: 3, params: null },
        ],
    };

    const tx = createMockTx({
        badge: { findMany: async () => [badge] },
        userBadge: { create: async ({ data }) => createdBadges.push(data), findUnique: async () => null },
        ticket: { count: async () => 2 },
    });

    const awards = await awardBadgesForCustomRuleTypes(tx, {
        userId: 'combo-user-2',
        ruleTypes: ['calorie_single_activity', 'activity_specific_participation', 'invite_count'],
        activityId: 'activity-combo-2',
        wasPresent: true,
        caloriesDelta: 500,
        source: 'combo-test',
    });

    assert.equal(awards.length, 0);
});

const crossConnectionCombos = [
    {
        name: 'calorie_single_activity + invite_count awards when satisfied per matrix',
        badge: buildBadgeConfig('badge-calorie-invite-only', [
            { id: 'matrix-c1', ruleType: 'calorie_single_activity', targetValue: 350, params: null },
            { id: 'matrix-c2', ruleType: 'invite_count', targetValue: 2, params: null },
        ]),
        txOverrides: {
            ticket: { count: async () => 3 },
        },
        context: {
            caloriesDelta: 500,
        },
    },
    {
        name: 'calorie_single_activity + social_share awards when satisfied per matrix',
        badge: buildBadgeConfig('badge-calorie-social', [
            { id: 'matrix-c3', ruleType: 'calorie_single_activity', targetValue: 300, params: null },
            { id: 'matrix-c4', ruleType: 'social_share', targetValue: 1, params: null },
        ]),
        txOverrides: {
            socialShare: { count: async () => 2 },
        },
        context: {
            caloriesDelta: 400,
        },
    },
    {
        name: 'activity_specific_participation + invite_count awards when both satisfied per matrix',
        badge: buildBadgeConfig(
            'badge-activity-invite',
            [
                { id: 'matrix-c5', ruleType: 'activity_specific_participation', targetValue: null, params: null },
                { id: 'matrix-c6', ruleType: 'invite_count', targetValue: 2, params: null },
            ],
            { activityId: 'activity-matrix' },
        ),
        txOverrides: {
            ticket: { count: async () => 3 },
        },
        context: {
            activityId: 'activity-matrix',
            wasPresent: true,
        },
    },
    {
        name: 'activity_specific_participation + social_share awards when both satisfied per matrix',
        badge: buildBadgeConfig(
            'badge-activity-social',
            [
                { id: 'matrix-c7', ruleType: 'activity_specific_participation', targetValue: null, params: null },
                { id: 'matrix-c8', ruleType: 'social_share', targetValue: 1, params: null },
            ],
            { activityId: 'activity-social' },
        ),
        txOverrides: {
            socialShare: { count: async () => 2 },
        },
        context: {
            activityId: 'activity-social',
            wasPresent: true,
        },
    },
    {
        name: 'invite_count + social_share awards according to matrix support',
        badge: buildBadgeConfig('badge-invite-social', [
            { id: 'matrix-c9', ruleType: 'invite_count', targetValue: 2, params: null },
            { id: 'matrix-c10', ruleType: 'social_share', targetValue: 1, params: null },
        ]),
        txOverrides: {
            ticket: { count: async () => 3 },
            socialShare: { count: async () => 2 },
        },
        context: {},
    },
    {
        name: 'invite_count + activity_participation_count awards when both satisfied per matrix',
        badge: buildBadgeConfig('badge-invite-participation', [
            { id: 'matrix-c11', ruleType: 'invite_count', targetValue: 2, params: null },
            { id: 'matrix-c12', ruleType: 'activity_participation_count', targetValue: 4, params: null },
        ]),
        txOverrides: {
            ticket: { count: async () => 3 },
            userActivity: {
                count: async () => 5,
                findMany: async () => [],
            },
        },
        context: {},
    },
    {
        name: 'calorie_cumulative + activity_participation_count awards when both satisfied per matrix',
        badge: buildBadgeConfig('badge-cumulative-participation', [
            { id: 'matrix-c13', ruleType: 'calorie_cumulative', targetValue: 5000, params: null },
            { id: 'matrix-c14', ruleType: 'activity_participation_count', targetValue: 5, params: null },
        ]),
        txOverrides: {
            userActivity: {
                count: async () => 6,
                findMany: async () => [],
            },
        },
        context: {
            totalCaloriesBurned: 6000,
        },
    },
    {
        name: 'calorie_cumulative + invite_count awards when both satisfied per matrix',
        badge: buildBadgeConfig('badge-cumulative-invite', [
            { id: 'matrix-c15', ruleType: 'calorie_cumulative', targetValue: 4000, params: null },
            { id: 'matrix-c16', ruleType: 'invite_count', targetValue: 2, params: null },
        ]),
        txOverrides: {
            ticket: { count: async () => 3 },
        },
        context: {
            totalCaloriesBurned: 5000,
        },
    },
    {
        name: 'calorie_cumulative + social_share awards when both satisfied per matrix',
        badge: buildBadgeConfig('badge-cumulative-social', [
            { id: 'matrix-c17', ruleType: 'calorie_cumulative', targetValue: 4500, params: null },
            { id: 'matrix-c18', ruleType: 'social_share', targetValue: 1, params: null },
        ]),
        txOverrides: {
            socialShare: { count: async () => 2 },
        },
        context: {
            totalCaloriesBurned: 6000,
        },
    },
    {
        name: 'calorie_cumulative + frequency_count awards when both satisfied per matrix',
        badge: buildBadgeConfig('badge-cumulative-frequency', [
            { id: 'matrix-c19', ruleType: 'calorie_cumulative', targetValue: 4000, params: null },
            {
                id: 'matrix-c20',
                ruleType: 'frequency_count',
                targetValue: 2,
                params: { timeframe: 'weekly', weeks: 2, timesPerWeek: 1, eventType: 'presence' },
            },
        ]),
        txOverrides: {
            userActivity: {
                findMany: async () => ([
                    { joinedAt: new Date() },
                    { joinedAt: new Date(Date.now() - 8 * ONE_DAY_MS) },
                ]),
                count: async () => 5,
            },
        },
        context: {
            totalCaloriesBurned: 5000,
        },
    },
    {
        name: 'calorie_cumulative + points_cumulative awards when both satisfied per matrix',
        badge: buildBadgeConfig('badge-cumulative-points', [
            { id: 'matrix-c21', ruleType: 'calorie_cumulative', targetValue: 4000, params: null },
            { id: 'matrix-c22', ruleType: 'points_cumulative', targetValue: 1500, params: null },
        ]),
        context: {
            totalCaloriesBurned: 6000,
            totalPoints: 2000,
        },
    },
    {
        name: 'social_share + activity_participation_count awards when both satisfied per matrix',
        badge: buildBadgeConfig('badge-social-participation', [
            { id: 'matrix-c23', ruleType: 'social_share', targetValue: 1, params: null },
            { id: 'matrix-c24', ruleType: 'activity_participation_count', targetValue: 4, params: null },
        ]),
        txOverrides: {
            socialShare: { count: async () => 2 },
            userActivity: {
                count: async () => 5,
                findMany: async () => [],
            },
        },
        context: {},
    },
];

crossConnectionCombos.forEach((comboCase) => {
    test(comboCase.name, async () => {
        const createdBadges = [];
        const tx = createMockTx({
            badge: { findMany: async () => [comboCase.badge] },
            userBadge: {
                create: async ({ data }) => { createdBadges.push(data); },
                findUnique: async () => null,
            },
            ...(comboCase.txOverrides || {}),
        });

        const badgeRuleTypes = comboCase.ruleTypes
            || Array.from(new Set(comboCase.badge.badgeRules.map((rule) => rule.ruleType)));

        const awards = await awardBadgesForCustomRuleTypes(tx, {
            userId: comboCase.userId || 'matrix-user',
            source: 'matrix-test',
            ruleTypes: badgeRuleTypes,
            ...comboCase.context,
        });

        assert.equal(awards.length, 1);
        assert.equal(createdBadges[0]?.badgeId, comboCase.badge.id);
    });
});

test('awardBadgesForActivityProgress does not award when only some rules match', async () => {
    const tx = createMockTx({
        badge: {
            findMany: async () => ([{
                id: 'badge-all-rules',
                activityId: 'activity-special',
                badgeRules: [
                    {
                        id: 'rule-activity',
                        ruleType: 'activity_specific_participation',
                        targetValue: 1,
                        params: null,
                    },
                    {
                        id: 'rule-calories',
                        ruleType: 'calorie_single_activity',
                        targetValue: 800,
                        params: null,
                    },
                ],
            }]),
        },
    });

    const awards = await awardBadgesForActivityProgress(tx, {
        userId: 'user-partial',
        activityId: 'activity-special',
        wasPresent: true,
        caloriesDelta: 500,
        source: 'unit-test',
    });

    assert.equal(awards.length, 0);
});

test('awardInviteBadges tracks invite milestones based on used tickets', async () => {
    const createdBadges = [];
    const tx = createMockTx({
        badge: {
            findMany: async () => ([{
                id: 'badge-invite',
                badgeRules: [{
                    id: 'rule-invite',
                    ruleType: 'invite_count',
                    targetValue: 3,
                    params: null,
                }],
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
                badgeRules: [{
                    id: 'rule-points',
                    ruleType: 'points_cumulative',
                    targetValue: 1000,
                    params: null,
                }],
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
                    badgeRules: [{
                        id: 'rule-first',
                        ruleType: 'redeem_first',
                        targetValue: 1,
                        params: null,
                    }],
                },
                {
                    id: 'badge-cumulative',
                    badgeRules: [{
                        id: 'rule-cumulative',
                        ruleType: 'redeem_points_cumulative',
                        targetValue: 5000,
                        params: null,
                    }],
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

test('redeem_purchase rule only awards the badge being redeemed', async () => {
    const limitedBadgeA = {
        id: 'badge-limited-a',
        badgeRules: [{ id: 'rule-limited-a', ruleType: 'redeem_purchase', targetValue: null, params: null }],
    };
    const limitedBadgeB = {
        id: 'badge-limited-b',
        badgeRules: [{ id: 'rule-limited-b', ruleType: 'redeem_purchase', targetValue: null, params: null }],
    };

    const createdForA = [];
    const txForA = createMockTx({
        badge: { findMany: async () => [limitedBadgeA, limitedBadgeB] },
        userBadge: {
            create: async ({ data }) => { createdForA.push(data); },
            findUnique: async () => null,
        },
    });

    const awardsForA = await awardRedemptionBadges(txForA, {
        userId: 'user-limited',
        source: 'redeem:badge-limited-a',
        redeemedBadgeId: 'badge-limited-a',
    });

    assert.equal(awardsForA.length, 1);
    assert.equal(createdForA[0]?.badgeId, 'badge-limited-a');

    const createdForB = [];
    const txForB = createMockTx({
        badge: { findMany: async () => [limitedBadgeA, limitedBadgeB] },
        userBadge: {
            create: async ({ data }) => { createdForB.push(data); },
            findUnique: async () => null,
        },
    });

    const awardsForB = await awardRedemptionBadges(txForB, {
        userId: 'user-limited',
        source: 'redeem:badge-limited-b',
        redeemedBadgeId: 'badge-limited-b',
    });

    assert.equal(awardsForB.length, 1);
    assert.equal(createdForB[0]?.badgeId, 'badge-limited-b');
});

test('awardSocialShareBadge grants badge on first verified share', async () => {
    const createdBadges = [];
    const tx = createMockTx({
        badge: {
            findMany: async () => ([{
                id: 'badge-social',
                badgeRules: [{
                    id: 'rule-social',
                    ruleType: 'social_share',
                    targetValue: 1,
                    params: null,
                }],
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
                    badgeRules: [{
                        id: 'rule-seasonal',
                        ruleType: 'points_cumulative',
                        targetValue: 500,
                        params: null,
                    }],
                },
                {
                    id: 'badge-regular',
                    isSeasonal: false,
                    badgeRules: [{
                        id: 'rule-regular',
                        ruleType: 'points_cumulative',
                        targetValue: 500,
                        params: null,
                    }],
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
