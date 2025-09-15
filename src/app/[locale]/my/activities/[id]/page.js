'use client';

import '@/app/shared/css/ActivityDetails.css';
import { useEffect, useRef } from 'react';
import { useActivities } from '@/app/shared/contexts/ActivitiesContext';
import { useUser } from '@/app/shared/contexts/userContext';
import { useParams } from 'next/navigation';
import ActivityDetails from '@/app/shared/components/ActivityDetails';
import ActivityDetailsSkeleton from '@/app/shared/components/skeletons/ActivityDetailsSkeleton';
import { HiOutlineEmojiSad } from 'react-icons/hi';
import { IoIosArrowBack } from 'react-icons/io';
import { useTranslations } from 'next-intl';

function getActivity(activities, id) {
	return activities.find((activity) => activity.id === id);
}

function formatDateTime(startTime, endTime) {
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
		formattedStartTime,
		formattedEndTime,
	};
}

export default function ActivityDetailsPage() {
	const { activities, setActivities, loading: activityLoading } = useActivities();
	const { user, setUser, loading: userLoading } = useUser();
	const { id } = useParams();
	const t = useTranslations();

	if (activityLoading || !activities || !activities.length) {
		return <ActivityDetailsSkeleton />;
	}

	const activity = getActivity(activities, id);

	if (userLoading || activityLoading) return <ActivityDetailsSkeleton />;

	if (!!activities.length && !activity) {
		return (
			<div className='activityDetailsEmptyState'>
				<div className='activityDetailsEmptyIcon'>
					<HiOutlineEmojiSad />
				</div>
				<div className='activityDetailsEmptyTitle'>
					{t('Activity.DetailsPage.noActivityTitle')}
				</div>
				<div className='activityDetailsEmptyDesc'>
					{t('Activity.DetailsPage.noActivityDesc')}
				</div>
				<button
					className='activityDetailsEmptyBtn'
					onClick={() => window.history.back()}
				>
					<span className='back'>
						<IoIosArrowBack />
					</span>{' '}
					{t('Activity.DetailsPage.back')}
				</button>
			</div>
		);
	}

	const { formattedStartTime, formattedEndTime } = formatDateTime(
		activity.startTime,
		activity.endTime
	);

	return (
		<ActivityDetails
			activity={activity}
			setActivities={setActivities}
			user={user}
			setUser={setUser}
			formattedStartTime={formattedStartTime}
			formattedEndTime={formattedEndTime}
		/>
	);
}
