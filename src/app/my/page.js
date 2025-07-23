'use client';

import styles from '@/app/shared/css/page.module.css';
import Activity from '@/app/shared/components/Activity';
import ActivityItem from '@/app/shared/components/ActivityItem';
import Hero from '@/app/shared/components/Hero';
import api from '@/utils/axios/api';
import { useEffect, useState } from 'react';

export default function Home() {
	const [activities, setActivities] = useState([]);

	const fetchActivities = async () => {
		const res = await api.get('/admin/activities');
		setActivities(res.data?.activities);
	};

	useEffect(() => {
		fetchActivities();
		return () => setActivities([]);
	}, []);

	console.log(activities);
	return (
		<>
			<Hero />
			<Activity />
			<div className={styles.grid3}>
				{activities.slice(0, 9).map((a) => (
					<ActivityItem
						key={a.id}
						activity={a}
					/>
				))}
			</div>
		</>
	);
}
