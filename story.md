# Story: Revamp Badge Schema & Awarding Flow

## Overview
We are implementing a flexible and admin-driven badge system that supports seasonal, activity-specific, milestone, invite, social, and limited-edition badges. The new schema will provide a clear, extensible model for creating and awarding badges while supporting the admin flows for importing & awarding. This work is backend-first (schema + API + rule evaluator). UI changes and admin pages will follow in a later phase.

---

## Key Decisions / Constraints
- Keep `Badge.name` as the main title field; add `nameZh` for Chinese translations.
- Use `description` and `descriptionZh` for textual descriptions.
- `Badge.imageUrl` is required and stores a Supabase bucket path value.
- Single rule per badge initially; the system will enforce one `BadgeRule` per `Badge` (unique constraint) to keep initial complexity low.
- `activityId` will be a nullable FK on `Badge` if the badge targets a specific activity. Activity-specific badges are only awardable during/after the admin-import process for that activity; they remain visible after the activity is over (locked if not earned) but are not awardable after the event import has been processed for a user.
- There will be `isLimitedEdition` and `fsPointsCost` fields for buyable badges, with the redemption API exposed to users (requires auth). One redemption per user.
- No cron jobs are used; awarding is checked during import/event processing or other relevant flows (e.g., ticket verification).
- Admin-only badge creation.

---

## Models (summary)
- Badge (update):
  - id, name, nameZh, description, descriptionZh, imageUrl (non-null), isSeasonal, seasonalStartDate, seasonalEndDate, activityId (FK), isLimitedEdition, fsPointsCost, place (int), isActive, createdAt
  - Remove fields: `badgeType`, `criteriaValue`, `rarity`.
- BadgeRule (new):
  - id, badgeId (FK), ruleType (enum), targetValue (int?), params (Json?), isActive, createdAt
  - Enforce one rule per badge with a unique index on `badgeId`.
  - `ruleType` values include: `calorie_single_activity`, `calorie_cumulative`, `activity_participation_count`, `activity_specific_participation`, `consecutive_days_calories`, `invite_count`, `social_share`.
- UserBadge (update):
  - id, userId, badgeId, status (earned/pending/revoked/redeemed), earnedAt, source (string, e.g. `activity_import:activityId`, `invite:userId`, `redeem`), pointsSpent, createdAt
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
   - For `activity_participation_count` specifically, awarding is done via the ticket verification flow. When an admin verifies a ticket and marks the user as present for an activity, the verification handler must:
     1. Ensure `wasPresent` or equivalent is set true for `UserActivity` for that activity and user.
     2. Query the number of unique activities the user has been marked present for (e.g., `SELECT COUNT(DISTINCT activity_id) FROM user_activities WHERE user_id = ? AND was_present = true`).
     3. If the count >= `BadgeRule.targetValue` for any active `activity_participation_count` badge that applies to the user (and seasonal constraints if applicable), award the badge to the user by creating a `UserBadge` with `source: ticket_verification:<ticketId>` and `earnedAt` set to now.
     4. Awarding must be idempotent (if `UserBadge` already exists do nothing), and must not award seasonal and non-seasonal duplicates for the same condition simultaneously — prefer seasonal badges.
     5. If a `Badge` is tied to `activityId` specifically, ensure we only count that badge in terms of the activity being part of the user's participation (most `activity_participation_count` badges are global counts; `activity_specific_participation` is used for activity-specific badges).
   - This flow avoids cron jobs and awards immediately on the admin verification path.

3. Invite badges
   - Ticket verification flow will trigger invite logic: when a user verifies a ticket, confirm the inviter and mark that the inviter has a valid referred & present user. If the inviter meets the invite target, award the `invite_count` badge.

4. Social/share badges
   - Award when user triggers a share action that the backend verifies (if needed), using `social_share` rule.

5. Seasonal badges
   - If a badge is seasonal (`isSeasonal` true and `seasonalStartDate`/`seasonalEndDate` defines the window), the award evaluator must only award the seasonal badge within its seasonal window.
   - If the seasonal and non-seasonal badges target the same rule (e.g., both represent 500 calories) and the user's event qualifies during season window, the system must prioritize awarding the seasonal badge only, not the non-seasonal one.

6. Limited edition redeemable badges
   - Provide a `POST /api/badges/{badgeId}/redeem` endpoint (auth required).
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
- Create and run migration in development; `prisma generate`.
- Note: We will not attempt to update seeds; the system hasn’t been used, so no data migration is expected to be necessary.

Phase B — Backend APIs
- Update admin badge create/update endpoints to accept new fields and the `rule` payload.
- Add `POST /api/badges/:id/redeem` (auth-required) for redemption of limited edition badges.
- Add rule evaluation helper services to evaluate a badge's rule for a given user & context.

