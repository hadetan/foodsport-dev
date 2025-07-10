"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ErrorAlert from "@/app/shared/components/ErrorAlert";

const EditActivityPage = ({ params }) => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [activeStep, setActiveStep] = useState(1);
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

    // Mock data - Replace with API call
    useEffect(() => {
        const activity = {
            id: params.id,
            title: "Morning Yoga Session",
            type: "Yoga",
            description: "Join us for a refreshing morning yoga session",
            date: "2025-07-10",
            time: "08:00",
            location: "Central Park",
            capacity: 20,
            status: "active",
            images: [],
        };
        setFormData(activity);
    }, [params.id]);

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

    const removeImage = (index) => {
        setFormData((prev) => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index),
        }));
    };

    const handleSubmit = async () => {
        try {
            setLoading(true);
            // TODO: Implement API call to update activity
            await new Promise((resolve) => setTimeout(resolve, 1000));
            router.push("/admin/activities");
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-base-200 p-6">
            <div className="max-w-screen-2xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Edit Activity</h1>
                    <button
                        className="btn btn-outline"
                        onClick={() => router.push("/admin/activities")}
                    >
                        Back to Activities
                    </button>
                </div>

                {error && (
                    <ErrorAlert message={error} onClose={() => setError("")} />
                )}

                <div className="card bg-base-100 shadow-xl">
                    <div className="card-body p-6">
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

                        <div className="container mx-auto max-w-4xl">
                            {/* Step 1: Basic Info */}
                            {activeStep === 1 && (
                                <div className="space-y-8">
                                    <div className="form-control">
                                        <label className="label mb-2">
                                            <span className="label-text text-base font-medium">
                                                Activity Title
                                            </span>
                                        </label>
                                        <input
                                            type="text"
                                            name="title"
                                            placeholder="Enter activity title"
                                            className="input input-bordered mt-2"
                                            value={formData.title}
                                            onChange={handleFormChange}
                                        />
                                    </div>

                                    <div className="form-control">
                                        <label className="label mb-2">
                                            <span className="label-text text-base font-medium">
                                                Activity Type
                                            </span>
                                        </label>
                                        <select
                                            name="type"
                                            className="select select-bordered mt-2"
                                            value={formData.type}
                                            onChange={handleFormChange}
                                        >
                                            <option value="">
                                                Select activity type
                                            </option>
                                            <option value="yoga">Yoga</option>
                                            <option value="running">
                                                Running
                                            </option>
                                            <option value="cycling">
                                                Cycling
                                            </option>
                                            <option value="swimming">
                                                Swimming
                                            </option>
                                        </select>
                                    </div>

                                    <div className="form-control">
                                        <label className="label mb-2">
                                            <span className="label-text text-base font-medium">
                                                Description
                                            </span>
                                        </label>
                                        <textarea
                                            name="description"
                                            className="textarea textarea-bordered h-24 mt-2"
                                            placeholder="Enter activity description"
                                            value={formData.description}
                                            onChange={handleFormChange}
                                        ></textarea>
                                    </div>

                                    <div className="form-control">
                                        <label className="label mb-2">
                                            <span className="label-text text-base font-medium">
                                                Status
                                            </span>
                                        </label>
                                        <select
                                            name="status"
                                            className="select select-bordered mt-2"
                                            value={formData.status}
                                            onChange={handleFormChange}
                                        >
                                            <option value="draft">Draft</option>
                                            <option value="active">
                                                Active
                                            </option>
                                            <option value="cancelled">
                                                Cancelled
                                            </option>
                                        </select>
                                    </div>
                                </div>
                            )}

                            {/* Step 2: Details */}
                            {activeStep === 2 && (
                                <div className="space-y-8">
                                    <div className="form-control">
                                        <label className="label mb-2">
                                            <span className="label-text text-base font-medium">
                                                Date
                                            </span>
                                        </label>
                                        <input
                                            type="date"
                                            name="date"
                                            className="input input-bordered mt-2"
                                            value={formData.date}
                                            onChange={handleFormChange}
                                        />
                                    </div>

                                    <div className="form-control">
                                        <label className="label mb-2">
                                            <span className="label-text text-base font-medium">
                                                Time
                                            </span>
                                        </label>
                                        <input
                                            type="time"
                                            name="time"
                                            className="input input-bordered mt-2"
                                            value={formData.time}
                                            onChange={handleFormChange}
                                        />
                                    </div>

                                    <div className="form-control">
                                        <label className="label mb-2">
                                            <span className="label-text text-base font-medium">
                                                Location
                                            </span>
                                        </label>
                                        <input
                                            type="text"
                                            name="location"
                                            placeholder="Enter activity location"
                                            className="input input-bordered mt-2"
                                            value={formData.location}
                                            onChange={handleFormChange}
                                        />
                                    </div>

                                    <div className="form-control">
                                        <label className="label mb-2">
                                            <span className="label-text text-base font-medium">
                                                Capacity
                                            </span>
                                        </label>
                                        <input
                                            type="number"
                                            name="capacity"
                                            placeholder="Enter participant limit"
                                            className="input input-bordered mt-2"
                                            value={formData.capacity}
                                            onChange={handleFormChange}
                                            min="1"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Step 3: Images */}
                            {activeStep === 3 && (
                                <div className="space-y-8">
                                    <div className="form-control">
                                        <label className="label mb-2">
                                            <span className="label-text text-base font-medium">
                                                Upload Images
                                            </span>
                                        </label>
                                        <input
                                            type="file"
                                            className="file-input file-input-bordered w-full mt-2"
                                            accept="image/*"
                                            multiple
                                            onChange={handleImageUpload}
                                        />
                                    </div>

                                    {formData.images.length > 0 && (
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                                            {formData.images.map(
                                                (image, index) => (
                                                    <div
                                                        key={index}
                                                        className="relative group"
                                                    >
                                                        <img
                                                            src={URL.createObjectURL(
                                                                image
                                                            )}
                                                            alt={`Preview ${
                                                                index + 1
                                                            }`}
                                                            className="w-full h-32 object-cover rounded-lg"
                                                        />
                                                        <button
                                                            className="btn btn-circle btn-sm btn-error absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                                            onClick={() =>
                                                                removeImage(
                                                                    index
                                                                )
                                                            }
                                                        >
                                                            ×
                                                        </button>
                                                    </div>
                                                )
                                            )}
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
                                                <p>
                                                    <span className="font-medium">
                                                        Status:
                                                    </span>{" "}
                                                    {formData.status}
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
                                                Images ({formData.images.length}
                                                )
                                            </h4>
                                            <div className="grid grid-cols-4 gap-2">
                                                {formData.images.map(
                                                    (image, index) => (
                                                        <img
                                                            key={index}
                                                            src={URL.createObjectURL(
                                                                image
                                                            )}
                                                            alt={`Preview ${
                                                                index + 1
                                                            }`}
                                                            className="w-full h-20 object-cover rounded-lg"
                                                        />
                                                    )
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    <div className="alert alert-info">
                                        <span>
                                            Review the information above before
                                            updating the activity.
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Navigation Buttons */}
                            <div className="flex justify-between mt-6">
                                <button
                                    className="btn"
                                    onClick={() =>
                                        activeStep > 1
                                            ? setActiveStep((prev) => prev - 1)
                                            : router.push("/admin/activities")
                                    }
                                >
                                    {activeStep === 1 ? "Cancel" : "Back"}
                                </button>
                                <button
                                    className={`btn btn-primary ${
                                        loading ? "loading" : ""
                                    }`}
                                    onClick={() => {
                                        if (activeStep === 4) {
                                            handleSubmit();
                                        } else {
                                            setActiveStep((prev) =>
                                                Math.min(prev + 1, 4)
                                            );
                                        }
                                    }}
                                    disabled={loading}
                                >
                                    {activeStep === 4
                                        ? "Update Activity"
                                        : "Next"}
                                </button>
                            </div>
                        </div>
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
            </div>
        </div>
    );
};

export default EditActivityPage;
