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
import { DISTRICTS } from "@/app/constants/constants";
import Pagination from "@/app/admin/(logged_in)/components/Pagination";

const UserManagementPage = () => {
    const router = useRouter();
    const { users, loading } = useUsers();
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;
    const totalPages = Math.ceil(filteredUsers.length / pageSize);

    // Format district names for display (replace underscores with spaces, capitalize)
    const formatDistrict = (district) =>
        district.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

    const hongKongRegions = ["All", ...DISTRICTS.map(formatDistrict)];

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

    const handlePageChange = (page) => setCurrentPage(page);

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
            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
            />
        </>
    );
};

export default UserManagementPage;
