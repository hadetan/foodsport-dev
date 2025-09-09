'use client';

import styles from '@/app/shared/css/item.module.css';
import Image from 'next/image';
import Button from '@/app/shared/components/Button';
import { useRouter } from 'next/navigation';
import { FaCalendar, FaClock } from 'react-icons/fa';
import formatDate from '@/utils/formatDate';
import ActivityIcon from './ActivityIcon';
import { RiSunFoggyFill } from 'react-icons/ri';
import { MdEventSeat } from 'react-icons/md';
import calculateDays from '@/utils/calculateDays';
import calculateSeats from '@/utils/calculateSeats';
import { FaLocationDot } from 'react-icons/fa6';
import calculateTimer from '@/utils/calculateTimer';
import { useEffect, useState } from 'react';

function formatTime(activity) {
	const formattedStartTime = new Date(activity.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
	const formattedEndTime = new Date(activity.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

	return {
		formattedStartTime,
		formattedEndTime,
	};
}

export default function ActivityItem({
	activity,
	user,
}) {
	const router = useRouter();

	const { formattedStartTime, formattedEndTime } = formatTime(activity);
	const redirectUrl = user
		? `/my/activities/${activity.id}`
		: `/activities/${activity.id}`;

	const choppedDesc =
		activity.description && activity.description.length > 90
			? activity.description.slice(0, 90) + '...'
			: activity.description;

	const { daysLeft } = calculateDays(activity);
	const { seatsLeft } = calculateSeats(activity);

	let startDateTime = null;
	if (activity.startDate) {
		startDateTime = new Date(activity.startDate);
		if (activity.startTime) {
			const t = new Date(activity.startTime);
			if (!isNaN(t)) {
				startDateTime.setHours(t.getHours(), t.getMinutes(), t.getSeconds() || 0, 0);
			}
		}
	}

	const initialTimer = startDateTime ? calculateTimer(startDateTime, new Date()) : { within24h: false };
	const [timerInfo, setTimerInfo] = useState(initialTimer);

	useEffect(() => {
		if (!startDateTime) return;
		if (!timerInfo.within24h || timerInfo.finished) return;

		const tick = (timerInfo.hours === 0 && timerInfo.minutes === 0) ? 1000 : 60000;
		const id = setInterval(() => {
			const info = calculateTimer(startDateTime, new Date());
			setTimerInfo(info);
		}, tick);

		return () => clearInterval(id);
	}, [startDateTime, timerInfo.within24h, timerInfo.finished, timerInfo.hours, timerInfo.minutes]);

	return (
		<div className={styles.card}>
			<div className={styles.imageWrapper}>
				{activity.imageUrl && (
					<Image
						src={activity.imageUrl}
						alt={activity.activityType}
						fill
						className={styles.cardImage}
						onClick={() => router.push(redirectUrl)}
					/>
				)}

				{timerInfo.within24h && !timerInfo.finished && (
					<div className={styles.imageBadge}>
						<span className={styles.badgeNumber}>{timerInfo.formatted}</span>
						<span className={styles.badgeLabel}>to start</span>
					</div>
				)}
			</div>
			<div className={styles.content}>
				<div className={styles.cardTitleRow}>
					<h3
						className={styles.cardTitleText}
						onClick={() => router.push(redirectUrl)}
					>
						{activity.title}
					</h3>
					<div className={styles.badges}>
						<Button className={styles.filterBtn} title='Filter' onClick={() => handleActTypeSearch(activity.activityType)}>
							<ActivityIcon type={activity.activityType} />
						</Button>
					</div>
				</div>
				<div className={styles.cardSubtitle} title={activity.description}>{choppedDesc}</div>

				<div className={styles.metaContainer}>
					<div className={styles.metaLeft}>
						<div className={styles.detailsRow}>
							<span className={styles.icon}><FaCalendar size={19} /></span>
							<span>{`${formatDate(activity.startDate)} - ${formatDate(activity.endDate)}`}</span>
						</div>
						<div className={styles.detailsRow}>
							<span className={styles.icon}><FaClock size={20} /></span>
							<span>{formattedStartTime} - {formattedEndTime}</span>
						</div>
						<div className={styles.detailsRow}>
							<span className={styles.icon}><FaLocationDot size={20} /></span>
							<span>{activity.location}</span>
						</div>
					</div>
					<div className={styles.metaRight}>
						{daysLeft !== null && (
							<div className={styles.rightRow}>
								<span className={styles.icon}><RiSunFoggyFill size={23}/></span>
								<span>{daysLeft} {daysLeft === 1 || daysLeft === 0 ? 'Day to go' : 'Days to go'}</span>
							</div>
						)}
						{seatsLeft !== null && (
							<div className={styles.rightRow}>
								<span className={styles.icon}><MdEventSeat size={23}/></span>
								<span>{seatsLeft} {seatsLeft === 1 ? 'Seat Left' : 'Seats Left'}</span>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
