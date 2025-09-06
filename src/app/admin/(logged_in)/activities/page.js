"use client";

import { useState, Suspense } from "react";
import { useAdminActivities } from "@/app/shared/contexts/AdminActivitiesContext";
import { useRouter } from "next/navigation";
import Table from "@/app/admin/(logged_in)/components/Table";
import ActivityStatus from "@/app/constants/constants";
import FullPageLoader from "../components/FullPageLoader";
import { RotateCcw } from "lucide-react";
import Pagination from "@/app/admin/(logged_in)/components/Pagination";
import { ACTIVITY_TYPES, MONTHS } from "@/app/constants/constants"; // Ensure this exists or define locally

// Responsive filter bar
const FilterBar = ({ setFilters, filters }) => {
    return (
        <div className="flex flex-col gap-2 md:flex-row md:gap-4 w-full mb-6">
            {/* Type Filter */}
            <div className="flex flex-col min-w-[160px]">
                <label className="text-xs font-semibold mb-1">Type</label>
                <select
                    className="input input-bordered min-w-[160px]"
                    value={filters.type}
                    onChange={(e) =>
                        setFilters((f) => ({ ...f, type: e.target.value }))
                    }
                >
                    <option value="">All</option>
                    {ACTIVITY_TYPES?.map((type) => (
                        <option key={type} value={type}>
                            {type}
                        </option>
                    ))}
                </select>
            </div>
            {/* Month Filter */}
            <div className="flex flex-col min-w-[160px]">
                <label className="text-xs font-semibold mb-1">Month</label>
                <select
                    className="input input-bordered min-w-[160px]"
                    value={filters.month}
                    onChange={(e) =>
                        setFilters((f) => ({ ...f, month: e.target.value }))
                    }
                >
                    <option value="">All</option>
                    {MONTHS.map((m) => (
                        <option key={m.value} value={m.value}>
                            {m.label}
                        </option>
                    ))}
                </select>
            </div>
            {/* Location Filter */}
            <div className="flex flex-col min-w-[180px]">
                <label className="text-xs font-semibold mb-1">Location</label>
                <input
                    type="text"
                    className="input input-bordered min-w-[180px]"
                    placeholder="Location"
                    value={filters.location}
                    onChange={(e) =>
                        setFilters((f) => ({ ...f, location: e.target.value }))
                    }
                />
            </div>
            {/* Status Filter */}
            <div className="flex flex-col min-w-[140px]">
                <label className="text-xs font-semibold mb-1">Status</label>
                <select
                    className="input input-bordered min-w-[140px]"
                    value={filters.status}
                    onChange={(e) =>
                        setFilters((f) => ({ ...f, status: e.target.value }))
                    }
                >
                    <option value="">All</option>
                    {Object.values(ActivityStatus).map((status) => (
                        <option key={status} value={status}>
                            {status}
                        </option>
                    ))}
                </select>
            </div>
            {/* Activity Name Filter */}
            <div className="flex flex-col min-w-[180px]">
                <label className="text-xs font-semibold mb-1">
                    Activity Name
                </label>
                <input
                    type="text"
                    className="input input-bordered min-w-[180px]"
                    placeholder="Search activity name"
                    value={filters.activityName || ""}
                    onChange={(e) =>
                        setFilters((f) => ({
                            ...f,
                            activityName: e.target.value,
                        }))
                    }
                />
            </div>
            {/* Reset Icon */}
            <div className="flex items-end">
                <button
                    type="button"
                    className="btn btn-ghost p-2"
                    title="Reset filters"
                    onClick={() =>
                        setFilters({
                            type: "",
                            month: "",
                            location: "",
                            status: "",
                            activityName: "",
                        })
                    }
                >
                    <RotateCcw className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};

function ActivityManagementPageContent() {
    const router = useRouter();
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);
    const [filters, setFilters] = useState({
        type: "",
        month: "",
        location: "",
        status: "",
        activityName: "",
    });

    const { activities, loading: tableLoading } = useAdminActivities();

    // Sort activities by creation date (descending)
    const sortedActivities = [...activities].sort((a, b) => {
        const dateA = new Date(a.createdAt || a.created_at || 0);
        const dateB = new Date(b.createdAt || b.created_at || 0);
        return dateB - dateA;
    });

    const filteredActivities = sortedActivities.filter((a) => {
        // Type filter
        if (filters.type && a.activityType !== filters.type) return false;
        // Month filter (checks month of startDate)
        if (
            filters.month &&
            (!a.startDate ||
                a.startDate.length < 7 ||
                a.startDate.slice(5, 7) !== filters.month)
        )
            return false;
        // Status filter
        if (filters.status && a.status !== filters.status) return false;
        // Location filter (partial match, case-insensitive)
        if (
            filters.location &&
            (!a.location ||
                !a.location
                    .toLowerCase()
                    .includes(filters.location.toLowerCase()))
        )
            return false;
        if (
            filters.activityName &&
            (!a.title ||
                !a.title
                    .toLowerCase()
                    .includes(filters.activityName.toLowerCase()))
        )
            return false;
        return true;
    });

    const paginatedActivities = filteredActivities.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    );

    const totalPages = Math.ceil(filteredActivities.length / pageSize);
    const tableHeading = [
        "Activity",
        "Type",
        "Date & Time",
        "Location",
        "Capacity",
        "Status",
        "Created At", // <-- Added column heading
        "Actions",
    ];

    const handleActivityClick = (activity) => {
        if (activity && activity.id) {
            router.push(`/admin/activities/viewActivity/${activity.id}`);
        }
    };

    const handlePageChange = (page) => setCurrentPage(page);

    return (
        <>
            {" "}
            <h2 className="text-2xl font-bold">Activities</h2>
            <div className="min-h-screen w-full overflow-y-auto p-4 lg:p-6">
                {/* Responsive Filters + Create Button inline */}
                <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-6 gap-2">
                    <div className="flex-1">
                        <FilterBar setFilters={setFilters} filters={filters} />
                    </div>
                    <div className="mt-2 md:mt-0 md:ml-4 flex-shrink-0">
                        <button
                            className="btn btn-primary"
                            onClick={() =>
                                router.push("/admin/activities/createActivity")
                            }
                        >
                            Create Activity
                        </button>
                    </div>
                </div>
                {/* Activities Table */}
                <div className="overflow-x-auto bg-base-100 rounded-lg shadow relative">
                    {tableLoading ? (
                        <FullPageLoader />
                    ) : (
                        <div className="overflow-x-auto">
                            <Table
                                heading={tableHeading}
                                tableData={paginatedActivities}
                                tableType={"acitivityPage"}
                                onRowClick={handleActivityClick}
                                className="cursor-pointer"
                            />
                        </div>
                    )}
                    {/* Pagination */}
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                    />
                </div>
            </div>
        </>
    );
}

export default function ActivityManagementPage() {
    return (
        <Suspense>
            <ActivityManagementPageContent />
        </Suspense>
    );
}
