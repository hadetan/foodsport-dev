// Returns { status: 'upcoming' | 'ongoing' | 'finished', daysLeft: number }
export default function getActivityStatus(activity) {
  const now = new Date();
  const start = new Date(activity.startDate);
  if (activity.startTime) {
    const t = new Date(activity.startTime);
    if (!isNaN(t)) {
      start.setHours(t.getHours(), t.getMinutes(), t.getSeconds() || 0, 0);
    }
  }
  const end = new Date(activity.endDate);
  if (activity.endTime) {
    const t = new Date(activity.endTime);
    if (!isNaN(t)) {
      end.setHours(t.getHours(), t.getMinutes(), t.getSeconds() || 0, 0);
    }
  }

  if (now < start) {
    const nowUTC = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
    const startUTC = Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate());
    const msPerDay = 1000 * 60 * 60 * 24;
    const daysLeft = Math.floor((startUTC - nowUTC) / msPerDay);
    return { status: 'upcoming', daysLeft };
  } else if (now >= start && now <= end) {
    // Ongoing
    return { status: 'ongoing', daysLeft: 0 };
  } else {
    // Finished
    return { status: 'completed', daysLeft: 0 };
  }
}
