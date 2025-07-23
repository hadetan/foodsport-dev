"use client";
import axiosClient from "@/utils/axios/api";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Dropdown from "@/app/admin/(logged_in)/components/Dropdown";
import Table from "@/app/admin/(logged_in)/components/Table";

const ActivityManagementPage = () => {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(false); // Added loading state
    const [activeStep, setActiveStep] = useState(1); // Added activeStep state
    const router = useRouter();
    const [tableLoading, setTableLoading] = useState(true);
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
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
    const tableHeading = [
        "Activity",
        "Type",
        "Date & Time",
        "Location",
        "Capacity",
        "Status",
        "Actions",
    ];
    const getActivities = async () => {
        try {
            setTableLoading(true);
            const response = await axiosClient.get("/admin/activities");

            let data = response.data;
            setActivities(data.activities);
        } finally {
            setTableLoading(false);
        }
    };

    useEffect(() => {
        getActivities();
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
