import Image from "next/image";
import styles from "./page.module.css";
import Activity from "./components/Activity";
import ActivityItem from "./components/ActivityItem";
import activities from "@/app/data/activities";
import Hero from "./components/Hero";

export default function Home() {
  return (
    <>
      <Hero />
      <Activity />
      <div className={styles.grid3}>
        {activities.map((item, idx) => (
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
        ))}
      </div>
    </>
  );
}
