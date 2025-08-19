import React, { useState } from "react";
import { Pencil } from "lucide-react";
import { useRouter } from "next/navigation";
import formatDate from "@/utils/formatDate";

const statusBadgeClass = {
    upcoming: "bg-yellow-400 text-black btn-md",
    active: "bg-green-500 text-white btn-md",
    closed: "bg-gray-500 text-white btn-md",
    completed: "bg-blue-500 text-white btn-md",
    draft: "bg-pink-400 text-white btn-md",
};
const ActivityRow = ({ activity }) => {
    const router = useRouter();

    const handleEdit = () => {
        router.push(`/admin/activities/${activity.id}`);
    };

    return (
        <>
            <tr key={activity.id} className="text-base align-middle">
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
            
            </tr>
             
        </>
    );
};

export default ActivityRow;
