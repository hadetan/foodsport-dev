'use client';

import Activity from '@/app/shared/components/Activity';
import ActivityItem from '@/app/shared/components/ActivityItem';
import styles from '@/app/shared/css/page.module.css';
import api from '@/utils/axios/api';
import { useEffect, useState } from 'react';
import ActivityDetails from '@/app/shared/components/ActivityDetails';

export default function ActivitiesPage() {
	const [activities, setActivities] = useState([]);
	const [activity, setActivity] = useState(null);
	const [showActivity, setShowActivity] = useState(false);

	const fetchActivities = async () => {
		const res = await api.get('/admin/activities');
		setActivities(res.data?.activities);
	};

	useEffect(() => {
		fetchActivities();
		return () => setActivities([]);
	}, []);
	return (
		<div className='main-activities'>
			{!showActivity ? (
				<>
					<Activity />
					<div className={styles.grid3}>
						{activities.map((a) => (
							<ActivityItem
								key={a.id}
								activity={a}
								setActivityData={setActivity}
                setShowActivity={setShowActivity}
							/>
						))}
					</div>
				</>
			) : (
				<ActivityDetails activity={activity} setShowActivity={setShowActivity}/>
			)}
		</div>
	);
}
