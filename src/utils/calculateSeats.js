export default function (activity) {
	const taken = activity.participantCount;
	let seatsLeft = activity.participantLimit - taken;
	if (seatsLeft < 0) seatsLeft = 0;

    return { seatsLeft };
}
