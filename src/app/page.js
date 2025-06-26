import Image from "next/image";
import styles from "./page.module.css";
import Activity from "./components/Activity";
import ActivityItem from "./components/ActivityItem";

const activities = [
  {
    activity: "KAYAK",
    chinese_title: "4月_動點星期三線上減卡路里",
    english_description: "April_FOODSPORT Wednesday Online Calories Drive",
    dates: "13ᵗʰ Jan 2024 - 26ᵗʰ Jan 2024",
    time: "10:00 a.m. - 7:00 p.m.",
    location: "Hong Kong, Kwun Tong",
    image: "/kayak.jpg",
  },
  {
    activity: "YOGA",
    chinese_title: "4月_動點星期三線上減卡路里",
    english_description: "April_FOODSPORT Wednesday Online Calories Drive",
    dates: "13ᵗʰ Jan 2024 - 26ᵗʰ Jan 2024",
    time: "10:00 a.m. - 7:00 p.m.",
    location: "Hong Kong, Kwun Tong",
    image: "/yoga.jpg",
  },
  {
    activity: "FITNESS",
    chinese_title: "4月_動點星期三線上減卡路里",
    english_description: "April_FOODSPORT Wednesday Online Calories Drive",
    dates: "13ᵗʰ Jan 2024 - 26ᵗʰ Jan 2024",
    time: "10:00 a.m. - 7:00 p.m.",
    location: "Hong Kong, Kwun Tong",
    image: "/fitness.jpg",
  },
  {
    activity: "RUNNING",
    chinese_title: "4月_動點星期三線上減卡路里",
    english_description: "April_FOODSPORT Wednesday Online Calories Drive",
    dates: "13ᵗʰ Jan 2024 - 26ᵗʰ Jan 2024",
    time: "10:00 a.m. - 7:00 p.m.",
    location: "Hong Kong, Kwun Tong",
    image: "/running.jpg",
  },
  {
    activity: "CYCLING",
    chinese_title: "4月_動點星期三線上減卡路里",
    english_description: "April_FOODSPORT Wednesday Online Calories Drive",
    dates: "13ᵗʰ Jan 2024 - 26ᵗʰ Jan 2024",
    time: "10:00 a.m. - 7:00 p.m.",
    location: "Hong Kong, Kwun Tong",
    image: "/cycling.jpg",
  },
  {
    activity: "HIKING",
    chinese_title: "4月_動點星期三線上減卡路里",
    english_description: "April_FOODSPORT Wednesday Online Calories Drive",
    dates: "13ᵗʰ Jan 2024 - 26ᵗʰ Jan 2024",
    time: "10:00 a.m. - 7:00 p.m.",
    location: "Hong Kong, Kwun Tong",
    image: "/hiking.jpg",
  },
];

export default function Home() {
  return (
    <>
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
