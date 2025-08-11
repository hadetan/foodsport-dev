/**
 * Sort activities based on the given criteria.
 *
 * @param {Object[]} activities - Array of activity objects.
 * @param {boolean} [sortAll=false] - Whether to include all statuses in sorting.
 * @returns {Object[]} - Sorted array of activities.
 */
export default function sortActivities(activities, sortAll = false) {
    const statusOrder = sortAll
        ? ["active", "upcoming", "completed", "cancelled", "closed"] 
        : ["active", "upcoming", "completed"];

    return (activities)
        .filter(activity => sortAll || statusOrder.includes(activity.status))
        .sort((a, b) => {
            if (a.isFeatured && b.isFeatured) {
                const statusComparison = statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status);
                if (statusComparison !== 0) return statusComparison;
            } else if (a.isFeatured) {
                return -1;
            } else if (b.isFeatured) {
                return 1;
            }

            const statusComparison = (statusOrder.includes(a.status) ? statusOrder.indexOf(a.status) : statusOrder.length) - (statusOrder.includes(b.status) ? statusOrder.indexOf(b.status) : statusOrder.length);
            if (statusComparison !== 0) return statusComparison;

            const dateA = new Date(a.startDate).getTime() || Infinity;
            const dateB = new Date(b.startDate).getTime() || Infinity;
            return dateA - dateB;
        });
}
