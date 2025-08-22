"use client";

import { useState, useEffect, Suspense } from "react";
import { useAdminActivities } from "@/app/shared/contexts/AdminActivitiesContext";
import { useRouter, useSearchParams } from "next/navigation";
import Dropdown from "@/app/admin/(logged_in)/components/Dropdown";
import Table from "@/app/admin/(logged_in)/components/Table";
import ActivityStatus from "@/app/constants/constants";
import FullPageLoader from "../components/FullPageLoader";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Pagination from "@/app/admin/(logged_in)/components/Pagination";

function ActivityManagementPageContent() {
    const [activity, setActivity] = useState(null);
    const router = useRouter();
    const searchParams = useSearchParams();
    const view = searchParams.get("view") || "list";
    const [formData, setFormData] = useState({
        title: "",
        type: "",
        description: "",
        date: "",
        time: "",
        location: "",
        capacity: "",
        images: [],
        status: "draft",
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);
    const [selectedStatus, setSelectedStatus] = useState("");

    const {
        activities,
        setActivities,
        loading: tableLoading,
    } = useAdminActivities();

    const filteredActivities = selectedStatus
        ? activities.filter((a) => a.status === selectedStatus)
        : activities;

    const paginatedActivities = filteredActivities.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    );

    const totalPages = Math.ceil(filteredActivities.length / pageSize);
    const tableHeading = [
        "Activity",
        "Type",
        "Start Date",
        "End Date",
        "Start Time",
        "End Time",
        "Location",
        "Capacity",
        "Status",
        "Actions",
    ];

    const handleActivityClick = (activity) => {
        if (activity && activity.id) {
            router.push(`/admin/activities/viewActivity/${activity.id}`);
        }
    };

    const handlePageChange = (page) => setCurrentPage(page);

    return (
        <div className="min-h-screen w-full overflow-y-auto p-4 lg:p-6">
            <div className="flex justify-between mb-6">
                <button
                    className="btn btn-primary"
                    onClick={() =>
                        router.push("/admin/activities/createActivity")
                    }
                >
                    Create Activity
                </button>
                <h2 className="text-2xl font-bold">Activities</h2>
            </div>
            {/* Search and Filters */}
            <div className="flex flex-col lg:flex-row gap-4 mb-6">
                {/* <Dropdown items={statusOfUser} name="Status" /> */}
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
    );
}

export default function ActivityManagementPage() {
    return (
        <Suspense>
            <ActivityManagementPageContent />
        </Suspense>
    );
}
