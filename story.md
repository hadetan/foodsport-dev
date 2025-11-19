# Story: Revamp Badge Schema & Awarding Flow

## Overview
We are implementing a flexible and admin-driven badge system that supports seasonal, activity-specific, milestone, invite, social, and limited-edition badges. The new schema will provide a clear, extensible model for creating and awarding badges while supporting the admin flows for importing & awarding. This work is backend-first (schema + API + rule evaluator). UI changes and admin pages will follow in a later phase.
- Single rule per badge initially; the system will enforce one `BadgeRule` per `Badge` (unique constraint) to keep initial complexity low.
- `activityId` will be a nullable FK on `Badge` if the badge targets a specific activity. Activity-specific badges are only awardable during/after the admin-import process for that activity; they remain visible after the activity is over (locked if not earned) but are not awardable after the event import has been processed for a user.
- There will be `isLimitedEdition` and `fsPointsCost` fields for buyable badges, with the redemption API exposed to users (requires auth). One redemption per user.
- No cron jobs are used; awarding is checked during import/event processing or other relevant flows (e.g., ticket verification).
- Admin-only badge creation.

---

## Models (summary)
   - id, name, nameZh, description, descriptionZh, imageUrl (non-null), isSeasonal, seasonalStartDate, seasonalEndDate, activityId (FK), isLimitedEdition, fsPointsCost, place (int), isActive, createdAt
   - Remove fields: `badgeType`, `criteriaValue`, `rarity`.
- BadgeRule (new):
   - id, badgeId (FK), ruleType (enum), targetValue (int?), params (Json?), isActive, createdAt
   - Enforce one rule per badge with a unique index on `badgeId`.
   - `ruleType` values include: `calorie_single_activity`, `calorie_cumulative`, `activity_participation_count`, `activity_specific_participation`, `consecutive_days_calories`, `invite_count`, `social_share`.
- UserBadge (update):
   - Keep `@@unique([userId, badgeId])` so users can only have one instance of each badge.
- BadgeRedemption (optional):
   - id, userId, badgeId, pointsPaid, redeemedAt, status
   - This may be used to track purchases separately.

---
## Awarding rules & flows
1. Activity-specific badges
   - Admin imports the activity attendance/donation import for an activity.
   - During import, for each user in the import rows marked present, check if `Badge` exists where `activityId` equals the activity and an award rule applies or admin specified direct awarding.
   - If present and the user does not already have the badge, create a `UserBadge` with `source: activity_import:<activityId>` and `earnedAt` set to now.
   - After the activity is finished, the badge remains visible but cannot be awarded via that activity anymore (import being the source of awarding only).

2. Milestone badges (calories/duration/participation counts)
   - The admin will create badges with `badgeRule` like `calorie_single_activity` (targetValue: 500), `calorie_cumulative` (targetValue: 10_000), or `activity_participation_count` (targetValue: 5).
   - When an admin imports activity results (calories/duration), the import logic checks per user if they reach any active badge rule thresholds given the import (delta or cumulative as required). If a badge is satisfied, award immediately.

3. Invite badges
   - Ticket verification flow will trigger invite logic: when a user verifies a ticket, confirm the inviter and mark that the inviter has a valid referred & present user. If the inviter meets the invite target, award the `invite_count` badge.

4. Social/share badges
   - Create a fully automated share-token workflow so admins never review proof manually.
   - `POST /api/social-shares` (auth required) mints a share token tied to the user + badge context and returns a canonical share URL (e.g., `/share/{token}`). Frontend embeds this URL in the share sheet so every share goes through our redirect.
   - When anyone hits `/share/{token}`, the server records a unique click (IP + UA hash) for that token, forwards the visitor to the public landing page, and once the first unique click (or configured threshold) occurs it marks the token `verified` and triggers badge evaluation immediately.
   - Awarding remains idempotent: if the user already has the `social_share` badge (seasonal preferred over non-seasonal), no duplicate `UserBadge` rows are created. Tokens are single-use and rate limited per user to avoid abuse.
   - No admin interaction or proof upload is required; everything happens via the redirect + click logging. APIs should still respect seasonal priority and operate without cron jobs.

5. Seasonal badges
   - If a badge is seasonal (`isSeasonal` true and `seasonalStartDate`/`seasonalEndDate` defines the window), the award evaluator must only award the seasonal badge within its seasonal window.
   - If the seasonal and non-seasonal badges target the same rule (e.g., both represent 500 calories) and the user's event qualifies during season window, the system must prioritize awarding the seasonal badge only, not the non-seasonal one.

