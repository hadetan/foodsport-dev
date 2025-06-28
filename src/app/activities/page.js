import Activity from '@/app/components/Activity';
import ActivityItem from '@/app/components/ActivityItem';
import styles from '../page.module.css';

async function fetchActivities() {
  const res = await fetch('http://localhost:3001/api/activities', {
    cache: 'no-store',
  });
  return res.json();
}

export default async function ActivitiesPage() {
  const activities = await fetchActivities();
  return (
    <>
      <Activity />
      <div className={styles.grid3}>
        {activities.map((item) => (
          <ActivityItem
            key={item.id}
            image={item.image}
            overlayText={item.activity}
            title={item.chinese_title}
            subtitle={item.english_description}
            date={item.dates}
            time={item.time}
            location={item.location}
            href={`/activities/${item.id}`}
          />
        ))}
      </div>
    </>
  );
}
