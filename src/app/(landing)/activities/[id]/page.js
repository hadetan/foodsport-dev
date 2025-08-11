"use client";

import { useEffect, useRef } from "react";
import { useActivities } from "@/app/shared/contexts/ActivitiesContext";
import { useParams } from "next/navigation";
import ActivityDetails from "@/app/shared/components/ActivityDetails";
import ActivityDetailsSkeleton from "@/app/shared/components/skeletons/ActivityDetailsSkeleton"; // Import skeleton loader
import { HiOutlineEmojiSad } from "react-icons/hi";
import { IoIosArrowBack } from "react-icons/io";

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
    const { activities, loading } = useActivities();
    const { id } = useParams();

    if (loading || !activities || !activities.length) {
        return <ActivityDetailsSkeleton />;
    }

    const activity = getActivity(activities, id);

    const topRef = useRef(null);
    useEffect(() => {
        if (topRef.current) {
            topRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [activity]);
    if (!!activities.length && !activity) {
            return (
                <div className='activityDetailsEmptyState'>
                    <div className='activityDetailsEmptyIcon'>
                        <HiOutlineEmojiSad />
                    </div>
                    <div className='activityDetailsEmptyTitle'>
                        No Activity Found
                    </div>
                    <div className='activityDetailsEmptyDesc'>
                        We couldn't find the activity you're looking for.
                        <br />
                        Please check the link again.
                    </div>
                    <button
                        className='activityDetailsEmptyBtn'
                        onClick={() => window.history.back()}
                    >
                        <span className='back'>
                            <IoIosArrowBack />
                        </span>{' '}
                        Go Back
                    </button>
                </div>
            );
    }

    const { formattedStartTime, formattedEndTime } = formatDateTime(
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
