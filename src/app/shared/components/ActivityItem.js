'use client';

import styles from '@/app/shared/css/item.module.css';
import ParticipantCircle from './ParticipantCircle';
import Image from 'next/image';
import Button from '@/app/shared/components/Button';
import { useRouter } from 'next/navigation';
import api from '@/utils/axios/api';
import { useState } from 'react';
import ActivityIcon from '@/app/shared/components/ActivityIcon';
import { FaCalendar, FaClock, FaMinusCircle, FaPlusCircle, FaShare } from 'react-icons/fa';
import ShareDialog from '@/app/shared/components/ShareDialog';
import Featured from './Featured';
import formatDate from '@/utils/formatDate';
import ActivityItemSkeleton from '@/app/shared/components/skeletons/ActivityItemSkeleton';
import { IoLocationSharp } from 'react-icons/io5';

function formatDateTime(activity) {
	const formattedStartTime = new Date(activity.startTime).toLocaleTimeString(
		[],
		{ hour: '2-digit', minute: '2-digit' }
	);
	const formattedEndTime = new Date(activity.endTime).toLocaleTimeString([], {
		hour: '2-digit',
		minute: '2-digit',
	});

	return {
		formattedStartTime,
		formattedEndTime,
	};
}

export default function ActivityItem({
	activity,
	user,
	setUser,
	setActivities,
}) {
	if (!user) {
		return <ActivityItemSkeleton />;
	}

	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [showShare, setShowShare] = useState(false);

	const { formattedStartTime, formattedEndTime } = formatDateTime(activity);

	const choppedDesc =
		activity.description && activity.description.length > 90
			? activity.description.slice(0, 90) + '...'
			: activity.description;

	const statusClass = `${styles.statusBadge} ${
		styles[`status-${activity.status}`]
	}`;

	async function handleJoin() {
		try {
			setLoading(true);
			const res = await api.post('/my/activities/join', {
				activityId: activity.id,
			});
			setUser((prevUser) => ({
				...prevUser,
				joinedActivityIds: [
					...(prevUser.joinedActivityIds || []),
					res.data?.userActivity?.activityId,
				],
			}));
			setActivities((prevActivities) =>
				prevActivities.map((act) =>
					act.id === activity.id
						? {
								...act,
								participantCount: res.data?.participantCount,
						  }
						: act
				)
			);
		} catch (error) {
			setError(error.message || 'Something went wrong');
			if (
				error.status === 401 &&
				error.response.data.error.includes('Token')
			) {
				router.push('/auth/login');
			}
		} finally {
			setLoading(false);
		}
	}

	async function handleLeave() {
		try {
			setLoading(true);
			const res = await api.delete('/my/activities/leave', {
				data: { activityId: activity.id },
			});
			setUser((prevUser) => {
				const prevIds = Array.isArray(prevUser.joinedActivityIds)
					? prevUser.joinedActivityIds
					: [];
				const removeId = activity.id;
				return {
					...prevUser,
					joinedActivityIds: prevIds.filter((id) => id !== removeId),
				};
			});
			setActivities((prevActivities) =>
				prevActivities.map((act) =>
					act.id === activity.id
						? {
								...act,
								participantCount: res.data?.participantCount,
						  }
						: act
				)
			);
		} catch (error) {
			setError(error.message || 'Something went wrong');
			if (
				error.status === 401 &&
				error.response.data.error.includes('Token')
			) {
				router.push('/auth/login');
			}
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className={styles.card}>
			{activity.isFeatured && <Featured position='top' />}
			<div className={styles.imageWrapper}>
				{activity.imageUrl && (
					<Image
						src={activity.imageUrl}
						alt={activity.activityType}
						fill
						className={styles.cardImage}
						onClick={() => {
							router.push(`/my/activities/${activity.id}`);
						}}
					/>
				)}
				<div className={styles.overlayText}>
					<em>{activity.activityType}</em>
				</div>
			</div>
			<div className={styles.content}>
				<div className={styles.row}>
					<div>
						<div className={styles.cardTitle}>
							<h3
								onClick={() => {
									router.push(
										`/my/activities/${activity.id}`
									);
								}}
							>
								{activity.title}
							</h3>
							<div className={styles.badges}>
								<span
									className={statusClass}
									title={activity.status}
								>
									{activity.status.charAt(0).toUpperCase() +
										activity.status.slice(1)}
								</span>
								<Button
									className={styles.filterBtn}
									title='Filter'
								>
									<ActivityIcon
										type={activity.activityType}
									/>
								</Button>
							</div>
						</div>
						<div
							className={styles.cardSubtitle}
							title={activity.description}
						>
							{choppedDesc}
						</div>
					</div>
				</div>
				<div className={styles.detailsRow}>
					<span className={styles.icon}><FaCalendar /></span>
					<span>
						{`${formatDate(activity.startDate)} - 
						${formatDate(activity.endDate)}`}
					</span>
				</div>
				<div className={styles.detailsRow}>
					<span className={styles.icon}><FaClock /></span>
					<span>
						{formattedStartTime} - {formattedEndTime}
					</span>
				</div>
				<div className={styles.detailsRow}>
					<span className={styles.icon}><IoLocationSharp /></span>
					<span>{activity.location}</span>
				</div>
			</div>
			<div className={styles.cardActions}>
				<Button
					className={styles.actionBtn}
					title={`${activity.participantCount} Participant`}
				>
					<ParticipantCircle
						participantCount={activity.participantCount}
						participantLimit={activity.participantLimit}
						size={20}
					/>
					STATUS
				</Button>
				<Button
					className={styles.actionBtn}
					onClick={() => setShowShare(true)}
				>
					<span className={styles.actionIcon}>
						<FaShare />
					</span>
					SHARE
				</Button>
				{user?.joinedActivityIds?.includes(activity.id) ? (
					<Button
						className={`${styles.actionBtn}`}
						onClick={handleLeave}
						disabled={loading}
					>
						<span className={styles.actionIcon}>
							<FaMinusCircle />
						</span>
						{loading ? 'LEAVING' : 'LEAVE'}
					</Button>
				) : (
					<Button
						className={`${styles.actionBtn}`}
						onClick={handleJoin}
						disabled={loading}
					>
						<span className={styles.actionIcon}>
							<FaPlusCircle />
						</span>
						{loading ? 'JOINING' : 'JOIN NOW'}
					</Button>
				)}
			</div>
			{showShare && (
				<ShareDialog
					url={
						typeof window !== 'undefined'
							? window.location.origin +
							  `/activities/${activity.id}`
							: `/activities/${activity.id}`
					}
					onClose={() => setShowShare(false)}
				/>
			)}
		</div>
	);
}
