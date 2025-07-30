"use client";

import Activity from "@/app/shared/components/Activity";
import ActivityItem from "@/app/shared/components/ActivityItem";
import styles from "@/app/shared/css/page.module.css";
import { useActivities } from "@/app/shared/contexts/ActivitiesContext";
import ActivityItemSkeleton from "@/app/shared/components/skeletons/ActivityItemSkeleton";

export default function ActivitiesPage() {
    const { activities } = useActivities();

    return (
        <div className="main-activities">
            <Activity />
            <div className={styles.grid3}>
                {activities.length === 0
                    ? Array.from({ length: 6 }).map((_, i) => (
                          <ActivityItemSkeleton key={i} />
                      ))
                    : activities.map((a) => (
                          <ActivityItem key={a.id} activity={a} />
                      ))}
            </div>
        </div>
    );
}
