import React from "react";
import { Pencil } from "lucide-react";
import { useRouter } from "next/navigation";

const statusBadgeClass = {
    upcoming: "bg-yellow-400 text-black btn-md",
    active: "bg-green-500 text-white btn-md",
    closed: "bg-gray-500 text-white btn-md",
    completed: "bg-blue-500 text-white btn-md",
    cancelled: "bg-red-700 text-white btn-md",
    draft: "bg-pink-400 text-white btn-md",
};
const ActivityRow = ({ activity, shouldShowEdit, setActivity }) => {
    const router = useRouter();

    const handleEdit = () => {
        shouldShowEdit(true);
        setActivity(activity);
        // Navigate to the edit page
        router.push("/admin/activities?view=edit");
    };
    return (
        <>
            <tr key={activity.id} className="text-base">
                <td>
                    <div className="flex items-center space-x-3">
                        <div className="avatar">
                            <div className="mask mask-squircle w-16 h-16">
                                <img
                                    src={
                                        activity.imageUrl &&
                                        activity.imageUrl !== ""
                                            ? activity.imageUrl
                                            : "/fallback-image.png"
                                    }
                                    alt={activity.title}
                                    className="cursor-pointer hover:opacity-75"
                                    onClick={() => {
                                        if (activity.image) {
                                            setSelectedImage(activity.image);
                                            setIsImageModalOpen(true);
                                        }
                                    }}
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = "/fallback-image.png";
                                    }}
                                />
                            </div>
                        </div>
                        <div>
                            <div className="font-bold text-base">
                                {activity.title}
                            </div>
                        </div>
                    </div>
                </td>
                {/* Show activity type */}
                <td className="text-base">{activity.activityType}</td>
                {/* Show start date */}
                <td className="text-base">
                    {activity.startDate
                        ? new Date(activity.startDate).toLocaleDateString()
                        : ""}
                </td>
                {/* Show end date */}
                <td className="text-base">
                    {activity.endDate
                        ? new Date(activity.endDate).toLocaleDateString()
                        : ""}
                </td>
                {/* Show start time */}
                <td className="text-base">
                    {activity.startTime
                        ? new Date(activity.startTime).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                          })
                        : ""}
                </td>
                {/* Show end time */}
                <td className="text-base">
                    {activity.endTime
                        ? new Date(activity.endTime).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                          })
                        : ""}
                </td>
                <td className="text-base">{activity.location}</td>
                <td>
                    <div className="flex flex-col gap-1">
                        <div className="text-sm">
                            {activity.participantCount}/
                            {activity.participantLimit}
                        </div>
                        <progress
                            className="progress progress-primary w-32 h-4"
                            value={
                                activity.participantLimit
                                    ? (activity.participantCount /
                                          activity.participantLimit) *
                                      100
                                    : 0
                            }
                            max="100"
                        ></progress>
                    </div>
                </td>
                <td>
                    <div
                        className={`badge px-5 py-2 rounded-full font-bold text-base ${
                            statusBadgeClass[activity.status]
                        }`}
                    >
                        {activity.status}
                    </div>
                </td>
                <td>
                    <div className="btn-group">
                        {/* Only show the pencil (edit) icon */}
                        <button
                            className="btn btn-sm btn-ghost"
                            onClick={handleEdit}
                        >
                            <Pencil size={24} />
                        </button>
                    </div>
                </td>
            </tr>
        </>
    );
};

export default ActivityRow;