6. Limited edition redeemable badges
   - Provide a `POST /api/badges/{badgeId}/redeem` endpoint (auth required).
    - Unit/integration tests for `rewardCalories` verifying pending calories conversion into FS points and ensuring `totalPoints` are updated and `pendingCaloriesForFsPoints` decremented.
    - Unit tests for redemption flow to ensure `totalPoints` are properly deducted and `UserBadge` updated.
   - Validate `isLimitedEdition`, check `fsPoints` balance, deduct points, create `BadgeRedemption` (optional) and `UserBadge` (source: `redeem`), and mark the badge as earned for the user.
   - Ensure uniqueness per user.

---

## Admin flows
- Admin badge creation API: supports `name`, `nameZh`, `description`, `descriptionZh`, `imageUrl`, `isSeasonal`/`seasonalStartDate`/`seasonalEndDate`, `activityId`, `isLimitedEdition`/`fsPointsCost`, `place` (integer), `BadgeRule` object.
- Activity import API: admin imports attendance/donations; server evaluates badge awarding logic based on rule and grants badges appropriately.
- Ticket verification API: existing ticket verification logic should check invite rules and award badges to inviter where applicable.

---

## Implementation Phases

Phase A — Schema & Prisma Migration
- Modify `prisma/schema.prisma` to implement the new models and fields.
- Make `Badge.imageUrl` non-nullable, add `nameZh`, `description`, `descriptionZh`, `place` integers, `isLimitedEdition`, `fsPointsCost`, `activityId` (FK) fields.
- Add `BadgeRule` model with unique `badgeId` and `ruleType` enum.
- Update `UserBadge` model: `status`, `earnedAt`, `source`, `pointsSpent`.
- Add `BadgeRedemption` model (optional).
- Add a new `pendingCaloriesForFsPoints` Int field on `User` (and `TempUser` if applicable) defaulting to 0 to hold accumulated calories that are pending FS point conversion.
- Create and run migration in development; `prisma generate`.
- Note: We will not attempt to update seeds; the system hasn’t been used, so no data migration is expected to be necessary.

Phase B — Backend APIs
   1. Increment `User.totalCaloriesBurned` and `User.pendingCaloriesForFsPoints` by calories imported.
   2. Compute `pointsEarned = Math.floor(pendingCaloriesForFsPoints / 500)` and if > 0 increment `User.totalPoints` by `pointsEarned` and decrement `pendingCaloriesForFsPoints` by `pointsEarned * 500`.
   3. Make this whole flow an atomic database transaction to avoid race conditions and ensure idempotency.
   4. For `TempUser`, update `pendingCaloriesForFsPoints` similarly (optional), but only award points to `User` accounts; handle migrating `TempUser` to a full `User` account if required.
 - Add `POST /api/social-shares` (auth-required) to mint share tokens and the public `/share/{token}` redirect handler that logs unique clicks, self-verifies the share, and awards `social_share` badges without manual admin review.

### Phase B (continued) — FS Points conversion & redemption
- Add `pendingCaloriesForFsPoints` Int field to `User` (and `TempUser` optionally) to accumulate calories for point conversion. Default: 0.
- Implement the `rewardCalories` flow change:
   - When an admin imports calories, the server performs a transaction that:
      1. Increments `User.totalCaloriesBurned` by `calories`.
      2. Increments `User.pendingCaloriesForFsPoints` by `calories`.
      3. Computes `pointsEarned = Math.floor(pendingCaloriesForFsPoints / 500)`.
      4. If `pointsEarned > 0`, increments `User.totalPoints` by `pointsEarned`, and decrements `pendingCaloriesForFsPoints` by `pointsEarned * 500`.
   - Use a DB transaction for the above to ensure atomicity and idempotency.
   - The same applies for `TempUser` if tracking calories for temporary users; if `TempUser` later converts to `User`, ensure migration copies `pendingCaloriesForFsPoints` correctly.
