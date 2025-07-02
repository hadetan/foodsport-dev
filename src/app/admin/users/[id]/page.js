"use client";

import { useState } from "react";

const UserProfilePage = ({ params }) => {
    const [activeTab, setActiveTab] = useState("details");
    const [loading, setLoading] = useState(false);

    // Mock user data - Replace with API call
    const user = {
        id: params.id,
        name: "John Doe",
        email: "john@example.com",
        status: "active",
        role: "user",
        avatar: "/default-avatar.png",
        joinDate: "2023-01-01",
        lastLogin: "2023-06-30",
        activities: [
            {
                id: 1,
                type: "login",
                date: "2023-06-30 15:00",
                description: "Logged in successfully",
            },
            {
                id: 2,
                type: "profile_update",
                date: "2023-06-29 10:30",
                description: "Updated profile picture",
            },
        ],
    };

    const handleStatusChange = async (newStatus) => {
        setLoading(true);
        // Implement status change logic here
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setLoading(false);
    };

    return (
        <div className="p-4">
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
                                <span className="badge badge-primary">
                                    {user.role}
                                </span>
                                <span
                                    className={`badge ${
                                        user.status === "active"
                                            ? "badge-success"
                                            : user.status === "inactive"
                                            ? "badge-warning"
                                            : "badge-error"
                                    }`}
                                >
                                    {user.status}
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
                                                handleStatusChange("inactive")
                                            }
                                        >
                                            Deactivate
                                        </a>
                                    </li>
                                    <li>
                                        <a
                                            onClick={() =>
                                                handleStatusChange("suspended")
                                            }
                                            className="text-error"
                                        >
                                            Suspend
                                        </a>
                                    </li>
                                </ul>
                            </div>
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
                        activeTab === "settings" ? "tab-active" : ""
                    }`}
                    onClick={() => setActiveTab("settings")}
                >
                    Settings
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
                                        <th>Join Date</th>
                                        <td>{user.joinDate}</td>
                                    </tr>
                                    <tr>
                                        <th>Last Login</th>
                                        <td>{user.lastLogin}</td>
                                    </tr>
                                    <tr>
                                        <th>Status</th>
                                        <td>{user.status}</td>
                                    </tr>
                                    <tr>
                                        <th>Role</th>
                                        <td>{user.role}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeTab === "activity" && (
                        <div className="overflow-x-auto">
                            <ul className="timeline timeline-vertical">
                                {user.activities.map((activity) => (
                                    <li key={activity.id}>
                                        <div className="timeline-start">
                                            {activity.date}
                                        </div>
                                        <div className="timeline-middle">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 20 20"
                                                fill="currentColor"
                                                className="w-5 h-5"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        </div>
                                        <div className="timeline-end timeline-box">
                                            {activity.description}
                                        </div>
                                        <hr />
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {activeTab === "settings" && (
                        <div className="space-y-4">
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text">Role</span>
                                </label>
                                <select className="select select-bordered w-full max-w-xs">
                                    <option>User</option>
                                    <option>Admin</option>
                                    <option>Moderator</option>
                                </select>
                            </div>

                            <div className="form-control">
                                <label className="label cursor-pointer">
                                    <span className="label-text">
                                        Email Notifications
                                    </span>
                                    <input
                                        type="checkbox"
                                        className="toggle"
                                        defaultChecked
                                    />
                                </label>
                            </div>

                            <div className="form-control">
                                <label className="label cursor-pointer">
                                    <span className="label-text">
                                        Two-Factor Authentication
                                    </span>
                                    <input type="checkbox" className="toggle" />
                                </label>
                            </div>

                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text">Notes</span>
                                </label>
                                <textarea
                                    className="textarea textarea-bordered h-24"
                                    placeholder="Admin notes about this user"
                                ></textarea>
                            </div>

                            <button className="btn btn-primary">
                                Save Settings
                            </button>
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
