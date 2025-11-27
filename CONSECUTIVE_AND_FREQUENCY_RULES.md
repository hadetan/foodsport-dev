# Badge rules: consecutive_days_calories & frequency_count — Usage Guide

This file documents how to use `params` for the two badge rules that rely on them in our codebase: `consecutive_days_calories` and `frequency_count`.

Relevant code:
- Rule validation: `src/lib/badges/ruleValidation.js`
- Rule evaluation: `src/lib/badges/ruleEvaluator.js` (see `evaluateConsecutiveRule`, `evaluateFrequencyRule` and `doesBadgeRuleMatch()`)
- UI examples and formatters: `src/app/[locale]/(landing)/Components/BadgeDetailsPage.js`

Summary
-------
- Only `consecutive_days_calories` and `frequency_count` rely on `params` for specific behaviour.
- `params` is accepted by any rule per the current validator, but only the two rules above actually use them at runtime.
- Both rules also require a positive `targetValue` as enforced by the validator. For `frequency_count`, `targetValue` acts as a fallback for the number of periods if `params` don't provide `weeks`/`months`.

General validation rules
------------------------
- `params` must be either `null` or an `object`.
- `targetValue` is required and must be a positive integer for these rules (as per `TARGET_REQUIRED_RULES` in `ruleValidation.js`).
- If `params` contains invalid types or invalid values, the validator will accept but the evaluator might not behave as expected — see specific sections for recommended validation.

1) consecutive_days_calories
---------------------------
Purpose:
- Award a badge for maintaining a consecutive streak of presence (attendances) or consecutive days with minimum daily calories (burn or donation).

Required/Optional fields:
- `ruleType` (string) — `consecutive_days_calories` (required)
- `targetValue` (number) — Number of consecutive days required (required; positive integer)
- `params` (object|null) — Optional. When provided, it switches the evaluation from presence-only to calorie-based rules.

Allowed/expected `params` fields:
- `minDailyCalories` (number) — If present and > 0, evaluator treats the rule as a calorie-based streak. Example: `minDailyCalories: 200`.
- `type` or `source` (string) — Optional. One of `'burn'`, `'donation'`, or `'presence'` (default if omitted). The evaluator maps `'donation'` to the donation totals and `'burn'` to user calorie submissions.

Notes & examples:
- Presence streak (no `params`):

  ```json
  {
    "ruleType": "consecutive_days_calories",
    "targetValue": 7,
    "params": null
  }
  ```

- Calorie streak (min daily burn of 200 kcal for 5 consecutive days):

  ```json
  {
    "ruleType": "consecutive_days_calories",
    "targetValue": 5,
    "params": { "minDailyCalories": 200, "type": "burn" }
  }
  ```

Validation & server behaviour:
- `targetValue` must be positive. Validator rejects zero/negative or non-numeric.
- If `params.minDailyCalories` is present, the evaluator uses `calculateCalorieConsecutiveDays()`.
- If `params` is omitted or `minDailyCalories` is not present, the evaluator uses presence-based streak calculation (`calculatePresenceConsecutiveDays()`).

2) frequency_count
------------------
Purpose:
- Award badges that require approval for repeated activity or calorie targets across a time-series: weekly or monthly occurrences over several periods. Examples: "Attend at least 1 event each week for 2 weeks" or "Log 2 calorie sessions each month for 3 months".

Required/Optional fields:
- `ruleType` (string) — `frequency_count` (required)
- `targetValue` (number) — Required positive integer (validator requires this). The evaluator uses it as a fallback for number of periods (weeks/months) if `params` do not provide them.
- `params` (object|null) — Optional, but a primary way to tune behaviour.

Expected `params` fields and semantics:
- `timeframe` (string) — `'weekly'` or `'monthly'`. Defaults to `'weekly'` when not provided.
- For weekly timeframe:
  - `weeks` (number) — Number of weeks required. If omitted, evaluator falls back to `rule.targetValue`.
  - `timesPerWeek` or `times` or `timesPerWindow` (number) — Required occurrences per week.
- For monthly timeframe:
  - `months` (number) — Number of months required. If omitted, evaluator falls back to `rule.targetValue`.
  - `timesPerMonth` or `times` or `timesPerWindow` (number) — Required occurrences per month.
- `eventType` (string) — `'presence'`, `'calorie_burn'`, or `'calorie_donation'`. Defaults to `'presence'`.
- `minCaloriesPerEvent` or `minDailyCalories` (number) — When `eventType` is calorie-based, enforces a minimum calorie threshold per event/day to count the event.

Notes & examples:
- Weekly presence requirement (attend 1 activity/week for 2 weeks):

  ```json
  {
    "ruleType": "frequency_count",
    "targetValue": 2,
    "params": { "timeframe": "weekly", "weeks": 2, "timesPerWeek": 1, "eventType": "presence" }
  }
  ```

