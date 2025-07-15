import Image from 'next/image';
import styles from '@/app/shared/css/page.module.css';
import Activity from '@/app/shared/components/Activity';
import ActivityItem from '@/app/shared/components/ActivityItem';
// import activities from "@/data/activities";
import Hero from '@/app/shared/components/Hero';
import ComingSoon from '@/app/(landing)/Components/ComingSoon';

export default function Home() {
	return (
		<>
			<Hero />
			<Activity />
			<div className={styles.grid3}>
				{/* {activities.map((item, idx) => (
          <ActivityItem
            key={idx}
            image={item.image}
            overlayText={item.activity}
            title={item.chinese_title}
            subtitle={item.english_description}
            date={item.dates}
            time={item.time}
            location={item.location}
          />
        ))} */}
			</div>
			<ComingSoon />
		</>
	);
}
