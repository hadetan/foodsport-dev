"use client";

import React, { useState, useEffect } from "react";

const DashboardPage = () => {
    const [dateRange, setDateRange] = useState("7d");
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState(null);
    const [theme, setTheme] = useState("light");

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

        return () => observer.disconnect();
    }, []);

    const chartTextColor = theme === "dark" ? "#e2e8f0" : "#1e293b";

    const handleRefresh = async () => {
        setLoading(true);
        // TODO: Implement API call
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

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8 w-full">
                <div className="stats shadow">
                    <div className="stat bg-gradient-to-r from-primary to-primary-focus text-primary-content">
                        <div className="stat-title opacity-80">Total Users</div>
                        <div className="stat-value">1,234</div>
                        <div className="stat-desc opacity-80">
                            ↑ 12% from last period
                        </div>
                    </div>
                </div>

                <div className="stats shadow">
                    <div className="stat bg-gradient-to-r from-secondary to-secondary-focus text-secondary-content">
                        <div className="stat-title opacity-80">
                            Active Activities
                        </div>
                        <div className="stat-value">56</div>
                        <div className="stat-desc opacity-80">
                            ↑ 8% from last period
                        </div>
                    </div>
                </div>

                <div className="stats shadow">
                    <div className="stat bg-gradient-to-r from-success to-success/80 text-success-content">
                        <div className="stat-title opacity-80">
                            Total Rewards
                        </div>
                        <div className="stat-value">789</div>
                        <div className="stat-desc opacity-80">
                            ↓ 3% from last period
                        </div>
                    </div>
                </div>

                <div className="stats shadow">
                    <div className="stat bg-gradient-to-r from-accent to-accent-focus text-accent-content">
                        <div className="stat-title opacity-80">
                            Total Donations
                        </div>
                        <div className="stat-value">45.2k</div>
                        <div className="stat-desc opacity-80">
                            ↑ 15% from last period
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Signups Table */}
            <div className="card bg-base-100 shadow-lg w-full">
                <div className="card-body">
                    <h2 className="card-title text-base-content">
                        Recent Signups
                    </h2>
                    <div className="overflow-x-auto">
                        <table className="table table-zebra w-full">
                            <thead>
                                <tr>
                                    <th>User</th>
                                    <th>Date</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>John Doe</td>
                                    <td>2025-07-01</td>
                                    <td>
                                        <div className="badge badge-success gap-2">
                                            Active
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td>Jane Smith</td>
                                    <td>2025-07-01</td>
                                    <td>
                                        <div className="badge badge-warning gap-2">
                                            Pending
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td>Mike Johnson</td>
                                    <td>2025-06-30</td>
                                    <td>
                                        <div className="badge badge-success gap-2">
                                            Active
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
