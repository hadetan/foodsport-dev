import React, { useEffect, useRef } from 'react';
import '@/app/shared/css/ActivityDetails.css';
import Image from 'next/image';
import Avatar from '@/app/shared/components/avatar';
import ActivityIcon from '@/app/shared/components/ActivityIcon';
import { FaBurn, FaCalendar, FaClock, FaTrophy } from 'react-icons/fa';
import { HiMiniUserGroup } from 'react-icons/hi2';
import { IoLocationSharp, IoPersonSharp } from 'react-icons/io5';
import formatDate from '@/utils/formatDate';
import { IoIosArrowBack } from 'react-icons/io';

const ActivityDetails = ({
	activity,
	formattedStartTime,
	formattedEndTime,
}) => {
	const topRef = useRef(null);
	useEffect(() => {
		if (topRef.current) {
			topRef.current.scrollIntoView({ behavior: 'smooth' });
		}
	});
	return (
		<div className='activityDetailsPage' ref={topRef}>
			{/* Hero Image Section */}
			<div className='activityDetailsHero'>
				<button
					className='activityDetailsBackBtn'
					onClick={() => window.history.back()}
				>
					<span className='back'><IoIosArrowBack /></span> Back
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
									<ActivityIcon
										type={activity.activityType}
										className='logo'
									/>
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
										{activity.pointsPerParticipant || '—'}{' '}
										Points
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
						<FaCalendar className='logo logo-faded' />
						<span>{`${formatDate(
							activity.startDate
						)} - ${formatDate(activity.endDate)}`}</span>
					</div>
					<div className='activityDetailsSidebarRow'>
						<FaClock className='logo logo-faded' />
						<span>{`${formattedStartTime} - ${formattedEndTime}`}</span>
					</div>
					<div className='activityDetailsSidebarRow'>
						<span>
							<IoLocationSharp className='logo logo-faded' />
						</span>
						<span>{activity.location}</span>
					</div>
					<div className='activityDetailsSidebarRow'>
						<span>
							<HiMiniUserGroup className='logo logo-faded' />
						</span>
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
};

export default ActivityDetails;
