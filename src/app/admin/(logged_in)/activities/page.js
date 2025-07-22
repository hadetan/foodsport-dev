"use client";
import axiosClient from "@/utils/axios/api";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Dropdown from "@/app/admin/(logged_in)/components/Dropdown";
import Table from "@/app/admin/(logged_in)/components/Table";

const activityStatusOptions = [
    "upcoming",
    "active",
    "closed",
    "completed",
    "cancelled",
    "draft",
];

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
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);
    const [selectedStatus, setSelectedStatus] = useState(""); // Add selected status

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

    // POST handler for creating a new activity

    return (
        <div className="min-h-screen w-full overflow-y-auto p-4 lg:p-6 flex flex-col">
            <div className="flex flex-col items-center">
                <h2 className="text-5xl font-bold text-center mb-8">
                    Activities
                </h2>
            </div>

            {/* Create Activity Button and Filters */}
            <div className="flex flex-row justify-between items-center gap-6 mb-6">
                <button
                    className="btn btn-primary btn-xl h-16 px-10 text-xl"
                    onClick={() =>
                        router.push("/admin/activities/createActivity")
                    }
                >
                    Create Activity
                </button>
                <div className="w-full max-w-xs">
                    <select
                        className="select select-lg w-full text-xl"
                        value={selectedStatus}
                        onChange={(e) => {
                            setSelectedStatus(e.target.value);
                            setCurrentPage(1);
                        }}
                    >
                        <option value="">All Status</option>
                        {activityStatusOptions.map((status) => (
                            <option key={status} value={status}>
                                {status.charAt(0).toUpperCase() +
                                    status.slice(1)}
                            </option>
                        ))}
                    </select>
                </div>
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
                            tableData={paginatedActivities}
                            tableType={"acitivityPage"}
                        />
                    </div>
                )}
            </div>

            {/* Pagination Controls */}
            {!tableLoading && totalPages > 1 && (
                <div className="flex justify-center items-center mt-6 gap-2">
                    <button
                        className="btn btn-sm"
                        onClick={() =>
                            setCurrentPage((p) => Math.max(1, p - 1))
                        }
                        disabled={currentPage === 1}
                    >
                        Prev
                    </button>
                    <span>
                        Page {currentPage} of {totalPages}
                    </span>
                    <button
                        className="btn btn-sm"
                        onClick={() =>
                            setCurrentPage((p) => Math.min(totalPages, p + 1))
                        }
                        disabled={currentPage === totalPages}
                    >
                        Next
                    </button>
                </div>
            )}

            <dialog id="create_activity_modal" className="modal">
                <div className="modal-box w-11/12 max-w-3xl">
                    <h3 className="font-bold text-lg mb-4">
                        Create New Activity
                    </h3>
                </div>
            </dialog>

            {/* View Participants Modal */}
            <dialog id="view_participants_modal" className="modal">
                <div className="modal-box w-11/12 max-w-3xl">
                    <h3 className="font-bold text-lg mb-4">
                        Activity Participants
                    </h3>

                    {/* Stats */}
                    <div className="stats shadow mb-4 w-full">
                        <div className="stat">
                            <div className="stat-title">Total Enrolled</div>
                            <div className="stat-value">15</div>
                            <div className="stat-desc">Out of 20 spots</div>
                        </div>

                        <div className="stat">
                            <div className="stat-title">Capacity</div>
                            <div className="stat-value text-success">75%</div>
                            <div className="stat-desc text-success">
                                5 spots left
                            </div>
                        </div>
                    </div>

                    {/* Participants Table */}
                    <div className="overflow-x-auto">
                        <table className="table table-zebra">
                            <thead>
                                <tr>
                                    <th>User</th>
                                    <th>Join Date</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>
                                        <div className="flex items-center space-x-3">
                                            <div className="avatar">
                                                <div className="mask mask-squircle w-12 h-12">
                                                    <img
                                                        src="/default-avatar.png"
                                                        alt="Avatar"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <div className="font-bold">
                                                    John Doe
                                                </div>
                                                <div className="text-sm opacity-50">
                                                    john@example.com
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>2025-07-01</td>
                                    <td>
                                        <div className="badge badge-success">
                                            Confirmed
                                        </div>
                                    </td>
                                    <td>
                                        <button className="btn btn-sm btn-ghost text-error">
                                            Remove
                                        </button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div className="modal-action">
                        <form method="dialog">
                            <button className="btn">Close</button>
                        </form>
                    </div>
                </div>
                <form method="dialog" className="modal-backdrop">
                    <button>close</button>
                </form>
            </dialog>

            {/* Image Preview Modal */}
            <dialog
                id="image_preview_modal"
                className={`modal ${isImageModalOpen ? "modal-open" : ""}`}
            >
                <div className="modal-box w-11/12 max-w-5xl">
                    <h3 className="font-bold text-lg mb-4">Activity Image</h3>
                    {selectedImage && (
                        <img
                            src={selectedImage}
                            alt="Activity"
                            className="w-full rounded-lg"
                        />
                    )}
                    <div className="modal-action">
                        <button
                            className="btn"
                            onClick={() => setIsImageModalOpen(false)}
                        >
                            Close
                        </button>
                    </div>
                </div>
                <form method="dialog" className="modal-backdrop">
                    <button onClick={() => setIsImageModalOpen(false)}>
                        close
                    </button>
                </form>
            </dialog>

            {/* Loading Overlay */}
            {loading && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-base-100 rounded-lg p-4 flex flex-col items-center space-y-2">
                        <span className="loading loading-spinner loading-lg"></span>
                        <p className="text-base-content">Processing...</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ActivityManagementPage;
