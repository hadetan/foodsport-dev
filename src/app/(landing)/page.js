"use client";

import styles from "@/app/shared/css/page.module.css";
import Activity from "@/app/shared/components/Activity";
import ActivityItem from "@/app/shared/components/ActivityItem";
import Hero from "@/app/shared/components/Hero";
import ComingSoon from "@/app/(landing)/Components/ComingSoon";
import { useActivities } from "@/app/shared/contexts/ActivitiesContext";
import ActivityItemSkeleton from "../shared/components/skeletons/ActivityItemSkeleton";
import sortActivities from "@/utils/sortActivities";
import Button from "../shared/components/Button";
import { useRouter } from "next/navigation";

export default function Home() {
    const { activities } = useActivities();
    const router = useRouter();
    const sortedActivities = sortActivities(activities || []);

    return (
        <>
            <Hero />
            <Activity />
            <div className={styles.grid3}>
                {sortedActivities.length === 0
                    ? Array.from({ length: 6 }).map((_, i) => (
                          <ActivityItemSkeleton key={i} />
                      ))
                    : sortedActivities
                          .slice(0, 6)
                          .map((a) => (
                              <ActivityItem
                                  key={a.id}
                                  activity={a}
                              />
                          ))}
            </div>
            <div className={styles.exploreCont}>
				<Button
					className={styles.explore}
					onClick={() => router.push('/activities')}
				>
					EXPLORE MORE ACTIVITIES
				</Button>
			</div>
            <ComingSoon />
        </>
    );
}
