"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useUsers } from "@/app/shared/contexts/usersContext";
import Avatar from "@/app/shared/components/avatar";
import FullPageLoader from "../../../components/FullPageLoader";
import { Download, Upload, Pencil } from "lucide-react";
import { toast } from "@/utils/Toast";
import axios from '@/utils/axios/api';
import parseUsersFromCsv from "@/utils/parseCsv";
import ActivityDetailsAdmin from "../../../components/ActivityDetailsAdmin";
import { useAdminActivities } from "@/app/shared/contexts/AdminActivitiesContext";

function formatDateTime(startTime, endTime) {
    const formattedStartTime = startTime ? new Date(startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "";
    const formattedEndTime = endTime ? new Date(endTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "";

    return { formattedStartTime, formattedEndTime };
}

const ActivityDetailPage = () => {
    const [activity, setActivity] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showZh, setShowZh] = useState(false);
    const { users } = useUsers();
    const [participatingUsers, setParticipatingUsers] = useState([]);
    const params = useParams();
    const router = useRouter();

    const { activities, loading: activitiesLoading } = useAdminActivities();
    const activityId = params?.id;

    const [activeTab, setActiveTab] = useState("details");
    const fileInputRef = useRef(null);
    const [importing, setImporting] = useState(false);

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

    const handleImportClick = () => fileInputRef.current?.click();

    const handleFileChange = async (e) => {
        const file = e.target.files?.[0];
        e.target.value = "";
        if (!file) return;

        if (!activityId) {
            toast.error("Missing activity id");
            return;
        }

        setImporting(true);
        try {
            const text = await file.text();
            const { users, skipped } = parseUsersFromCsv(text);

            const payloadUsers = users.map((u) => ({
                email: String(u.email ?? ""),
                calories: Number.isFinite(u.calories) ? Number(u.calories) : 0,
                ...(Number.isFinite(u.duration)
                    ? { duration: Number(u.duration) }
                    : {}),
            }));

            const res = await axios.post(
                "/admin/users/rewardCalories",
                { activityId, users: payloadUsers },
                { withCredentials: true }
            );
            const data = res?.data || {};

            const results = Array.isArray(data?.results) ? data.results : [];
            const successCount = results.filter((r) => r.success).length;
            const failCount = results.length - successCount;
            const skippedCount = skipped.length;
            const totalProcessed = results.length;

            toast.success(
                `Import complete. Rewarded ${successCount}/${totalProcessed}. Skipped ${failCount + skippedCount
                }.`
            );
        } catch (err) {
            const msg = err?.response?.data?.error || "Import failed";
            toast.error(msg);
        } finally {
            setImporting(false);
        }
    };

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
                    The activity you are looking for does not exist or has been removed.
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

    const canImportExport =
        activity?.status === "cancelled" || activity?.status === "closed";

    const { formattedStartTime, formattedEndTime } = formatDateTime(
        activity.startTime,
        activity.endTime
    );

    const handleExportUsers = () => {
        if (!activity) {
            toast.error("No activity data to export");
            return;
        }
        if (!participatingUsers || participatingUsers.length === 0) {
            toast.error("No participating users to export");
            return;
        }

        const escapeCsv = (value) => {
            if (value === null || value === undefined) return '""';
            const s = String(value);
            return `"${s.replace(/"/g, '""')}"`;
        };

        const matchId = (val) => {
            if (!val) return false;
            const id = activityId?.toString();
            return (val === activityId || val?.toString?.() === id || val?.id?.toString?.() === id || val?.activityId?.toString?.() === id || val?.activity?.id?.toString?.() === id);
        };

        const findActivityJoin = (user) => {
            const arr = Array.isArray(user?.joinedActivities) ? user.joinedActivities : [];
            return (arr.find(matchId) || {});
        };

        const headers = ["firstname", "lastname", "email", "Registered", "gender", "height", "weight", "dob", "totalDuration", "totalCaloriesBurned"];
        const userHeader = headers.map((h) => `"${h}"`).join(",");

        const userRows = participatingUsers.map((user) => {
            const values = [
                user?.firstname ?? "", user?.lastname ?? "", user?.email ?? "", user?.isRegistered ? "Yes" : "No",
                user?.gender ?? "Not specified", user?.height ?? "", user?.weight ?? "", user?.dateOfBirth ?? "", "", "",
            ];
            return values.map(escapeCsv).join(",");
        }
        );

        const activityHeader = `"id","title"`;
        const activityRow = [activity?.id ?? "", activity?.title ?? ""].map(escapeCsv).join(",");

        let usersSection = "";
        if (userRows.length > 0) {
            usersSection = "\r\n\r\nParticipating Users\r\n" + userHeader + "\r\n" + userRows.join("\r\n");
        }

        const csvContent = activityHeader + "\r\n" + activityRow + usersSection;

        const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `activity_${activityId}_users.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    return (
        <div className="w-full min-h-screen bg-white">
            {/* Heading and Navigation Buttons */}
            <div className="container mx-auto px-4 pt-6 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <button
                        className="flex items-center bg-indigo-500 hover:bg-indigo-600 text-white font-medium px-5 py-2 rounded-lg shadow transition-colors mb-4 cursor-pointer"
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
                    <h2 className="text-xl font-bold text-gray-800 mb-2 mx-10">
                        VIEW ACTIVITY
                    </h2>
                </div>
                {/* Show Edit Activity button only in details tab, top right */}
                {activeTab === "details" && (
                    <div className="flex items-center gap-2">
                        <button
                            className="flex items-center bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium px-4 py-2 rounded-lg shadow transition-colors cursor-pointer"
                            onClick={() => setShowZh((s) => !s)}
                            title="Toggle Chinese view"
                        >
                            {/* simple label - not using i18n here as requested */}
                            {showZh ? "Show EN" : "Show ZH"}
                        </button>

                        <button
                            className="flex items-center bg-blue-500 hover:bg-blue-600 text-white font-medium px-5 py-2 rounded-lg shadow transition-colors cursor-pointer"
                            onClick={() =>
                                router.push(`/admin/activities/${activity?.id}`)
                            }
                        >
                            <Pencil className="w-5 h-5 mr-2" />
                            Edit Activity
                        </button>
                    </div>
                )}
            </div>

            {/* Tabs - just below navigation */}
            <div className="container mx-auto px-4 mt-4 mb-8">
                <div
                    role="tablist"
                    className="tabs tabs-border border-b border-blue-200"
                >
                    <a
                        role="tab"
                        className={`tab ${activeTab === "details"
                            ? "tab-active text-blue-600"
                            : "text-gray-500 hover:text-blue-600"
                            }`}
                        onClick={() => setActiveTab("details")}
                    >
                        Activity Details
                    </a>
                    <a
                        role="tab"
                        className={`tab ${activeTab === "users"
                            ? "tab-active text-blue-600"
                            : "text-gray-500 hover:text-blue-600"
                            }`}
                        onClick={() => setActiveTab("users")}
                    >
                        Users Joined
                    </a>
                </div>
            </div>

            {/* Header Section with Image and Activity Details Side by Side */}
            {activeTab === "details" && (
                <div className="container mx-auto py-8 ">
                    <ActivityDetailsAdmin
                        activity={activity}
                        formattedStartTime={formattedStartTime}
                        formattedEndTime={formattedEndTime}
                        showZh={showZh}
                    />
                </div>
            )}

            {/* Tab Panels */}
            <div className="container mx-auto px-4">
                <div className="w-full">
                    {activeTab === "users" && (
                        <div>
                            {/* Import/Export buttons only when status is cancelled or closed */}
                            <div className="flex items-center justify-end gap-2 mb-6">
                                {canImportExport && (
                                    <>
                                        <button
                                            className="flex items-center bg-blue-500 hover:bg-blue-600 text-white font-medium px-4 py-2 rounded-lg shadow transition-colors disabled:opacity-60"
                                            onClick={handleImportClick}
                                            disabled={importing}
                                            title="Import"
                                        >
                                            <Download className="w-5 h-5 mr-2" />
                                            {importing
                                                ? "Importing..."
                                                : "Import"}
                                        </button>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept=".csv,text/csv"
                                            className="hidden"
                                            onChange={handleFileChange}
                                        />
                                        <button
                                            className="flex items-center bg-blue-500 hover:bg-blue-600 text-white font-medium px-4 py-2 rounded-lg shadow transition-colors"
                                            onClick={handleExportUsers}
                                            title="Export Users"
                                        >
                                            <Upload className="w-5 h-5 mr-2" />
                                            Export Users
                                        </button>
                                    </>
                                )}
                            </div>
                            {/* Participating Users Table */}
                            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-200">
                                    <h2 className="text-xl font-bold text-gray-800">
                                        Participating Users (
                                        {participatingUsers.length})
                                    </h2>
                                </div>

                                {participatingUsers.length === 0 ? (
                                    <div className="px-6 py-8 text-center">
                                        <p className="text-gray-500 text-lg">
                                            No users have joined this activity yet.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        User
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Email
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Gender
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Height/Weight
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Register Date
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Activities
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {participatingUsers.map(
                                                    (user) => (
                                                        <tr
                                                            key={user.id}
                                                            className="hover:bg-gray-50"
                                                        >
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <div className="flex items-center">
                                                                    <div className="flex-shrink-0">
                                                                        <Avatar
                                                                            src={
                                                                                user.profilePicture ||
                                                                                user.profilePictureUrl ||
                                                                                null
                                                                            }
                                                                            srcAvatar={
                                                                                user.profilePicture ||
                                                                                user.profilePictureUrl ||
                                                                                null
                                                                            }
                                                                            firstName={
                                                                                user.firstname ||
                                                                                ""
                                                                            }
                                                                            lastName={
                                                                                user.lastname ||
                                                                                ""
                                                                            }
                                                                            alt={`${user.firstname ||
                                                                                "User"
                                                                                } ${user.lastname ||
                                                                                ""
                                                                                }`}
                                                                            size="40"
                                                                        />
                                                                    </div>
                                                                    <div className="ml-4">
                                                                        <div className="text-sm font-medium text-gray-900">
                                                                            {(user.firstname ||
                                                                                "") +
                                                                                (user.lastname
                                                                                    ? ` ${user.lastname}`
                                                                                    : user.firstname
                                                                                        ? ""
                                                                                        : "N/A")}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <div className="text-sm text-gray-900">
                                                                    {user.email ||
                                                                        "N/A"}
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <div className="text-sm text-gray-900">
                                                                    {user.gender ||
                                                                        "Not specified"}
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <div className="text-sm text-gray-900">
                                                                    {user.height
                                                                        ? `${user.height} CM`
                                                                        : "N/A"}{" "}
                                                                    /{" "}
                                                                    {user.weight
                                                                        ? `${user.weight} KG`
                                                                        : "N/A"}
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <div className="text-sm text-gray-900">
                                                                    {(() => {
                                                                        const dt =
                                                                            user.joinedDate ||
                                                                            user.joinDate ||
                                                                            user.createdAt;
                                                                        return dt
                                                                            ? formatDate(
                                                                                dt
                                                                            )
                                                                            : "Not specified";
                                                                    })()}
                                                                </div>
                                                            </td>
                                                            {/* Stats */}
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <div className="text-sm text-gray-900">
                                                                    {user.stats
                                                                        ?.totalActivities ??
                                                                        user.totalActivities ??
                                                                        0}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    )
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>

                            {/* Removed participating users list to match the image */}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ActivityDetailPage;
