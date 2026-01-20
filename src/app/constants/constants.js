const ACTIVITY_STATUSES = ["active", "draft", "cancelled", "closed"];
export default ACTIVITY_STATUSES;
export const ACTIVITY_TYPES = [
  "running",
  "hiking",
  "water sport",
  "volunteering",
  "racket sport",
  "yoga",
  "dance",
  "fitness",
  "cycling",
  "mindfulness",
  "team sport",
  "virtual",
  "multi sports",
];

// Added formatted activity types (capitalized and underscored)
export const ACTIVITY_TYPES_FORMATTED = [
  "Running",
  "Hiking",
  "Water_Sport",
  "Volunteering",
  "Racket_Sport",
  "Yoga",
  "Dance",
  "Fitness",
  "Cycling",
  "Mindfulness",
  "Team_Sport",
  "Virtual",
  "Multi_Sports",
];

export const MONTHS = [
  { value: "01", label: "January" },
  { value: "02", label: "February" },
  { value: "03", label: "March" },
  { value: "04", label: "April" },
  { value: "05", label: "May" },
  { value: "06", label: "June" },
  { value: "07", label: "July" },
  { value: "08", label: "August" },
  { value: "09", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

export const MAX_IMAGE_SIZE_MB = 10;

export const MAX_SOCIAL_MEDIA_IMAGES = 5;

export const ALLOWED_RULE_TYPES = new Set([
  'calorie_single_activity',
  'calorie_cumulative',
  'activity_participation_count',
  'activity_specific_participation',
  'invite_count',
  'social_share',
  'points_cumulative',
  'redeem_first',
  'redeem_points_cumulative',
  'redeem_purchase',
]);

export const ACTIVITY_RULE_TYPES = [
  'calorie_single_activity',
  'calorie_cumulative',
  'activity_participation_count',
  'activity_specific_participation',
];

export const POINT_RULE_TYPES = ['points_cumulative'];

export const REDEMPTION_RULE_TYPES = ['redeem_first', 'redeem_points_cumulative', 'redeem_purchase'];

export const CALORIES_PER_POINT = 1;
