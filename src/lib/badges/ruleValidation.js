import { ALLOWED_RULE_TYPES } from '@/app/constants/constants';

const TARGET_REQUIRED_RULES = new Set([
  'calorie_single_activity',
  'calorie_cumulative',
  'activity_participation_count',
  'consecutive_days_calories',
  'invite_count',
  'frequency_count',
  'points_cumulative',
  'redeem_points_cumulative',
]);

const TARGET_OPTIONAL_RULES = new Set([
  'activity_specific_participation',
  'social_share',
  'redeem_first',
  'redeem_purchase',
]);

// Rule combination matrix: defines which rule types can be combined together
// Based on cross-connection.md specification
const ALLOWED_RULE_COMBINATIONS = {
  calorie_single_activity: new Set([
    'activity_specific_participation',
    'invite_count',
    'social_share',
  ]),
  calorie_cumulative: new Set([
    'activity_participation_count',
    'invite_count',
    'social_share',
    'frequency_count',
    'points_cumulative',
  ]),
  activity_participation_count: new Set([
    'calorie_cumulative',
    'invite_count',
    'social_share',
  ]),
  activity_specific_participation: new Set([
    'calorie_single_activity',
    'invite_count',
    'social_share',
  ]),
  consecutive_days_calories: new Set([]),
  invite_count: new Set([
    'calorie_single_activity',
    'calorie_cumulative',
    'activity_participation_count',
    'activity_specific_participation',
    'social_share',
  ]),
  social_share: new Set([
    'calorie_single_activity',
    'calorie_cumulative',
    'activity_participation_count',
    'activity_specific_participation',
    'invite_count',
  ]),
  frequency_count: new Set([
    'calorie_cumulative',
  ]),
  points_cumulative: new Set([
    'calorie_cumulative',
  ]),
  redeem_first: new Set([]),
  redeem_points_cumulative: new Set([]),
  redeem_purchase: new Set([]),
};

export function coerceRulesPayload(payload) {
  if (!payload || typeof payload !== 'object') {
    return [];
  }
  return Array.isArray(payload.rules) ? payload.rules : [];
}

export function validateAndNormalizeBadgeRules(rawRules) {
  if (!Array.isArray(rawRules) || rawRules.length === 0) {
    return { isValid: false, error: 'At least one badge rule is required.' };
  }

  const normalized = [];
  const seenTypes = new Set();

  for (let i = 0; i < rawRules.length; i += 1) {
    const rule = rawRules[i];
    if (!rule || typeof rule !== 'object') {
      return { isValid: false, error: `Rule at index ${i} must be an object.` };
    }
    const { ruleType, targetValue, params = null } = rule;
    if (typeof ruleType !== 'string' || !ALLOWED_RULE_TYPES.has(ruleType)) {
      return { isValid: false, error: `Rule at index ${i} has an invalid ruleType.` };
    }
    if (seenTypes.has(ruleType)) {
      return { isValid: false, error: `Duplicate ruleType "${ruleType}" detected.` };
    }
    seenTypes.add(ruleType);

    const normalizedRule = { ruleType };

    if (params !== null && typeof params !== 'object') {
      return { isValid: false, error: `Rule at index ${i} must provide params as an object or null.` };
    }
    normalizedRule.params = params;

    if (TARGET_OPTIONAL_RULES.has(ruleType)) {
      normalizedRule.targetValue = normalizeTargetValue(targetValue);
    } else if (TARGET_REQUIRED_RULES.has(ruleType)) {
      const normalizedTarget = normalizeTargetValue(targetValue);
      if (normalizedTarget == null || normalizedTarget <= 0) {
        return { isValid: false, error: `Rule type "${ruleType}" requires a positive targetValue.` };
      }
      normalizedRule.targetValue = normalizedTarget;
    } else {
      normalizedRule.targetValue = normalizeTargetValue(targetValue);
    }

    normalized.push(normalizedRule);
  }

  // Validate rule combinations if there are multiple rules
  if (normalized.length > 1) {
    const combinationError = validateRuleCombinations(normalized);
    if (combinationError) {
      return { isValid: false, error: combinationError };
    }
  }

  return { isValid: true, rules: normalized };
}

/**
 * Validates that all rule combinations in the badge are allowed per the cross-connection matrix
 * @param {Array} rules - Array of normalized rule objects
 * @returns {string|null} - Error message if invalid, null if valid
 */
function validateRuleCombinations(rules) {
  const ruleTypes = rules.map(r => r.ruleType);

  // Check each pair of rules
  for (let i = 0; i < ruleTypes.length; i += 1) {
    const primaryRule = ruleTypes[i];
    const allowedCombinations = ALLOWED_RULE_COMBINATIONS[primaryRule];

    for (let j = 0; j < ruleTypes.length; j += 1) {
      if (i === j) continue; // Skip self-comparison

      const jointRule = ruleTypes[j];

      // Check if this combination is allowed
      if (!allowedCombinations || !allowedCombinations.has(jointRule)) {
        return `Rule combination not allowed: "${primaryRule}" cannot be combined with "${jointRule}". Please refer to the badge rule combination matrix.`;
      }
    }
  }

  return null;
}

function normalizeTargetValue(value) {
  if (value === undefined || value === null || value === '') {
    return null;
  }
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return null;
  }
  return Math.trunc(numeric);
}
