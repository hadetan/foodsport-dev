"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Dropdown from "@/app/admin/(logged_in)/components/Dropdown";
import Table from "@/app/admin/(logged_in)/components/Table";

const ActivityManagementPage = () => {
    const router = useRouter();
    const [tableLoading, setTableLoading] = useState(true);

    const tableHeading = [
        "Activity",
        "Type",
        "Date & Time",
        "Location",
        "Capacity",
        "Status",
        "Actions",
    ];

    // Mock data - Replace with actual API call
    const activities = [
        {
            id: 1,
            title: "Morning Yoga Session",
            type: "Yoga",
            status: "active",
            date: "2025-07-10",
            time: "08:00 AM",
            location: "Central Park",
            capacity: 20,
            enrolled: 15,
            image: "/bg-1.png",
        },
        {
            id: 2,
            title: "Evening Run Club",
            type: "Running",
            status: "inactive",
            date: "2025-07-11",
            time: "06:00 PM",
            location: "City Track",
            capacity: 30,
            enrolled: 10,
            image: "/bg-2.png",
        },
    ];

    useEffect(() => {
        setTimeout(() => {
            setTableLoading(false);
        }, 1000);
    }, []);

    const statusOfUser = ["Active", "Inactive"];

    return (
        <div className="min-h-screen w-full overflow-y-auto p-4 lg:p-6">
            {/* Create Activity Button */}
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
                <Dropdown items={statusOfUser} name="Status" />
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
                            tableData={activities}
                            tableType={"acitivityPage"}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default ActivityManagementPage;
