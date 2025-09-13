"use client";

import styles from '@/app/shared/css/item.module.css';
import Image from 'next/image';
import Button from '@/app/shared/components/Button';
import { useRouter } from 'next/navigation';
import { FaCalendar, FaClock } from 'react-icons/fa';
import formatDate from '@/utils/formatDate';
import ActivityIcon from './ActivityIcon';
import { RiSunFoggyFill } from 'react-icons/ri';
import { MdEventSeat } from 'react-icons/md';
import getActivityStatus from '@/utils/getActivityStatus';
import calculateSeats from '@/utils/calculateSeats';
import { FaLocationDot } from 'react-icons/fa6';
import calculateTimer from '@/utils/calculateTimer';
import { useEffect, useState, useMemo, useRef } from 'react';
import { useAuth } from '../contexts/authContext';
import { useTranslations, useLocale } from 'next-intl';
import { pickLocalized } from '@/i18n/config';
import Tooltip from './Tooltip';

function formatTime(activity) {
    const formattedStartTime = new Date(activity.startTime).toLocaleTimeString(
        [],
        { hour: "2-digit", minute: "2-digit" }
    );
    const formattedEndTime = new Date(activity.endTime).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
    });

    return {
        formattedStartTime,
        formattedEndTime,
    };
}

function truncateText(text, maxLength) {
    if (!text || text.length <= maxLength) return text;

    const truncated = text.slice(0, maxLength);
    const lastSpaceIndex = truncated.lastIndexOf(" ");

    if (lastSpaceIndex > 0 && lastSpaceIndex > maxLength * 0.8) {
        return truncated.slice(0, lastSpaceIndex) + "...";
    }

    return truncated + "...";
}

export default function ActivityItem({ activity, user }) {
    const router = useRouter();
    const { authToken } = useAuth();
    const t = useTranslations();
	const locale = useLocale();

    const { formattedStartTime, formattedEndTime } = formatTime(activity);
    const redirectUrl = user
        ? `/my/activities/${activity.id}`
        : `/activities/${activity.id}`;

    const localizedTitle = pickLocalized({
		locale,
		en: activity.title,
		zh: activity.titleZh
	});
	const localizedDescription = pickLocalized({
		locale,
		en: activity.description,
		zh: activity.descriptionZh
	});

    const choppedTitle = truncateText(localizedDescription, 65);
	const choppedDesc =
		localizedDescription && localizedDescription.length > 90
			? truncateText(localizedDescription, 200)
			: localizedDescription;

    const { status: activityStatus, daysLeft } = getActivityStatus(activity);
    const { seatsLeft } = calculateSeats(activity);

    const startDateTime = useMemo(() => {
		if (!activity.startDate) return null;
		const date = new Date(activity.startDate);
		if (activity.startTime) {
			const t = new Date(activity.startTime);
			if (!isNaN(t)) {
				date.setHours(t.getHours(), t.getMinutes(), t.getSeconds() || 0, 0);
			}
		}
		return date;
	}, [activity.startDate, activity.startTime]);

	const initialTimer = startDateTime ? calculateTimer(startDateTime, new Date()) : { within24h: false };
	const [timerInfo, setTimerInfo] = useState(initialTimer);
	const lastUpdateRef = useRef(Date.now());
	const isCancelledOrClosed = activity.status === 'cancelled' || activity.status === 'closed';

	useEffect(() => {
		if (!startDateTime) return;
		if (!timerInfo.within24h || timerInfo.finished) return;

		const interval = setInterval(() => {
			const now = new Date();
			const info = calculateTimer(startDateTime, now);

			if (info.hours === 0 && info.minutes === 0) {
				setTimerInfo(info);
			} else {
				const last = lastUpdateRef.current;
				if (now - last >= 60000 || timerInfo.formatted !== info.formatted) {
					lastUpdateRef.current = now.getTime();
					setTimerInfo(info);
				}
			}
		}, 1000);
		return () => clearInterval(interval);
	}, [startDateTime, timerInfo.within24h, timerInfo.finished]);

	function handleActTypeSearch(actType) {
		authToken ?
			router.push(`/${locale}/my/activities?type=${encodeURIComponent(actType)}`)
			:
			router.push(`/${locale}/activities?type=${encodeURIComponent(actType)}`);
	}

    const tooltipText = t('Activity.ActivityItem.startEndFull', {
        startDate: formatDate(activity.startDate),
        startTime: formattedStartTime,
        endDate: formatDate(activity.endDate),
        endTime: formattedEndTime,
    });

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

                {!isCancelledOrClosed && timerInfo.within24h && !timerInfo.finished && (
					<div className={styles.imageBadge}>
						<span className={styles.badgeNumber}>{timerInfo.formatted}</span>
						<span className={styles.badgeLabel}>{t('Activity.ActivityItem.toStart')}</span>
					</div>
				)}
            </div>
            <div className={styles.content}>
                <div className={styles.cardTitleRow}>
                    <h3
                        className={styles.cardTitleText}
                        onClick={() => router.push(redirectUrl)}
                    >
                        {choppedTitle}
                    </h3>
                    <div className={styles.badges}>
                        <Button
                            className={styles.filterBtn}
                            onClick={() =>
                                handleActTypeSearch(activity.activityType)
                            }
                        >
                            <ActivityIcon type={activity.activityType} />
                        </Button>
                    </div>
                </div>
                <div
                    className={styles.cardSubtitle}
                    title={activity.description}
                >
                    {choppedDesc}
                </div>

                <div className={styles.metaContainer}>
                    <div className={styles.metaLeft}>
                        <Tooltip content={tooltipText} width={'16rem'}>
                            <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
                                <div className={styles.detailsRow}>
                                <span className={styles.icon}>
                                    <FaCalendar size={19} />
                                </span>
                                <span>{`${formatDate(
                                    activity.startDate
                                )} - ${formatDate(activity.endDate)}`}</span>
                                </div>
                                <div className={styles.detailsRow}>
                                    <span className={styles.icon}>
                                        <FaClock size={20} />
                                    </span>
                                    <span>
                                        {formattedStartTime} - {formattedEndTime}
                                    </span>
                                </div>
                            </div>
                        </Tooltip>
                        <div className={styles.detailsRow}>
                            <span className={styles.icon}>
                                <FaLocationDot size={20} />
                            </span>
                            <span>{activity.location}</span>
                        </div>
                    </div>
                    <div className={styles.metaRight}>
                        {activityStatus === 'upcoming' && daysLeft !== null && (
							<div className={styles.rightRow}>
								<span className={styles.icon}><RiSunFoggyFill size={23}/></span>
								<span>{t('Activity.ActivityItem.daysToGo', { count: daysLeft })}</span>
							</div>
						)}
						{activityStatus === 'ongoing' && (
							<div className={styles.rightRow}>
								<span className={styles.icon}><RiSunFoggyFill size={23}/></span>
								<span>{t('Activity.ActivityItem.ongoing')}</span>
							</div>
						)}
						{activityStatus === 'completed' && (
							<div className={styles.rightRow}>
								<span className={styles.icon}><RiSunFoggyFill size={23}/></span>
								<span>{t('Activity.ActivityItem.expired')}</span>
							</div>
						)}
                        {seatsLeft !== null && (
							<div className={styles.rightRow}>
								<span className={styles.icon}><MdEventSeat size={23}/></span>
								<span>{t('Activity.ActivityItem.seatsLeft', { count: seatsLeft })}</span>
							</div>
						)}
                    </div>
                </div>
            </div>
        </div>
    );
}
