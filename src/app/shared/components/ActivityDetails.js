import '@/app/shared/css/ActivityDetails.css';
import Image from 'next/image';
import { useEffect, useRef } from 'react';

export default function ActivityDetails({ activity, setShowActivity }) {
	const topRef = useRef(null);
  useEffect(() => {
	if (topRef.current) {
	  topRef.current.scrollIntoView({ behavior: 'smooth' });
	}
  }, [activity]);
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
	participantAvatars  = [],
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
	<div className="activityDetailsPage" ref={topRef}>
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
	  </div>
	  <div className="activityDetailsContent">
		{/* Sidebar Card */}
		<aside className="activityDetailsSidebar">
		  <div className="activityDetailsSidebarTitle">{title}</div>
		  <div className="activityDetailsSidebarDesc">{description}</div>
		  <div className="activityDetailsSidebarRow"><span>📅</span><span>{dateDisplay}</span></div>
		  <div className="activityDetailsSidebarRow"><span>⏰</span><span>{timeDisplay}</span></div>
		  <div className="activityDetailsSidebarRow"><span>📍</span><span>{location}</span></div>
		  <div className="activityDetailsSidebarRow"><span>👤</span><span>{organizerName}</span></div>
		  <div className="activityDetailsSidebarRow"><span>👥</span><span>{participantCount} / {participantLimit}</span></div>
		  {/* Avatars */}
		  <div className="activityDetailsAvatars">
			{participantAvatars.slice(0, 7).map((avatar, idx) => (
			  <Image key={idx} src={avatar} alt="avatar" width={32} height={32} className="activityDetailsAvatar" />
			))}
			{participantCount > 7 && (
			  <span className="activityDetailsAvatarMore">+{participantCount - 7}</span>
			)}
		  </div>
		  <div className="activityDetailsSidebarActions">
			<button className="activityDetailsShareBtn">SHARE</button>
			<button className="activityDetailsJoinBtn">JOIN NOW</button>
		  </div>
		</aside>
		{/* Details Section */}
		<main className="activityDetailsMain">
		  <div className="activityDetailsMainDesc">{t}</div>
		</main>
	  </div>
	</div>
  );
}

const t = "What is Lorem Ipsum? Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum. Why do we use it? It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for 'lorem ipsum' will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like)."