"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/utils/axios/api";
import { useUsers } from "@/app/shared/contexts/usersContext";
import Avatar from "@/app/shared/components/avatar";
import { IoIosArrowBack } from "react-icons/io";
import formatDate from "@/utils/formatDate";
import FullPageLoader from "../../components/FullPageLoader";

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

    if (usersLoading) return <FullPageLoader />;
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
                    {/* Profile Header */}
                    <div className="flex flex-col md:flex-row items-center gap-6 p-8 bg-gradient-to-r from-primary/10 to-base-100 border-b border-base-300">
                        <div className="flex-shrink-0">
                            <Avatar
                                srcAvatar={user.profilePictureUrl}
                                firstName={user.firstname}
                                lastName={user.lastname}
                                size="40" // reduced from 64 to 40 for a smaller profile picture
                                isNav={true}
                            />
                        </div>
                        <div className="flex-1 text-center md:text-left">
                            <div className="text-2xl font-semibold text-base-content">
                                {user.firstname} {user.lastname}
                            </div>
                            <div className="text-base-content/70 text-sm mt-1">
                                {user.email}
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
                    {/* Details Grid */}
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                        <Detail label="ID" value={user.id} />
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
                                    user.gender
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
                            label="Joined At"
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
            </div>
        </div>
    );
};

// Detail row component for cleaner markup
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
