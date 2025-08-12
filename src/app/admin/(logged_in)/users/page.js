"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import SearchBar from "@/app/admin/(logged_in)/components/SearchBar";
import Dropdown from "@/app/admin/(logged_in)/components/Dropdown";
import Table from "@/app/admin/(logged_in)/components/Table";
import api from "@/utils/axios/api";
import { useUsers } from "@/app/shared/contexts/usersContenxt";

const UserManagementPage = () => {
    const router = useRouter();
    const { users, loading } = useUsers();
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

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

    useEffect(() => {
        if (!Array.isArray(users) || loading) {
            setFilteredUsers([]);
            return;
        }

        const filtered = users.filter((user) => {
            const fullName = `${user.firstname} ${user.lastname}`.toLowerCase();
            const matchesSearch = fullName.includes(searchQuery.toLowerCase());

            const matchesStatus =
                statusFilter === "all" ||
                (statusFilter === "active" && user.isActive) ||
                (statusFilter === "inactive" && !user.isActive);

            return matchesSearch && matchesStatus;
        });

        setFilteredUsers(filtered);
    }, [searchQuery, users, statusFilter, loading]);

    // Add handler for row click
    const handleRowClick = (userId) => {
        router.push(`/admin/users/${userId}`);
    };

    const statusOfUser = ["All", "Active", "Inactive"];
    const tableHeading = [
        "User Info",
        "Joined At",
        "Status",
        "Statistics",
        "Actions",
    ];

    const handleStatusChange = (status) => {
        setStatusFilter(status.toLowerCase());
    };

    return (
        <>
            <div className="text-2xl mb-5 text-base-content">Manage Users</div>
            {/* Search and Filters */}
            <div className="flex gap-4">
                <SearchBar
                    placeholderName="Search Users"
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                />

                {/* Enhanced Filters */}
                <div className="flex flex-wrap gap-2">
                    <Dropdown
                        items={statusOfUser}
                        name="Status"
                        selectedValue={
                            statusFilter === "all"
                                ? "All"
                                : statusFilter.charAt(0).toUpperCase() +
                                  statusFilter.slice(1)
                        }
                        onSelect={handleStatusChange}
                    />

                    <select
                        className="select select-bordered w-full lg:w-48"
                        defaultValue="Hong Kong"
                        disabled
                    >
                        <option value="Hong Kong">Hong Kong</option>
                    </select>

                    <Dropdown items={hongKongRegions} name="All Districts" />
                </div>
            </div>

            {/* User Table */}
            <div className="overflow-x-auto rounded-lg shadow relative">
                {loading ? (
                    <div className="min-h-[300px] flex items-center justify-center">
                        <span className="loading loading-spinner loading-lg"></span>
                    </div>
                ) : (
                    <div className="overflow-x-auto rounded-box border border-primary/60">
                        <Table
                            heading={tableHeading}
                            tableData={filteredUsers}
                            tableType={"userPage"}
                            onRowClick={handleRowClick}
                        />
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
        </>
    );
};

export default UserManagementPage;
