# Badge Rule Joints — reference & notation

Purpose
- Document which BadgeRuleType values can be combined ("joint") in a single badge definition.
- Provide a readable matrix, examples and a recommended schema notation for multi-rule badges.

Quick reference — Rule types (from prisma/schema.prisma)
- calorie_single_activity
  - User has to burn x calories in a single activity
- calorie_cumulative
  - User has burn x calories in total
- activity_participation_count
  - User's total activity participation
- activity_specific_participation
  - User has to join x activity specifically
- consecutive_days_calories
  - Burn x amount of calories per day (target value specifies for how many days needed to burn continuously)
    - Example rules: Presence streak: targetValue = 7, params: none. Calorie streak: targetValue = 5, params: { minDailyCalories: 200, type: 'burn' }.
- invite_count
  - User has to invite x count of users through invite feature where the invited user has to verify their tickets in order to be count as invited.
- social_share
  - Share x activity or any activity for (target specified) amount of times
- frequency_count
  - Period alignment: weeks are anchored to start-of-week and months to start-of-month — includes the current period (not rolling 7-day window).
    - Example rules: Attend at least 1 activity each week for the last 2 weeks:
      ```json
      {
        ruleType: 'frequency_count',
        targetValue: 1,
        params: { timeframe: 'weekly', weeks: 2, timesPerWeek: 1, eventType: 'presence' }
      }
      ```
      Log 2 calorie sessions (≥ 300 kcal/day) every month for 3 months:
      ```json
      {
        ruleType: 'frequency_count',
        targetValue: 3,
        params: { timeframe: 'monthly', months: 3, timesPerMonth: 2, eventType: 'calorie_burn', minCaloriesPerEvent: 300 }
      }
      ```
- points_cumulative
  - Total earning of users fs points. E.g. user needs to earn total of 20 fs points.
- redeem_first
  - Redeem anything for first time and receive this type of badge with this rule type
- redeem_points_cumulative
  - Total sum of users fs points spending e.g. user needs to spend 20 fs points to gain this.
- redeem_purchase
  - Specifies that this badge is redeemable and so users will spend their fs points to buy this.
    - Example:
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

More of the examples for the api usage is added in the './docs/admin-badges-api.md' and some of the test cases added in the .md './tests.md'.

Matrix (example — mark ✓ where common / supported, mark - if referring to itself)
| Primary \ Jointed With → | calorie_single_activity | calorie_cumulative | activity_participation_count | activity_specific_participation | consecutive_days_calories | invite_count | social_share | frequency_count | points_cumulative | redeem_first | redeem_points_cumulative | redeem_purchase |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| calorie_single_activity         | - | x | x | ✓ | x | ✓ | ✓ | x | x | x | x | x |
| calorie_cumulative              | x | - | ✓ | x | x | ✓ | ✓ | ✓ | ✓ | x | x | x |
| activity_participation_count    | x | ✓ | - | x | x | ✓ | ✓ | x | x | x | x | x |
| activity_specific_participation | ✓ | x | x | - | x | ✓ | ✓ | x | x | x | x | x |
| consecutive_days_calories       | x | x | x | x | - | x | x | x | x | x | x | x |
| invite_count                    | ✓ | ✓ | ✓ | ✓ | x | - | ✓ | x | x | x | x | x |
| social_share                    | ✓ | ✓ | ✓ | ✓ | x | ✓ | - | x | x | x | x | x |
| frequency_count                 | x | ✓ | x | x | x | x | x | - | x | x | x | x |
| points_cumulative               | x | ✓ | x | x | x | x | x | x | - | x | x | x |
| redeem_first                    | x | x | x | x | x | x | x | x | x | - | x | x |
| redeem_points_cumulative        | x | x | x | x | x | x | x | x | x | x | - | x |
| redeem_purchase                 | x | x | x | x | x | x | x | x | x | x | x | - |
