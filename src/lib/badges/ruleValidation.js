import { ALLOWED_RULE_TYPES } from '@/app/constants/constants';

export const INVALID_RULES_PAYLOAD_ERROR = 'INVALID_RULES_PAYLOAD';

const TARGET_REQUIRED_RULES = new Set([
  'calorie_single_activity',
  'calorie_cumulative',
  'activity_participation_count',
  'consecutive_days_calories',
  'invite_count',
  'points_cumulative',
  'redeem_points_cumulative',
]);

const TARGET_OPTIONAL_RULES = new Set([
  'activity_specific_participation',
  'social_share',
  'redeem_first',
  'redeem_purchase',
]);

// Rules that are allowed to include a `params` object. Others must pass `params: null`.
const RULES_ALLOWING_PARAMS = new Set([
  'consecutive_days_calories',
]);

function validateConsecutiveParams(params, index) {
  const result = { isValid: true, params: {} };
  const normalized = {};
  if (params.minDailyCalories !== undefined && params.minDailyCalories !== null && params.minDailyCalories !== '') {
    const n = Number(params.minDailyCalories);
    if (!Number.isFinite(n) || n <= 0) {
      return { isValid: false, error: `Rule at index ${index}: params.minDailyCalories must be a positive number.` };
    }
    normalized.minDailyCalories = Math.trunc(n);
  }
  const source = params.type ?? params.source ?? null;
  // Default to 'burn' when no explicit type/source provided.
  const allowed = ['presence', 'burn', 'donation'];
  if (source === null) {
    normalized.type = 'burn';
  } else {
    if (typeof source !== 'string' || !allowed.includes(source)) {
      return { isValid: false, error: `Rule at index ${index}: params.type/source must be one of ${allowed.join(', ')}.` };
    }
    normalized.type = source;
  }
  return { isValid: true, params: Object.keys(normalized).length ? normalized : null };
}

// frequency_count params validator removed because rule is no longer available in admin UI
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
  // frequency_count removed
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

  const rawRules = payload.rules;
  if (rawRules === undefined || rawRules === null) {
    return [];
  }

  if (Array.isArray(rawRules)) {
    // Normalize rules: if any rule has `params` as a JSON string, parse it
    return rawRules.map((r) => {
      if (!r || typeof r !== 'object') return r;
      const copy = { ...r };
      if (copy.params && typeof copy.params === 'string') {
        try {
          copy.params = JSON.parse(copy.params);
        } catch (err) {
          // leave as string; validation will reject later
        }
      }
      return copy;
    });
  }

  if (typeof rawRules === 'string') {
    const trimmed = rawRules.trim();
    if (!trimmed) {
      return [];
    }
    try {
      const parsed = JSON.parse(trimmed);
      if (!Array.isArray(parsed)) {
        throw new Error('Rules payload must be an array');
      }
      return parsed;
    } catch (err) {
      const error = new Error(INVALID_RULES_PAYLOAD_ERROR);
      error.cause = err;
      throw error;
    }
  }

  return [];
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

    // Enforce which rules are allowed to include a params object
    if (params !== null && !RULES_ALLOWING_PARAMS.has(ruleType)) {
      return { isValid: false, error: `Rule at index ${i} ("${ruleType}") does not accept params.` };
    }

    // If params are provided for allowed rules, validate and normalize them
    if (params !== null && RULES_ALLOWING_PARAMS.has(ruleType)) {
      let validationResult = { isValid: true, params: params };
      if (ruleType === 'consecutive_days_calories') {
        validationResult = validateConsecutiveParams(params, i);
      }
      if (!validationResult.isValid) {
        return { isValid: false, error: validationResult.error };
      }
      normalizedRule.params = validationResult.params ?? null;
    } else {
      normalizedRule.params = null;
    }

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
