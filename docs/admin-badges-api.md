# Admin Badges API — Quick Guide

This guide explains how to use the admin badge APIs to create or update badges with flexible rule sets. Keep the examples handy when creating new seasonal, activity-specific, social, limited-edition, milestone, or invite badges.

Endpoints
- POST /api/admin/badges — Create a badge. Admin-only, requires authentication via Supabase admin cookies.
- PUT /api/admin/badges/{badgeId} — Update badge metadata and rule sets. Admin-only.

Required request headers
- x-internal-api (if used by internal admin clients) or the admin user session via Supabase auth cookie

Top-level request body fields
- name (string, required) — i18n master display name (EN) for the badge.
- nameZh (string, optional) — Display name for Traditional Chinese.
- description (string, optional) — EN description.
- descriptionZh (string, optional) — CN/Traditional Chinese description.
- imageUrl (string, required) — path to Supabase bucket object; frontend will compose the public URL.
- isSeasonal (boolean, optional) — whether the badge is a seasonal one.
- seasonalStartDate (ISO string, required if isSeasonal true) — season start.
- seasonalEndDate (ISO string, required if isSeasonal true) — season end.
- activityId (UUID, optional) — set for activity-specific badges; activity must exist and not be cancelled.
- isLimitedEdition (boolean, optional) — indicates this badge is redeemable via FS points. If true, `fsPointsCost` must be set.
- fsPointsCost (number, optional) — FS point price if redeemable (must be a positive integer for limited edition badges).
- place (int, optional) — integer ordering for UI; if not set, the server assigns the next available place.
- rules (array, required) — array of rule payloads for the badge. Must contain at least one rule and every rule must be satisfied for the badge to be earned.

Rule object fields (example):
- ruleType (string, required) — enum value for the rule (see below).
- targetValue (int, optional) — threshold (e.g., a calorie amount, participation count).
- params (JSON object or null, optional) — further parameters (e.g., `days` for consecutive-day rules).

When multiple rules are provided, the evaluator uses logical AND: a user must satisfy every active rule on the badge before it is awarded.

Allowed ruleType values and example bodies
- calorie_single_activity — Award if calories in a single activity meet or exceed target value.
  Example:
  ```json
  {
    "name": "500 Cal Single Activity",
    "imageUrl": "badges/500cal.png",
    "rules": [
      { "ruleType": "calorie_single_activity", "targetValue": 500 }
    ]
  }
  ```

- calorie_cumulative — Award when total calories across activities reaches target.
  Example:
  ```json
  {
    "name": "10k Cumul",
    "imageUrl": "badges/10k.png",
    "rules": [
      { "ruleType": "calorie_cumulative", "targetValue": 10000 }
    ]
  }
  ```

- activity_participation_count — Award after N attendances across activities.
  Example:
  ```json
  {
    "name": "Attend 5 Activities",
    "imageUrl": "badges/attend5.png",
    "rules": [
      { "ruleType": "activity_participation_count", "targetValue": 5 }
    ]
  }
  ```

- activity_specific_participation — Award once for participating in a specific activity.
  Example:
  ```json
  {
    "name": "Marathon 2025 Participant",
    "imageUrl": "badges/marathon2025.png",
    "activityId": "<activity-uuid>",
    "rules": [
      { "ruleType": "activity_specific_participation" }
    ]
  }
  ```

- consecutive_days_calories — Award when calories burned across N consecutive days (finer param options available via `params`).
  Example using `params.days`:
  ```json
  {
    "name": "7-Day Streak",
    "imageUrl": "badges/7daystreak.png",
    "rules": [
      {
        "ruleType": "consecutive_days_calories",
        "targetValue": 500,
        "params": { "days": 7 }
      }
    ]
  }
  ```

- invite_count — Award when inviter reaches a count of valid referred tickets (present and verified). Use `targetValue` for threshold.
  Example:
  ```json
  {
    "name": "Invite Champion",
    "imageUrl": "badges/invite_champ.png",
    "rules": [
      { "ruleType": "invite_count", "targetValue": 3 }
    ]
  }
  ```

