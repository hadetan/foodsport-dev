// Returns a new array with featured activities first, then the rest sorted by soonest start date/time
export default function sortFeaturedAndSoonest(activities) {
  if (!Array.isArray(activities)) return [];
  const isActFeatured = a => Boolean(a && a.isFeatured === true);
  const filtered = activities.slice();
  const featured = filtered.filter(isActFeatured);
  const nonFeatured = filtered.filter(a => !isActFeatured(a));
  nonFeatured.sort((a, b) => {
    const aStart = new Date(a.startDate);
    const bStart = new Date(b.startDate);
    const time_a = new Date(a.startTime);
    if (!isNaN(time_a)) aStart.setHours(time_a.getHours(), time_a.getMinutes(), time_a.getSeconds() || 0, 0);
    const time_b = new Date(b.startTime);
    if (!isNaN(time_b)) bStart.setHours(time_b.getHours(), time_b.getMinutes(), time_b.getSeconds() || 0, 0);
    return aStart - bStart;
  });
  return [...featured, ...nonFeatured];
}
