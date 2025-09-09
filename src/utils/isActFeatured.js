// Returns true if the activity is marked as featured
export default function isActFeatured(activity) {
  return Boolean(activity && activity.isFeatured === true);
}