- social_share — Award via automated share token flow (server verifies clicks) — no admin manual verification needed. For this rule, `targetValue` is optional and not required for the default share flow.
  Example:
  ```json
  {
    "name": "Share the Love",
    "imageUrl": "badges/share.png",
    "rules": [
      { "ruleType": "social_share" }
    ]
  }
  ```

Limited edition redeemable badge example
```json
{
  "name": "Limited T-Shirt",
  "imageUrl": "badges/tshirt-special.png",
  "isLimitedEdition": true,
  "fsPointsCost": 30,
  "rules": [
    { "ruleType": "social_share" },
    { "ruleType": "calorie_cumulative", "targetValue": 2500 }
  ]
}
```

## Updating an existing badge
- Endpoint: `PUT /api/admin/badges/{badgeId}`.
- Provide any fields you wish to change (e.g., `name`, `imageUrl`, `isActive`).
- Include `rules` (array) to replace the entire rule set atomically.

Example payload updating rules and limited-edition settings:
```json
{
  "name": "Anniversary Legend",
  "isLimitedEdition": false,
  "rules": [
    { "ruleType": "calorie_cumulative", "targetValue": 10000 },
    { "ruleType": "activity_participation_count", "targetValue": 10 }
  ]
}
```

Notes, validation, and server-side rules
- The API validates `isSeasonal` with `seasonalStartDate` and `seasonalEndDate`. If `isSeasonal` is true, `seasonalStartDate` and `seasonalEndDate` must be valid ISO dates and `seasonalStartDate` < `seasonalEndDate`.
- For `activityId`, the API validates the referenced activity exists and is not cancelled; otherwise the request will be rejected (404).
- For `isLimitedEdition`, `fsPointsCost` must be provided and be a positive integer. The API enforces this.
- Every badge must have at least one rule. Provide multiple rules via the `rules` array; all rules must be satisfied for the badge to be awarded.
- `imageUrl` should be a relative Supabase path (FE composes the public URL). The API does not upload or validate bucket-level permissions.
- Default `place` behavior: the server assigns the next highest place if `place` is not provided. Admins can set `place` to reorder badges for UI.
- Awarding is immediate in flows where awarding is expected (e.g., admin import, ticket verification); social share badges are automatically verified when click thresholds are met via the `/share/{token}` redirect.

Response example (201)
```json
{
  "badge": {
    "id": "uuid",
    "name": "...",
    "imageUrl": "badges/...",
    "isSeasonal": false,
    "activityId": null,
    "isLimitedEdition": false,
    "fsPointsCost": null,
    "place": 1,
    "badgeRules": [
      {
        "id": "uuid-1",
        "badgeId": "uuid",
        "ruleType": "calorie_cumulative",
        "targetValue": 10000,
        "params": null
      },
      {
        "id": "uuid-2",
        "badgeId": "uuid",
        "ruleType": "activity_participation_count",
        "targetValue": 3,
        "params": null
      }
    ]
  }
}
```

Best practices and tips
- Keep rules simple and use `params` for more complex rules only when needed.
- For seasonal badges: create both seasonal and evergreen badges for the same rule if needed — the evaluator automatically prioritizes seasonal badges when inside the season window.
- Use `activityId` for awards that come from a specific activity import, but note these badge awards are only processed during activity imports or ticket verification that involves the associated activity.
- When attaching `social_share` rules: ensure you have the front-end using the share token API (`/api/social-shares`) so share clicks and verification occur automatically.

Troubleshooting
- A `400` error usually indicates missing fields or validation; verify `rule.ruleType` and `fsPointsCost` when required.
- A `404` might be returned when `activityId` references a non-existent activity or a cancelled one.
- If you get a `500` error on badge creation, check server logs for transaction or DB constraint errors (e.g., duplicate badge rule creation attempts).

---
This document outlines the admin usage of the Badge creation API with examples that map to every rule type available in the current system. Keep this doc handy for admins and for updating tests and the UI admin console.