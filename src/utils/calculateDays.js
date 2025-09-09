// Calculates days left until activity starts, using UTC start of day to avoid DST/local time issues.
// Returns daysLeft (can be negative if already started) and hasStarted boolean.
export default function (activity) {
	const now = new Date();
	const start = new Date(activity.startDate);

	// Use UTC start of day for both dates
	const nowUTC = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
	const startUTC = Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate());
	const msPerDay = 1000 * 60 * 60 * 24;
	const diff = Math.floor((startUTC - nowUTC) / msPerDay);

	return {
		daysLeft: diff,
		hasStarted: diff < 0
	};
}
