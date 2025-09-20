"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/utils/axios/api";
import { useUsers } from "@/app/shared/contexts/usersContext";
import Avatar from "@/app/shared/components/avatar";
import { IoIosArrowBack } from "react-icons/io";
import { Pencil, Check, Copy } from "lucide-react";
import formatDate from "@/utils/formatDate";
import FullPageLoader from "../../components/FullPageLoader";

const UserDetailPage = () => {
    const { id } = useParams();
    const router = useRouter();
    const { users, loading: usersLoading, setUsers } = useUsers();
    const [user, setUser] = useState(null);
    const [statusLoading, setStatusLoading] = useState(false);
    const [isEditingEmail, setIsEditingEmail] = useState(false);
    const [email, setEmail] = useState("");
    const [copied, setCopied] = useState(false);
    const [emailLoading, setEmailLoading] = useState(false);
    const [activities, setActivities] = useState([]);
    const [activitiesLoading, setActivitiesLoading] = useState(true);
    const [activitiesError, setActivitiesError] = useState(null);

    useEffect(() => {
        if (users && users.length > 0) {
            const filtered = users.filter((u) => String(u.id) === String(id));
            setUser(filtered.length > 0 ? filtered[0] : null);
            if (filtered.length > 0) {
                setEmail(filtered[0].email || "");
                // Extract activities from user data
                const activitiesList = filtered[0].joinedActivities ?? [];
                setActivities(
                    Array.isArray(activitiesList) ? activitiesList : []
                );
                setActivitiesLoading(false);
                setActivitiesError(null);
            }
        }
    }, [users, id]);

    const handleUserStatus = async () => {
        if (statusLoading || !user) return;

        const newStatus = !user.isActive;
        setStatusLoading(true);

        try {
            const { data } = await api.patch(`/admin/users`, {
                userId: user.id,
                isActive: newStatus,
            });

            if (data) {
                setUser({ ...user, isActive: newStatus });
                setUsers(
                    users.map((u) =>
                        u.id === user.id ? { ...u, isActive: newStatus } : u
                    )
                );
            }
        } catch (err) {
            console.error("Status update error:", err);
            alert("Failed to update user status.");
        } finally {
            setStatusLoading(false);
        }
    };

    const handleEmailSave = async () => {
        if (!user) return;
        setEmailLoading(true);
        try {
            const { data } = await api.patch("/admin/users", {
                userId: user.id,
                email,
            });
            if (data && !data.error) {
                setUser({ ...user, email });
                setUsers(
                    users.map((u) => (u.id === user.id ? { ...u, email } : u))
                );
                setIsEditingEmail(false);
            } else {
                alert(data?.error || "Failed to update email.");
            }
        } catch (err) {
            console.error("Email update error:", err);
            alert("Failed to update email.");
        } finally {
            setEmailLoading(false);
        }
    };

    const handleCopyId = () => {
        if (!user?.id) return;
        navigator.clipboard.writeText(user.id);
        setCopied(true);
        setTimeout(() => setCopied(false), 1200);
    };

    if (usersLoading) return <FullPageLoader />;
    if (!user)
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <div className="text-center">
                    <div className="text-5xl font-extrabold text-purple-500 mb-4">
                        User Not Found
                    </div>
                    <div className="text-lg text-gray-300">
                        Sorry, we could not find a user with this ID.
                    </div>
                </div>
            </div>
        );

    return (
        <div className="p-4 md:p-8 bg-base-200 min-h-screen">
            <div>
                <div className="flex items-center mb-8">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center text-base-content/60 hover:text-primary transition-colors duration-200 mr-4 cursor-pointer"
                    >
                        <IoIosArrowBack className="w-5 h-5 mr-1" />
                        Back
                    </button>
                    <h2 className="text-2xl md:text-3xl font-bold text-base-content">
                        User Details
                    </h2>
                </div>
                <div className="bg-base-100 border border-base-300 rounded-2xl shadow-lg overflow-hidden">
                    <div className="flex flex-col md:flex-row items-center gap-6 p-8 bg-gradient-to-r from-primary/10 to-base-100 border-b border-base-300">
                        <div className="flex-shrink-0">
                            <Avatar
                                srcAvatar={user.profilePictureUrl}
                                firstName={user.firstname}
                                lastName={user.lastname}
                                size="20"
                                isNav={true}
                            />
                        </div>
                        <div className="flex-1 text-center md:text-left">
                            <div className="text-2xl font-semibold text-base-content">
                                {user.firstname} {user.lastname}
                            </div>
                            <div className="text-base-content/70 text-sm mt-1 flex items-center gap-2">
                                {isEditingEmail ? (
                                    <>
                                        <input
                                            className="input input-bordered input-sm"
                                            type="email"
                                            value={email}
                                            onChange={(e) =>
                                                setEmail(e.target.value)
                                            }
                                            autoFocus
                                            disabled={emailLoading}
                                        />
                                        <button
                                            type="button"
                                            className="btn btn-ghost btn-xs"
                                            onClick={handleEmailSave}
                                            aria-label="Save Email"
                                            disabled={emailLoading}
                                        >
                                            {emailLoading ? (
                                                <span className="loading loading-spinner loading-xs text-success" />
                                            ) : (
                                                <Check className="w-4 h-4 text-success" />
                                            )}
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <span>{email}</span>
                                        <button
                                            type="button"
                                            className="btn btn-ghost btn-xs"
                                            onClick={() =>
                                                setIsEditingEmail(true)
                                            }
                                            aria-label="Edit Email"
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </button>
                                    </>
                                )}
                            </div>
                            <div className="mt-3 flex flex-col md:flex-row gap-2 items-center md:items-start">
                                <span
                                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                        user.isActive
                                            ? "bg-green-100 text-green-700"
                                            : "bg-red-100 text-red-700"
                                    }`}
                                >
                                    {user.isActive ? "Active" : "Blocked"}
                                </span>
                                <button
                                    onClick={handleUserStatus}
                                    disabled={statusLoading}
                                    className={`relative inline-flex items-center h-7 rounded-full w-14 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors duration-300 ${
                                        user.isActive
                                            ? "bg-green-500"
                                            : "bg-red-500"
                                    } ml-0 md:ml-4 mt-2 md:mt-0`}
                                >
                                    {statusLoading && (
                                        <span className="absolute inset-0 flex items-center justify-center">
                                            <span className="loading loading-spinner loading-xs text-white"></span>
                                        </span>
                                    )}
                                    <span
                                        className={`${
                                            user.isActive
                                                ? "translate-x-7"
                                                : "translate-x-1"
                                        } inline-block w-5 h-5 transform bg-white rounded-full transition-transform duration-300`}
                                    />
                                    <span className="sr-only">
                                        {user.isActive
                                            ? "Block User"
                                            : "Activate User"}
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                        <Detail
                            label="ID"
                            value={
                                <span className="flex items-center gap-2">
                                    {user.id}
                                    <button
                                        type="button"
                                        className="btn btn-ghost btn-xs p-1"
                                        onClick={handleCopyId}
                                        aria-label="Copy User ID"
                                    >
                                        <Copy className="w-4 h-4" />
                                    </button>
                                    {copied && (
                                        <span className="text-xs text-success ml-1">
                                            Copied!
                                        </span>
                                    )}
                                </span>
                            }
                        />
                        <Detail
                            label="Date of Birth"
                            value={
                                user.dateOfBirth ? (
                                    formatDate(user.dateOfBirth.split("T")[0])
                                ) : (
                                    <span className="italic text-base-content/50">
                                        Empty
                                    </span>
                                )
                            }
                        />
                        <Detail
                            label="Gender"
                            value={
                                user.gender ? (
                                    user.gender.charAt(0).toUpperCase() +
                                    user.gender.slice(1)
                                ) : (
                                    <span className="italic text-base-content/50">
                                        Empty
                                    </span>
                                )
                            }
                        />
                        <Detail
                            label="Phone Number"
                            value={
                                user.phoneNumber ? (
                                    user.phoneNumber
                                ) : (
                                    <span className="italic text-base-content/50">
                                        Empty
                                    </span>
                                )
                            }
                        />
                        <Detail
                            label="Height"
                            value={
                                user.height ? (
                                    `${user.height} cm`
                                ) : (
                                    <span className="italic text-base-content/50">
                                        Empty
                                    </span>
                                )
                            }
                        />
                        <Detail
                            label="Weight"
                            value={
                                user.weight ? (
                                    `${user.weight} kg`
                                ) : (
                                    <span className="italic text-base-content/50">
                                        Empty
                                    </span>
                                )
                            }
                        />
                        <Detail
                            label="Total Calories Donated"
                            value={
                                user.totalCaloriesDonated === 0 ? (
                                    <span className="italic text-base-content/50">
                                        No donations made
                                    </span>
                                ) : (
                                    user.totalCaloriesDonated
                                )
                            }
                        />
                        <Detail
                            label="Registered At"
                            value={
                                user.createdAt ? (
                                    formatDate(user.createdAt.split("T")[0])
                                ) : (
                                    <span className="italic text-base-content/50">
                                        Empty
                                    </span>
                                )
                            }
                        />
                    </div>
                </div>

                <div className="mt-8 bg-base-100 border border-base-300 rounded-2xl shadow-lg overflow-hidden">
                    <div className="px-6 py-4 border-b border-base-300 flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-base-content">
                            Joined Activities
                            <span className="ml-2 text-base-content/60 text-sm">
                                ({activities.length})
                            </span>
                        </h3>
                    </div>

                    {activitiesLoading ? (
                        <div className="p-6 flex items-center gap-2">
                            <span className="loading loading-spinner loading-sm" />
                            <span className="text-base-content/70 text-sm">
                                Loading activities...
                            </span>
                        </div>
                    ) : activitiesError ? (
                        <div className="p-6 text-error text-sm">
                            {activitiesError}
                        </div>
                    ) : activities.length === 0 ? (
                        <div className="p-6 text-base-content/60 text-sm">
                            No activities joined.
                        </div>
                    ) : (
                        <div className="overflow-x-auto ">
                            <table className="table table-zebra-zebra mb-4">
                                <thead className="bg-base-200">
                                    <tr>
                                        <th className="text-xs font-semibold uppercase text-base-content/60">
                                            Activity
                                        </th>
                                        <th className="text-xs font-semibold uppercase text-base-content/60">
                                            Activity Type
                                        </th>
                                        <th className="text-xs font-semibold uppercase text-base-content/60">
                                            Location
                                        </th>
                                        <th className="text-xs font-semibold uppercase text-base-content/60">
                                            Joined At
                                        </th>
                                        <th className="text-xs font-semibold uppercase text-base-content/60">
                                            Was Present
                                        </th>
                                        <th className="text-xs font-semibold uppercase text-base-content/60">
                                            Calories Donated
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {activities.slice().map((a, index) => {
                                        const activityName =
                                            a.title ?? a.name ?? "Unknown";
                                        const activityType =
                                            a.activityType ?? a.type ?? "—";
                                        const location = a.location ?? "—";
                                        const joinedAtRaw = a.createdAt ?? null;
                                        const wasPresent =
                                            a.wasPresent ?? false;
                                        const calories = a.caloriesDonated ?? 0;

                                        return (
                                            <tr
                                                key={`${
                                                    a.id || "unknown"
                                                }-${activityName}-${index}`}
                                                className="py-3"
                                            >
                                                <td className="text-sm text-base-content">
                                                    {activityName}
                                                </td>
                                                <td className="text-sm text-base-content/80">
                                                    {activityType}
                                                </td>
                                                <td className="text-sm text-base-content/80">
                                                    {location}
                                                </td>
                                                <td className="text-sm text-base-content/80">
                                                    {joinedAtRaw ? (
                                                        formatDate(
                                                            String(
                                                                joinedAtRaw
                                                            ).split("T")[0]
                                                        )
                                                    ) : (
                                                        <span className="italic text-base-content/50">
                                                            —
                                                        </span>
                                                    )}
                                                </td>
                                                <td>
                                                    <span
                                                        className={`px-2 py-0.5 rounded-full text-xs ${
                                                            wasPresent
                                                                ? "bg-green-100 text-green-700"
                                                                : "bg-red-100 text-red-700"
                                                        }`}
                                                    >
                                                        {wasPresent
                                                            ? "Yes"
                                                            : "No"}
                                                    </span>
                                                </td>
                                                <td className="text-sm text-base-content/80">
                                                {calories || 0}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

function Detail({ label, value }) {
    return (
        <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-base-content/60 uppercase tracking-wide">
                {label}
            </span>
            <span className="text-base-content text-sm break-all">{value}</span>
        </div>
    );
}

export default UserDetailPage;