Phase C — Awarding integration
- Wire rule evaluator into the import flow and ticket verification flow so badges are awarded at the time of import/verification.
- Ensure awarding respects `isLimitedEdition`, `isSeasonal` windows, and `activityId` windows. Prioritize seasonal badge awarding over non-seasonal badge with the same criteria.

Phase D — Tests & QA
- Unit tests for rule evaluator across rule types: calorie_single_activity, calorie_cumulative, activity_specific, invite_count.
- Integration tests for import awarding and redemption flows.

Phase E — Frontend (later)
- Update admin UI for badge creation & rule entry.
- Update All Badges screen to show `place`, `isLimitedEdition`, and redemption button for buyable badges.

---

## Acceptance Criteria (AC)
- [ ] Schema: `Badge.imageUrl` is NOT NULL; `nameZh`, `description`, `descriptionZh`, `place` int, `isLimitedEdition`, `fsPointsCost` fields exist.
- [ ] Schema: `badgeType`, `criteriaValue`, and `rarity` fields are removed cleanly from `Badge`.
- [ ] Schema: `BadgeRule` model exists with `ruleType`, `targetValue`, `params`(JSON) and a unique constraint to ensure one rule per badge.
- [ ] Schema: `UserBadge` has `status`, `source`, `pointsSpent`, `earnedAt` and `@@unique([userId, badgeId])` persists.
- [ ] Admin API: Admin can create a badge with the new fields and a `BadgeRule` payload and receive the saved badge back with rule data.
- [ ] Activity Import: When an admin imports activity attendance or donation rows, the import process will evaluate badge rules and award eligible badges immediately to matching users.
 - [ ] Activity Import: When an admin imports activity attendance or donation rows, the import process will evaluate badge rules and award eligible badges immediately to matching users.
 - [ ] Ticket Verification: When an admin verifies a ticket and marks a user as present, the `activity_participation_count` rule will be evaluated for the inviter and the attendee where applicable, and badges will be awarded immediately if conditions are met.
- [ ] Ticket verification: When a ticket is verified and the associated invite conditions satisfy any invite badge, the inviter is awarded the related badge.
- [ ] Redemption: A user may redeem a limited-edition badge once via `POST /api/badges/{badgeId}/redeem` if they have enough FS Points; the system deducts points and awards the badge.
- [ ] Seasonal badge priority: If a seasonal badge and a non-seasonal badge apply to the same rule in the same window, the seasonal badge is awarded, and the non-seasonal badge is NOT awarded for that instance.
- [ ] `Badge.place`: Admin can set `place` to order badges for UI placement; duplicates allowed and not unique.
- [ ] Localization: `name`/`nameZh` and `description`/`descriptionZh` are used in the frontend to display titles/descriptions according to locale.
- [ ] No retries/cron jobs needed for awarding; awarding occurs during import/event flows or on direct trigger flows (ticket verification, redemption, share), and all awarding is idempotent.

---

## Developer Notes & Conventions
- Keep `imageUrl` as a path to a Supabase bucket; FE will compose the final URL for display.
- All badges are visible on the All Badges screen; locked badges are grayed out and still visible if not earned.
- `UserBadge.status` includes `earned` (default), `pending` (if partial verification or in processing), `revoked` (rare; admin action to revoke), `redeemed` (for bought badges).
- `BadgeRule` `params` JSON can be used for details like `days`, `activityId` (if needed — although we also have `Badge.activityId` for direct mapping), or `requiresAdminVerification` flags.
- For `invite_count`: a user must have `target value` invites who signed up and were present (per the existing invite + ticket verification flows) for the inviter to be awarded.

---

## Open Questions & Followups
- We have no open questions at this time based on your final clarifications. If any detail changes (e.g., multiple rules per badge), we will adjust the model accordingly and update migration plan.
- We will follow the import flow as the source of truth for awarding milestones and cumulative sums, not cron jobs.

---

## Next Steps (short-term)
1. Proceed with schema updates in `prisma/schema.prisma` using the finalized models and run `npx prisma migrate dev` to apply the changes.
2. Update server-side admin badge creation APIs to accept `BadgeRule` payload.
3. Implement a rule evaluator and wire it into the admin import & ticket verification flows.
4. Implement `/api/badges/:id/redeem` for consumers with auth.
5. Add unit/integration tests and update API docs (if needed).

---

If you confirm this plan I’ll begin Phase A (schema updates and migration) and then proceed to Phase B.

If you'd like any changes, or to add more ACs, say the word and I’ll adjust the story.md before I run the migration.