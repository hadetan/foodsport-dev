import test from 'node:test';
import assert from 'node:assert/strict';
import {
    awardBadgesForActivityProgress,
    awardPointsBadges,
    awardRedemptionBadges,
    awardInviteBadges,
    awardBadgesForCustomRuleTypes,
} from '../src/lib/badges/ruleEvaluator.js';
import { awardSocialShareBadge } from '../src/lib/badges/awardSocialShare.js';

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
        socialShare: {
            count: async () => 0,
            findUnique: async () => null,
            update: async () => null,
        },
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

function buildBadgeConfig(id, badgeRules, extra = {}) {
    return { id, badgeRules, ...extra };
}

test('activity APIs award badges for single and multi-rule sets', async () => {
    const createdBadges = [];
    const singleBadge = {
        id: 'badge-single-rule',
        badgeRules: [
            {
                id: 'rule-single-calorie',
                ruleType: 'calorie_single_activity',
                targetValue: 400,
                params: null,
            },
        ],
    };
    const multiBadge = {
        id: 'badge-multi-rule',
        activityId: 'activity-101',
        badgeRules: [
            {
                id: 'rule-activity-specific',
                ruleType: 'activity_specific_participation',
                targetValue: null,
                params: null,
            },
            {
                id: 'rule-calorie-threshold',
                ruleType: 'calorie_single_activity',
                targetValue: 600,
                params: null,
            },
        ],
    };

    const tx = createMockTx({
        badge: {
            findMany: async () => [singleBadge, multiBadge],
        },
        userBadge: {
            findUnique: async () => null,
            create: async ({ data }) => { createdBadges.push(data); },
        },
    });

    // First API call: ticket verification only (participation rule satisfied, no calories yet)
    const verifyAwards = await awardBadgesForActivityProgress(tx, {
        userId: 'user-alice',
        activityId: 'activity-101',
        wasPresent: true,
        source: 'verifyTicket',
    });

    assert.equal(verifyAwards.length, 0, 'no badges should be created immediately when only participation rule matches');
    assert.equal(createdBadges.length, 0, 'user badge list should still be empty after verification');

    // Second API call: calorie reward import (should satisfy both single and multi rule badges)
    const rewardAwards = await awardBadgesForActivityProgress(tx, {
        userId: 'user-alice',
        activityId: 'activity-101',
        wasPresent: true,
        caloriesDelta: 700,
        source: 'rewardCalories',
    });

    assert.equal(rewardAwards.length, 2, 'both single-rule and multi-rule badges should be earned after calories are processed');
    assert.equal(createdBadges.length, 2); // ensure two badge records were inserted
    assert.deepEqual(createdBadges.map((record) => record.badgeId).sort(), ['badge-multi-rule', 'badge-single-rule']);
});

test('calorie milestones award cumulative badges in one import', async () => {
    const created = [];
    const badges = [
        {
            id: 'badge-500-single',
            badgeRules: [{ id: 'rule-single-calorie', ruleType: 'calorie_single_activity', targetValue: 500, params: null }],
        },
        {
            id: 'badge-10k',
            badgeRules: [{ id: 'rule-10k', ruleType: 'calorie_cumulative', targetValue: 10000, params: null }],
        },
        {
            id: 'badge-50k',
            badgeRules: [{ id: 'rule-50k', ruleType: 'calorie_cumulative', targetValue: 50000, params: null }],
        },
        {
            id: 'badge-100k',
            badgeRules: [{ id: 'rule-100k', ruleType: 'calorie_cumulative', targetValue: 100000, params: null }],
        },
    ];

    const tx = createMockTx({
        badge: { findMany: async () => badges },
        userBadge: { create: async ({ data }) => created.push(data), findUnique: async () => null },
    });

    const awards = await awardBadgesForActivityProgress(tx, {
        userId: 'milestone-user',
        caloriesDelta: 1000,
        totalCaloriesBurned: 120000,
        wasPresent: true,
        activityId: 'any-activity',
        source: 'calorie-import',
    });

    assert.equal(awards.length, badges.length);
    assert.deepEqual(created.map((entry) => entry.badgeId).sort(), badges.map((b) => b.id).sort());
});

