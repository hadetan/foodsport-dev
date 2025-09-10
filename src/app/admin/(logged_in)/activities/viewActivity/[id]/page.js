"use client";

import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useUsers } from "@/app/shared/contexts/usersContext";
import Avatar from "@/app/shared/components/avatar";
import FullPageLoader from "../../../components/FullPageLoader";
import { useActivities } from "@/app/shared/contexts/ActivitiesContext";
import { Download, Upload, Pencil } from "lucide-react";
import { toast } from "@/utils/Toast";
import axios from "axios"; // add axios

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

    const [activeTab, setActiveTab] = useState("details"); // "details" or "users"
    const fileInputRef = useRef(null);
    const [importing, setImporting] = useState(false);

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

    // Split CSV line with a given delimiter while respecting quotes and escaped quotes
    const splitCsvLine = (line, delimiter = ",") => {
        const out = [];
        let cur = "";
        let inQuotes = false;
        for (let i = 0; i < line.length; i++) {
            const ch = line[i];
            if (ch === '"') {
                if (inQuotes && line[i + 1] === '"') {
                    cur += '"';
                    i++;
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (ch === delimiter && !inQuotes) {
                out.push(cur);
                cur = "";
            } else {
                cur += ch;
            }
        }
        out.push(cur);
        return out;
    };

    const normalizeCell = (val) => {
        if (val == null) return "";
        let s = String(val).trim();
        if (s.startsWith('"') && s.endsWith('"')) s = s.slice(1, -1);
        return s.trim();
    };

    const parseNumberLoose = (val) => {
        if (val == null) return NaN;
        const cleaned = String(val).replace(/[^0-9.\-]/g, "");
        if (!cleaned) return NaN;
        const n = Number(cleaned);
        return Number.isFinite(n) ? n : NaN;
    };

    // Parse CSV text with no strict validations (accept any CSV)
    const parseUsersFromCsv = (text) => {
        const lines = text
            .replace(/^\uFEFF/, "")
            .replace(/\r\n/g, "\n")
            .replace(/\r/g, "\n")
            .split("\n");

        // Detect delimiter by sampling first non-empty lines
        const tryDelims = [",", ";", "\t"];
        const candidates = lines.filter((l) => l && l.trim()).slice(0, 10);
        let delimiter = ",";
        let bestScore = -1;
        for (const d of tryDelims) {
            const score = candidates.reduce(
                (acc, l) => acc + (l.includes(d) ? 1 : 0),
                0
            );
            if (score > bestScore) {
                bestScore = score;
                delimiter = d;
            }
        }

        // Find start index: prefer the line after a "Participating Users" marker, else first line with delimiter
        const sectionIdx = lines.findIndex((raw) => {
            if (!raw) return false;
            const s = String(raw).trim();
            const unq =
                s.startsWith('"') && s.endsWith('"') ? s.slice(1, -1) : s;
            return /participating users/i.test(unq);
        });

        let headerIdx = -1;
        if (sectionIdx !== -1) {
            for (let i = sectionIdx + 1; i < lines.length; i++) {
                const raw = lines[i];
                if (!raw || !raw.trim()) continue;
                if (raw.includes(delimiter)) {
                    headerIdx = i;
                    break;
                }
            }
        }
        if (headerIdx === -1) {
            headerIdx = lines.findIndex(
                (raw) => raw && raw.trim() && raw.includes(delimiter)
            );
        }
        if (headerIdx === -1) {
            // No delimiter found anywhere; treat each non-empty line as a single-column row
            const users = lines
                .filter((l) => l && l.trim())
                .map((l) => ({
                    email: l.trim(), // best effort
                    calories: 0,
                }));
            return { users, skipped: [] };
        }

        // Helper to normalize header keys for matching
        const normKey = (s) =>
            String(s || "")
                .toLowerCase()
                .replace(/\s+/g, "")
                .replace(/[_-]+/g, "");

        // Treat first non-empty row as header if it looks like text; else use positional mapping
        const headerColsRaw = splitCsvLine(lines[headerIdx], delimiter).map(
            normalizeCell
        );
        const headerNorm = headerColsRaw.map(normKey);

        // Map indices using common synonyms; fallback to positional 0/1/2
        const emailKeys = ["email", "useremail", "e-mail"]; // normalized keys
        const calKeys = [
            "totalcaloriesburned",
            "calories",
            "kcal",
            "caloriesburned",
            "verifiedcalories",
            "submittedcalories",
            "totalcalories",
        ];
        const durKeys = [
            "totalduration",
            "duration",
            "minutes",
            "activityduration",
            "timespent",
        ];

        const findIdx = (keys, fallback) => {
            const idx = keys
                .map((k) => headerNorm.indexOf(k))
                .find((i) => i >= 0);
            return idx >= 0 ? idx : fallback;
        };

        const idxEmail = findIdx(emailKeys, 0);
        const idxCalories = findIdx(calKeys, 1);
        const idxDuration = findIdx(durKeys, 2);

        const users = [];
        for (let i = headerIdx + 1; i < lines.length; i++) {
            const raw = lines[i];
            if (!raw || !raw.trim()) continue;
            if (!raw.includes(delimiter)) continue;

            const cols = splitCsvLine(raw, delimiter).map(normalizeCell);

            const emailRaw = cols[idxEmail] ?? "";
            const caloriesRaw = cols[idxCalories] ?? "";
            const durationRaw = cols[idxDuration];

            let calories = parseNumberLoose(caloriesRaw);
            if (!Number.isFinite(calories)) calories = 0;

            let duration;
            const d = parseNumberLoose(durationRaw);
            if (Number.isFinite(d)) duration = d; // optional

            users.push({
                email: emailRaw,
                calories, // normalize to API expected key
                ...(duration !== undefined ? { duration } : {}),
            });
        }

        // If no data rows after header, but header had content, still return empty users (API accepts empty array)
        return { users, skipped: [] };
    };

    const handleImportClick = () => fileInputRef.current?.click();

    const handleFileChange = async (e) => {
        const file = e.target.files?.[0];
        e.target.value = ""; // allow re-selecting the same file next time
        if (!file) return;

        if (!activityId) {
            toast.error("Missing activity id");
            return;
        }

        setImporting(true);
        try {
            const text = await file.text();
            const { users, skipped } = parseUsersFromCsv(text);

            // Removed strict validation; always attempt API call
            const payloadUsers = users.map((u) => ({
                email: String(u.email ?? ""),
                calories: Number.isFinite(u.calories) ? Number(u.calories) : 0,
                ...(Number.isFinite(u.duration)
                    ? { duration: Number(u.duration) }
                    : {}),
            }));

            const res = await axios.post(
                "/api/admin/users/rewardCalories",
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
                `Import complete. Rewarded ${successCount}/${totalProcessed}. Skipped ${
                    failCount + skippedCount
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

    // Simple check for cancelled or closed status
    const canImportExport =
        activity?.status === "cancelled" || activity?.status === "closed";

    return (
        <div className="w-full min-h-screen bg-white">
            {/* Heading and Navigation Buttons */}
            <div className="container mx-auto px-4 pt-6 flex justify-between items-center">
                <div className="flex items-center gap-4">
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
                    <h2 className="text-xl font-bold text-gray-800 mb-2 mx-10">
                        VIEW ACTIVITY
                    </h2>
                </div>
                {/* Show Edit Activity button only in details tab, top right */}
                {activeTab === "details" && (
                    <button
                        className="flex items-center bg-blue-500 hover:bg-blue-600 text-white font-medium px-5 py-2 rounded-lg shadow transition-colors"
                        onClick={() =>
                            router.push(`/admin/activities/${activity?.id}`)
                        }
                    >
                        <Pencil className="w-5 h-5 mr-2" />
                        Edit Activity
                    </button>
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
                        className={`tab ${
                            activeTab === "details"
                                ? "tab-active text-blue-600"
                                : "text-gray-500 hover:text-blue-600"
                        }`}
                        onClick={() => setActiveTab("details")}
                    >
                        Activity Details
                    </a>
                    <a
                        role="tab"
                        className={`tab ${
                            activeTab === "users"
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
                                                className={`ml-2 px-3 py-1 rounded-full text-xs font-semibold ${
                                                    activity.status === "active"
                                                        ? "bg-green-600 text-white"
                                                        : activity.status ===
                                                          "inactive"
                                                        ? "bg-gray-400 text-white"
                                                        : activity.status ===
                                                          "cancelled"
                                                        ? "bg-red-600 text-white"
                                                        : activity.status ===
                                                          "completed"
                                                        ? "bg-gray-600 text-white"
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
                </div>
            )}

            {/* Tab Panels */}
            <div className="container mx-auto px-4">
                <div className="w-full">
                    {activeTab === "details" && (
                        <div>
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
                        </div>
                    )}
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
                                            <Upload className="w-5 h-5 mr-2" />
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
                                            onClick={() => {
                                                // Export activity info and user details, merging per-activity joined data
                                                if (!activity) {
                                                    toast.error(
                                                        "No activity data to export"
                                                    );
                                                    return;
                                                }
                                                if (
                                                    !participatingUsers ||
                                                    participatingUsers.length ===
                                                        0
                                                ) {
                                                    toast.error(
                                                        "No participating users to export"
                                                    );
                                                    return;
                                                }

                                                const escapeCsv = (value) => {
                                                    if (
                                                        value === null ||
                                                        value === undefined
                                                    )
                                                        return '""';
                                                    const s = String(value);
                                                    return `"${s.replace(
                                                        /"/g,
                                                        '""'
                                                    )}"`;
                                                };

                                                const matchId = (val) => {
                                                    if (!val) return false;
                                                    const id =
                                                        activityId?.toString();
                                                    // support primitive id, object with id/activityId, or nested activity.id
                                                    return (
                                                        val === activityId ||
                                                        val?.toString?.() ===
                                                            id ||
                                                        val?.id?.toString?.() ===
                                                            id ||
                                                        val?.activityId?.toString?.() ===
                                                            id ||
                                                        val?.activity?.id?.toString?.() ===
                                                            id
                                                    );
                                                };

                                                const findActivityJoin = (
                                                    user
                                                ) => {
                                                    const arr = Array.isArray(
                                                        user?.joinedActivities
                                                    )
                                                        ? user.joinedActivities
                                                        : [];
                                                    return (
                                                        arr.find(matchId) || {}
                                                    );
                                                };

                                                // Columns we will export (aligned with DB naming)
                                                const headers = [
                                                    "firstname",
                                                    "lastname",
                                                    "email",
                                                    "Registered",
                                                    "gender",
                                                    "height",
                                                    "weight",
                                                    "dob",
                                                    "joinedDate",
                                                    "totalDuration",
                                                    "totalCaloriesBurned",
                                                ];
                                                const userHeader = headers
                                                    .map((h) => `"${h}"`)
                                                    .join(",");

                                                const userRows =
                                                    participatingUsers.map(
                                                        (user) => {
                                                            const join =
                                                                findActivityJoin(
                                                                    user
                                                                );

                                                            const values = [
                                                                user?.firstname ??
                                                                    user?.firstName ??
                                                                    "",
                                                                user?.lastname ??
                                                                    user?.lastName ??
                                                                    "",
                                                                user?.email ??
                                                                    user?.user_email ??
                                                                    user?.user
                                                                        ?.email ??
                                                                    "",
                                                                // Registered (Yes/No based on isRegistered)
                                                                user?.isRegistered
                                                                    ? "Yes"
                                                                    : "No",
                                                                user?.gender ??
                                                                    user?.sex ??
                                                                    "",
                                                                user?.height ??
                                                                    user
                                                                        ?.profile
                                                                        ?.height ??
                                                                    "",
                                                                user?.weight ??
                                                                    user
                                                                        ?.profile
                                                                        ?.weight ??
                                                                    "",
                                                                user?.dob ??
                                                                    user?.dateOfBirth ??
                                                                    user
                                                                        ?.profile
                                                                        ?.dob ??
                                                                    "",
                                                                join?.joinedDate ??
                                                                    join?.joinDate ??
                                                                    join?.createdAt ??
                                                                    user?.joinedDate ??
                                                                    user?.joinDate ??
                                                                    user?.createdAt ??
                                                                    "",
                                                                // totalDuration
                                                                join?.totalDuration ??
                                                                    join?.duration ??
                                                                    join?.activityDuration ??
                                                                    join?.minutes ??
                                                                    join?.timeSpent ??
                                                                    "",
                                                                // totalCaloriesBurned
                                                                join?.totalCaloriesBurned ??
                                                                    join?.calories ??
                                                                    join?.totalCalories ??
                                                                    join?.kcal ??
                                                                    "",
                                                            ];

                                                            return values
                                                                .map(escapeCsv)
                                                                .join(",");
                                                        }
                                                    );

                                                // Only id and title for activity
                                                const activityHeader = `"id","title"`;
                                                const activityRow = [
                                                    activity?.id ?? "",
                                                    activity?.title ?? "",
                                                ]
                                                    .map(escapeCsv)
                                                    .join(",");

                                                let usersSection = "";
                                                if (userRows.length > 0) {
                                                    usersSection =
                                                        "\r\n\r\nParticipating Users\r\n" +
                                                        userHeader +
                                                        "\r\n" +
                                                        userRows.join("\r\n");
                                                }

                                                const csvContent =
                                                    activityHeader +
                                                    "\r\n" +
                                                    activityRow +
                                                    usersSection;

                                                // Add BOM for Excel compatibility
                                                const blob = new Blob(
                                                    ["\uFEFF" + csvContent],
                                                    {
                                                        type: "text/csv;charset=utf-8;",
                                                    }
                                                );
                                                const url =
                                                    URL.createObjectURL(blob);
                                                const link =
                                                    document.createElement("a");
                                                link.href = url;
                                                link.setAttribute(
                                                    "download",
                                                    `activity_${activityId}_users.csv`
                                                );
                                                document.body.appendChild(link);
                                                link.click();
                                                document.body.removeChild(link);
                                                URL.revokeObjectURL(url);
                                            }}
                                            title="Export Users"
                                        >
                                            <Download className="w-5 h-5 mr-2" />
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
                                            No users have joined this activity
                                            yet.
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
                                                        Joined Date
                                                    </th>
                                                    {/* New columns for richer details */}
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Status
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Activities
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Donations
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Badges
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
                                                                    <div className="flex-shrink-0 h-10 w-10">
                                                                        <Avatar
                                                                            // Support both prop styles used in codebase
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
                                                                            alt={`${
                                                                                user.firstname ||
                                                                                "User"
                                                                            } ${
                                                                                user.lastname ||
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
                                                            {/* Status */}
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <span
                                                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                                        user.isActive
                                                                            ? "bg-green-100 text-green-800"
                                                                            : "bg-red-100 text-red-800"
                                                                    }`}
                                                                >
                                                                    {user.isActive
                                                                        ? "Active"
                                                                        : "Blocked"}
                                                                </span>
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
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <div className="text-sm text-gray-900">
                                                                    {user.stats
                                                                        ?.totalDonations ??
                                                                        user.totalDonations ??
                                                                        0}
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <div className="text-sm text-gray-900">
                                                                    {user.stats
                                                                        ?.badgeCount ??
                                                                        user.badgeCount ??
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
