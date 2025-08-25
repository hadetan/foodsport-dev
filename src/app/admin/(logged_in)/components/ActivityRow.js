import React, { useState } from "react";
import { Pencil, Eye } from "lucide-react";
import { useRouter } from "next/navigation";
import formatDate from "@/utils/formatDate";

const statusBadgeClass = {
    upcoming: "bg-yellow-400 text-black btn-md",
    active: "bg-green-500 text-white btn-md",
    closed: "bg-gray-500 text-white btn-md",
    completed: "bg-blue-500 text-white btn-md",
    draft: "bg-pink-400 text-white btn-md",
};
const ActivityRow = ({ activity, onRowClick }) => {
    const router = useRouter();

    const handleEdit = (e) => {
        e.stopPropagation(); // Prevent row click event
        router.push(`/admin/activities/${activity.id}`);
    };

    const handleViewDetails = (e) => {
        e.stopPropagation(); // Prevent row click event
        router.push(`/admin/activities/viewActivity/${activity.id}`);
    };

    const handleRowClick = () => {
        if (onRowClick) {
            onRowClick(activity);
        } else {
            // If no onRowClick provided, navigate to view details
            router.push(`/admin/activities/viewActivity/${activity.id}`);
        }
    };

    return (
        <>
            <tr
                key={activity.id}
                className="text-base align-middle cursor-pointer hover:bg-base-200"
                onClick={handleRowClick}
            >
                <td className="align-middle">
                    <div className="flex items-center space-x-3">
                        <div className="avatar">
                            <div className="mask mask-squircle w-16 h-16">
                                <img
                                    src={activity.imageUrl}
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
                                        e.target.src = null;
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
                <td className="text-base align-middle">
                    {activity.activityType}
                </td>
                {/* Show start date */}
                <td className="text-base align-middle text-center whitespace-nowrap">
                    <div className="flex items-center justify-center h-full min-h-[64px]">
                        {activity.startDate
                            ? formatDate(activity.startDate)
                            : ""}
                    </div>
                </td>
                {/* Show end date */}
                <td className="text-base align-middle text-center whitespace-nowrap">
                    <div className="flex items-center justify-center h-full min-h-[64px]">
                        {activity.endDate ? formatDate(activity.endDate) : ""}
                    </div>
                </td>
                {/* Show start time */}
                <td className="text-base align-middle text-center whitespace-nowrap">
                    <div className="flex items-center justify-center h-full min-h-[64px]">
                        {activity.startTime
                            ? new Date(activity.startTime).toLocaleTimeString(
                                  [],
                                  {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                  }
                              )
                            : ""}
                    </div>
                </td>
                {/* Show end time */}
                <td className="text-base align-middle text-center whitespace-nowrap">
                    <div className="flex items-center justify-center h-full min-h-[64px]">
                        {activity.endTime
                            ? new Date(activity.endTime).toLocaleTimeString(
                                  [],
                                  {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                  }
                              )
                            : ""}
                    </div>
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
                    <div className="flex flex-row items-center justify-center gap-2">
                        <button
                            className="btn btn-sm btn-ghost btn-square"
                            onClick={handleViewDetails}
                            title="View Activity Details"
                        >
                            <Eye size={25} className="text-black-400" />
                        </button>
                        <button
                            className="btn btn-sm btn-ghost btn-square"
                            onClick={handleEdit}
                            title="Edit Activity"
                        >
                            <Pencil size={25} className="text-black-400" />
                        </button>
                    </div>
                </td>
            </tr>
             
        </>
    );
};

export default ActivityRow;