- Monthly calorie-based requirement (Log 2 ≥300 kcal sessions every month for 3 months):

  ```json
  {
    "ruleType": "frequency_count",
    "targetValue": 3,
    "params": { "timeframe": "monthly", "months": 3, "timesPerMonth": 2, "eventType": "calorie_burn", "minCaloriesPerEvent": 300 }
  }
  ```

- Minimal fallback example (targetValue used as the number of periods):

  ```json
  {
    "ruleType": "frequency_count",
    "targetValue": 2,
    "params": { "timeframe": "weekly", "timesPerWeek": 1 }
  }
  ```

Validation & server behaviour:
- `targetValue` (positive number) must be present. If `params.weeks` or `params.months` are not provided, the evaluator uses `rule.targetValue` to compute the period count.
- If `eventType` is `'calorie_burn'` or `'calorie_donation'`, `minCaloriesPerEvent` (or `minDailyCalories`) controls the threshold for the event to be counted when scanning daily totals.
- The evaluator uses `evaluateFrequencyRule()` to compute counts per period and verifies all periods in the requested window meet or exceed the per-period occurrence requirement.

Usage patterns and admin notes
-----------------------------
- Keep the `targetValue` consistent with the semantics in the `params`. For example: if you provide `params.weeks` you should still set `targetValue` to the same value for validator compatibility.
- If you want to express a rule without `params` for `consecutive_days_calories`, omit `params` and the system evaluates presence streaks.
- If you want frequency-like rules without specifying `params`, include `targetValue` (validator requires it) and set `params.timesPerWeek/timesPerMonth` accordingly.

Full API examples
-----------------
- Create a badge that requires a 5-day calorie burn streak:

  ```json
  POST /api/admin/badges
  {
    "name": "5-Day Burn Streak",
    "imageUrl": "badges/5day.png",
    "rules": [
      {
        "ruleType": "consecutive_days_calories",
        "targetValue": 5,
        "params": { "minDailyCalories": 200, "type": "burn" }
      }
    ]
  }
  ```

- Create a badge that requires weekly presence: 2 weeks, 1 attendance per week:

  ```json
  POST /api/admin/badges
  {
    "name": "2-Week Consistency",
    "imageUrl": "badges/2weeks.png",
    "rules": [
      {
        "ruleType": "frequency_count",
        "targetValue": 2,
        "params": { "timeframe": "weekly", "weeks": 2, "timesPerWeek": 1, "eventType": "presence" }
      }
    ]
  }
  ```

- Create a badge that requires 2 calorie sessions/month for 3 months:

  ```json
  POST /api/admin/badges
  {
    "name": "Monthly Burner",
    "imageUrl": "badges/monthly.png",
    "rules": [
      {
        "ruleType": "frequency_count",
        "targetValue": 3,
        "params": { "timeframe": "monthly", "months": 3, "timesPerMonth": 2, "eventType": "calorie_burn", "minCaloriesPerEvent": 300 }
      }
    ]
  }
  ```

Error handling & examples
-------------------------
- Missing/invalid `targetValue` for `consecutive_days_calories` or `frequency_count` will produce 400/validation error: "Rule type \"{ruleType}\" requires a positive targetValue.".
- `params` must be an `object` or `null`, otherwise the validator returns an error: "Rule at index {i} must provide params as an object or null.".
- If `params` includes invalid fields/values (e.g., `minDailyCalories` negative), DOM/UI/server may accept it but evaluator will likely not match. Consider adding further validation checks.

Further suggestions
-------------------
- Add server-side `params` validation for the two permitted param-heavy rules to avoid misconfigured rules.
  - `consecutive_days_calories`:
    - `minDailyCalories` (positive integer optional)
    - `type/source` in `['presence', 'burn', 'donation']`
  - `frequency_count`:
    - `timeframe` in `['weekly', 'monthly']`
    - `weeks` or `months` or `rule.targetValue` (positive integer)
    - `timesPerWeek` or `timesPerMonth` or `timesPerWindow` or `times` (positive integer)
    - If `eventType` is calorie-based, include `minCaloriesPerEvent` > 0

- If you want to prevent `params` misuse, add a `RULES_ALLOWING_PARAMS` set to `ruleValidation.js` and reject `params` for other rule types.

Links and references
--------------------
- `src/lib/badges/ruleValidation.js` — how rules are validated and `params` are accepted as `null` or `object`.
- `src/lib/badges/ruleEvaluator.js` — how `consecutive_days_calories` and `frequency_count` use `params` while evaluating.
- `tests/badgeRules.test.js` — unit tests with examples of `params` use.

If you'd like, I can add validator updates to enforce `params` only on these rules and include unit tests demonstrating expected behaviour. Let me know if you'd like that implemented next.