"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ErrorAlert from "@/components/ErrorAlert";
import UserRow from "./userRow";
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
            avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
        },
        {
            id: 2,
            name: "Sarah Chen",
            email: "sarah.chen@example.com",
            status: "inactive",
            joinedAt: "2025-05-15",
            location: {
                country: "Hong Kong",
                state: "Wan Chai",
                city: "Wan Chai",
                postal: "999077",
                address: "456 Hennessy Road",
            },
            stats: {
                totalActivities: 32,
                totalDonations: 850,
                badgeCount: 5,
            },
            avatar: "",
        },
        {
            id: 3,
            name: "Michael Wong",
            email: "michael.wong@example.com",
            status: "inactive",
            joinedAt: "2025-04-20",
            location: {
                country: "Hong Kong",
                state: "Kowloon City",
                city: "Kowloon City",
                postal: "999077",
                address: "789 Nathan Road",
            },
            stats: {
                totalActivities: 18,
                totalDonations: 420,
                badgeCount: 3,
            },
            avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face    ",
        },
        {
            id: 4,
            name: "Emily Liu",
            email: "emily.liu@example.com",
            status: "active",
            joinedAt: "2025-03-10",
            location: {
                country: "Hong Kong",
                state: "Sha Tin",
                city: "Sha Tin",
                postal: "999077",
                address: "321 Sha Tin Road",
            },
            stats: {
                totalActivities: 67,
                totalDonations: 2100,
                badgeCount: 12,
            },
            avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
        },
        {
            id: 5,
            name: "David Chan",
            email: "david.chan@example.com",
            status: "active",
            joinedAt: "2025-02-28",
            location: {
                country: "Hong Kong",
                state: "Tsuen Wan",
                city: "Tsuen Wan",
                postal: "999077",
                address: "654 Tsuen Wan Street",
            },
            stats: {
                totalActivities: 23,
                totalDonations: 680,
                badgeCount: 4,
            },
            avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
        },
        {
            id: 6,
            name: "Lisa Ho",
            email: "lisa.ho@example.com",
            status: "inactive",
            joinedAt: "2025-01-15",
            location: {
                country: "Hong Kong",
                state: "Yuen Long",
                city: "Yuen Long",
                postal: "999077",
                address: "987 Yuen Long Road",
            },
            stats: {
                totalActivities: 12,
                totalDonations: 250,
                badgeCount: 2,
            },
            avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
        },
        {
            id: 7,
            name: "Alex Thompson",
            email: "alex.thompson@example.com",
            status: "active",
            joinedAt: "2024-12-05",
            location: {
                country: "Hong Kong",
                state: "Islands",
                city: "Discovery Bay",
                postal: "999077",
                address: "147 Discovery Bay Road",
            },
            stats: {
                totalActivities: 89,
                totalDonations: 3200,
                badgeCount: 15,
            },
            avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
        },
        {
            id: 8,
            name: "Grace Lam",
            email: "grace.lam@example.com",
            status: "active",
            joinedAt: "2024-11-20",
            location: {
                country: "Hong Kong",
                state: "Kwun Tong",
                city: "Kwun Tong",
                postal: "999077",
                address: "258 Kwun Tong Road",
            },
            stats: {
                totalActivities: 41,
                totalDonations: 1100,
                badgeCount: 7,
            },
            avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
        },
        {
            id: 9,
            name: "Ryan Kwok",
            email: "ryan.kwok@example.com",
            status: "inactive",
            joinedAt: "2024-10-12",
            location: {
                country: "Hong Kong",
                state: "Tai Po",
                city: "Tai Po",
                postal: "999077",
                address: "369 Tai Po Road",
            },
            stats: {
                totalActivities: 8,
                totalDonations: 150,
                badgeCount: 1,
            },
            avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
        },
        {
            id: 10,
            name: "Sophie Yeung",
            email: "sophie.yeung@example.com",
            status: "active",
            joinedAt: "2024-09-08",
            location: {
                country: "Hong Kong",
                state: "Southern",
                city: "Aberdeen",
                postal: "999077",
                address: "741 Aberdeen Road",
            },
            stats: {
                totalActivities: 56,
                totalDonations: 1800,
                badgeCount: 9,
            },
            avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face",
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
            <div className="flex flex-col lg:flex-row gap-4 mb-6 bg-white p-4 rounded-xl outline outline-black/10">
                <label className="flex-1 relative input">
                    <input
                        type="text"
                        placeholder="Search users..."
                        className="grow input-bordered w-full md:max-w-md pr-10"
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
                </label>

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
                        <table className="table table-zebra w-full bg-white">
                            <thead className="sticky top-0 bg-base-900  ">
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
                                    <UserRow user={user} />
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