test('participation badges span first join, repeat counts, and activity-specific rules', async () => {
    const created = [];
    const badges = [
        {
            id: 'badge-first-join',
            badgeRules: [{ id: 'rule-first', ruleType: 'activity_participation_count', targetValue: 1, params: null }],
        },
        {
            id: 'badge-five-joins',
            badgeRules: [{ id: 'rule-five', ruleType: 'activity_participation_count', targetValue: 5, params: null }],
        },
        {
            id: 'badge-specific-event',
            activityId: 'activity-special',
            badgeRules: [{ id: 'rule-specific', ruleType: 'activity_specific_participation', targetValue: null, params: null }],
        },
    ];

    const tx = createMockTx({
        badge: { findMany: async () => badges },
        userBadge: { create: async ({ data }) => created.push(data), findUnique: async () => null },
        userActivity: { ...createMockTx().userActivity, count: async () => 12 },
    });

    const awards = await awardBadgesForActivityProgress(tx, {
        userId: 'participant',
        activityId: 'activity-special',
        wasPresent: true,
        source: 'verify-flow',
    });

    assert.equal(awards.length, badges.length);
    assert.deepEqual(created.map((entry) => entry.badgeId).sort(), badges.map((b) => b.id).sort());
});

test('consecutive-calorie streak awards the streak badge', async () => {
    const created = [];
    const now = Date.now();
    const submissions = [0, 1, 2].map((offset) => ({
        createdAt: new Date(now - offset * 24 * 60 * 60 * 1000),
        submittedCalories: 250,
    }));

    const badge = {
        id: 'badge-streak-3',
        badgeRules: [{
            id: 'rule-streak',
            ruleType: 'consecutive_days_calories',
            targetValue: 3,
            params: { minDailyCalories: 200, type: 'burn' },
        }],
    };

    const tx = createMockTx({
        badge: { findMany: async () => [badge] },
        calorieSubmission: { findMany: async () => submissions },
        userBadge: { create: async ({ data }) => created.push(data), findUnique: async () => null },
    });

    const awards = await awardBadgesForActivityProgress(tx, {
        userId: 'streak-fan',
        wasPresent: true,
        caloriesDelta: 350,
        totalCaloriesBurned: 800,
        activityId: 'streak-activity',
        source: 'streak-flow',
    });

    assert.equal(awards.length, 1);
    assert.deepEqual(created.map((entry) => entry.badgeId), [badge.id]);
});

test('frequency rule awards when events occur each week', async () => {
    const created = [];
    const now = Date.now();
    const submissions = [0, 8].map((offset) => ({
        createdAt: new Date(now - offset * 24 * 60 * 60 * 1000),
        submittedCalories: 300,
    }));

    const badge = {
        id: 'badge-weekly-frequency',
        badgeRules: [{
            id: 'rule-frequency',
            ruleType: 'frequency_count',
            targetValue: 1,
            params: { timeframe: 'weekly', weeks: 1, timesPerWeek: 1, eventType: 'calorie_burn', minCaloriesPerEvent: 200 },
        }],
    };

    const tx = createMockTx({
        badge: { findMany: async () => [badge] },
        calorieSubmission: { findMany: async () => submissions },
        userBadge: { create: async ({ data }) => created.push(data), findUnique: async () => null },
    });

    const awards = await awardBadgesForActivityProgress(tx, {
        userId: 'frequency-user',
        wasPresent: true,
        caloriesDelta: 400,
        totalCaloriesBurned: 700,
        activityId: 'frequency-activity',
        source: 'frequency-flow',
    });

    assert.equal(awards.length, 1);
    assert.deepEqual(created.map((entry) => entry.badgeId), [badge.id]);
});

