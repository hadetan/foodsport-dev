"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/utils/axios/api";
import { useUsers } from "@/app/shared/contexts/usersContenxt";

const UserDetailPage = () => {
    const { id } = useParams();
    const router = useRouter();
    const { users, loading: usersLoading, setUsers } = useUsers();
    const [user, setUser] = useState(null);
    const [statusLoading, setStatusLoading] = useState(false);

    useEffect(() => {
        if (users && users.length > 0) {
            const filtered = users.filter((u) => String(u.id) === String(id));
            setUser(filtered.length > 0 ? filtered[0] : null);
        }
    }, [users, id]);

    // Updated function to match the route.js PATCH API requirements
    const handleUserStatus = async () => {
        if (statusLoading || !user) return;

        const newStatus = !user.isActive;
        setStatusLoading(true);

        try {
            // The API expects userId in the body based on route.js
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

    if (usersLoading) return <div>Loading...</div>;
    if (!user)
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <div className="text-center">
                    <div className="text-5xl font-extrabold text-purple-500 mb-4">
                        User Not Found
                    </div>
                    <div className="text-lg text-gray-300">
                        Sorry, we couldn't find a user with this ID.
                    </div>
                </div>
            </div>
        );

    return (
        <div className="p-6">
            <div className="flex items-center mb-6">
                <button
                    onClick={() => router.back()}
                    className="flex items-center text-gray-500 hover:text-indigo-600 transition-colors duration-200 mr-4"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="w-5 h-5 mr-1"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
                        />
                    </svg>
                    Back
                </button>
                <h2 className="text-2xl font-bold text-gray-900">
                    User Details
                </h2>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow">
                {/* Profile Picture Row */}
                <div className="flex items-center p-4 border-b border-gray-200">
                    <span className="font-bold text-gray-700 w-48">
                        Profile Picture
                    </span>
                    <div className="flex-1">
                        {user.profilePictureUrl &&
                        user.profilePictureUrl !== "" ? (
                            <img
                                src={
                                    process.env.NEXT_PUBLIC_SUPABASE_URL
                                        ? process.env.NEXT_PUBLIC_SUPABASE_URL +
                                          user.profilePictureUrl
                                        : user.profilePictureUrl
                                }
                                alt="Profile"
                                className="w-20 h-20 rounded-full object-cover border border-gray-300"
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src =
                                        "https://ui-avatars.com/api/?background=E0E7FF&color=3730A3&name=" +
                                        encodeURIComponent(
                                            (user.firstname || "") +
                                                " " +
                                                (user.lastname || "")
                                        );
                                }}
                            />
                        ) : (
                            <div className="w-20 h-20 rounded-full bg-indigo-100 flex items-center justify-center border border-gray-300">
                                <span className="text-indigo-700 text-2xl font-bold">
                                    {user.firstname
                                        ? user.firstname.charAt(0).toUpperCase()
                                        : "?"}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Detail Rows */}
                <div className="divide-y divide-gray-200">
                    <div className="flex p-4">
                        <span className="font-bold text-gray-700 w-48">ID</span>
                        <span className="text-gray-900 flex-1">{user.id}</span>
                    </div>
                    <div className="flex p-4">
                        <span className="font-bold text-gray-700 w-48">
                            Name
                        </span>
                        <span className="text-gray-900 flex-1">
                            {user.firstname} {user.lastname}
                        </span>
                    </div>
                    <div className="flex p-4">
                        <span className="font-bold text-gray-700 w-48">
                            Email
                        </span>
                        <span className="text-gray-900 flex-1">
                            {user.email}
                        </span>
                    </div>
                    <div className="flex p-4">
                        <span className="font-bold text-gray-700 w-48">
                            Date of Birth
                        </span>
                        <span className="text-gray-900 flex-1">
                            {user.dateOfBirth.split("T")[0]}
                        </span>
                    </div>
                    <div className="flex p-4">
                        <span className="font-bold text-gray-700 w-48">
                            Gender
                        </span>
                        <span className="text-gray-900 flex-1">
                            {user.gender ? (
                                user.gender
                            ) : (
                                <span className="italic text-gray-400">
                                    Empty
                                </span>
                            )}
                        </span>
                    </div>
                    <div className="flex p-4">
                        <span className="font-bold text-gray-700 w-48">
                            Phone Number
                        </span>
                        <span className="text-gray-900 flex-1">
                            {user.phoneNumber ? (
                                user.phoneNumber
                            ) : (
                                <span className="italic text-gray-400">
                                    Empty
                                </span>
                            )}
                        </span>
                    </div>
                    <div className="flex p-4">
                        <span className="font-bold text-gray-700 w-48">
                            Total Calories Donated
                        </span>
                        <span className="text-gray-900 flex-1">
                            {user.totalCaloriesDonated === 0 ? (
                                <span className="italic text-gray-400">
                                    No donations made
                                </span>
                            ) : (
                                user.totalCaloriesDonated
                            )}
                        </span>
                    </div>
                    <div className="flex p-4">
                        <span className="font-bold text-gray-700 w-48">
                            Status
                        </span>
                        <span className="flex-1 flex items-center gap-3">
                            <button
                                onClick={handleUserStatus}
                                disabled={statusLoading}
                                className="relative inline-flex items-center h-6 rounded-full w-11 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                style={{
                                    backgroundColor: user.isActive
                                        ? "#10B981"
                                        : "#EF4444",
                                    transition: "background-color 0.3s",
                                }}
                            >
                                {statusLoading && (
                                    <span className="absolute inset-0 flex items-center justify-center">
                                        <span className="loading loading-spinner loading-xs text-white"></span>
                                    </span>
                                )}
                                <span
                                    className={`${
                                        user.isActive
                                            ? "translate-x-6"
                                            : "translate-x-1"
                                    } inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-300`}
                                />
                                <span className="sr-only">
                                    {user.isActive
                                        ? "Block User"
                                        : "Activate User"}
                                </span>
                            </button>
                            <span className="text-sm font-medium text-gray-700">
                                {user.isActive ? "Active" : "Blocked"}
                            </span>
                        </span>
                    </div>
                    <div className="flex p-4">
                        <span className="font-bold text-gray-700 w-48">
                            Joined At
                        </span>
                        <span className="text-gray-900 flex-1">
                            {user.createdAt ? user.createdAt.split("T")[0] : ""}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserDetailPage;
