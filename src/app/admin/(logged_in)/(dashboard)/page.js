"use client";

import React, { useState, useEffect } from "react";
// import api from "@/utils/axios/api"; // Uncomment and use for real API calls

const DashboardPage = () => {
    const [dateRange, setDateRange] = useState("7d");
    const [loading, setLoading] = useState(false);
    const [theme, setTheme] = useState("light");
    // Placeholder for fetched dashboard data
    const [dashboard, setDashboard] = useState({
        participants: "0",
           donations: "HK$0",
           volunteers: "0",
           events: "0",
           recentSignups: [],
           loading: true,
           error: null
    });

    useEffect(() => {
        const isDark =
            document.documentElement.getAttribute("data-theme") === "dark";
        setTheme(isDark ? "dark" : "light");

        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === "data-theme") {
                    const newTheme =
                        document.documentElement.getAttribute("data-theme");
                    setTheme(newTheme);
                }
            });
        });

        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ["data-theme"],
        });

        // Fetch dashboard data here (replace with real API)
        // api.get('/admin/dashboard?range=' + dateRange).then(res => setDashboard(res.data));

        return () => observer.disconnect();
    }, [dateRange]);

    const chartTextColor = theme === "dark" ? "#e2e8f0" : "#1e293b";

    const handleRefresh = async () => {
        setLoading(true);
        // Fetch dashboard data here (replace with real API)
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setLoading(false);
    };

    return (
        <div className="min-h-screen w-full overflow-y-auto p-4 lg:p-6 bg-gradient-to-br from-base-200 to-base-100">
            {/* Filters */}
            <div className="flex flex-wrap gap-4 mb-6 w-full">
                <select
                    className="select select-bordered w-full max-w-xs"
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                >
                    <option value="24h">Last 24 Hours</option>
                    <option value="7d">Last 7 Days</option>
                    <option value="30d">Last 30 Days</option>
                </select>
                <div className="join">
                    <button className="btn join-item btn-secondary">
                        Export
                    </button>
                    <button
                        className={`btn join-item btn-primary ${
                            loading ? "loading" : ""
                        }`}
                        onClick={handleRefresh}
                        disabled={loading}
                    >
                        {loading ? "Refreshing..." : "Refresh"}
                    </button>
                </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8 w-full">
                <div className="stats shadow">
                    <div className="stat bg-gradient-to-r from-secondary to-secondary-focus text-secondary-content">
                        <div className="stat-title opacity-80">
                            <span className="font-bold">
                                Active Participants
                            </span>
                        </div>
                        <div className="stat-value">
                            {dashboard.participants}
                        </div>
                        <div className="stat-desc opacity-80">All time</div>
                    </div>
                </div>
                <div className="stats shadow">
                    <div className="stat bg-gradient-to-r from-success to-success/80 text-success-content">
                        <div className="stat-title opacity-80">
                            <span className="font-bold">Donations</span>
                        </div>
                        <div className="stat-value">{dashboard.donations}</div>
                        <div className="stat-desc opacity-80">Total funds</div>
                    </div>
                </div>
                <div className="stats shadow">
                    <div className="stat bg-gradient-to-r from-accent to-accent-focus text-accent-content">
                        <div className="stat-title opacity-80">
                            <span className="font-bold">Volunteers</span>
                        </div>
                        <div className="stat-value">{dashboard.volunteers}</div>
                        <div className="stat-desc opacity-80">Registered</div>
                    </div>
                </div>
                <div className="stats shadow">
                    <div className="stat bg-gradient-to-r from-info to-info/80 text-info-content">
                        <div className="stat-title opacity-80">
                            <span className="font-bold">Events</span>
                        </div>
                        <div className="stat-value">{dashboard.events}</div>
                        <div className="stat-desc opacity-80">All time</div>
                    </div>
                </div>
            </div>

            {/* Placeholder for analytics charts */}
            <div className="grid grid-cols-1 lg:grid-cols-1 gap-4 mb-8">
                {/* Only Event Calendar remains */}
                <div className="card bg-base-100 shadow-lg">
                    <div className="card-body">
                        <h2 className="card-title text-base-content">
                            <span className="font-bold">Event Calendar</span>
                        </h2>
                        {/* TODO: Insert event calendar component */}
                        <div className="text-base-content/60 text-sm">
                            [Event calendar visualization here]
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Signups Table */}
            <div className="card bg-base-100 shadow-lg w-full mb-8">
                <div className="card-body">
                    <h2 className="card-title text-base-content">
                        <span className="font-bold">Recent Signups</span>
                    </h2>
                    <div className="overflow-x-auto">
                        <table className="table table-zebra w-full">
                            <thead>
                                <tr>
                                    <th>
                                        <span className="font-bold">User</span>
                                    </th>
                                    <th>
                                        <span className="font-bold">Date</span>
                                    </th>
                                    <th>
                                        <span className="font-bold">
                                            Status
                                        </span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {dashboard.recentSignups.map((signup) => (
                                    <tr key={`${signup.name}-${signup.date}`}>
                                        {" "}
                                        <td>{signup.name}</td>
                                        <td>{signup.date}</td>
                                        <td>
                                            <div
                                                className={`badge gap-2 ${
                                                    signup.status === "Active"
                                                        ? "badge-success"
                                                        : signup.status ===
                                                          "Pending"
                                                        ? "badge-warning"
                                                        : "badge-ghost"
                                                }`}
                                            >
                                                {signup.status}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
