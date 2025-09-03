"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useUsers } from "@/app/shared/contexts/usersContext";
import Avatar from "@/app/shared/components/avatar";
import FullPageLoader from "../../../components/FullPageLoader";
import { useActivities } from "@/app/shared/contexts/ActivitiesContext";
import { Download, Upload } from "lucide-react";
import { toast } from "@/utils/Toast";
import axios from "axios";

const ActivityDetailPage = () => {
    const [activity, setActivity] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { users } = useUsers();
    const [participatingUsers, setParticipatingUsers] = useState([]);
    const params = useParams();
    const router = useRouter();

    const { activities, loading: activitiesLoading } = useActivities();
    const activityId = params?.id;

    const [showVerifyDropdown, setShowVerifyDropdown] = useState(false);
    const [ticketCode, setTicketCode] = useState("");
    const [verifying, setVerifying] = useState(false);
    const [verifyError, setVerifyError] = useState(null);
    const [verifySuccess, setVerifySuccess] = useState(null);

    const handleVerify = async () => {
        setVerifying(true);
        setVerifyError(null);
        setVerifySuccess(null);
        try {
            const res = await axios.post("/api/admin/verifyTicket", {
                activityId,
                ticketCode: ticketCode.trim(),
            });
            const data = res.data;
            setVerifySuccess(data.message || "Ticket verified successfully!");
            setTicketCode("");
        } catch (error) {
            if (
                error.response &&
                error.response.data &&
                error.response.data.error
            ) {
                setVerifyError(error.response.data.error);
            } else {
                setVerifyError("An error occurred while verifying the ticket.");
            }
        } finally {
            setVerifying(false);
        }
    };

    // Filter users who have joined this activity
    useEffect(() => {
        if (users && users.length > 0 && activityId) {
            const filteredUsers = users.filter(
                (user) =>
                    user.joinedActivities &&
                    Array.isArray(user.joinedActivities) &&
                    user.joinedActivities.some(
                        (activity) =>
                            activity === activityId ||
                            activity.id === activityId
                    )
            );
            setParticipatingUsers(filteredUsers);
        }
    }, [users, activityId]);

    useEffect(() => {
        if (!activityId || activitiesLoading) return;
        setLoading(true);
        setError(null);
        // Find the activity from the activities context
        const found = activities?.find(
            (a) =>
                a.id === activityId ||
                a.id?.toString() === activityId?.toString()
        );
        if (found) {
            setActivity(found);
            setLoading(false);
        } else {
            setActivity(null);
            setLoading(false);
        }
    }, [activityId, activities, activitiesLoading]);

    if (loading) {
        return <FullPageLoader />;
    }

    if (error) {
        return (
            <div
                className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 my-4"
                role="alert"
            >
                <p className="font-bold">Error</p>
                <p>{error}</p>
            </div>
        );
    }

    if (!activity) {
        return (
            <div className="text-center py-10">
                <h2 className="text-2xl font-bold text-gray-700">
                    Activity not found
                </h2>
                <p className="text-gray-500">
                    The activity you are looking for does not exist or has been
                    removed.
                </p>
            </div>
        );
    }

    const formatDate = (dateString) => {
        if (!dateString) return "Not specified";
        const options = { year: "numeric", month: "long", day: "numeric" };
        return new Date(dateString).toLocaleDateString("en-US", options);
    };

    const formatTime = (dateString) => {
        if (!dateString) return "Not specified";
        const options = { hour: "2-digit", minute: "2-digit", hour12: false };
        return new Date(dateString).toLocaleTimeString("en-US", options);
    };

    return (
        <div className="w-full min-h-screen bg-white">
            {/* Navigation Buttons */}
            <div className="container mx-auto px-4 pt-6 flex justify-between items-center">
                <button
                    className="flex items-center bg-indigo-500 hover:bg-indigo-600 text-white font-medium px-5 py-2 rounded-lg shadow transition-colors mb-4"
                    onClick={() => router.push("/admin/activities")}
                >
                    <svg
                        className="w-5 h-5 mr-2"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15 19l-7-7 7-7"
                        />
                    </svg>
                    Back
                </button>
                <div className="flex items-center gap-2">
                    <button
                        className="flex items-center bg-blue-500 hover:bg-blue-600 text-white font-medium px-4 py-2 rounded-lg shadow transition-colors mb-4"
                        onClick={() => {
                            /* handle import */
                        }}
                        title="Import"
                    >
                        <Upload className="w-5 h-5 mr-2" />
                        Import
                    </button>
                    <button
                        className="flex items-center bg-blue-500 hover:bg-blue-600 text-white font-medium px-4 py-2 rounded-lg shadow transition-colors mb-4"
                        onClick={() => {
                            // Export selected activity details and participating users as CSV
                            if (!activity) {
                                toast.error("No activity data to export");
                                return;
                            }

                            // Activity fields to export
                            const activityFields = [
                                "id",
                                "title",
                                "description",
                                "activityType",
                                "location",
                                "startDate",
                                "endDate",
                                "startTime",
                                "endTime",
                                "caloriesPerHour",
                            ];
                            const activityHeader = activityFields
                                .map((field) => `"${field}"`)
                                .concat(['"duration"', '"calories"']) // add empty columns
                                .join(",");
                            const activityRow = activityFields
                                .map((field) =>
                                    activity[field] !== undefined &&
                                    activity[field] !== null
                                        ? `"${String(activity[field]).replace(
                                              /"/g,
                                              '""'
                                          )}"`
                                        : ""
                                )
                                .concat(["", ""]) // empty duration and calories
                                .join(",");

                            // Participating users fields to export
                            const userFields = [
                                "firstname",
                                "lastname",
                                "email",
                                "joinedDate",
                                "height",
                                "weight",
                                "dob",
                                "gender",
                            ];
                            const userHeader = userFields
                                .map((field) => `"${field}"`)
                                .join(",");
                            const userRows =
                                participatingUsers &&
                                participatingUsers.length > 0
                                    ? participatingUsers.map((user) =>
                                          userFields
                                              .map((key) =>
                                                  user[key] !== undefined &&
                                                  user[key] !== null
                                                      ? `"${String(
                                                            user[key]
                                                        ).replace(/"/g, '""')}"`
                                                      : ""
                                              )
                                              .join(",")
                                      )
                                    : [];

                            let usersSection = "";
                            if (userRows.length > 0) {
                                usersSection =
                                    "\r\n\r\nParticipating Users\r\n" +
                                    userHeader +
                                    "\r\n" +
                                    userRows.join("\r\n");
                            }

                            const csvContent =
                                "Activity Details\r\n" +
                                activityHeader +
                                "\r\n" +
                                activityRow +
                                usersSection;

                            const blob = new Blob([csvContent], {
                                type: "text/csv;charset=utf-8;",
                            });
                            const url = URL.createObjectURL(blob);
                            const link = document.createElement("a");
                            link.href = url;
                            link.setAttribute(
                                "download",
                                `activity_${activityId}_details_and_users.csv`
                            );
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                            URL.revokeObjectURL(url);
                        }}
                        title="Export Activity Details & Users"
                    >
                        <Download className="w-5 h-5 mr-2" />
                        Export Activity
                    </button>
                </div>
                <button
                    className="flex items-center bg-blue-500 hover:bg-blue-600 text-white font-medium px-5 py-2 rounded-lg shadow transition-colors mb-4"
                    onClick={() =>
                        router.push(`/admin/activities/${activity?.id}`)
                    }
                >
                    <svg
                        className="w-5 h-5 mr-2"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                        />
                    </svg>
                    Edit Activity
                </button>
            </div>

            {/* Verify Tickets Dropdown Card */}
            <div className="container mx-auto px-4 pt-4">
                <div className="max-w-xl mx-auto mb-8">
                    <div className="bg-white rounded-lg shadow border border-gray-200">
                        <button
                            className="w-full flex justify-between items-center px-6 py-4 focus:outline-none"
                            onClick={() =>
                                setShowVerifyDropdown((prev) => !prev)
                            }
                            aria-expanded={showVerifyDropdown}
                        >
                            <div>
                                <span className="text-lg font-semibold text-gray-800">
                                    Verify tickets
                                </span>
                                <div className="text-xs text-gray-400 mt-1">
                                    Click to expand
                                </div>
                            </div>
                            <svg
                                className={`w-5 h-5 ml-2 transition-transform duration-200 ${
                                    showVerifyDropdown ? "rotate-180" : ""
                                }`}
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={2}
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M19 9l-7 7-7-7"
                                />
                            </svg>
                        </button>
                        {showVerifyDropdown && (
                            <div className="px-6 pb-6 pt-2">
                                {verifyError && (
                                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4 text-sm">
                                        {verifyError}
                                    </div>
                                )}
                                <div className="flex flex-col sm:flex-row items-end gap-2">
                                    <input
                                        type="text"
                                        className="flex-1 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50"
                                        placeholder="Enter ticket code"
                                        value={ticketCode}
                                        onChange={(e) =>
                                            setTicketCode(e.target.value)
                                        }
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter")
                                                handleVerify();
                                        }}
                                    />
                                    <button
                                        className="ml-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2 rounded shadow disabled:opacity-60"
                                        onClick={handleVerify}
                                        disabled={verifying}
                                    >
                                        {verifying ? "Verifying..." : "Verify"}
                                    </button>
                                </div>
                                {verifySuccess && (
                                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded mt-4 text-sm">
                                        {verifySuccess}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Header Section with Image and Activity Details Side by Side */}
            <div className="container mx-auto px-4 py-8 ">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8 ">
                    {/* Cover Image - Takes 2/3 of the width on large screens */}
                    <div className="lg:col-span-2 border-2">
                        <div
                            className="relative w-full"
                            style={{ aspectRatio: "16/9" }}
                        >
                            {activity.imageUrl ? (
                                <Image
                                    src={activity.imageUrl}
                                    alt={activity.title}
                                    fill
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                                    className="object-cover rounded-lg"
                                    priority
                                />
                            ) : (
                                <div className="absolute inset-0 w-full h-full bg-gray-200 flex items-center justify-center">
                                    <p className="text-gray-500">
                                        No image available
                                    </p>
                                </div>
                            )}
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                                {/* Title */}
                                <h1 className="text-3xl md:text-4xl font-bold text-white">
                                    {activity.title}
                                </h1>
                                {/* Date and status badge, styled like the card preview */}
                                <div className="flex items-center mt-2">
                                    <span className="text-white text-base mr-4">
                                        {activity.startDate
                                            ? formatDate(activity.startDate)
                                            : "Date not specified"}
                                    </span>
                                    {activity.status && (
                                        <span
                                            className={`ml-2 px-3 py-1 rounded-full text-xs font-semibold
                                            ${
                                                activity.status === "active"
                                                    ? "bg-green-600 text-white"
                                                    : activity.status ===
                                                      "inactive"
                                                    ? "bg-gray-400 text-white"
                                                    : "bg-yellow-500 text-white"
                                            }`}
                                        >
                                            {activity.status}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Activity Details - Takes 1/3 of the width on large screens */}
                    <div>
                        <div className="bg-white rounded-lg shadow-md p-6 h-full">
                            <h2 className="text-xl font-bold mb-4 text-gray-800">
                                Activity Details
                            </h2>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-sm text-gray-500">
                                        Type
                                    </p>
                                    <p className="font-medium text-gray-800">
                                        {activity.activityType}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">
                                        Location
                                    </p>
                                    <p className="font-medium text-gray-800">
                                        {activity.location}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">
                                        Start Date
                                    </p>
                                    <p className="font-medium text-gray-800">
                                        {formatDate(activity.startDate)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">
                                        End Date
                                    </p>
                                    <p className="font-medium text-gray-800">
                                        {formatDate(activity.endDate)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">
                                        Start Time
                                    </p>
                                    <p className="font-medium text-gray-800">
                                        {formatTime(activity.startTime)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">
                                        End Time
                                    </p>
                                    <p className="font-medium text-gray-800">
                                        {formatTime(activity.endTime)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">
                                        Participant Limit
                                    </p>
                                    <p className="font-medium text-gray-800">
                                        {activity.participantLimit ??
                                            "Not specified"}
                                    </p>
                                </div>
                                <div></div>
                                <div>
                                    <p className="text-sm text-gray-500">
                                        Calories Per Hour
                                    </p>
                                    <p className="font-medium text-gray-800">
                                        {activity.caloriesPerHour ??
                                            "Not specified"}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">
                                        Featured
                                    </p>
                                    <p className="font-medium text-gray-800">
                                        {activity.isFeatured ? "Yes" : "No"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="w-full">
                    {/* Description */}
                    <div className="bg-white rounded-lg shadow-md p-6 mb-8 w-full">
                        <h2 className="text-2xl font-bold mb-4 text-gray-800">
                            Description
                        </h2>
                        <div className="prose max-w-none">
                            {activity.description ? (
                                <p className="text-gray-700 whitespace-pre-line">
                                    {activity.description}
                                </p>
                            ) : (
                                <p className="text-gray-500 italic">
                                    No description provided
                                </p>
                            )}
                        </div>
                    </div>
                    {/* Participating Users */}
                    <div className="bg-white rounded-lg shadow-md p-6 mb-8 w-full">
                        <h2 className="text-2xl font-bold mb-4 text-gray-800">
                            Participating Users - {participatingUsers.length}
                        </h2>
                        {participatingUsers && participatingUsers.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {participatingUsers.map((user, index) => {
                                    let firstName = "";
                                    let lastName = "";
                                    if (user.firstname && user.lastname) {
                                        firstName = user.firstname;
                                        lastName = user.lastname;
                                    }
                                    return (
                                        <div
                                            key={index}
                                            className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg"
                                        >
                                            <Avatar
                                                srcAvatar={user.avatar}
                                                firstName={firstName}
                                                lastName={lastName}
                                                size="12"
                                            />
                                            <div>
                                                <p className="font-medium text-gray-800">
                                                    {`${firstName} ${lastName}`}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    {user.email}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <p className="text-gray-500 italic">
                                No users have joined this activity yet
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ActivityDetailPage;
