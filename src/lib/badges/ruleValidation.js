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

  return { isValid: true, rules: normalized };
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
