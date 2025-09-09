"use client";

import styles from "@/app/shared/css/page.module.css";
import Activity from "@/app/shared/components/Activity";
import ActivityItem from "@/app/shared/components/ActivityItem";
import getActivityStatus from "@/utils/getActivityStatus";
import sortFeaturedAndSoonest from "@/utils/sortFeaturedAndSoonest";
import Hero from "@/app/shared/components/Hero";
import ComingSoon from "@/app/(landing)/Components/ComingSoon";
import { useActivities } from "@/app/shared/contexts/ActivitiesContext";
import ActivityItemSkeleton from "../shared/components/skeletons/ActivityItemSkeleton";
import Button from "../shared/components/Button";
import { useRouter } from "next/navigation";

export default function Home() {
    const { activities } = useActivities();
    const router = useRouter();

    const filtered = activities.filter(a => {
        const { status } = getActivityStatus(a);
        return (status === 'upcoming' || status === 'ongoing') && a.status === 'active';
    });
    const sorted = sortFeaturedAndSoonest(filtered);

    return (
        <>
            <Hero />
            <Activity />
            <div className={styles.grid3}>
                {activities.length === 0
                    ? Array.from({ length: 6 }).map((_, i) => (
                        <ActivityItemSkeleton key={i} />
                    ))
                    : sorted
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
