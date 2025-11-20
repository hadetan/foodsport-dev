# Badge Multi-Rule Reference

This document summarizes how the FoodSport badge system now supports multiple rules per badge, spanning schema, API, evaluator, and validation requirements.

## Schema and Persistence
- `BadgeRule` no longer enforces a unique constraint on `badgeId`; multiple rules may reference the same badge.
- Rules store core fields only (`ruleType`, `targetValue`, `params`, `isActive`, timestamps). They are evaluated collectively, so no priority metadata is needed.
- `updated_at` is tracked automatically so rule edits are auditable.
- Prisma relation on `Badge` is now `badgeRules: BadgeRule[]` and API consumers must expect full collections when querying badges.

## Admin API Expectations
- **Create** (`POST /api/admin/badges`) and **update** (`PUT /api/admin/badges/{badgeId}`) accept either `rules` (array) or `rule` (single object). The server coerces single objects into arrays to keep legacy clients working.
- Requests must provide at least one valid rule. Validation enforces:
  - `ruleType` must be part of `ALLOWED_RULE_TYPES`.
  - No duplicate `ruleType` entries per badge payload (prevents conflicting logic).
  - Numeric thresholds (`targetValue`) are required for rule types that depend on counts/calories/points.
  - `params` must be objects (or `null`) for structured rule configuration.
  - Because evaluation is AND-based, each badge's rule list represents required criteria rather than alternatives.
- Responses now include `badgeRules` arrays so UIs can render/manage every rule associated with a badge.

## Evaluator and Awarding Logic
- Badge award flows fetch every active rule for eligible badges and require all of them to pass before awarding.
- Seasonal prioritization still occurs across badges with identical rule sets: seasonal badges continue to win over evergreen badges when rules collide.
- A badge is awarded at most once per evaluation batch, even when multiple badges within a rule set are eligible.
- The evaluator caches per-rule earned values to keep idempotent writes, then checks `user_badges (userId, badgeId)` before inserting to avoid duplicate rows.

## Operational Notes
- Adding or reordering rules only requires updating the badge via the admin API; no extra schema work is needed beyond the included migration `20251120110444_allow_multi_badge_rules`.
- When migrating existing single-rule badges, simply resubmit their original rule via the update API alongside any additional rules you want to add.
- Tests covering badge rules live in `tests/badgeRules.test.js`; extend them whenever you ship new evaluator capabilities.
