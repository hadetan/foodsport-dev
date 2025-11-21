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

- x `points_cumulative`:

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

- x `frequency_count`:

    ```json
        {
            "name": "Weekly Warrior",
            "description": "Attend at least 3 qualifying activities every week for the last 4 weeks.",
            "imageUrl": "https://example.com/badges/weekly-warrior.png",
            "rules": [
                {
                    "ruleType": "frequency_count",
                    "targetValue": 3,
                    "params": {
                        "timeframe": "weekly",
                        "weeks": 4,
                        "timesPerWeek": 3,
                        "eventType": "presence"
                    }
                }
            ]
        }
    ```

    **Guide**
    1. *Admin flow*: Post the badge via the admin badge endpoint so that it includes the `frequency_count` rule. The `params` determine the rolling window: 4 weekly periods, with 3 presence entries required each.
    2. *User flow*: Attend activities (marked `wasPresent: true` on `userActivity`) that fall inside the weekly periods. The evaluator calculates counts across the required weeks using `evaluateFrequencyRule`, whose helper functions (`formatPeriodKey`, `buildPeriodSequence`, etc.) ensure the right weeks are assessed. When every week’s count meets or exceeds 3, the badge is issued.
    3. *Test steps*: Create 12 activity participations spread over the last four weeks (3 per week). After logging them, call whichever background job or API triggers `awardBadgesForRules` (typically automation or an admin-run evaluation). The badge should show up in `/api/my/badges` with `UserBadgeStatus.earned` once each week satisfied the rule.

- x `redeem_points_cumulative`:

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
