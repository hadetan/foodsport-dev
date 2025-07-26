'use client';

import styles from '@/app/shared/css/item.module.css';
import ParticipantCircle from './ParticipantCircle';
import Image from 'next/image';
import Button from '@/app/shared/components/Button';
import { useRouter } from 'next/navigation';
import api from '@/utils/axios/api';
import { useState } from 'react';
import ActivityIcon from '@/app/shared/components/ActivityIcon';
import { FaMinusCircle, FaPlusCircle, FaShare } from 'react-icons/fa';

function formatDateTime(activity) {
	const formattedStartDate = new Date(
		activity.startDate
	).toLocaleDateString();
	const formattedEndDate = new Date(activity.endDate).toLocaleDateString();
	const formattedStartTime = new Date(activity.startTime).toLocaleTimeString(
		[],
		{ hour: '2-digit', minute: '2-digit' }
	);
	const formattedEndTime = new Date(activity.endTime).toLocaleTimeString([], {
		hour: '2-digit',
		minute: '2-digit',
	});

	return {
		formattedStartDate,
		formattedEndDate,
		formattedStartTime,
		formattedEndTime,
	};
}

export default function ActivityItem({ activity, user, setUser, setActivities }) {
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	const {
		formattedStartDate,
		formattedEndDate,
		formattedStartTime,
		formattedEndTime,
	} = formatDateTime(activity);

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
			setUser(prevUser => ({
				...prevUser,
				joinedActivityIds: [
					...(prevUser.joinedActivityIds || []),
					res.data?.userActivity?.activityId
				]
			}));
			setActivities(prevActivities =>
				prevActivities.map(act =>
					act.id === activity.id
						? { ...act, participantCount: res.data?.participantCount }
						: act
				)
			)
		} catch (error) {
			setError(error.message || 'Something went wrong');
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
			setUser(prevUser => {
				const prevIds = Array.isArray(prevUser.joinedActivityIds) ? prevUser.joinedActivityIds : [];
				const removeId = activity.id;
				return {
					...prevUser,
					joinedActivityIds: prevIds.filter(id => id !== removeId)
				};
			});
			setActivities(prevActivities =>
				prevActivities.map(act =>
					act.id === activity.id
						? { ...act, participantCount: res.data?.participantCount }
						: act
				)
			)
		} catch (error) {
			setError(error.message || 'Something went wrong');
		} finally {
			setLoading(false);
		}
	}

	console.log(user);

	return (
		<div className={styles.card}>
			{activity.isFeatured && (
				<div className={styles.featuredBadge}>★ Featured</div>
			)}
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
							{activity.title}
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
					<span className={styles.icon}>&#128197;</span>
					<span>
						{formattedStartDate} - {formattedEndDate}
					</span>
				</div>
				<div className={styles.detailsRow}>
					<span className={styles.icon}>&#128337;</span>
					<span>
						{formattedStartTime} - {formattedEndTime}
					</span>
				</div>
				<div className={styles.detailsRow}>
					<span className={styles.icon}>&#128205;</span>
					<span>{activity.location}</span>
				</div>
			</div>
			<div className={styles.cardActions}>
				<Button className={styles.actionBtn}>
					<ParticipantCircle
						participantCount={activity.participantCount}
						participantLimit={activity.participantLimit}
						size={32}
					/>
					STATUS
				</Button>
				<Button className={styles.actionBtn}>
					<span className={styles.actionIcon}><FaShare /></span>
					SHARE
				</Button>
				{user?.joinedActivityIds?.includes(activity.id) ? (
					<Button
						className={`${styles.actionBtn} ${styles.leaveBtn}`}
						onClick={handleLeave}
						disabled={loading}
					>
						<span className={styles.actionIcon}><FaMinusCircle /></span>
						{loading ? 'LEAVING' : 'LEAVE'}
					</Button>
				) : (
					<Button
						className={`${styles.actionBtn} ${styles.joinBtn}`}
						onClick={handleJoin}
						disabled={loading}
					>
						<span className={styles.actionIcon}><FaPlusCircle /></span>
						{loading ? 'JOINING' : 'JOIN NOW'}
					</Button>
				)}
			</div>
		</div>
	);
}
