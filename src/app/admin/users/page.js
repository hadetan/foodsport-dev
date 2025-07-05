"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ErrorAlert from "@/components/ErrorAlert";

const UserManagementPage = () => {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [loading, setLoading] = useState(false);
    const [tableLoading, setTableLoading] = useState(true);
    const [notification, setNotification] = useState({
        show: false,
        message: "",
        type: "",
    });

    // Hong Kong regions
    const hongKongRegions = [
        "Central and Western",
        "Eastern",
        "Southern",
        "Wan Chai",
        "Kowloon City",
        "Kwun Tong",
        "Sham Shui Po",
        "Wong Tai Sin",
        "Yau Tsim Mong",
        "Islands",
        "Kwai Tsing",
        "North",
        "Sai Kung",
        "Sha Tin",
        "Tai Po",
        "Tsuen Wan",
        "Tuen Mun",
        "Yuen Long",
    ];

    // Mock data - Replace with actual API call
    const users = [
        {
            id: 1,
            name: "John Doe",
            email: "john@example.com",
            status: "active",
            joinedAt: "2025-06-01",
            location: {
                country: "Hong Kong",
                state: "Central and Western",
                city: "Central",
                postal: "999077",
                address: "123 Finance Street",
            },
            stats: {
                totalActivities: 45,
                totalDonations: 1200,
                badgeCount: 8,
            },
            avatar: "/default-avatar.png",
        },
    ];

    // Simulate initial data loading
    useState(() => {
        setTimeout(() => {
            setTableLoading(false);
        }, 1000);
    }, []);

    return (
        <div className="p-4">
            {/* Success/Error Alert */}
            {notification.show &&
                (notification.type === "error" ? (
                    <ErrorAlert
                        message={notification.message}
                        onClose={() =>
                            setNotification({ ...notification, show: false })
                        }
                    />
                ) : (
                    <div className="alert alert-success mb-4">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="stroke-current shrink-0 h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                        <span>{notification.message}</span>
                        <button
                            className="btn btn-sm btn-ghost"
                            onClick={() =>
                                setNotification({
                                    ...notification,
                                    show: false,
                                })
                            }
                        >
                            ×
                        </button>
                    </div>
                ))}

            {/* Search and Filters */}
            <div className="flex flex-col lg:flex-row gap-4 mb-6">
                <div className="flex-1 relative">
                    <input
                        type="text"
                        placeholder="Search users..."
                        className="input input-bordered w-full md:max-w-md pr-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                    </svg>
                </div>

                {/* Enhanced Filters */}
                <div className="flex flex-wrap gap-2">
                    <select
                        className="select select-bordered w-full lg:w-48"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="blocked">Blocked</option>
                    </select>

                    <select
                        className="select select-bordered w-full lg:w-48"
                        defaultValue="Hong Kong"
                        disabled
                    >
                        <option value="Hong Kong">Hong Kong</option>
                    </select>

                    <select className="select select-bordered w-full lg:w-48">
                        <option value="">All Districts</option>
                        {hongKongRegions.map((region) => (
                            <option key={region} value={region}>
                                {region}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* User Table */}
            <div className="overflow-x-auto bg-base-100 rounded-lg shadow relative">
                {tableLoading ? (
                    <div className="min-h-[300px] flex items-center justify-center">
                        <span className="loading loading-spinner loading-lg"></span>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="table table-zebra w-full">
                            <thead className="sticky top-0 bg-base-100">
                                <tr>
                                    <th>User Info</th>
                                    <th>Location</th>
                                    <th>Status</th>
                                    <th>Statistics</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user) => (
                                    <tr
                                        key={user.id}
                                        className="hover:bg-base-200"
                                    >
                                        <td>
                                            <div className="flex items-center space-x-3">
                                                <div className="avatar">
                                                    <div className="mask mask-squircle w-12 h-12">
                                                        <img
                                                            src={user.avatar}
                                                            alt={user.name}
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="font-bold">
                                                        {user.name}
                                                    </div>
                                                    <div className="text-sm opacity-50">
                                                        {user.email}
                                                    </div>
                                                    <div className="text-xs opacity-50">
                                                        Joined: {user.joinedAt}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="text-sm">
                                                <div>{user.location.state}</div>
                                                <div className="text-xs opacity-50">
                                                    {user.location.city},{" "}
                                                    {user.location.postal}
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span
                                                className={`badge ${
                                                    user.status === "active"
                                                        ? "badge-success"
                                                        : "badge-error"
                                                }`}
                                            >
                                                {user.status}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="text-sm">
                                                <div>
                                                    Activities:{" "}
                                                    {user.stats.totalActivities}
                                                </div>
                                                <div>
                                                    Donations:{" "}
                                                    {user.stats.totalDonations}
                                                </div>
                                                <div>
                                                    Badges:{" "}
                                                    {user.stats.badgeCount}
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="btn-group">
                                                <button
                                                    className="btn btn-sm btn-ghost tooltip"
                                                    data-tip="View Profile"
                                                    onClick={() =>
                                                        router.push(
                                                            `/admin/users/${user.id}`
                                                        )
                                                    }
                                                >
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        className="h-4 w-4"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth="2"
                                                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                                        />
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth="2"
                                                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                                        />
                                                    </svg>
                                                </button>
                                                <button
                                                    className="btn btn-sm btn-ghost tooltip"
                                                    data-tip="Edit User"
                                                >
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        className="h-4 w-4"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth="2"
                                                            d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                                                        />
                                                    </svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Pagination */}
            <div className="flex justify-center mt-4">
                <div className="btn-group">
                    <button className="btn btn-outline">«</button>
                    <button className="btn btn-outline">Page 1</button>
                    <button className="btn btn-outline">»</button>
                </div>
            </div>

            {/* Loading Overlay */}
            {loading && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-base-100 rounded-lg p-4 flex flex-col items-center space-y-2">
                        <span className="loading loading-spinner loading-lg"></span>
                        <p className="text-base-content">Processing...</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagementPage;
