'use client';

import Activity from '@/app/shared/components/Activity';
import ActivityItem from '@/app/shared/components/ActivityItem';
import styles from '@/app/shared/css/page.module.css';

export default function ActivitiesPage() {
	//use activitiesContext to get the activity
	//we will not do any kind of data fetching here
	//add skeleton for loading activities [take reference from /my/page.js]
	//work on [id] page.js that is inside of the current folder
	return (
		<div className='main-activities'>
			<Activity />
			<div className={styles.grid3}>
				{activities.map((a) => (
					<ActivityItem
						key={a.id}
						activity={a}
					/>
				))}
			</div>
		</div>
	);
}
