- ✓ `calorie_single_activity` & `activity_specific_participation` mixture:

    ```json
        {
            "name": "Burn 500 calories and join x activity",
            "description": "Join x activity and burn 500 calories in it, to claim this",
            "activityId": "9d5e14e1-844b-452a-a482-a37d9b475667",
            "imageUrl": "https://raw.githubusercontent.com/drknzz/GitHub-Achievements/main/Media/Badges/Mars-2020-Contributor/PNG/Mars2020ContributorBadge.png",
            "rules": [
                    { "ruleType": "calorie_single_activity", "targetValue": 500 },
                    { "ruleType": "activity_specific_participation" }
                ]
        }
    ```

- ✓ `invite_count`:

    ```json
    {
        "name": "Invite a friend",
        "description": "Invite a friend and claim this amazing E-badge",
        "activityId": "9d5e14e1-844b-452a-a482-a37d9b475667",
        "imageUrl": "https://raw.githubusercontent.com/drknzz/GitHub-Achievements/main/Media/Badges/Heart-on-your-sleeve/PNG/HeartOnYourSleeve.png",
        "rules": [
                { "ruleType": "invite_count", "targetValue": 1 }
            ]
    }
    ```

- ✓ `invite_count` & `activity_specific_participation` mixture:

    ```json
    {
        "name": "Invite a friend",
        "description": "Invite a friend and claim this amazing E-badge",
        "activityId": "9d5e14e1-844b-452a-a482-a37d9b475667",
        "imageUrl": "https://raw.githubusercontent.com/drknzz/GitHub-Achievements/main/Media/Badges/Heart-on-your-sleeve/PNG/HeartOnYourSleeve.png",
        "rules": [
                { "ruleType": "invite_count", "targetValue": 5 },
                { "ruleType": "activity_specific_participation" }
            ]
    }
    ```

- ✓ `calorie_cumulative`:

    ```json
    {
        "name": "1k Cumul",
        "imageUrl": "https://raw.githubusercontent.com/drknzz/GitHub-Achievements/main/Media/Badges/Heart-on-your-sleeve/PNG/HeartOnYourSleeve.png",
        "rules": [
            { "ruleType": "calorie_cumulative", "targetValue": 1000 }
        ]
    }
    ```

- ✓ `activity_participation_count`:

    ```json
        {
            "name": "Attend 2 Activities",
            "imageUrl": "https://raw.githubusercontent.com/drknzz/GitHub-Achievements/main/Media/Badges/Heart-on-your-sleeve/PNG/HeartOnYourSleeve.png",
            "rules": [
                { "ruleType": "activity_participation_count", "targetValue": 2 }
            ]
        }
    ```

- ✓ `redeem_purchase`:

    ```json
        {
            "name": "Buy this badge with 2 fs points",
            "imageUrl": "badges/limited.png",
            "isLimitedEdition": true,
            "fsPointsCost": 2,
            "rules": [
                { "ruleType": "redeem_purchase" }
            ]
        }
    ```

- ✓ `redeem_first`:

    ```json
        {
            "name": "Buy your first item using fs points",
            "imageUrl": "badges/limited.png",
            "rules": [
                { "ruleType": "redeem_first" }
            ]
        }
    ```

- ✓ `redeem_purchase` & `redeem_first`:

    ```json
        {
            "name": "Buy this badge with 2 fs points",
            "imageUrl": "badges/limited.png",
            "isLimitedEdition": true,
            "fsPointsCost": 2,
            "rules": [
                { "ruleType": "redeem_purchase" },
                { "ruleType": "redeem_first" }
            ]
        }
    ```

- ✓ `points_cumulative`:

    ```json
        {
            "name": "5k FS Points",
            "description": "Earn 5,000 cumulative FS points to unlock this tiered badge.",
            "imageUrl": "https://example.com/badges/points-5k.png",
            "rules": [
                {
                    "ruleType": "points_cumulative",
                    "targetValue": 5000
                }
            ]
        }
    ```

    **Guide**
    1. *Admin flow*: Create the badge via `POST /api/admin/badges` (or whichever admin route backs badge creation) with the above payload. The badge is recorded as active with the `points_cumulative` rule; `ruleEvaluator.awardPointsBadges` reads `totalPoints` whenever it runs (typically triggered after a points change or via a scheduled job), so the badge becomes eligible once the user's `totalPoints` hits 5,000.
    2. *User flow*: Accumulate points through existing activities, donations, or admin adjustments that increment `user.totalPoints`. The badge waitlist is evaluated when `awardPointsBadges` runs; once `totalPoints >= 5000`, the rule evaluator calls `ensureUserBadge` and awards the badge automatically.
    3. *Test steps*: After creating the badge, grant yourself points (e.g., via fixtures, admin reward APIs, or direct DB edit) until your `totalPoints` reaches 5,000. Trigger the rule evaluator by redeeming or logging activity if needed (or call any helper that invokes `awardPointsBadges`) and confirm the badge appears under your earned badges in `/api/my/badges`.

