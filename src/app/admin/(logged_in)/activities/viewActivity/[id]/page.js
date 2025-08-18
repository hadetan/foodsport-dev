"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useUsers } from "@/app/shared/contexts/usersContenxt";
import Avatar from "@/app/shared/components/avatar";

const ActivityDetailPage = () => {
    const [activity, setActivity] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { users, loading: usersLoading } = useUsers();
    const [participatingUsers, setParticipatingUsers] = useState([]);
    const params = useParams();
    const router = useRouter();

    // Fix: Always treat params as an object, not a Promise (client component)
    const activityId = params?.id;

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
        if (!activityId) return;
        const fetchActivityDetails = async () => {
            try {
                setLoading(true);
                setError(null);
                // Fetch activity details from API
                const response = await fetch(`/api/activities/${activityId}`);
                if (!response.ok) {
                    const contentType = response.headers.get("content-type");
                    if (
                        contentType &&
                        contentType.indexOf("text/html") !== -1
                    ) {
                        throw new Error(
                            "Received HTML response instead of JSON"
                        );
                    }
                    try {
                        const errorData = await response.json();
                        throw new Error(
                            errorData.error ||
                                "Failed to fetch activity details"
                        );
                    } catch (jsonError) {
                        throw new Error(`Server error: ${response.status}`);
                    }
                }
                const data = await response.json();
                // Compose activity object with all possible fields
                const a = data.activity || {};
                console.log("Activity data:", a); // <-- log activity data for debugging
                setActivity({
                    id: a.id,
                    title: a.title || `Activity ${activityId}`,
                    description: a.description || "No description provided",
                    content: a.content || "No content provided",
                    status: a.status || "active",
                    createdAt: a.createdAt || new Date().toISOString(),
                    location: a.location || "Not specified",
                    category: a.activityType || "Uncategorized",
                    participantCount: a.participantCount ?? 0,
                    participantLimit: a.participantLimit ?? 0,
                    date: a.startDate || null,
                    duration: a.duration || null,
                    tags: a.tags || [],
                    // Prefer imageUrl, fallback to coverImage
                    coverImage: a.imageUrl || a.coverImage || null,
                    media: a.media || [],
                    startTime: a.startTime || a.date || a.start_time || null,
                    endTime: a.endTime || a.endDate || a.end_time || null,
                });
            } catch (err) {
                console.error("Error fetching activity:", err);
                setError(err.message);

                // For development purposes - create mock data when API fails
                if (process.env.NODE_ENV === "development") {
                    console.log("Using mock data for development");
                    setActivity({
                        id: activityId,
                        title: `Activity ${activityId}`,
                        description:
                            "This is a mock activity description since the API call failed.",
                        content: "Mock content for development purposes.",
                        status: "active",
                        createdAt: new Date().toISOString(),
                        location: "Mock Location",
                        category: "Development",
                        participantCount: 5,
                        participantLimit: 15,
                        // Add other needed fields here
                    });
                    setError(null);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchActivityDetails();
    }, [activityId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
            </div>
        );
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
        const options = { year: "numeric", month: "long", day: "numeric" };
        return new Date(dateString).toLocaleDateString("en-US", options);
    };

    const formatTime = (dateString) => {
        if (!dateString) return null;
        const options = { hour: "2-digit", minute: "2-digit", hour12: false };
        return new Date(dateString).toLocaleTimeString("en-US", options);
    };

    return (
        <div className="w-full min-h-screen bg-gray-900 dark:bg-gray-950">
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

            {/* Header Section with Image and Activity Details Side by Side */}
            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                    {/* Cover Image - Takes 2/3 of the width on large screens */}
                    <div className="lg:col-span-2">
                        <div
                            className="relative w-full"
                            style={{ aspectRatio: "16/9" }}
                        >
                            {activity.coverImage ? (
                                <Image
                                    src={activity.coverImage}
                                    alt={activity.title}
                                    fill
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                                    className="object-cover rounded-lg"
                                    priority
                                />
                            ) : (
                                <div className="absolute inset-0 w-full h-full bg-gray-200 flex items-center justify-center">
                                    <p className="text-gray-500">
                                        No cover image available
                                    </p>
                                </div>
                            )}
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                                <h1 className="text-3xl md:text-4xl font-bold text-white">
                                    {activity.title}
                                </h1>
                                <div className="flex items-center mt-2 text-white/90">
                                    <span className="mr-4">
                                        {formatDate(activity.createdAt)}
                                    </span>
                                    <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm">
                                        {activity.status || "Active"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Activity Details - Takes 1/3 of the width on large screens */}
                    <div>
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 h-full">
                            <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100">
                                Activity Details
                            </h2>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Category
                                    </p>
                                    <p className="font-medium text-gray-800 dark:text-gray-200">
                                        {activity.category || "Uncategorized"}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Location
                                    </p>
                                    <p className="font-medium text-gray-800 dark:text-gray-200">
                                        {activity.location || "Not specified"}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Date
                                    </p>
                                    <p className="font-medium text-gray-800 dark:text-gray-200">
                                        {activity.date
                                            ? formatDate(activity.date)
                                            : "Not specified"}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Start Time
                                    </p>
                                    <p className="font-medium text-gray-800 dark:text-gray-200">
                                        {activity.startTime
                                            ? formatTime(activity.startTime)
                                            : activity.date
                                            ? formatTime(activity.date)
                                            : "Not specified"}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        End Time
                                    </p>
                                    <p className="font-medium text-gray-800 dark:text-gray-200">
                                        {activity.endTime
                                            ? formatTime(activity.endTime)
                                            : activity.endDate
                                            ? formatTime(activity.endDate)
                                            : "Not specified"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="w-full">
                    {/* Description */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8 w-full">
                        <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">
                            Description
                        </h2>
                        <div className="prose max-w-none">
                            {activity.description ? (
                                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                                    {activity.description}
                                </p>
                            ) : (
                                <p className="text-gray-500 dark:text-gray-400 italic">
                                    No description provided
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Participating Users */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8 w-full">
                        <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">
                            Participating Users - {participatingUsers.length}
                        </h2>
                        {participatingUsers && participatingUsers.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {participatingUsers.map((user, index) => {
                                    // Extract first and last name from user data
                                    let firstName = "";
                                    let lastName = "";

                                    if (user.firstname && user.lastname) {
                                        firstName = user.firstname;
                                        lastName = user.lastname;
                                    } else if (user.name) {
                                        const nameParts = user.name
                                            .trim()
                                            .split(" ");
                                        firstName = nameParts[0] || "";
                                        lastName =
                                            nameParts.length > 1
                                                ? nameParts.slice(1).join(" ")
                                                : "";
                                    }

                                    return (
                                        <div
                                            key={index}
                                            className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                                        >
                                            <Avatar
                                                srcAvatar={user.avatar}
                                                firstName={firstName || ""}
                                                lastName={lastName || ""}
                                                size="12"
                                            />
                                            <div>
                                                <p className="font-medium text-gray-800 dark:text-gray-200">
                                                    {firstName && lastName
                                                        ? `${firstName} ${lastName}`
                                                        : firstName ||
                                                          user.name ||
                                                          user.email.split(
                                                              "@"
                                                          )[0]}
                                                </p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    {user.email}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <p className="text-gray-500 dark:text-gray-400 italic">
                                No users have joined this activity yet
                            </p>
                        )}
                    </div>

                    {/* Media Gallery */}
                    {activity.media && activity.media.length > 0 && (
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8 w-full">
                            <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">
                                Media Gallery
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                {activity.media.map((item, index) => (
                                    <div
                                        key={index}
                                        className="relative h-48 rounded-md overflow-hidden"
                                    >
                                        <Image
                                            src={item.url}
                                            alt={
                                                item.caption ||
                                                `Media ${index + 1}`
                                            }
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Tags */}
                    {activity.tags && activity.tags.length > 0 && (
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 w-full">
                            <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100">
                                Tags
                            </h2>
                            <div className="flex flex-wrap gap-2">
                                {activity.tags.map((tag, index) => (
                                    <span
                                        key={index}
                                        className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-3 py-1 rounded-full text-sm"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ActivityDetailPage;
