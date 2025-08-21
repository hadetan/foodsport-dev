"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import SearchBar from "@/app/admin/(logged_in)/components/SearchBar";
import Dropdown from "@/app/admin/(logged_in)/components/Dropdown";
import Table from "@/app/admin/(logged_in)/components/Table";
import api from "@/utils/axios/api";
import { useUsers } from "@/app/shared/contexts/usersContext";
import FullPageLoader from "../components/FullPageLoader";
import { ChevronLeft, ChevronRight } from "lucide-react";

const UserManagementPage = () => {
    const router = useRouter();
    const { users, loading } = useUsers();
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;
    const totalPages = Math.ceil(filteredUsers.length / pageSize);

    // Hong Kong regions
    const hongKongRegions = [
        "All",
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

    // Only show users for current page
    const paginatedUsers = filteredUsers.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    );

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

                    <Dropdown items={hongKongRegions} name="All Districts" />
                </div>
            </div>

            {/* User Table */}
            <div className="overflow-x-auto rounded-lg shadow relative">
                {loading ? (
                    <FullPageLoader />
                ) : (
                    <div className="overflow-x-auto rounded-box border border-primary/60">
                        <Table
                            heading={tableHeading}
                            tableData={paginatedUsers}
                            tableType={"userPage"}
                            onRowClick={handleRowClick}
                        />
                    </div>
                )}
            </div>

            {/* Pagination */}
            <div className="flex justify-center mt-4">
                <div className="btn-group">
                    <button
                        className="btn btn-outline"
                        onClick={() =>
                            setCurrentPage((p) => Math.max(1, p - 1))
                        }
                        disabled={currentPage === 1}
                    >
                        <ChevronLeft size={18} />
                    </button>
                    <button className="btn btn-outline cursor-default" disabled>
                        Page {currentPage}
                    </button>
                    <button
                        className="btn btn-outline"
                        onClick={() =>
                            setCurrentPage((p) => Math.min(totalPages, p + 1))
                        }
                        disabled={
                            currentPage === totalPages || totalPages === 0
                        }
                    >
                        <ChevronRight size={18} />
                    </button>
                </div>
            </div>
        </>
    );
};

export default UserManagementPage;
