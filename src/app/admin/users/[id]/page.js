"use client";

import { useState } from "react";
import ErrorAlert from "@/components/ErrorAlert";

const UserProfilePage = ({ params }) => {
    const [activeTab, setActiveTab] = useState("details");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Mock user data - Replace with API call
    const user = {
        id: params.id,
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
        activities: [
            {
                id: 1,
                type: "Yoga",
                date: "2025-06-30 15:00",
                duration: "60 mins",
                calories: 200,
            },
            {
                id: 2,
                type: "Trekking",
                date: "2025-06-29 10:30",
                duration: "120 mins",
                calories: 500,
            },
            {
                id: 3,
                type: "Swimming",
                date: "2025-06-28 08:00",
                duration: "45 mins",
                calories: 300,
            },
        ],
    };

    const handleStatusChange = async (newStatus) => {
        setLoading(true);
        setError("");
        try {
            // Implementation will be added
            await new Promise((resolve) => setTimeout(resolve, 1000));
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4">
            <ErrorAlert message={error} onClose={() => setError("")} />

            {/* User Profile Header */}
            <div className="card bg-base-100 shadow-xl mb-6">
                <div className="card-body">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        <div className="avatar">
                            <div className="w-24 h-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                                <img src={user.avatar} alt={user.name} />
                            </div>
                        </div>
                        <div className="flex-1">
                            <h2 className="card-title text-2xl">{user.name}</h2>
                            <p className="text-base-content/60">{user.email}</p>
                            <div className="mt-2 flex flex-wrap gap-2">
                                <span
                                    className={`badge ${
                                        user.status === "active"
                                            ? "badge-success"
                                            : "badge-error"
                                    }`}
                                >
                                    {user.status}
                                </span>
                                <span className="badge badge-ghost">
                                    Joined: {user.joinedAt}
                                </span>
                            </div>
                        </div>
                        <div className="flex flex-col gap-2">
                            <button className="btn btn-primary">
                                Edit Profile
                            </button>
                            <div className="dropdown dropdown-end">
                                <label
                                    tabIndex={0}
                                    className="btn btn-outline btn-block"
                                >
                                    Change Status
                                </label>
                                <ul
                                    tabIndex={0}
                                    className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52"
                                >
                                    <li>
                                        <a
                                            onClick={() =>
                                                handleStatusChange("active")
                                            }
                                        >
                                            Activate
                                        </a>
                                    </li>
                                    <li>
                                        <a
                                            onClick={() =>
                                                handleStatusChange("blocked")
                                            }
                                        >
                                            Block
                                        </a>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="stats shadow">
                    <div className="stat">
                        <div className="stat-title">Total Activities</div>
                        <div className="stat-value text-primary">
                            {user.stats.totalActivities}
                        </div>
                    </div>
                </div>
                <div className="stats shadow">
                    <div className="stat">
                        <div className="stat-title">Total Donations</div>
                        <div className="stat-value text-secondary">
                            {user.stats.totalDonations}
                        </div>
                    </div>
                </div>
                <div className="stats shadow">
                    <div className="stat">
                        <div className="stat-title">Badge Count</div>
                        <div className="stat-value text-accent">
                            {user.stats.badgeCount}
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs Navigation */}
            <div className="tabs tabs-boxed mb-6">
                <a
                    className={`tab ${
                        activeTab === "details" ? "tab-active" : ""
                    }`}
                    onClick={() => setActiveTab("details")}
                >
                    Details
                </a>
                <a
                    className={`tab ${
                        activeTab === "activity" ? "tab-active" : ""
                    }`}
                    onClick={() => setActiveTab("activity")}
                >
                    Activity History
                </a>
                <a
                    className={`tab ${
                        activeTab === "location" ? "tab-active" : ""
                    }`}
                    onClick={() => setActiveTab("location")}
                >
                    Location
                </a>
            </div>

            {/* Tab Content */}
            <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                    {activeTab === "details" && (
                        <div className="overflow-x-auto">
                            <table className="table">
                                <tbody>
                                    <tr>
                                        <th>Name</th>
                                        <td>{user.name}</td>
                                    </tr>
                                    <tr>
                                        <th>Email</th>
                                        <td>{user.email}</td>
                                    </tr>
                                    <tr>
                                        <th>Joined At</th>
                                        <td>{user.joinedAt}</td>
                                    </tr>
                                    <tr>
                                        <th>Status</th>
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
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeTab === "location" && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <h3 className="font-semibold mb-2">
                                        Address Details
                                    </h3>
                                    <table className="table">
                                        <tbody>
                                            <tr>
                                                <th>Country</th>
                                                <td>{user.location.country}</td>
                                            </tr>
                                            <tr>
                                                <th>State</th>
                                                <td>{user.location.state}</td>
                                            </tr>
                                            <tr>
                                                <th>City</th>
                                                <td>{user.location.city}</td>
                                            </tr>
                                            <tr>
                                                <th>Postal Code</th>
                                                <td>{user.location.postal}</td>
                                            </tr>
                                            <tr>
                                                <th>Address</th>
                                                <td>{user.location.address}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                                <div className="card bg-base-200">
                                    <div className="card-body">
                                        <h3 className="card-title">
                                            Location Map
                                        </h3>
                                        <p className="text-sm opacity-70">
                                            Map integration will be added here
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "activity" && (
                        <div className="overflow-x-auto">
                            <table className="table table-zebra w-full">
                                <thead>
                                    <tr>
                                        <th>Activity</th>
                                        <th>Date</th>
                                        <th>Duration</th>
                                        <th>Calories</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {user.activities.map((activity) => (
                                        <tr
                                            key={activity.id}
                                            className="hover:bg-base-200"
                                        >
                                            <td>
                                                <div className="font-medium">
                                                    {activity.type}
                                                </div>
                                            </td>
                                            <td>{activity.date}</td>
                                            <td>{activity.duration}</td>
                                            <td>{activity.calories} cal</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Loading Overlay */}
            {loading && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <span className="loading loading-spinner loading-lg text-primary"></span>
                </div>
            )}
        </div>
    );
};

export default UserProfilePage;
