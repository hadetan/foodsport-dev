"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import SearchBar from "@/app/admin/(logged_in)/components/SearchBar";
import Dropdown from "@/app/admin/(logged_in)/components/Dropdown";
import Table from "@/app/admin/(logged_in)/components/Table";
import { useUsers } from "@/app/shared/contexts/usersContext";
import FullPageLoader from "../components/FullPageLoader";
import Pagination from "@/app/admin/(logged_in)/components/Pagination";

const UserManagementContent = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { users, loading } = useUsers();
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const pageSize = 10;

    // Get current page from URL, default to 1
    const currentPage = parseInt(searchParams.get("page")) || 1;
    const totalPages = Math.ceil(filteredUsers.length / pageSize);

    useEffect(() => {
        if (!Array.isArray(users) || loading) {
            setFilteredUsers([]);
            return;
        }

        const q = String(searchQuery || "")
            .trim()
            .toLowerCase();

        const filtered = users.filter((user) => {
            const fullName = `${user.firstname || ""} ${
                user.lastname || ""
            }`.toLowerCase();
            const email = (user.email || "").toLowerCase();
            const id = String(user.id || user.userId || "").toLowerCase();

            const matchesSearch =
                !q ||
                fullName.includes(q) ||
                email.includes(q) ||
                id.includes(q);

            const matchesStatus =
                statusFilter === "all" ||
                (statusFilter === "active" &&
                    user.isActive &&
                    user.isRegistered !== false) ||
                (statusFilter === "inactive" &&
                    !user.isActive &&
                    user.isRegistered !== false) ||
                (statusFilter === "unregistered" &&
                    user.isRegistered === false);

            return matchesSearch && matchesStatus;
        });

        setFilteredUsers(filtered);

        // Reset to page 1 when filters change
        if (searchQuery || statusFilter !== "all") {
            const params = new URLSearchParams();
            params.set("page", "1");
            router.replace(`?${params.toString()}`, { scroll: false });
        }
    }, [searchQuery, users, statusFilter, loading, router]);

    // Add handler for row click
    const handleRowClick = (userId) => {
        router.push(`/admin/users/${userId}?returnPage=${currentPage}`);
    };

    const statusOfUser = ["All", "Active", "Inactive", "Unregistered"];
    const tableHeading = [
        "User Info",
        "Registered At",
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

    const handlePageChange = (page) => {
        // Update URL with new page number
        const params = new URLSearchParams();
        params.set("page", page.toString());
        router.push(`?${params.toString()}`, { scroll: false });
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

const UserManagementPage = () => (
    <Suspense fallback={<FullPageLoader />}>
        <UserManagementContent />
    </Suspense>
);

export default UserManagementPage;
