"use client";

import Activity from "@/app/shared/components/Activity";
import ActivityItem from "@/app/shared/components/ActivityItem";
import styles from "@/app/shared/css/page.module.css";
import { useActivities } from "@/app/shared/contexts/ActivitiesContext";
import ActivityItemSkeleton from "@/app/shared/components/skeletons/ActivityItemSkeleton";
import sortActivities from "@/utils/sortActivities";
import ActivitiesFilter from "../Components/ActivitiesFilter";
import { useEffect, useMemo, useState } from "react";

export default function ActivitiesPage() {
    const { activities, loading } = useActivities();
    const sortedActivities = useMemo(() => sortActivities(activities || [], true), [activities]);
    const [filteredActivities, setFilteredActivities] = useState(sortedActivities);

    return (
        <div className="main-activities">
            <Activity />
            <ActivitiesFilter activities={sortedActivities} setFilteredActivities={setFilteredActivities} loading={loading} />
            <div className={styles.grid3}>
                {filteredActivities.length === 0
                    ? Array.from({ length: 6 }).map((_, i) => (
                          <ActivityItemSkeleton key={i} />
                      ))
                    : filteredActivities.map((a) => (
                          <ActivityItem key={a.id} activity={a} />
                      ))}
            </div>
        </div>
    );
}
