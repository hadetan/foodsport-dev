"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ErrorAlert from "@/app/shared/components/ErrorAlert";
import RichTextEditor from "@/app/shared/components/RichTextEditor";
import axiosClient from "@/utils/axios/api";
import ActivityStatus from "@/app/constants/ActivityStatus";

const MAX_IMAGE_SIZE_MB = 10;

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
        pointsPerParticipant: "",
        caloriesPerHour: "",
        image: null,
        status: "draft",
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
            setError("Selected image cannot exceed 10 MB.");
            return;
        }
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
    };

    const handleSubmit = async () => {
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
                pointsPerParticipant: Number(formData.pointsPerParticipant),
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
                            </label>
                        </div>

                        {/* Description (Rich Text Editor) */}
                        <div className="form-control flex items-center gap-4">
                            <span className="w-40 text-white text-base">
                                Summary
                            </span>
                            <label className="flex-1 max-w-xl w-1/2">
                                <RichTextEditor
                                    value={formData.description}
                                    onChange={(val) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            description: val,
                                        }))
                                    }
                                    className="text-black dark:text-inherit text-base"
                                />
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
                                />
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
                                />
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
                                    name="pointsPerParticipant"
                                    placeholder="Enter points per participant"
                                    className="input input-bordered input-md text-base"
                                    value={formData.pointsPerParticipant}
                                    onChange={handleFormChange}
                                    min="0"
                                />
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