- Add `POST /api/badges/:id/redeem` (auth-required) implementation for redemption flow:
   - Check `Badge.isLimitedEdition` and `Badge.fsPointsCost` and ensure `User.totalPoints >= fsPointsCost`.
   - Deduct `fsPointsCost` from `User.totalPoints` and create a `BadgeRedemption` record (if used) and `UserBadge` with `status: redeemed`, `pointsSpent: fsPointsCost`, `source: redeem`.
   - Ensure idempotency and uniqueness: check `@@unique([userId, badgeId])` and abort if already redeemed/awarded.
   - Make redemption part of a DB transaction to ensure points deduction and award are atomic.

---

Phase C — Awarding integration
- Wire rule evaluator into the import flow and ticket verification flow so badges are awarded at the time of import/verification.
- Ensure awarding respects `isLimitedEdition`, `isSeasonal` windows, and `activityId` windows. Prioritize seasonal badge awarding over non-seasonal badge with the same criteria.
- For `activity_participation_count`, run evaluation on ticket verification (not as a cron job); results are idempotent.

## Acceptance Criteria (AC)
- [x] Schema: `Badge.imageUrl` is NOT NULL; `nameZh`, `description`, `descriptionZh`, `place` int, `isLimitedEdition`, `fsPointsCost` fields exist.
- [x] Schema: `badgeType`, `criteriaValue`, and `rarity` fields are removed cleanly from `Badge`.
- [x] Schema: `BadgeRule` model exists with `ruleType`, `targetValue`, `params`(JSON) and a unique constraint to ensure one rule per badge.
- [x] Schema: `UserBadge` has `status`, `source`, `pointsSpent`, `earnedAt` and `@@unique([userId, badgeId])` persists.
- [ ] Admin API: Admin can create a badge with the new fields and a `BadgeRule` payload and receive the saved badge back with rule data.
- [ ] Activity Import: When an admin imports activity attendance or donation rows, the import process will evaluate badge rules and award eligible badges immediately to matching users.
- [ ] Ticket verification: When a ticket is verified and the associated invite conditions satisfy any invite badge, the inviter is awarded the related badge.
- [ ] Redemption: A user may redeem a limited-edition badge once via `POST /api/badges/{badgeId}/redeem` if they have enough FS Points; the system deducts points and awards the badge.
- [ ] Seasonal badge priority: If a seasonal badge and a non-seasonal badge apply to the same rule in the same window, the seasonal badge is awarded, and the non-seasonal badge is NOT awarded for that instance.
- [x] `Badge.place`: Admin can set `place` to order badges for UI placement; duplicates allowed and not unique.
- [ ] Localization: `name`/`nameZh` and `description`/`descriptionZh` are used in the frontend to display titles/descriptions according to locale.
- [ ] No retries/cron jobs needed for awarding; awarding occurs during import/event flows or on direct trigger flows (ticket verification, redemption, share), and all awarding is idempotent.
- [x] `User` model has a `pendingCaloriesForFsPoints` Int field (default 0) for storing calories usable for FS point conversion.
- [x] rewardCalories endpoint: increments `totalCaloriesBurned` and `pendingCaloriesForFsPoints`, converts calories to FS points using `500 calories = 1 FS point`, and increments `totalPoints` with atomic transaction.
- [ ] Redemption: Redemption endpoint deducts `fsPointsCost` atomically, creates `BadgeRedemption` and `UserBadge`, and logs redemption activity for audit.
- [ ] Tests: Unit/integration tests for FS point conversion (`rewardCalories`) and redemption flows exist and pass.
- [x] `TempUser` model also supports `pendingCaloriesForFsPoints` (optional) and migration/mapping onto `User` on account conversion.
- [x] `BadgeRedemption` model is present (optional) and used to record redemptions with `pointsPaid` and `redeemedAt`.

---

## Developer Notes & Conventions
- Keep `imageUrl` as a path to a Supabase bucket; FE will compose the final URL for display.
- All badges are visible on the All Badges screen; locked badges are grayed out and still visible if not earned.
- `UserBadge.status` includes `earned` (default), `pending` (if partial verification or in processing), `revoked` (rare; admin action to revoke), `redeemed` (for bought badges).
- `BadgeRule` `params` JSON can be used for details like `days`, `activityId` (if needed — although we also have `Badge.activityId` for direct mapping), or `requiresAdminVerification` flags.
- For the FS points buffer `pendingCaloriesForFsPoints`: all increments, decrements, conversions, and the award must occur in DB transactions; the field will be used by the reward import flow.
- For `invite_count`: a user must have `target value` invites who signed up and were present (per the existing invite + ticket verification flows) for the inviter to be awarded.

---
