"use client";

import Activity from "@/app/shared/components/Activity";
import ActivityItem from "@/app/shared/components/ActivityItem";
import styles from "@/app/shared/css/page.module.css";
import { useActivities } from "@/app/shared/contexts/ActivitiesContext";
import ActivityItemSkeleton from "@/app/shared/components/skeletons/ActivityItemSkeleton";
import sortActivities from "@/utils/sortActivities";

export default function ActivitiesPage() {
    const { activities } = useActivities();
    const sortedActivities = sortActivities(activities || [], true);
    return (
        <div className="main-activities">
            <Activity />
            <div className={styles.grid3}>
                {sortedActivities.length === 0
                    ? Array.from({ length: 6 }).map((_, i) => (
                          <ActivityItemSkeleton key={i} />
                      ))
                    : sortedActivities.map((a) => (
                          <ActivityItem key={a.id} activity={a} />
                      ))}
            </div>
        </div>
    );
}
