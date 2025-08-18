"use client";

import ActivityImg from "@/app/shared/components/Activity";
import ActivityItem from "@/app/shared/components/ActivityItem";
import styles from "@/app/shared/css/page.module.css";
import { useActivities } from "@/app/shared/contexts/ActivitiesContext";
import ActivityItemSkeleton from "@/app/shared/components/skeletons/ActivityItemSkeleton";
import sortActivities from "@/utils/sortActivities";
import ActivitiesFilter from "../../shared/components/ActivitiesFilter";
import { useEffect, useMemo, useState } from "react";
import ActivityNotFound from "@/app/shared/components/ActivityNotFound";

export default function ActivitiesPage() {
    const { activities, loading } = useActivities();
    const sortedActivities = useMemo(() => sortActivities(activities || [], true), [activities]);
    const [filteredActivities, setFilteredActivities] = useState(sortedActivities);

    useEffect(() => {
        setFilteredActivities(sortedActivities);
    }, [sortedActivities]);

    return (
        <div className="main-activities">
            <ActivityImg />
            <ActivitiesFilter activities={sortedActivities} setFilteredActivities={setFilteredActivities} />
            {!activities.length && !loading ? <ActivityNotFound /> : (
                <div className={styles.grid3}>
                    {!sortedActivities.length && loading ? (
                        Array.from({ length: 6 }).map((_, i) => (
                            <ActivityItemSkeleton key={i} />
                        ))
                    ) : (
                        filteredActivities.map((a) => (
                            <ActivityItem key={a.id} activity={a} />
                        ))
                    )}
                </div>)}
        </div>
    );
}
