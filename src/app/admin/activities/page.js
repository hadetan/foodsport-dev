"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ErrorAlert from "@/components/ErrorAlert";
import { Users, Pencil, Trash2, Search } from "lucide-react";

const ActivityManagementPage = () => {
    const router = useRouter();
    const [activeStep, setActiveStep] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [loading, setLoading] = useState(false);
    const [tableLoading, setTableLoading] = useState(true);
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [notification, setNotification] = useState({
        show: false,
        message: "",
        type: "",
    });
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

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        setFormData((prev) => ({
            ...prev,
            images: [...prev.images, ...files],
        }));
    };

    // Auto-dismiss notifications
    useEffect(() => {
        if (notification.show) {
            const timer = setTimeout(() => {
                setNotification((prev) => ({ ...prev, show: false }));
            }, 4000);
            return () => clearTimeout(timer);
        }
    }, [notification.show]);

    // Simulate initial data loading
    useEffect(() => {
        setTimeout(() => {
            setTableLoading(false);
        }, 1000);
    }, []);

    return (
        <div className="min-h-screen w-full overflow-y-auto p-4 lg:p-6">
            {/* Brief Auto-dismissing Alert */}
            {notification.show && (
                <div
                    className={`alert ${
                        notification.type === "success"
                            ? "alert-success"
                            : "alert-error"
                    } fixed top-4 right-4 z-50 w-auto min-w-[200px] transition-opacity duration-300`}
                >
                    <span>{notification.message}</span>
                </div>
            )}

            {/* /* Create Activity Button */}
            <div className="flex justify-between mb-6">
                <h2 className="text-2xl font-bold">Activities</h2>
                <button
                    className="btn btn-primary"
                    onClick={() =>
                        router.push("/admin/activities/createActivity")
                    }
                >
                    Create Activity
                </button>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col lg:flex-row gap-4 mb-6">
                <div className="flex-1 relative">
                    <input
                        type="text"
                        placeholder="Search activities..."
                        className="input input-bordered w-full md:max-w-md pr-8"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <Search />

                <select
                    className="select select-bordered w-full lg:w-48"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                </select>
            </div>

            {/* Activities Table */}
            <div className="overflow-x-auto bg-base-100 rounded-lg shadow relative">
                {tableLoading ? (
                    <div className="min-h-[300px] flex items-center justify-center">
                        <span className="loading loading-spinner loading-lg"></span>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="table table-zebra w-full">
                            <thead>
                                <tr>
                                    <th>Activity</th>
                                    <th>Type</th>
                                    <th>Date & Time</th>
                                    <th>Location</th>
                                    <th>Capacity</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {activities.map((activity) => (
                                    <tr key={activity.id}>
                                        <td>
                                            <div className="flex items-center space-x-3">
                                                <div className="avatar">
                                                    <div className="mask mask-squircle w-12 h-12">
                                                        <img
                                                            src={activity.image}
                                                            alt={activity.title}
                                                            className="cursor-pointer hover:opacity-75"
                                                            onClick={() => {
                                                                setSelectedImage(
                                                                    activity.image
                                                                );
                                                                setIsImageModalOpen(
                                                                    true
                                                                );
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="font-bold">
                                                        {activity.title}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>{activity.type}</td>
                                        <td>
                                            <div>{activity.date}</div>
                                            <div className="text-sm opacity-50">
                                                {activity.time}
                                            </div>
                                        </td>
                                        <td>{activity.location}</td>
                                        <td>
                                            <div className="flex flex-col gap-1">
                                                <div className="text-sm">
                                                    {activity.enrolled}/
                                                    {activity.capacity}
                                                </div>
                                                <progress
                                                    className="progress progress-primary w-20"
                                                    value={
                                                        (activity.enrolled /
                                                            activity.capacity) *
                                                        100
                                                    }
                                                    max="100"
                                                ></progress>
                                            </div>
                                        </td>
                                        <td>
                                            <div
                                                className={`badge ${
                                                    activity.status === "active"
                                                        ? "badge-success"
                                                        : activity.status ===
                                                          "pending"
                                                        ? "badge-warning"
                                                        : activity.status ===
                                                          "completed"
                                                        ? "badge-info"
                                                        : "badge-error"
                                                }`}
                                            >
                                                {activity.status}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="btn-group">
                                                <button
                                                    className="btn btn-sm btn-ghost"
                                                    onClick={() =>
                                                        document
                                                            .getElementById(
                                                                "view_participants_modal"
                                                            )
                                                            .showModal()
                                                    }
                                                >
                                                    <Users />
                                                </button>
                                                <button
                                                    className="btn btn-sm btn-ghost"
                                                    onClick={() =>
                                                        router.push(
                                                            `/admin/activities/${activity.id}`
                                                        )
                                                    }
                                                >
                                                    <Pencil />
                                                </button>
                                                <button className="btn btn-sm btn-ghost text-error">
                                                    <Trash2 />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Create Activity Modal */}
            <dialog id="create_activity_modal" className="modal">
                <div className="modal-box w-11/12 max-w-3xl">
                    <h3 className="font-bold text-lg mb-4">
                        Create New Activity
                    </h3>

                    {/* Stepper */}
                    <ul className="steps steps-horizontal w-full mb-6">
                        <li
                            className={`step ${
                                activeStep >= 1 ? "step-primary" : ""
                            }`}
                        >
                            Basic Info
                        </li>
                        <li
                            className={`step ${
                                activeStep >= 2 ? "step-primary" : ""
                            }`}
                        >
                            Details
                        </li>
                        <li
                            className={`step ${
                                activeStep >= 3 ? "step-primary" : ""
                            }`}
                        >
                            Images
                        </li>
                        <li
                            className={`step ${
                                activeStep >= 4 ? "step-primary" : ""
                            }`}
                        >
                            Review
                        </li>
                    </ul>

                    {/* Step 1: Basic Info */}
                    {activeStep === 1 && (
                        <div className="space-y-4">
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text">
                                        Activity Title
                                    </span>
                                </label>
                                <input
                                    type="text"
                                    name="title"
                                    placeholder="Enter activity title"
                                    className="input input-bordered"
                                    value={formData.title}
                                    onChange={handleFormChange}
                                />
                            </div>

                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text">
                                        Activity Type
                                    </span>
                                </label>
                                <select
                                    name="type"
                                    className="select select-bordered"
                                    value={formData.type}
                                    onChange={handleFormChange}
                                >
                                    <option value="">
                                        Select activity type
                                    </option>
                                    <option value="yoga">Yoga</option>
                                    <option value="running">Running</option>
                                    <option value="cycling">Cycling</option>
                                    <option value="swimming">Swimming</option>
                                </select>
                            </div>

                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text">
                                        Description
                                    </span>
                                </label>
                                <textarea
                                    name="description"
                                    className="textarea textarea-bordered h-24"
                                    placeholder="Enter activity description"
                                    value={formData.description}
                                    onChange={handleFormChange}
                                ></textarea>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Details */}
                    {activeStep === 2 && (
                        <div className="space-y-4">
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text">Date</span>
                                </label>
                                <input
                                    type="date"
                                    name="date"
                                    className="input input-bordered"
                                    value={formData.date}
                                    onChange={handleFormChange}
                                />
                            </div>

                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text">Time</span>
                                </label>
                                <input
                                    type="time"
                                    name="time"
                                    className="input input-bordered"
                                    value={formData.time}
                                    onChange={handleFormChange}
                                />
                            </div>

                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text">Location</span>
                                </label>
                                <input
                                    type="text"
                                    name="location"
                                    placeholder="Enter activity location"
                                    className="input input-bordered"
                                    value={formData.location}
                                    onChange={handleFormChange}
                                />
                            </div>

                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text">Capacity</span>
                                </label>
                                <input
                                    type="number"
                                    name="capacity"
                                    placeholder="Enter participant limit"
                                    className="input input-bordered"
                                    value={formData.capacity}
                                    onChange={handleFormChange}
                                    min="1"
                                />
                            </div>
                        </div>
                    )}

                    {/* Step 3: Images */}
                    {activeStep === 3 && (
                        <div className="space-y-4">
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text">
                                        Upload Images
                                    </span>
                                </label>
                                <input
                                    type="file"
                                    className="file-input file-input-bordered w-full"
                                    accept="image/*"
                                    multiple
                                    onChange={handleImageUpload}
                                />
                            </div>

                            {formData.images.length > 0 && (
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                                    {formData.images.map((image, index) => (
                                        <div
                                            key={index}
                                            className="relative group"
                                        >
                                            <img
                                                src={URL.createObjectURL(image)}
                                                alt={`Preview ${index + 1}`}
                                                className="w-full h-32 object-cover rounded-lg"
                                            />
                                            <button
                                                className="btn btn-circle btn-sm btn-error absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={() =>
                                                    handleRemoveImage(index)
                                                }
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Step 4: Review */}
                    {activeStep === 4 && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <h4 className="font-semibold mb-2">
                                        Basic Information
                                    </h4>
                                    <div className="space-y-2">
                                        <p>
                                            <span className="font-medium">
                                                Title:
                                            </span>{" "}
                                            {formData.title}
                                        </p>
                                        <p>
                                            <span className="font-medium">
                                                Type:
                                            </span>{" "}
                                            {formData.type}
                                        </p>
                                        <p>
                                            <span className="font-medium">
                                                Description:
                                            </span>{" "}
                                            {formData.description}
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="font-semibold mb-2">
                                        Details
                                    </h4>
                                    <div className="space-y-2">
                                        <p>
                                            <span className="font-medium">
                                                Date:
                                            </span>{" "}
                                            {formData.date}
                                        </p>
                                        <p>
                                            <span className="font-medium">
                                                Time:
                                            </span>{" "}
                                            {formData.time}
                                        </p>
                                        <p>
                                            <span className="font-medium">
                                                Location:
                                            </span>{" "}
                                            {formData.location}
                                        </p>
                                        <p>
                                            <span className="font-medium">
                                                Capacity:
                                            </span>{" "}
                                            {formData.capacity}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {formData.images.length > 0 && (
                                <div>
                                    <h4 className="font-semibold mb-2">
                                        Images ({formData.images.length})
                                    </h4>
                                    <div className="grid grid-cols-4 gap-2">
                                        {formData.images.map((image, index) => (
                                            <img
                                                key={index}
                                                src={URL.createObjectURL(image)}
                                                alt={`Preview ${index + 1}`}
                                                className="w-full h-20 object-cover rounded-lg"
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="alert alert-info">
                                <span>
                                    Review the information above before creating
                                    the activity.
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="modal-action">
                        <button
                            className="btn"
                            onClick={() =>
                                activeStep > 1
                                    ? setActiveStep((prev) => prev - 1)
                                    : document
                                          .getElementById(
                                              "create_activity_modal"
                                          )
                                          .close()
                            }
                        >
                            {activeStep === 1 ? "Cancel" : "Back"}
                        </button>
                        <button
                            className="btn btn-primary"
                            onClick={() => {
                                if (activeStep === 4) {
                                    // TODO: Implement activity creation
                                    setNotification({
                                        show: true,
                                        message:
                                            "Activity created successfully",
                                        type: "success",
                                    });
                                    document
                                        .getElementById("create_activity_modal")
                                        .close();
                                    setActiveStep(1);
                                } else {
                                    setActiveStep((prev) =>
                                        Math.min(prev + 1, 4)
                                    );
                                }
                            }}
                        >
                            {activeStep === 4 ? "Create Activity" : "Next"}
                        </button>
                    </div>
                </div>
                <form method="dialog" className="modal-backdrop">
                    <button>close</button>
                </form>
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