test('FS points and redemption badges earn through points accumulation and redeem flows', async () => {
    const pointsCreated = [];
    const pointsBadges = [
        {
            id: 'badge-1k-points',
            badgeRules: [{ id: 'rule-points-1k', ruleType: 'points_cumulative', targetValue: 1000, params: null }],
        },
        {
            id: 'badge-3k-points',
            badgeRules: [{ id: 'rule-points-3k', ruleType: 'points_cumulative', targetValue: 3000, params: null }],
        },
    ];

    const pointsTx = createMockTx({
        badge: { findMany: async () => pointsBadges },
        userBadge: { create: async ({ data }) => pointsCreated.push(data), findUnique: async () => null },
    });

    const pointAwards = await awardPointsBadges(pointsTx, {
        userId: 'points-user',
        totalPoints: 3500,
        source: 'points-import',
    });

    assert.equal(pointAwards.length, pointsBadges.length);
    assert.deepEqual(pointsCreated.map((entry) => entry.badgeId).sort(), pointsBadges.map((b) => b.id).sort());

    const redemptionBadges = [
        {
            id: 'badge-redeem-first',
            badgeRules: [{ id: 'rule-redeem-first', ruleType: 'redeem_first', targetValue: 1, params: null }],
        },
        {
            id: 'badge-redeem-10k',
            badgeRules: [{ id: 'rule-redeem-10k', ruleType: 'redeem_points_cumulative', targetValue: 10000, params: null }],
        },
        {
            id: 'badge-purchase-only',
            badgeRules: [{ id: 'rule-redeem-purchase', ruleType: 'redeem_purchase', targetValue: null, params: null }],
        },
    ];
    const redemptionCreated = [];
    const redemptionTx = createMockTx({
        badge: { findMany: async () => redemptionBadges },
        userBadge: { create: async ({ data }) => redemptionCreated.push(data), findUnique: async () => null },
    });

    const redemptionAwards = await awardRedemptionBadges(redemptionTx, {
        userId: 'redeemer',
        redemptionCount: 2,
        redeemedPointsTotal: 12000,
        redeemedBadgeId: 'badge-purchase-only',
        source: 'redeem:badge',
    });

    assert.equal(redemptionAwards.length, redemptionBadges.length);
    assert.deepEqual(redemptionCreated.map((entry) => entry.badgeId).sort(), redemptionBadges.map((b) => b.id).sort());
});

test('social share and invite flows award their respective badges', async () => {
    const inviteCreated = [];
    const inviteBadge = {
        id: 'badge-invite-count',
        badgeRules: [{ id: 'rule-invite', ruleType: 'invite_count', targetValue: 3, params: null }],
    };
    const inviteTx = createMockTx({
        badge: { findMany: async () => [inviteBadge] },
        userBadge: { create: async ({ data }) => inviteCreated.push(data), findUnique: async () => null },
        ticket: { count: async () => 5 },
    });

    const inviteAwards = await awardInviteBadges(inviteTx, {
        userId: 'inviter',
        source: 'invite-flow',
    });

    assert.equal(inviteAwards.length, 1);
    assert.equal(inviteCreated[0]?.badgeId, inviteBadge.id);

    const socialCreated = [];
    const socialBadge = {
        id: 'badge-social-share',
        badgeRules: [{ id: 'rule-social', ruleType: 'social_share', targetValue: null, params: null }],
    };
    const socialTx = createMockTx({
        badge: { findMany: async () => [socialBadge] },
        userBadge: { create: async ({ data }) => socialCreated.push(data), findUnique: async () => null },
    });

    const socialAward = await awardSocialShareBadge(socialTx, 'share-user');
    assert.equal(socialAward.awarded, true);
    assert.equal(socialCreated[0]?.badgeId, socialBadge.id);
});

