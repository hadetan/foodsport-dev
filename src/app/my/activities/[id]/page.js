'use client';

import '@/app/shared/css/ActivityDetails.css';
import Image from 'next/image';
import { useEffect, useRef } from 'react';
import Avatar from '@/app/shared/components/avatar';
import { useActivities } from '@/app/shared/contexts/ActivitiesContext';
import { useParams } from 'next/navigation';
import ActivityIcon from '@/app/shared/components/ActivityIcon';
import { FaBurn, FaCalendar, FaClock, FaTrophy } from 'react-icons/fa';
import { HiMiniUserGroup } from 'react-icons/hi2';
import { IoLocationSharp, IoPersonSharp } from "react-icons/io5";

function getActivity(activities, id) {
	return activities.find((activity) => activity.id === id);
}

function formatDateTime(startDate, endDate, startTime, endTime) {
	const formattedStartDate = startDate
		? new Date(startDate).toLocaleDateString()
		: '';
	const formattedEndDate = endDate
		? new Date(endDate).toLocaleDateString()
		: '';
	const formattedStartTime = startTime
		? new Date(startTime).toLocaleTimeString([], {
				hour: '2-digit',
				minute: '2-digit',
		  })
		: '';
	const formattedEndTime = endTime
		? new Date(endTime).toLocaleTimeString([], {
				hour: '2-digit',
				minute: '2-digit',
		  })
		: '';

	return {
		formattedStartDate,
		formattedEndDate,
		formattedStartTime,
		formattedEndTime,
	};
}

export default function ActivityDetailsPage() {
	const { activities } = useActivities();
	const { id } = useParams();
	const activity = getActivity(activities, id);
    console.log(activity);

	const topRef = useRef(null);
	useEffect(() => {
		if (topRef.current) {
			topRef.current.scrollIntoView({ behavior: 'smooth' });
		}
	}, [activity]);
	if (!activity) return <div>No activity found.</div>;

	const {
		formattedStartDate,
		formattedEndDate,
		formattedStartTime,
		formattedEndTime,
	} = formatDateTime(
		activity.startDate,
		activity.endDate,
		activity.startTime,
		activity.endTime
	);

	return (
		<div className='activityDetailsPage' ref={topRef}>
			{/* Hero Image Section */}
			<div className='activityDetailsHero'>
				<button
					className='activityDetailsBackBtn'
					onClick={() => window.history.back()}
				>
					&#8592; Back
				</button>

				{activity.imageUrl && (
					<Image
						src={activity.imageUrl}
						alt={activity.activityType}
						fill={true}
						className='activityDetailsImage'
						priority
					/>
				)}
				{/* Featured Badge */}
				{activity.featured && (
					<span className='activityDetailsFeaturedBadge'>
						★ FEATURED
					</span>
				)}
			</div>
			<div className='activityDetailsContent'>
				{/* Main Details Section */}
				<main className='activityDetailsMain'>
					<h1 className='activityDetailsMainTitle'>
						{activity.title}
					</h1>
					<div className='activityDetailsMainDesc'>
						{activity.description}
					</div>
					<div>
						<h2 className='activityDetailsDetailsTitle'>
							Activity Details
						</h2>
						<div className='activityDetailsDetailsGrid'>
							<div className='activityDetailsDetailsItem'>
								<span role='img' aria-label='type'>
									<ActivityIcon type={activity.activityType} className='logo'/>
								</span>
								<div>
									<div className='activityDetailsDetailsLabel'>
										Activity Type
									</div>
									<div className='activityDetailsDetailsValue'>
										{activity.activityType}
									</div>
								</div>
							</div>
							<div className='activityDetailsDetailsItem'>
								<span role='img' aria-label='points'>
									<FaTrophy className='logo' />
								</span>
								<div>
									<div className='activityDetailsDetailsLabel'>
										Points per Participant
									</div>
									<div className='activityDetailsDetailsValue'>
										{activity.pointsPerParticipant || '—'} Points
									</div>
								</div>
							</div>
                            <div className='activityDetailsDetailsItem'>
								<span role='img' aria-label='calories'>
									<FaBurn className='logo' />
								</span>
								<div>
									<div className='activityDetailsDetailsLabel'>
										Calories Burned
									</div>
									<div className='activityDetailsDetailsValue'>
										{activity.caloriesPerHour || '—'}{' '}
										calories/hour
									</div>
								</div>
							</div>
							<div className='activityDetailsDetailsItem'>
								<span role='img' aria-label='organizer'>
                                    <IoPersonSharp className='logo' />
								</span>
								<div>
									<div className='activityDetailsDetailsLabel'>
										Organizer
									</div>
									<div className='activityDetailsDetailsValue'>
										{activity.organizerName || '—'}
									</div>
								</div>
							</div>
						</div>
					</div>
				</main>
				{/* Sidebar Card */}
				<aside className='activityDetailsSidebar'>
					<div className='activityDetailsSidebarRow'>
						<span><FaCalendar className='logo logo-faded'/></span>
						<span>{`${formattedStartDate} - ${formattedEndDate}`}</span>
					</div>
					<div className='activityDetailsSidebarRow'>
						<span><FaClock className='logo logo-faded'/></span>
						<span>{`${formattedStartTime} - ${formattedEndTime}`}</span>
					</div>
					<div className='activityDetailsSidebarRow'>
						<span><IoLocationSharp className='logo logo-faded'/></span>
						<span>{activity.location}</span>
					</div>
					<div className='activityDetailsSidebarRow'>
						<span><HiMiniUserGroup className='logo logo-faded' /></span>
						<span>
							{activity.participantCount} /{' '}
							{activity.participantLimit} participants
						</span>
					</div>
					{/* Avatars */}
					<div className='activityDetailsAvatars'>
						{activity?.participantAvatars
							?.slice(0, 7)
							.map((avatar, idx) => (
								<Avatar
									key={idx}
									src={avatar}
									alt='avatar'
									size={32}
									className='activityDetailsAvatar'
								/>
							))}
						{activity.participantCount > 7 && (
							<span className='activityDetailsAvatarMore'>
								+{activity.participantCount - 7}
							</span>
						)}
					</div>
					<div className='activityDetailsSidebarActions'>
						<button className='activityDetailsJoinBtn'>
							JOIN NOW
						</button>
						<button className='activityDetailsShareBtn'>
							SHARE
						</button>
					</div>
				</aside>
			</div>
		</div>
	);
}
