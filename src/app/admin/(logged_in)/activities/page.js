"use client";

import { useState, Suspense } from "react";
import { useAdminActivities } from "@/app/shared/contexts/AdminActivitiesContext";
import { useRouter } from "next/navigation";
import Table from "@/app/admin/(logged_in)/components/Table";
import ActivityStatus from "@/app/constants/constants";
import FullPageLoader from "../components/FullPageLoader";
import { RotateCcw } from "lucide-react";
import Pagination from "@/app/admin/(logged_in)/components/Pagination";
import { ACTIVITY_TYPES, MONTHS } from "@/app/constants/constants";

const FilterBar = ({ setFilters, filters }) => {
    return (
        <div className="w-full mb-6">
            <div className="flex flex-col md:flex-row md:flex-wrap md:gap-4 lg:flex-nowrap lg:gap-4">
                <div className="flex flex-col md:flex-row md:w-full md:gap-4">
                    <div className="flex flex-col min-w-[160px] md:flex-1">
                        <label className="text-xs font-semibold mb-1">
                            Type
                        </label>
                        <select
                            className="input input-bordered min-w-[160px]"
                            value={filters.type}
                            onChange={(e) =>
                                setFilters((f) => ({
                                    ...f,
                                    type: e.target.value,
                                }))
                            }
                        >
                            <option value="">All</option>
                            {ACTIVITY_TYPES?.map((type) => {
                                const label = type
                                    .split('_')
                                    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
                                    .join(' ');
                                return (
                                    <option key={type} value={type}>
                                        {label}
                                    </option>
                                );
                            })}
                        </select>
                    </div>
                    <div className="flex flex-col min-w-[160px] md:flex-1">
                        <label className="text-xs font-semibold mb-1">
                            Month
                        </label>
                        <select
                            className="input input-bordered min-w-[160px]"
                            value={filters.month}
                            onChange={(e) =>
                                setFilters((f) => ({
                                    ...f,
                                    month: e.target.value,
                                }))
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
                    <div className="flex flex-col min-w-[180px] md:flex-1">
                        <label className="text-xs font-semibold mb-1">
                            Location
                        </label>
                        <input
                            type="text"
                            className="input input-bordered min-w-[180px]"
                            placeholder="Location"
                            value={filters.location}
                            onChange={(e) =>
                                setFilters((f) => ({
                                    ...f,
                                    location: e.target.value,
                                }))
                            }
                        />
                    </div>
                </div>
                <div className="flex flex-col md:flex-row md:w-full md:gap-4 mt-2 md:mt-0">
                    <div className="flex flex-col min-w-[140px] md:flex-1">
                        <label className="text-xs font-semibold mb-1">
                            Status
                        </label>
                        <select
                            className="input input-bordered min-w-[140px]"
                            value={filters.status}
                            onChange={(e) =>
                                setFilters((f) => ({
                                    ...f,
                                    status: e.target.value,
                                }))
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
                    <div className="flex flex-col min-w-[180px] md:flex-1">
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
                    <div className="flex items-end md:flex-1">
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

    const sortedActivities = [...activities].sort((a, b) => {
        const dateA = new Date(a.createdAt || a.created_at || 0);
        const dateB = new Date(b.createdAt || b.created_at || 0);
        return dateB - dateA;
    });

    const filteredActivities = sortedActivities.filter((a) => {
        const normalizeType = (s) =>
            (s || "")
                .toString()
                .replace(/[_\s]+/g, "")
                .toLowerCase();
        if (filters.type && normalizeType(a.activityType) !== normalizeType(filters.type)) return false;
        if (
            filters.month &&
            (!a.startDate ||
                a.startDate.length < 7 ||
                a.startDate.slice(5, 7) !== filters.month)
        )
            return false;
        if (filters.status && a.status !== filters.status) return false;
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
        "Created At",
        "Actions",
    ];

    const handleActivityClick = (activity) => {
        if (activity && activity.id) {
            router.push(`/admin/activities/viewActivity/${activity.id}`);
        }
    };

    const handlePageChange = (page) => setCurrentPage(page);

    // Ensure that when filters change we go back to page 1 so filtering works
    const handleSetFilters = (updater) => {
        setFilters((prev) => {
            const next = typeof updater === 'function' ? updater(prev) : updater;
            return next;
        });
        setCurrentPage(1);
    };

    return (
        <>
            {" "}
            <h2 className="text-2xl font-bold">Activities </h2>
            <div className="min-h-screen w-full overflow-y-auto p-4 lg:p-6">
                <div style={{ display: "flex", justifyContent: "end" }}>
                    <button
                        className="btn btn-primary"
                        onClick={() =>
                            router.push("/admin/activities/createActivity")
                        }
                    >
                        Create Activity
                    </button>
                </div>
                <div style={{ marginBottom: "30px" }}>
                    <div className="flex flex-col  md:flex-row md:items-end md:justify-between mb-6 gap-2">
                    <div className="flex-1">
                        <FilterBar setFilters={handleSetFilters} filters={filters} />
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
