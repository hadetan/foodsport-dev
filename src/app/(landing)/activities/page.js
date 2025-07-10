import Activity from '@/app/shared/components/Activity';
import ActivityItem from '@/app/shared/components/ActivityItem';
import styles from '@/app/shared/css/page.module.css';

async function fetchActivities() {
  // const res = await fetch("localhost:3000/api/activities", {
  //   cache: "no-store",
  // });
  // return res.json();
  return [];
}

export default async function ActivitiesPage() {
  const activities = await fetchActivities();
  return (
    <>
      <h1>something</h1>
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
