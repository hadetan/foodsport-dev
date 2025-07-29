"use client";

import { useEffect, useRef } from "react";
import { useActivities } from "@/app/shared/contexts/ActivitiesContext";
import { useParams } from "next/navigation";
import ActivityDetails from "@/app/shared/components/ActivityDetails";

function getActivity(activities, id) {
    return activities.find((activity) => activity.id === id);
}

function formatDateTime(startTime, endTime) {
    const formattedStartTime = startTime
        ? new Date(startTime).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
          })
        : "";
    const formattedEndTime = endTime
        ? new Date(endTime).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
          })
        : "";

    return {
        formattedStartTime,
        formattedEndTime,
    };
}

export default function ActivityDetailsPage() {
    const { activities } = useActivities();
    const { id } = useParams();
    const activity = getActivity(activities, id);

    const topRef = useRef(null);
    useEffect(() => {
        if (topRef.current) {
            topRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [activity]);
    if (!activity) return <div>No activity found.</div>;

    const { formattedStartTime, formattedEndTime } = formatDateTime(
        activity.startDate,
        activity.endDate,
        activity.startTime,
        activity.endTime
    );

    return (
        <ActivityDetails
            activity={activity}
            formattedStartTime={formattedStartTime}
            formattedEndTime={formattedEndTime}
        />
    );
}
