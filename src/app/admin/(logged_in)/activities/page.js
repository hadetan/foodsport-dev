"use client";

import { Suspense, useState } from "react";
import { useRouter } from "next/navigation";
import Table from "@/app/admin/(logged_in)/components/Table";
import { useAdminActivities } from "@/app/shared/contexts/adminActivityContext";

const ActivityManagementPageContent = () => {
    const router = useRouter();
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);
    const [selectedStatus, setSelectedStatus] = useState("");

    const { adminActivities, loading: tableLoading } = useAdminActivities();

    const filteredActivities = selectedStatus
        ? adminActivities.filter((a) => a.status === selectedStatus)
        : adminActivities;

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
                    <div className="min-h-[300px] flex items-center justify-center">
                        <span className="loading loading-spinner loading-lg"></span>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <Table
                            heading={tableHeading}
                            tableData={adminActivities}
                            tableType={"acitivityPage"}
                        />
                    </div>
                )}
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
