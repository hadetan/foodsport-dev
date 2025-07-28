'use client';

import styles from '@/app/shared/css/page.module.css';
import Activity from '@/app/shared/components/Activity';
import ActivityItem from '@/app/shared/components/ActivityItem';
import Hero from '@/app/shared/components/Hero';
import ComingSoon from '@/app/(landing)/Components/ComingSoon';
import api from '@/utils/axios/api';
import { useEffect, useState } from 'react';

export default function Home() {
	//Explore activitiesContext file using ai to understand what its about
	//remove fetching
	//use activitiesContext to get all activities
	//remove useState's
	//remove data fetching [the activitiesContext has all the fetched activities]
	//remove useEffect
	//show skeleton of activities while loading [take reference from /my/page.js]

  const [activities, setActivities] = useState([]);

	const fetchActivities = async () => {
		const res = await api.get('/admin/activities');
		setActivities(res.data?.activities);
	};

	useEffect(() => {
		fetchActivities();
		return () => setActivities([]);
	}, []);

	return (
		<>
			<Hero />
			<Activity />
			<div className={styles.grid3}>
				{activities.slice(0, 6).map((a) => (
					<ActivityItem
						key={a.id}
						activity={a}
					/>
				))}
			</div>
			<ComingSoon />
		</>
	);
}
