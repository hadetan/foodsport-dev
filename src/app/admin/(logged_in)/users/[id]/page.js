"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/utils/axios/api";
import { useUsers } from "@/app/shared/contexts/usersContext";
import Avatar from "@/app/shared/components/avatar";
import { IoIosArrowBack } from 'react-icons/io';
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
        <div className="p-6">
            <div className="flex items-center mb-6">
                <button
                    onClick={() => router.back()}
                    className="flex items-center text-base-content/60 hover:text-base-content transition-colors duration-200 mr-4 cursor-pointer"
                >
                    <IoIosArrowBack className="w-5 h-5 mr-1" />
                    Back
                </button>
                <h2 className="text-2xl font-bold text-base-content">
                    User Details
                </h2>
            </div>
            <div className="bg-base-100 border border-base-300 rounded-lg overflow-hidden">
                {/* Profile Picture Row */}
                <div className="flex items-center p-4 border-b border-base-300">
                    <span className="font-bold text-base-content w-48">
                        Profile Picture
                    </span>
                    <div className="flex-1">
                        <Avatar
                            srcAvatar={user.profilePictureUrl}
                            firstName={user.firstname}
                            lastName={user.lastname}
                            size="20"
                            isNav={true}
                        />
                    </div>
                </div>

                {/* Detail Rows */}
                <div className="divide-y divide-base-300">
                    <div className="flex p-4">
                        <span className="font-bold text-base-content w-48">ID</span>
                        <span className="text-base-content flex-1">{user.id}</span>
                    </div>
                    <div className="flex p-4">
                        <span className="font-bold text-base-content w-48">
                            Name
                        </span>
                        <span className="text-base-content flex-1">
                            {user.firstname} {user.lastname}
                        </span>
                    </div>
                    <div className="flex p-4">
                        <span className="font-bold text-base-content w-48">
                            Email
                        </span>
                        <span className="text-base-content flex-1">
                            {user.email}
                        </span>
                    </div>
                    <div className="flex p-4">
                        <span className="font-bold text-base-content w-48">
                            Date of Birth
                        </span>
                        <span className="text-base-content flex-1">
                            {formatDate(user.dateOfBirth.split("T")[0])}
                        </span>
                    </div>
                    <div className="flex p-4">
                        <span className="font-bold text-base-content w-48">
                            Gender
                        </span>
                        <span className="text-base-content flex-1">
                            {user.gender ? (
                                user.gender
                            ) : (
                                <span className="italic text-base-content/50">
                                    Empty
                                </span>
                            )}
                        </span>
                    </div>
                    <div className="flex p-4">
                        <span className="font-bold text-base-content w-48">
                            Phone Number
                        </span>
                        <span className="text-base-content flex-1">
                            {user.phoneNumber ? (
                                user.phoneNumber
                            ) : (
                                <span className="italic text-base-content/50">
                                    Empty
                                </span>
                            )}
                        </span>
                    </div>
                    <div className="flex p-4">
                        <span className="font-bold text-base-content w-48">
                            Total Calories Donated
                        </span>
                        <span className="text-base-content flex-1">
                            {user.totalCaloriesDonated === 0 ? (
                                <span className="italic text-base-content/50">
                                    No donations made
                                </span>
                            ) : (
                                user.totalCaloriesDonated
                            )}
                        </span>
                    </div>
                    <div className="flex p-4">
                        <span className="font-bold text-base-content w-48">
                            Status
                        </span>
                        <span className="flex-1 flex items-center gap-3">
                            <button
                                onClick={handleUserStatus}
                                disabled={statusLoading}
                                className={`relative inline-flex items-center h-6 rounded-full w-11 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors duration-300 ${user.isActive ? 'bg-green-500' : 'bg-red-500'} cursor-pointer`}
                            >
                                {statusLoading && (
                                    <span className="absolute inset-0 flex items-center justify-center">
                                        <span className="loading loading-spinner loading-xs text-white"></span>
                                    </span>
                                )}
                                <span
                                    className={`${user.isActive ? "translate-x-6" : "translate-x-1"} inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-300`}
                                />
                                <span className="sr-only">
                                    {user.isActive
                                        ? "Block User"
                                        : "Activate User"}
                                </span>
                            </button>
                            <span className="text-sm font-medium text-base-content">
                                {user.isActive ? "Active" : "Blocked"}
                            </span>
                        </span>
                    </div>
                    <div className="flex p-4">
                        <span className="font-bold text-base-content w-48">
                            Joined At
                        </span>
                        <span className="text-base-content flex-1">
                            {formatDate(user.createdAt.split("T")[0])}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserDetailPage;
