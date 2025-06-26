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
    image: "https://images.unsplash.com/photo-1440993443326-9e9f5aea703a?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8a2F5YWt8ZW58MHx8MHx8fDI%3D",
  },
  {
    activity: "YOGA",
    chinese_title: "4月_動點星期三線上減卡路里",
    english_description: "April_FOODSPORT Wednesday Online Calories Drive",
    dates: "13ᵗʰ Jan 2024 - 26ᵗʰ Jan 2024",
    time: "10:00 a.m. - 7:00 p.m.",
    location: "Hong Kong, Kwun Tong",
    image: "https://images.unsplash.com/photo-1510894347713-fc3ed6fdf539?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTN8fHlvZ2F8ZW58MHx8MHx8fDI%3D",
  },
  {
    activity: "FITNESS",
    chinese_title: "4月_動點星期三線上減卡路里",
    english_description: "April_FOODSPORT Wednesday Online Calories Drive",
    dates: "13ᵗʰ Jan 2024 - 26ᵗʰ Jan 2024",
    time: "10:00 a.m. - 7:00 p.m.",
    location: "Hong Kong, Kwun Tong",
    image: "https://images.unsplash.com/photo-1483721310020-03333e577078?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8RklUTkVTU3xlbnwwfHwwfHx8Mg%3D%3D",
  },
  {
    activity: "RUNNING",
    chinese_title: "4月_動點星期三線上減卡路里",
    english_description: "April_FOODSPORT Wednesday Online Calories Drive",
    dates: "13ᵗʰ Jan 2024 - 26ᵗʰ Jan 2024",
    time: "10:00 a.m. - 7:00 p.m.",
    location: "Hong Kong, Kwun Tong",
    image: "https://images.unsplash.com/photo-1590333748338-d629e4564ad9?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8cnVubmluZ3xlbnwwfHwwfHx8Mg%3D%3D",
  },
  {
    activity: "CYCLING",
    chinese_title: "4月_動點星期三線上減卡路里",
    english_description: "April_FOODSPORT Wednesday Online Calories Drive",
    dates: "13ᵗʰ Jan 2024 - 26ᵗʰ Jan 2024",
    time: "10:00 a.m. - 7:00 p.m.",
    location: "Hong Kong, Kwun Tong",
    image: "https://images.unsplash.com/photo-1534787238916-9ba6764efd4f?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8Y3ljbGluZ3xlbnwwfHwwfHx8Mg%3D%3D",
  },
  {
    activity: "HIKING",
    chinese_title: "4月_動點星期三線上減卡路里",
    english_description: "April_FOODSPORT Wednesday Online Calories Drive",
    dates: "13ᵗʰ Jan 2024 - 26ᵗʰ Jan 2024",
    time: "10:00 a.m. - 7:00 p.m.",
    location: "Hong Kong, Kwun Tong",
    image: "https://images.unsplash.com/photo-1465311440653-ba9b1d9b0f5b?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fGhpa2luZ3xlbnwwfHwwfHx8Mg%3D%3D",
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