- ✓ `frequency_count`:

    ```json
    {
        "name": "Weekly Warrior",
        "description": "Attend at least 1 qualifying activities every week for the last 2 weeks.",
        "imageUrl": "https://raw.githubusercontent.com/drknzz/GitHub-Achievements/main/Media/Badges/Quick-Draw/PNG/Skin-Tones/QuickDraw_SkinTone1.png",
        "rules": [
            {
                "ruleType": "frequency_count",
                "targetValue": 1,
                "params": {
                    "timeframe": "weekly",
                    "weeks": 2,
                    "timesPerWeek": 1,
                    "eventType": "presence"
                }
            }
        ]
    }
    ```

    ```json
    {
        "name": "Weekly Warrior",
        "description": "Attend at least 3 qualifying activities every week for the last 4 weeks.",
        "imageUrl": "https://example.com/badges/monthly-warrior.png",
        "ruleType": "frequency_count",
        "params": { "timeframe": "monthly", "months": 6, "timesPerMonth": 2, "eventType": "presence" }
    }
    ```

    **Guide**
        1. *Admin flow*: Post the badge via the admin badge endpoint so that it includes the `frequency_count` rule. The `params` determine the rolling window: 4 weekly periods, with 3 presence entries required each.
        2. *User flow*: Activities should be recorded in `userActivity` with `wasPresent: true` and a `joinedAt` timestamp that falls inside the weeks being evaluated. The evaluator calculates counts across the required weeks using `evaluateFrequencyRule`.
        3. *Fast QA (recommended)*: You don't need to wait days. Use the Supabase Table Editor to insert rows into `userActivity` with past `joinedAt` timestamps that simulate the last 4 weeks. Then run a local evaluator script to trigger the badge logic immediately.

        Quick step-by-step (fastest):

        - Identify the user's `id` you want to test with (copy it from the `user` table in Supabase).
        - Use Supabase UI → Table Editor → `userActivity` → Insert Row 12 times with the following values (replace `<USER_ID>` and optionally `<ACTIVITY_ID>`):

            - `userId`: `<USER_ID>`
            - `tempUserId`: `null`
            - `activityId`: `<ACTIVITY_ID>` or `NULL`
            - `wasPresent`: `true`
            - `joinedAt`: set to timestamps that simulate 3 presence events in each of the 4 recent weeks. Example using relative days (choose days relative to today):
                - Week 1 (most recent week): now - 2 days, now - 3 days, now - 5 days
                - Week 2: now - 9 days, now - 10 days, now - 12 days
                - Week 3: now - 16 days, now - 17 days, now - 19 days
                - Week 4: now - 23 days, now - 24 days, now - 26 days

            You can set these in the Supabase UI date picker or use SQL (see the SQL template below).

        - After inserting rows, run the small evaluation script included in this repo to trigger the evaluator immediately:

            ```bash
            # ensure your environment points prisma to the same DB (set DATABASE_URL in .env.local)
            npx tsx scripts/evaluate-badges.js --userId <USER_ID> --activityId <ACTIVITY_ID>
            ```

        - The script prints awarded badge objects (if any). You can also verify by querying the `userBadge` table in Supabase (look for `userId = <USER_ID>` and `status = 'earned'`).

        Notes & verification
        - The script `scripts/evaluate-badges.js` uses the repository's Prisma client and the `awardBadgesForActivityProgress` evaluator. It reads `DATABASE_URL` from your environment, so ensure `.env.local` or your shell has `DATABASE_URL` set to your Supabase DB connection.
        - The script is intentionally minimal: it logs awarded badges for `activity`-type rules (includes `frequency_count`) and `points` rules. After running it, check the `userBadge` table for new earned badges.
        - If you need to test alternate event types (calorie-based frequency), create `calorieSubmission` or `calorieDonation` rows instead, and set `params.eventType` accordingly in the badge rule.

        Tips to avoid mistakes
        - Always use a QA/test user account or a non-production DB snapshot.
        - Use `gen_random_uuid()` only if the Postgres `pgcrypto` extension is enabled; otherwise, insert your own UUIDs (tools like `uuidgen` or the Supabase UI can auto-generate).
        - If a badge doesn't appear, re-check the `badgeRules` row for the badge to confirm `params` were stored correctly (look for `weeks` and `timesPerWeek`).

        Optional automation
        - If you want this to be a one-click QA job, I can add a small admin API route (server-only) that accepts `userId` and runs the evaluator for you. Want me to add that?

- ✓ `redeem_points_cumulative`:

    ```json
        {
            "name": "FS Shop Spender",
            "description": "Redeem at least 100 FS points worth of badges.",
            "imageUrl": "https://example.com/badges/fs-spender.png",
            "rules": [
                {
                    "ruleType": "redeem_points_cumulative",
                    "targetValue": 100
                }
            ]
        }
    ```

    **Guide**
    1. *Admin flow*: Publish the badge with this rule so the redemption evaluator can detect when a user’s historical `badgeRedemption` sum hits 100. The evaluator uses `resolveRedeemedPointsTotal` to sum `pointsPaid` from `badgeRedemption.aggregate`.
    2. *User flow*: Redeem limited-edition badges (like `redeem_purchase`) that deduct FS points. Each redemption adds a row to `badgeRedemption` with `pointsPaid`. Once the sum of `pointsPaid` across all records reaches 100, `awardRedemptionBadges` (invoked by `processPostTransactionJobs`) checks the rule and awards the badge.
    3. *Test steps*: Perform successive badge purchases until the aggregate `pointsPaid` equals or exceeds 100. The redemption transaction already queues `processPostTransactionJobs`, so after the final redemption you should see this badge in `/api/my/badges` without additional manual steps. Monitor server logs for `awardRedemptionBadges` to confirm it evaluated the rule.
