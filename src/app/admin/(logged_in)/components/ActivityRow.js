import React, { useState } from "react";
import { Pencil } from "lucide-react";
import { useRouter } from "next/navigation";
import formatDate from "@/utils/formatDate";

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
    const [showConfirm, setShowConfirm] = useState(false);
    const [isDeleted, setIsDeleted] = useState(false);

    const handleEdit = () => {
        shouldShowEdit(true);
        setActivity(activity);
        // Navigate to the edit page
        router.push("/admin/activities?view=edit");
    };

    const handlePowerClick = () => {
        setShowConfirm(true);
    };

    const handleConfirmYes = () => {
        setIsDeleted(true);
        setShowConfirm(false);
    };

    const handleConfirmNo = () => {
        setShowConfirm(false);
    };

    if (isDeleted) return null;

    return (
        <>
            <tr key={activity.id} className="text-base">
                <td>
                    <div className="flex items-center space-x-3">
                        <div className="avatar">
                            <div className="mask mask-squircle w-16 h-16">
                                <img
                                    src={
                                        activity.imageUrl 
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
                                        e.target.src = null;                                    }}
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
                    {activity.startDate ? formatDate(activity.startDate) : ""}
                </td>
                {/* Show end date */}
                <td className="text-base">
                    {activity.endDate ? formatDate(activity.endDate) : ""}
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
                        <button
                            className="btn btn-sm btn-ghost"
                            onClick={handleEdit}
                        >
                            <Pencil size={24} />
                        </button>
                    </div>
                    {/* Confirmation Popup */}
                    {showConfirm && (
                        <div
                            className="absolute left-1/2 transform -translate-x-1/2 mt-4 z-50"
                            style={{ position: "absolute" }}
                        >
                            <div
                                className="bg-[#6C63FF] rounded-xl shadow-xl p-8 min-w-[340px] flex flex-col items-center animate-zoom-in"
                                style={{
                                    animation:
                                        "zoomIn 0.2s cubic-bezier(0.4,0,0.2,1)",
                                }}
                            >
                                <div className="mb-6 text-lg font-semibold text-white text-center">
                                    Are you sure want to close the activity?
                                </div>
                                <div className="flex gap-4 justify-center">
                                    <button
                                        className="px-6 py-2 rounded-lg font-bold shadow transition bg-white text-[#6C63FF] hover:bg-purple-100 focus:bg-purple-200"
                                        onClick={handleConfirmYes}
                                    >
                                        Yes
                                    </button>
                                    <button
                                        className="px-6 py-2 rounded-lg font-bold shadow transition bg-transparent text-white border border-white hover:bg-white hover:text-[#6C63FF]"
                                        onClick={handleConfirmNo}
                                    >
                                        No
                                    </button>
                                </div>
                            </div>
                            <style jsx>{`
                                @keyframes zoomIn {
                                    0% {
                                        opacity: 0;
                                        transform: scale(0.7);
                                    }
                                    100% {
                                        opacity: 1;
                                        transform: scale(1);
                                    }
                                }
                                .animate-zoom-in {
                                    animation: zoomIn 0.2s
                                        cubic-bezier(0.4, 0, 0.2, 1);
                                }
                            `}</style>
                        </div>
                    )}
                </td>
            </tr>
        </>
    );
};

export default ActivityRow;