test('mixed rule badge spans participation, activity, and cumulative calories', async () => {
    const created = [];
    const badge = {
        id: 'badge-mix-all',
        activityId: 'event-mix',
        badgeRules: [
            { id: 'rule-count', ruleType: 'activity_participation_count', targetValue: 3, params: null },
            { id: 'rule-specific', ruleType: 'activity_specific_participation', targetValue: null, params: null },
            { id: 'rule-cumulative', ruleType: 'calorie_cumulative', targetValue: 2000, params: null },
        ],
    };

    const tx = createMockTx({
        badge: { findMany: async () => [badge] },
        userBadge: { create: async ({ data }) => created.push(data), findUnique: async () => null },
        userActivity: { ...createMockTx().userActivity, count: async () => 5 },
    });

    const awards = await awardBadgesForActivityProgress(tx, {
        userId: 'multi-mix',
        activityId: 'event-mix',
        wasPresent: true,
        totalCaloriesBurned: 2500,
        source: 'mixed-flow',
    });

    assert.equal(awards.length, 1);
    assert.deepEqual(created.map((entry) => entry.badgeId), [badge.id]);
});

const apiMatrixCombos = [
    {
        name: 'API combo: calorie_single_activity + invite_count awards when satisfied',
        badge: buildBadgeConfig('api-calorie-invite', [
            { id: 'api-c1', ruleType: 'calorie_single_activity', targetValue: 350, params: null },
            { id: 'api-c2', ruleType: 'invite_count', targetValue: 2, params: null },
        ]),
        txOverrides: {
            ticket: { count: async () => 3 },
        },
        context: {
            caloriesDelta: 500,
        },
    },
    {
        name: 'API combo: calorie_cumulative + frequency_count awards when satisfied',
        badge: buildBadgeConfig('api-cumulative-frequency', [
            { id: 'api-c3', ruleType: 'calorie_cumulative', targetValue: 4000, params: null },
            {
                id: 'api-c4',
                ruleType: 'frequency_count',
                targetValue: 2,
                params: { timeframe: 'weekly', weeks: 2, timesPerWeek: 1, eventType: 'presence' },
            },
        ]),
        txOverrides: {
            userActivity: {
                findMany: async () => ([
                    { joinedAt: new Date() },
                    { joinedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000) },
                ]),
                count: async () => 5,
            },
        },
        context: {
            totalCaloriesBurned: 5000,
        },
    },
    {
        name: 'API combo: activity_specific_participation + social_share awards when satisfied',
        badge: buildBadgeConfig(
            'api-activity-social',
            [
                { id: 'api-c5', ruleType: 'activity_specific_participation', targetValue: null, params: null },
                { id: 'api-c6', ruleType: 'social_share', targetValue: 1, params: null },
            ],
            { activityId: 'api-activity' },
        ),
        txOverrides: {
            socialShare: { count: async () => 2 },
        },
        context: {
            activityId: 'api-activity',
            wasPresent: true,
        },
    },
    {
        name: 'API combo: invite_count + activity_participation_count awards when satisfied',
        badge: buildBadgeConfig('api-invite-participation', [
            { id: 'api-c7', ruleType: 'invite_count', targetValue: 2, params: null },
            { id: 'api-c8', ruleType: 'activity_participation_count', targetValue: 4, params: null },
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
        name: 'API combo: calorie_cumulative + points_cumulative awards when satisfied',
        badge: buildBadgeConfig('api-cumulative-points', [
            { id: 'api-c9', ruleType: 'calorie_cumulative', targetValue: 4500, params: null },
            { id: 'api-c10', ruleType: 'points_cumulative', targetValue: 1200, params: null },
        ]),
        context: {
            totalCaloriesBurned: 6000,
            totalPoints: 1500,
        },
    },
];

apiMatrixCombos.forEach((combo) => {
    test(combo.name, async () => {
        const created = [];
        const tx = createMockTx({
            badge: { findMany: async () => [combo.badge] },
            userBadge: {
                create: async ({ data }) => { created.push(data); },
                findUnique: async () => null,
            },
            ...(combo.txOverrides || {}),
        });

        const ruleTypes = combo.ruleTypes
            || Array.from(new Set(combo.badge.badgeRules.map((rule) => rule.ruleType)));

        const awards = await awardBadgesForCustomRuleTypes(tx, {
            userId: 'api-matrix-user',
            source: 'api-matrix-test',
            ruleTypes,
            ...combo.context,
        });

        assert.equal(awards.length, 1);
        assert.equal(created[0]?.badgeId, combo.badge.id);
    });
});