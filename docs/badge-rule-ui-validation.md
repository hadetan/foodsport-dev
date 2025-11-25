# Badge Rule UI Validation

## Overview
The badge creation and editing UI now enforces rule combination constraints based on the cross-connection matrix defined in `cross-connection.md`. When users select rules, incompatible rules are automatically disabled with clear feedback.

## Implementation Details

### Files Modified
1. **`src/app/admin/(logged_in)/badges/create/page.js`** - Badge creation page
2. **`src/app/admin/(logged_in)/badges/[id]/page.js`** - Badge edit page

Both files now include:
- **ALLOWED_RULE_COMBINATIONS** constant - Maps each rule type to its compatible partners
- **canSelectRule()** function - Validates if a rule can be selected based on currently selected rules

## User Experience

### When Adding Rules

#### Scenario 1: No Rules Selected Yet
- **All rules are available** and can be selected
- No restrictions apply

#### Scenario 2: User Selects `calorie_cumulative`
Compatible rules remain enabled:
- ✅ `activity_participation_count`
- ✅ `invite_count`
- ✅ `social_share`
- ✅ `frequency_count`
- ✅ `points_cumulative`

Incompatible rules are **disabled and grayed out** with explanation:
- ❌ `calorie_single_activity` - "Cannot combine with calorie cumulative"
- ❌ `activity_specific_participation` - "Cannot combine with calorie cumulative"
- ❌ `consecutive_days_calories` - "Cannot combine with calorie cumulative"
- ❌ All redeem rules - "Cannot combine with calorie cumulative"

#### Scenario 3: User Selects `consecutive_days_calories`
- **All other rules become disabled** immediately
- Shows reason: "Cannot combine with consecutive days calories"
- This is a standalone rule type

#### Scenario 4: Limited Edition Badge Enabled
- `redeem_purchase` is **auto-selected** and marked as "Auto-selected (Limited Edition enabled)"
- All other rules become disabled since redeem_purchase cannot be combined with anything
- Cannot be unchecked while Limited Edition is enabled

#### Scenario 5: Activity Linked
- `activity_specific_participation` is **auto-selected** and marked as "Auto-selected (Activity linked)"
- Compatible rules remain available:
  - ✅ `calorie_single_activity`
  - ✅ `invite_count`
  - ✅ `social_share`
- Incompatible rules are disabled

### Visual Feedback

#### Enabled Rule (Can Be Selected)
```
┌─────────────────────────────────────────┐
│ ☐ Calorie Cumulative                    │
│ User must burn a cumulative number of   │
│ calories across all activities          │
└─────────────────────────────────────────┘
- White/normal background
- Cursor: pointer
- Checkbox: enabled
```

#### Auto-Selected Rule
```
┌─────────────────────────────────────────┐
│ ☑ Redeem Purchase                       │
│ User must purchase/redeem this badge    │
│ with FS points                          │
│ ✓ Auto-selected (Limited Edition enabled)│
└─────────────────────────────────────────┘
- Light blue background (info)
- Cursor: not-allowed
- Checkbox: checked and disabled
```

#### Incompatible Rule (Disabled)
```
┌─────────────────────────────────────────┐
│ ☐ Calorie Single Activity               │
│ User must burn a specific number of     │
│ calories in a single activity           │
│ ✗ Cannot combine with "calorie cumulative"│
└─────────────────────────────────────────┘
- Grayed out background (opacity 60%)
- Cursor: not-allowed
- Red error text showing reason
- Checkbox: disabled
```

#### Selected Rule (User Checked)
```
┌─────────────────────────────────────────┐
│ ☑ Invite Count                          │
│ User must invite a certain number of    │
│ people                                  │
│ [Target Value: 5        ]               │
└─────────────────────────────────────────┘
- Light primary color background
- Primary color border
- Shows target value input if required
- Can be unchecked (not auto-selected)
```

## Validation Logic Flow

```javascript
// When a user clicks a rule checkbox
1. Get the rule type being clicked
2. Get all currently selected rules (excluding the clicked one)
3. Check canSelectRule(ruleType, currentRules)
   a. If no rules selected → Allow
   b. For each existing rule:
      - Check if new rule's ALLOWED_RULE_COMBINATIONS includes existing rule
      - Check if existing rule's ALLOWED_RULE_COMBINATIONS includes new rule
      - If either fails → Reject with reason
   c. All checks pass → Allow
4. If rejected:
   - Disable checkbox
   - Gray out the rule card
   - Show red error message with reason
5. If allowed:
   - Enable checkbox
   - Normal styling
   - Allow selection
```

## Code Example

### Rule Combination Matrix
```javascript
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
        'frequency_count',
        'points_cumulative',
    ]),
    // ... more rules
};
```

### Validation Function
```javascript
function canSelectRule(ruleType, currentRules) {
    if (currentRules.length === 0) {
        return { canSelect: true, reason: null };
    }

    const allowedCombinations = ALLOWED_RULE_COMBINATIONS[ruleType];
    
    for (const existingRule of currentRules) {
        const existingRuleType = existingRule.ruleType;
        
        if (!allowedCombinations || !allowedCombinations.has(existingRuleType)) {
            return {
                canSelect: false,
                reason: `Cannot combine with "${existingRuleType.replace(/_/g, ' ')}"`
            };
        }
        
        const existingAllowed = ALLOWED_RULE_COMBINATIONS[existingRuleType];
        if (!existingAllowed || !existingAllowed.has(ruleType)) {
            return {
                canSelect: false,
                reason: `Cannot combine with "${existingRuleType.replace(/_/g, ' ')}"`
            };
        }
    }
    
    return { canSelect: true, reason: null };
}
```

## Benefits

1. **Prevents Invalid Combinations** - Users cannot create badges with incompatible rules
2. **Clear Feedback** - Users understand why they can't select certain rules
3. **Guided Experience** - The UI adapts based on selections, guiding users to valid configurations
4. **Consistent with Backend** - Frontend validation matches backend validation in `ruleValidation.js`
5. **Improved UX** - No need to submit form and wait for server error

## Testing the Validation

### Test Case 1: Standalone Rules
1. Create a new badge
2. Click "Add Rules"
3. Select "Consecutive Days Calories"
4. ✓ All other rules should become disabled and grayed out

### Test Case 2: Compatible Multi-Rule
1. Create a new badge
2. Click "Add Rules"
3. Select "Calorie Cumulative"
4. ✓ activity_participation_count, invite_count, social_share should remain enabled
5. Select "Invite Count"
6. ✓ Both rules should show as selected
7. ✓ social_share should still be enabled

### Test Case 3: Auto-Selection
1. Create a new badge
2. Enable "Is Limited Edition" toggle
3. Click "Add Rules"
4. ✓ "Redeem Purchase" should be auto-selected and disabled
5. ✓ All other rules should be disabled

### Test Case 4: Activity Link
1. Create a new badge
2. Select an activity from the dropdown
3. Click "Add Rules"
4. ✓ "Activity Specific Participation" should be auto-selected
5. ✓ Only compatible rules (calorie_single_activity, invite_count, social_share) should be enabled

## Related Documentation
- `cross-connection.md` - Rule combination matrix specification
- `src/lib/badges/ruleValidation.js` - Backend validation logic
- `docs/admin-badges-api.md` - Badge API documentation
