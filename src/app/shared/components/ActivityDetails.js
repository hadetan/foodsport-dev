import '@/app/shared/css/ActivityDetails.css';
import Image from 'next/image';
export default function ActivityDetails({ activity, setShowActivity }) {
  if (!activity) return <div>No activity found.</div>;

  const {
	title,
	description,
	activityType,
	location,
	startDate,
	endDate,
	startTime,
	endTime,
	status,
	participantLimit,
	participantCount,
	organizerName,
	imageUrl,
	pointsPerParticipant,
	caloriesPerHour,
	isFeatured,
  } = activity;

  const formattedStartDate = startDate ? new Date(startDate).toLocaleDateString() : '';
  const formattedEndDate = endDate ? new Date(endDate).toLocaleDateString() : '';
  const formattedStartTime = startTime ? new Date(startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
  const formattedEndTime = endTime ? new Date(endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

  let dateDisplay = formattedStartDate;
  if (formattedEndDate && formattedEndDate !== formattedStartDate) {
	dateDisplay = `${formattedStartDate} - ${formattedEndDate}`;
  }
  let timeDisplay = formattedStartTime;
  if (formattedEndTime && formattedEndTime !== formattedStartTime) {
	timeDisplay = `${formattedStartTime} - ${formattedEndTime}`;
  }

  return (
	<div className="activityDetailsPage">
	  <div className="activityDetailsHero">
		<button className="activityDetailsBackBtn" onClick={() => setShowActivity(false)}>
		  &#8592; Back
		</button>
		{imageUrl ? (
		  <Image
			src={imageUrl}
			alt={activityType}
			fill
			className="activityDetailsImage"
			priority
		  />
		) : (
		  <div className="activityDetailsOverlayText">{activityType}</div>
		)}
		<div className="activityDetailsOverlayText">{activityType}</div>
		{isFeatured && (
		  <div className="activityDetailsFeatured">★ Featured</div>
		)}
	  </div>
	  <div className="activityDetailsContent activityDetailsFlexContent">
        <main className="activityDetailsMain">
		  <h1 className="activityDetailsTitle">{title}</h1>
		  <div className="activityDetailsSubtitle">{description}</div>
		</main>
		<aside className="activityDetailsSidebar">
		  <div className="activityDetailsStatRow">
			<span className="activityDetailsIcon">&#128197;</span>
			<span>{dateDisplay}</span>
		  </div>
		  <div className="activityDetailsStatRow">
			<span className="activityDetailsIcon">&#128337;</span>
			<span>{timeDisplay}</span>
		  </div>
		  <div className="activityDetailsStatRow">
			<span className="activityDetailsIcon">&#128205;</span>
			<span>{location}</span>
		  </div>
		  <div className="activityDetailsStatRow">
			<span className="activityDetailsIcon">&#8505;</span>
			<span className={`activityDetailsStatusBadge status-${status}`}>{status}</span>
		  </div>
		  <div className="activityDetailsStatRow">
			<span className="activityDetailsIcon">&#128101;</span>
			<span>{participantCount} / {participantLimit}</span>
		  </div>
		  <div className="activityDetailsStatRow">
			<span className="activityDetailsIcon">&#127941;</span>
			<span className="activityDetailsPointsBadge">{pointsPerParticipant} pts</span>
		  </div>
		  <div className="activityDetailsStatRow">
			<span className="activityDetailsIcon">&#128293;</span>
			<span>{caloriesPerHour} cal/hr</span>
		  </div>
		  {organizerName && (
			<div className="activityDetailsStatRow">
			  <span className="activityDetailsIcon">👤</span>
			  <span>{organizerName}</span>
			</div>
		  )}
		</aside>
	  </div>
	</div>
  );
}
