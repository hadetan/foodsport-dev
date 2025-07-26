'use client';

import Image from 'next/image';
import styles from '@/app/shared/css/page.module.css';
import Activity from '@/app/shared/components/Activity';
import ActivityItem from '@/app/shared/components/ActivityItem';
// import activities from "@/data/activities";
import Hero from '@/app/shared/components/Hero';
import ComingSoon from '@/app/(base)/(landing)/Components/ComingSoon';
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
