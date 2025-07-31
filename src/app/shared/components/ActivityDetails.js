import React, { useEffect, useRef, useState } from 'react';
import '@/app/shared/css/ActivityDetails.css';
import Image from 'next/image';
import Avatar from '@/app/shared/components/avatar';
import ActivityIcon from '@/app/shared/components/ActivityIcon';
import { FaBurn, FaCalendar, FaClock, FaTrophy } from 'react-icons/fa';
import { HiMiniUserGroup } from 'react-icons/hi2';
import { IoLocationSharp, IoPersonSharp } from 'react-icons/io5';
import formatDate from '@/utils/formatDate';
import { IoIosArrowBack } from 'react-icons/io';
import Featured from './Featured';
import api from '@/utils/axios/api';
import ShareDialog from '@/app/shared/components/ShareDialog';

const ActivityDetails = ({
	activity,
	setActivities,
	user,
	setUser,
	formattedStartTime,
	formattedEndTime,
}) => {
	const topRef = useRef(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [showShare, setShowShare] = useState(false);

	useEffect(() => {
		if (topRef.current) {
			topRef.current.scrollIntoView({ behavior: 'smooth' });
		}
	}, []);

	async function handleJoin() {
		try {
			setLoading(true);
			const res = await api.post('/my/activities/join', {
				activityId: activity.id,
			});
			setUser(prevUser => ({
				...prevUser,
				joinedActivityIds: [
					...(prevUser.joinedActivityIds || []),
					res.data?.userActivity?.activityId
				]
			}));
			setActivities(prevActivities => prevActivities.map(act =>
				act.id === activity.id
					? { ...act, participantCount: (act.participantCount || 0) + 1 }
					: act
			));
		} catch (error) {
			setError(error.message || 'Something went wrong');
			if (error.response?.status === 401 && error.response?.data?.error?.includes('Token')) {
				window.location.href = '/auth/login';
			}
		} finally {
			setLoading(false);
		}
	}

	async function handleLeave() {
		try {
			setLoading(true);
			await api.delete('/my/activities/leave', {
				data: { activityId: activity.id },
			});
			setUser(prevUser => {
				const prevIds = Array.isArray(prevUser.joinedActivityIds) ? prevUser.joinedActivityIds : [];
				const removeId = activity.id;
				return {
					...prevUser,
					joinedActivityIds: prevIds.filter(id => id !== removeId)
				};
			});
			setActivities(prevActivities => prevActivities.map(act =>
				act.id === activity.id
					? { ...act, participantCount: Math.max(0, (act.participantCount || 1) - 1) }
					: act
			));
		} catch (error) {
			setError(error.message || 'Something went wrong');
			if (error.status === 401 && error.response?.data?.error?.includes('Token')) {
				window.location.href = '/auth/login';
			}
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className='activityDetailsPage' ref={topRef}>
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
				{activity.isFeatured && (
					<Featured position='bottom'/>
				)}
			</div>
			<div className='activityDetailsContent'>
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
						{user?.joinedActivityIds?.includes(activity.id) ? (
							<button className='activityDetailsJoinBtn' onClick={handleLeave} disabled={loading}>
								{loading ? 'LEAVING' : 'LEAVE'}
							</button>
						) : (
							<button className='activityDetailsJoinBtn' onClick={handleJoin} disabled={loading}>
								{loading ? 'JOINING' : 'JOIN NOW'}
							</button>
						)}
						<button className='activityDetailsShareBtn' onClick={() => setShowShare(true)}>
							SHARE
						</button>
						{showShare && (
							<ShareDialog
								url={typeof window !== 'undefined' ? window.location.origin + `/activities/${activity.id}` : `/activities/${activity.id}`}
								onClose={() => setShowShare(false)}
							/>
						)}
					</div>
				</aside>
			</div>
		</div>
	);
};

export default ActivityDetails;
