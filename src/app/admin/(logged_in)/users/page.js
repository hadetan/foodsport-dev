"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ErrorAlert from "@/app/shared/components/ErrorAlert";
import UserRow from "@/app/admin/(logged_in)/users/userRow";
import { Search, CheckCircle2, Menu } from "lucide-react";
import SearchBar from "@/app/admin/(logged_in)/components/SearchBar";
import Dropdown from "@/app/admin/(logged_in)/components/Dropdown";
import Table from "@/app/admin/(logged_in)/components/Table";
const UserManagementPage = () => {
    const router = useRouter();
    const [users, setUsers] = useState([]);
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

    // Simulate initial data loading
    useEffect(() => {
        setTableLoading(true);
        fetch("http://localhost:3000/api/admin/users")
            .then(async (res) => {
                const data = await res.json();
                setUsers(data.users);
            })

            .catch(() => {
                setUsers([]);
            })
            .finally(() => {
                setTableLoading(false);
            });
    }, []);

    const statusOfUser = ["Active", "Inactive"];
    const tableHeading = [
        "User Info",
        "Status",
        "Location",
        "Statistics",
        "Actions",
    ];
    return (
        <>
            <div className="text-2xl mb-5 text-base-content">Manage Users</div>
            {/* Search and Filters */}
            <div className="flex gap-4">
                <SearchBar placeholderName="Search Users" />

                {/* Enhanced Filters */}
                <div className="flex flex-wrap gap-2">
                    <Dropdown items={statusOfUser} name="Status" />

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
                {tableLoading ? (
                    <div className="min-h-[300px] flex items-center justify-center">
                        <span className="loading loading-spinner loading-lg"></span>
                    </div>
                ) : (
                    <div className="overflow-x-auto rounded-box border border-primary/60">
                        <Table heading={tableHeading} tableData={users} tableType ={"userPage"}/>
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
