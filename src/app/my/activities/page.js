'use client';

import ActivityImg from '@/app/shared/components/Activity';
import ActivityItem from '@/app/shared/components/ActivityItem';
import styles from '@/app/shared/css/page.module.css';
import sectionStyles from '@/app/shared/css/activitySection.module.css';
import getActivityStatus from '@/utils/getActivityStatus';
import sortFeaturedAndSoonest from '@/utils/sortFeaturedAndSoonest';
import { useActivities } from '@/app/shared/contexts/ActivitiesContext';
import ActivityItemSkeleton from '@/app/shared/components/skeletons/ActivityItemSkeleton';
import { useUser } from '@/app/shared/contexts/userContext';
import ActivitiesFilter from '@/app/shared/components/ActivitiesFilter';
import { Suspense, useState } from 'react';
import ActivityNotFound from '@/app/shared/components/ActivityNotFound';

export default function ActivitiesPage() {
	const { activities, setActivities, loading } = useActivities();
	const [filteredActivities, setFilteredActivities] = useState(activities);
	const { user, setUser } = useUser();

	const mergedUpcomingOngoing = (filteredActivities || []).filter(a => {
		const { status } = getActivityStatus(a);
		return status === 'upcoming' || status === 'ongoing';
	});
	const sortedUpcomingOngoing = sortFeaturedAndSoonest(mergedUpcomingOngoing);

	const finished = (filteredActivities || []).filter(a => {
		const { status } = getActivityStatus(a);
		return status === 'finished' || status === 'completed';
	});
	finished.sort((a, b) => {
		const aEnd = new Date(a.endDate);
		const bEnd = new Date(b.endDate);
		const time_a = new Date(a.endTime);
		if (!isNaN(time_a)) aEnd.setHours(time_a.getHours(), time_a.getMinutes(), time_a.getSeconds() || 0, 0);
		const time_b = new Date(b.endTime);
		if (!isNaN(time_b)) bEnd.setHours(time_b.getHours(), time_b.getMinutes(), time_b.getSeconds() || 0, 0);
		return bEnd - aEnd;
	});

	return (
		<div className='main-activities'>
			<ActivityImg />
			<Suspense fallback={null}>
				<ActivitiesFilter activities={activities} setFilteredActivities={setFilteredActivities} />
			</Suspense>
			{!filteredActivities.length && !loading ? <ActivityNotFound /> : (
				<>
					{sortedUpcomingOngoing.length > 0 && (
						<div className={sectionStyles.activitySection}>
							<h2 className={sectionStyles.activitySectionHeading}>Upcoming & Ongoing</h2>
							<div className={styles.grid3}>
								{sortedUpcomingOngoing.map((a) => (
									<ActivityItem key={a.id} activity={a} user={user} setUser={setUser} setActivities={setActivities} />
								))}
							</div>
						</div>
					)}
					{finished.length > 0 && (
						<div className={sectionStyles.activitySection}>
							<h2 className={sectionStyles.activitySectionHeading}>Finished</h2>
							<div className={styles.grid3}>
								{finished.map((a) => (
									<ActivityItem key={a.id} activity={a} user={user} setUser={setUser} setActivities={setActivities} />
								))}
							</div>
						</div>
					)}
					{!activities.length && loading && (
						<div className={styles.grid3}>
							{Array.from({ length: 6 }).map((_, i) => (
								<ActivityItemSkeleton key={i} />
							))}
						</div>
					)}
				</>
			)}
		</div>
	);
}
