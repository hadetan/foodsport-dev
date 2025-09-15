'use client';

import styles from '@/app/shared/css/page.module.css';
import Activity from '@/app/shared/components/Activity';
import ActivityItem from '@/app/shared/components/ActivityItem';
import getActivityStatus from '@/utils/getActivityStatus';
import sortFeaturedAndSoonest from '@/utils/sortFeaturedAndSoonest';
import Hero from '@/app/shared/components/Hero';
import { useActivities } from '@/app/shared/contexts/ActivitiesContext';
import { useUser } from '@/app/shared/contexts/userContext';
import Button from '../../shared/components/Button';
import { useRouter } from 'next/navigation';
import ActivityItemSkeleton from '../../shared/components/skeletons/ActivityItemSkeleton';
import { useTranslations } from 'next-intl';

export default function Home() {
	const { activities, setActivities } = useActivities();
	const { user, setUser } = useUser();
	const router = useRouter();
	const t = useTranslations();

	const filtered = activities
		.filter(a => {
			const { status } = getActivityStatus(a);
			return (status === 'upcoming' || status === 'ongoing') && a.status === 'active';
		});
	const sorted = sortFeaturedAndSoonest(filtered);

	return (
		<>
			<Hero />
			<Activity />
			<div className={styles.grid3}>
				{activities.length === 0
				? Array.from({ length: 6 }).map((_, i) => <ActivityItemSkeleton key={i} />)
				: sorted
					.slice(0, 6)
					.map((a) => (
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
					{t('Activity.Landing.exploreMoreActivities')}
				</Button>
			</div>
		</>
	);
}
