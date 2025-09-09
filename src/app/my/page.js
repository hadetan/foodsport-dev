'use client';

import styles from '@/app/shared/css/page.module.css';
import Activity from '@/app/shared/components/Activity';
import ActivityItem from '@/app/shared/components/ActivityItem';
import Hero from '@/app/shared/components/Hero';
import { useActivities } from '@/app/shared/contexts/ActivitiesContext';
import { useUser } from '@/app/shared/contexts/userContext';
import Button from '../shared/components/Button';
import { useRouter } from 'next/navigation';
import ActivityItemSkeleton from '../shared/components/skeletons/ActivityItemSkeleton';
import sortActivities from '@/utils/sortActivities';
import { useMemo } from 'react';

export default function Home() {
	const { activities, setActivities } = useActivities();
	const { user, setUser } = useUser();
	const router = useRouter();

	const sortedActivities = useMemo(() => sortActivities(activities || [], true), [activities]);

	return (
		<>
			<Hero />
			<Activity />
			<div className={styles.grid3}>
				{sortedActivities.length === 0
				? Array.from({ length: 6 }).map((_, i) => <ActivityItemSkeleton key={i} />)
				: sortedActivities.slice(0, 6).map((a) => (
					<ActivityItem
					key={a.id}
					activity={a}
					setActivities={setActivities}
					user={user}
					setUser={setUser}
					/>
				))}
			</div>
			<div className={styles.exploreCont}>
				<Button
					className={styles.explore}
					onClick={() => router.push('/my/activities')}
				>
					EXPLORE MORE ACTIVITIES
				</Button>
			</div>
		</>
	);
}
