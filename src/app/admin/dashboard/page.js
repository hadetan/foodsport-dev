"use client";

import React, { useState } from "react";

const DashboardPage = () => {
    const [dateRange, setDateRange] = useState("7d");

    return (
        <div className="p-6 bg-gradient-to-br from-blue-50 to-purple-50">
            {/* Filters */}
            <div className="flex flex-wrap gap-4 mb-6">
                <select
                    className="select bg-white border-2 border-blue-300 text-blue-600 w-full max-w-xs focus:border-blue-500"
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                >
                    <option value="24h">Last 24 Hours</option>
                    <option value="7d">Last 7 Days</option>
                    <option value="30d">Last 30 Days</option>
                </select>
                <div className="join">
                    <button className="btn join-item bg-purple-500 hover:bg-purple-600 border-0 text-white">
                        Export
                    </button>
                    <button className="btn join-item bg-blue-500 hover:bg-blue-600 border-0 text-white">
                        Refresh
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="stats bg-gradient-to-r from-blue-500 to-blue-400 text-white shadow-lg">
                    <div className="stat">
                        <div className="stat-title opacity-80">Total Users</div>
                        <div className="stat-value">1,234</div>
                        <div className="stat-desc opacity-80">
                            ↑ 12% from last period
                        </div>
                    </div>
                </div>

                <div className="stats bg-gradient-to-r from-purple-500 to-purple-400 text-white shadow-lg">
                    <div className="stat">
                        <div className="stat-title opacity-80">
                            Active Activities
                        </div>
                        <div className="stat-value">56</div>
                        <div className="stat-desc opacity-80">
                            ↑ 8% from last period
                        </div>
                    </div>
                </div>

                <div className="stats bg-gradient-to-r from-green-500 to-green-400 text-white shadow-lg">
                    <div className="stat">
                        <div className="stat-title opacity-80">
                            Total Rewards
                        </div>
                        <div className="stat-value">789</div>
                        <div className="stat-desc opacity-80">
                            ↓ 3% from last period
                        </div>
                    </div>
                </div>

                <div className="stats bg-gradient-to-r from-orange-500 to-orange-400 text-white shadow-lg">
                    <div className="stat">
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
            <div className="card bg-white shadow-lg border border-blue-100">
                <div className="card-body">
                    <h2 className="card-title text-blue-600">Recent Signups</h2>
                    <div className="overflow-x-auto">
                        <table className="table">
                            <thead>
                                <tr className="bg-blue-50">
                                    <th className="text-blue-600">User</th>
                                    <th className="text-blue-600">Date</th>
                                    <th className="text-blue-600">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="hover:bg-blue-50">
                                    <td>John Doe</td>
                                    <td>2025-07-01</td>
                                    <td>
                                        <div className="badge bg-green-100 text-green-600 border-0">
                                            Active
                                        </div>
                                    </td>
                                </tr>
                                <tr className="hover:bg-blue-50">
                                    <td>Jane Smith</td>
                                    <td>2025-07-01</td>
                                    <td>
                                        <div className="badge bg-orange-100 text-orange-600 border-0">
                                            Pending
                                        </div>
                                    </td>
                                </tr>
                                <tr className="hover:bg-blue-50">
                                    <td>Mike Johnson</td>
                                    <td>2025-06-30</td>
                                    <td>
                                        <div className="badge bg-green-100 text-green-600 border-0">
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
