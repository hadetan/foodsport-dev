"use client";

import { useActivities } from "@/app/shared/contexts/ActivitiesContext";
import { useParams } from "next/navigation";
import ActivityDetails from "@/app/shared/components/ActivityDetails";
import ActivityDetailsSkeleton from "@/app/shared/components/skeletons/ActivityDetailsSkeleton";
import { HiOutlineEmojiSad } from "react-icons/hi";
import { IoIosArrowBack } from "react-icons/io";
import { useTranslations } from "next-intl";

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
    const t = useTranslations("Activity.DetailsPage");

    if (loading || !activities || !activities.length) {
        return <ActivityDetailsSkeleton />;
    }

    const activity = getActivity(activities, id);

    if (!!activities.length && !activity) {
            return (
                <div className='activityDetailsEmptyState'>
                    <div className='activityDetailsEmptyIcon'>
                        <HiOutlineEmojiSad />
                    </div>
                    <div className='activityDetailsEmptyTitle'>
                        {t("noActivityTitle")}
                    </div>
                    <div className='activityDetailsEmptyDesc'>
                        {t("noActivityDesc").split("\n").map((line, idx) => (
                            <span key={idx}>
                                {line}
                                <br />
                            </span>
                        ))}
                    </div>
                    <button
                        className='activityDetailsEmptyBtn'
                        onClick={() => window.location.href = '/activities'}
                    >
                        <span className='back'>
                            <IoIosArrowBack />
                        </span>{' '}
                        {t("back")}
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
