import React, { useState } from "react";
import { Pencil, Eye, TicketCheck } from "lucide-react";
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

    // Helper to capitalize first letter
    const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

    const handleEdit = (e) => {
        e.stopPropagation(); // Prevent row click event
        router.push(`/admin/activities/${activity.id}`);
    };

    const handleViewDetails = (e) => {
        e.stopPropagation(); // Prevent row click event
        router.push(`/admin/activities/viewActivity/${activity.id}`);
    };

    const handleVerifyTicket = (e) => {
        e.stopPropagation();
        router.push(`/admin/activities/verifyTicket?activityId=${activity.id}`);
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
                className="text-base align-middle cursor-pointer hover:bg-purple-100"
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
                        <div className="min-w-[120px] sm:min-w-[160px] md:min-w-[200px]">
                            {/* Provide a minimum width so title doesn't collapse; allow wrapping and limit max width */}
                            <div className="font-bold text-base max-w-[220px] md:max-w-[320px] break-words">
                                {activity.title}
                            </div>
                        </div>
                    </div>
                </td>
                {/* Show activity type */}
                <td className="text-base align-middle">
                    {activity.activityType}
                </td>
                {/* Date & Time column */}
                <td className="text-base align-middle text-center whitespace-nowrap">
                    <div className="flex flex-col items-start justify-center h-full min-h-[64px]">
                        <span>
                            <span className="font-semibold">Start Date:</span>{" "}
                            {activity.startDate
                                ? formatDate(activity.startDate)
                                : ""}
                        </span>
                        <span>
                            <span className="font-semibold">End Date:</span>{" "}
                            {activity.endDate
                                ? formatDate(activity.endDate)
                                : ""}
                        </span>
                        <span>
                            <span className="font-semibold">Start Time:</span>{" "}
                            {activity.startTime
                                ? new Date(
                                      activity.startTime
                                  ).toLocaleTimeString([], {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                  })
                                : ""}
                        </span>
                        <span>
                            <span className="font-semibold">End Time:</span>{" "}
                            {activity.endTime
                                ? new Date(activity.endTime).toLocaleTimeString(
                                      [],
                                      { hour: "2-digit", minute: "2-digit" }
                                  )
                                : ""}
                        </span>
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
                <td className="text-base align-middle text-center whitespace-nowrap">
                    <div
                        className={`badge px-5 py-2 rounded-full font-bold text-base ${
                            statusBadgeClass[activity.status]
                        }`}
                    >
                        {capitalize(activity.status)}
                    </div>
                </td>
                {/* Created At column */}
                <td className="text-base align-middle text-center whitespace-nowrap">
                    {activity.createdAt ? formatDate(activity.createdAt) : ""}
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
                        <button
                            className="btn btn-sm btn-ghost btn-square cursor-pointer"
                            onClick={handleVerifyTicket}
                            title="Verify Ticket"
                            type="button"
                            tabIndex={0}
                        >
                            <TicketCheck />
                        </button>
                    </div>
                </td>
            </tr>
        </>
    );
};

export default ActivityRow;
