"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ErrorAlert from "@/app/shared/components/ErrorAlert";
import axiosClient from "@/utils/axios/api";
import ActivityStatus, {
    MAX_IMAGE_SIZE_MB,
} from "@/app/constants/constants";
import TiptapEditor from "@/app/shared/components/TiptapEditor";

const CreateActivityPage = () => {
    const router = useRouter();
    const [formData, setFormData] = useState({
        title: "",
        activityType: "",
        description: "",
        startDateTime: "",
        endDateTime: "",
        location: "",
        capacity: "",
        totalCaloriesBurnt: "",
        caloriesPerHour: "",
        image: null,
        status: "draft",
    });
    const [error, setError] = useState("");
    const [fieldErrors, setFieldErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const isValidYear = (dateStr) => {
        if (!dateStr) return true;
        const year = dateStr.split("-")[0];
        return /^\d{1,4}$/.test(year);
    };

    // Helper to check required fields and set field errors
    const validateFields = () => {
        const requiredFields = [
            "title",
            "activityType",
            "description",
            "startDateTime",
            "endDateTime",
            "location",
            "capacity",
            "totalCaloriesBurnt",
            "caloriesPerHour",
            "image",
            "status",
        ];
        const errors = {};
        requiredFields.forEach((field) => {
            if (
                formData[field] === "" ||
                formData[field] === null ||
                typeof formData[field] === "undefined"
            ) {
                errors[field] = " This field is required.";
            }
        });
        // Description minimum word limit
        if (
            formData.description &&
            formData.description
                .replace(/<[^>]+>/g, " ") // Remove HTML tags if any
                .split(/\s+/)
                .filter((w) => w.length > 0).length < 5
        ) {
            errors.description = "Description must be at least 5 words.";
        }
        // Year validation
        if (formData.startDateTime && !isValidYear(formData.startDateTime)) {
            errors.startDateTime = "Year must be at most 4 digits.";
        }
        if (formData.endDateTime && !isValidYear(formData.endDateTime)) {
            errors.endDateTime = "Year must be at most 4 digits.";
        }
        // Start date must not be after end date
        if (
            formData.startDateTime &&
            formData.endDateTime &&
            new Date(formData.startDateTime) > new Date(formData.endDateTime)
        ) {
            errors.startDateTime = "Start date cannot be after end date.";
            errors.endDateTime = "End date cannot be before start date.";
        }
        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        // Restrict year for datetime-local fields
        if (
            (name === "startDateTime" || name === "endDateTime") &&
            !isValidYear(value)
        ) {
            setFieldErrors((prev) => ({
                ...prev,
                [name]: "Year must be at most 4 digits.",
            }));
            return;
        }
        setFieldErrors((prev) => ({
            ...prev,
            [name]: undefined,
        }));
        setError("");
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
            setFieldErrors((prev) => ({
                ...prev,
                image: `Selected image cannot exceed ${MAX_IMAGE_SIZE_MB} MB.`,
            }));
            return;
        }
        setFieldErrors((prev) => ({
            ...prev,
            image: undefined,
        }));
        setError("");
        setFormData((prev) => ({
            ...prev,
            image: file,
        }));
    };

    const removeImage = () => {
        setFormData((prev) => ({
            ...prev,
            image: null,
        }));
        setFieldErrors((prev) => ({
            ...prev,
            image: "This field is required.",
        }));
    };

    const handleSubmit = async () => {
        if (!validateFields()) {
            setError("Please fix the errors in the form.");
            return;
        }

        try {
            setLoading(true);
            const startISO = new Date(formData.startDateTime).toISOString();
            const endISO = new Date(formData.endDateTime).toISOString();
            const payload = {
                title: formData.title,
                activityType: formData.activityType,
                location: formData.location,
                startDate: startISO,
                endDate: endISO,
                startTime: startISO,
                endTime: endISO,
                description: formData.description,
                status: formData.status,
                participantLimit: Number(formData.capacity),
                totalCaloriesBurnt: Number(formData.totalCaloriesBurnt),
                caloriesPerHour: Number(formData.caloriesPerHour),
                image: formData.image,
            };

            const formDataToSend = new FormData();
            Object.entries(payload).forEach(([key, value]) => {
                if (key === "image" && value) {
                    formDataToSend.set("image", value);
                } else if (
                    value !== undefined &&
                    value !== null &&
                    typeof value !== "object"
                ) {
                    formDataToSend.set(key, value);
                }
            });

            await axiosClient.post("/admin/activities", formDataToSend, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            router.push("/admin/activities");
        } catch (err) {
            setError(err?.response?.data?.error || err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-base-200 p-6 text-base">
            <div className="max-w-screen-2xl mx-auto">
                <div className="flex items-center mb-6 relative">
                    <button
                        className="btn btn-outline btn-md absolute left-0 text-base"
                        onClick={() => router.push("/admin/activities")}
                    >
                        Back to Activities
                    </button>
                    <h1 className="text-4xl font-bold mx-auto text-center w-full">
                        Create Activity
                    </h1>
                </div>

                {error && (
                    <ErrorAlert message={error} onClose={() => setError("")} />
                )}

                <div className="card bg-base-100 shadow-xl">
                    <div className="card-body p-8 space-y-10 text-base">
                        {/* Title */}
                        <div className="form-control flex items-center gap-4">
                            <span className="w-40 text-white text-base">
                                Activity Title
                            </span>
                            <label className="flex-1">
                                <input
                                    type="text"
                                    name="title"
                                    placeholder="Enter activity title"
                                    className="input input-md text-base"
                                    value={formData.title}
                                    onChange={handleFormChange}
                                />
                                {fieldErrors.title && (
                                    <span className="text-error text-sm mt-2 block">
                                        {fieldErrors.title}
                                    </span>
                                )}
                            </label>
                        </div>

                        {/* Activity Type */}
                        <div className="form-control flex items-center gap-4">
                            <span className="w-40 text-white text-base">
                                Activity Type
                            </span>
                            <label className="flex-1">
                                <select
                                    name="activityType"
                                    className="select select-bordered select-md text-base"
                                    value={formData.activityType}
                                    onChange={handleFormChange}
                                >
                                    <option value="">
                                        Select activity type
                                    </option>
                                    <option value="kayak">Kayak</option>
                                    <option value="hiking">Hiking</option>
                                    <option value="yoga">Yoga</option>
                                    <option value="fitness">Fitness</option>
                                    <option value="running">Running</option>
                                    <option value="cycling">Cycling</option>
                                    <option value="swimming">Swimming</option>
                                    <option value="dancing">Dancing</option>
                                    <option value="boxing">Boxing</option>
                                    <option value="other">Other</option>
                                </select>
                                {fieldErrors.activityType && (
                                    <span className="text-error text-sm mt-2 block">
                                        {fieldErrors.activityType}
                                    </span>
                                )}
                            </label>
                        </div>

                        {/* Description (Rich Text Editor) */}
                        <div className="form-control flex items-center gap-4">
                            <span className="w-40 text-white text-base">
                                Summary
                            </span>
                            <label className="flex-1 max-w-xl w-1/2">
                                <TiptapEditor
                                    value={formData.description}
                                    onChange={(val) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            description: val,
                                        }))
                                    }
                                    className="text-black dark:text-inherit text-base"
                                />
                                {fieldErrors.description && (
                                    <span className="text-error text-sm mt-2 block">
                                        {fieldErrors.description}
                                    </span>
                                )}
                            </label>
                        </div>

                        {/* Start DateTime */}
                        <div className="form-control flex items-center gap-4">
                            <span className="w-40 text-white text-base">
                                Start Date & Time
                            </span>
                            <label className="flex-1">
                                <input
                                    type="datetime-local"
                                    name="startDateTime"
                                    className="input input-bordered input-md text-base"
                                    value={formData.startDateTime}
                                    onChange={handleFormChange}
                                    max="9999-12-31T23:59"
                                />
                                {fieldErrors.startDateTime && (
                                    <span className="text-error text-sm mt-2 block">
                                        {fieldErrors.startDateTime}
                                    </span>
                                )}
                            </label>
                        </div>
                        {/* End DateTime */}
                        <div className="form-control flex items-center gap-4">
                            <span className="w-40 text-white text-base">
                                End Date & Time
                            </span>
                            <label className="flex-1">
                                <input
                                    type="datetime-local"
                                    name="endDateTime"
                                    className="input input-bordered input-md text-base"
                                    value={formData.endDateTime}
                                    onChange={handleFormChange}
                                    max="9999-12-31T23:59"
                                />
                                {fieldErrors.endDateTime && (
                                    <span className="text-error text-sm mt-2 block">
                                        {fieldErrors.endDateTime}
                                    </span>
                                )}
                            </label>
                        </div>

                        {/* Location */}
                        <div className="form-control flex items-center gap-4">
                            <span className="w-40 text-white text-base">
                                Location
                            </span>
                            <label className="flex-1">
                                <input
                                    type="text"
                                    name="location"
                                    placeholder="Enter activity location"
                                    className="input input-bordered input-md text-base"
                                    value={formData.location}
                                    onChange={handleFormChange}
                                />
                                {fieldErrors.location && (
                                    <span className="text-error text-sm mt-2 block">
                                        {fieldErrors.location}
                                    </span>
                                )}
                            </label>
                        </div>

                        {/* Capacity */}
                        <div className="form-control flex items-center gap-4">
                            <span className="w-40 text-white text-base">
                                Capacity
                            </span>
                            <label className="flex-1">
                                <input
                                    type="number"
                                    name="capacity"
                                    placeholder="Enter participant limit"
                                    className="input input-bordered input-md text-base"
                                    value={formData.capacity}
                                    onChange={handleFormChange}
                                    min="1"
                                />
                                {fieldErrors.capacity && (
                                    <span className="text-error text-sm mt-2 block">
                                        {fieldErrors.capacity}
                                    </span>
                                )}
                            </label>
                        </div>

                        {/* Points Per Participant */}
                        <div className="form-control flex items-center gap-4">
                            <span className="w-40 text-white text-base">
                                Points Per Participant
                            </span>
                            <label className="flex-1">
                                <input
                                    type="number"
                                    name="totalCaloriesBurnt"
                                    placeholder="Enter points per participant"
                                    className="input input-bordered input-md text-base"
                                    value={formData.totalCaloriesBurnt}
                                    onChange={handleFormChange}
                                    min="0"
                                />
                                {fieldErrors.totalCaloriesBurnt && (
                                    <span className="text-error text-sm mt-2 block">
                                        {fieldErrors.totalCaloriesBurnt}
                                    </span>
                                )}
                            </label>
                        </div>

                        {/* Calories Per Hour */}
                        <div className="form-control flex items-center gap-4">
                            <span className="w-40 text-white text-base">
                                Calories Per Hour
                            </span>
                            <label className="flex-1">
                                <input
                                    type="number"
                                    name="caloriesPerHour"
                                    placeholder="Enter calories per hour"
                                    className="input input-bordered input-md text-base"
                                    value={formData.caloriesPerHour}
                                    onChange={handleFormChange}
                                    min="0"
                                />
                                {fieldErrors.caloriesPerHour && (
                                    <span className="text-error text-sm mt-2 block">
                                        {fieldErrors.caloriesPerHour}
                                    </span>
                                )}
                            </label>
                        </div>

                        {/* Images */}
                        <div className="form-control flex items-center gap-4">
                            <span className="w-40 text-white text-base">
                                Upload Image
                            </span>
                            <label className="flex-1">
                                <input
                                    type="file"
                                    className="file-input file-input-bordered file-input-md text-base"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                />
                                {fieldErrors.image && (
                                    <span className="text-error text-sm mt-2 block">
                                        {fieldErrors.image}
                                    </span>
                                )}
                            </label>
                        </div>
                        {error && (
                            <div className="mb-4">
                                <ErrorAlert
                                    message={error}
                                    onClose={() => setError("")}
                                />
                            </div>
                        )}

                        {formData.image && (
                            <div className="relative group mt-4">
                                <img
                                    src={URL.createObjectURL(formData.image)}
                                    alt="Preview"
                                    className="w-full h-40 object-cover rounded-lg"
                                />
                                <button
                                    className="btn btn-circle btn-md btn-error absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-base"
                                    onClick={removeImage}
                                >
                                    ×
                                </button>
                            </div>
                        )}

                        {/* Status Dropdown at the bottom */}
                        <div className="form-control flex items-center gap-4 mt-4">
                            <span className="w-40 text-white text-base">
                                Status
                            </span>
                            <label className="flex-1">
                                <select
                                    name="status"
                                    className="select select-bordered select-md text-base"
                                    value={formData.status}
                                    onChange={handleFormChange}
                                >
                                    {ActivityStatus.map((status) => (
                                        <option key={status} value={status}>
                                            {status.charAt(0).toUpperCase() +
                                                status.slice(1)}
                                        </option>
                                    ))}
                                </select>
                                {fieldErrors.status && (
                                    <span className="text-error text-sm mt-2 block">
                                        {fieldErrors.status}
                                    </span>
                                )}
                            </label>
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-start gap-4">
                            <button
                                className={`btn btn-primary btn-md text-base ${
                                    loading ? "loading" : ""
                                }`}
                                onClick={handleSubmit}
                                disabled={loading}
                            >
                                SAVE
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateActivityPage;
