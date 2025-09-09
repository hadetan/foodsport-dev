export default function (activity) {
	const now = new Date();
	const start = new Date(activity.startDate);
	const diff = Math.ceil((start - now) / (1000 * 60 * 60 * 24));

	return { daysLeft: diff > 0 ? diff : 0 };
}
