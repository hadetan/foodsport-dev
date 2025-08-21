"use client";
import React, { useState, useRef, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";
import { useAdminActivities } from "@/app/shared/contexts/AdminActivitiesContext";
import FullPageLoader from "../../components/FullPageLoader";
import { Pencil } from "lucide-react";

export default function EditActivityPage() {
    const [form, setForm] = useState(null);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [imageFile, setImageFile] = useState(null);
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");
    const [audit, setAudit] = useState({});
    const router = useRouter();
    const fileInputRef = useRef();
    const params = useParams();
    const activityId = params?.id;
    const {
        activities,
        loading: actLoading,
        setActivities,
    } = useAdminActivities();
    const [activity, setActivity] = useState(undefined);
    useEffect(() => {
        if (!activities || !activityId) return;
        const found =
            activities.find((a) => String(a.id) === String(activityId)) || null;
        setActivity(found);
    }, [activities, activityId]);

    useEffect(() => {
        if (!activity) return;
        setForm({
            title: activity.title || "",
            summary: activity.description || "", // renamed
            activityType: activity.activityType || "",
            date: activity.startDate ? activity.startDate.slice(0, 10) : "",
            location: activity.location || "",
            capacity: activity.participantLimit || "",
            status: activity.status || "active",
            totalCaloriesBurnt: activity.totalCaloriesBurnt || "",
            caloriesPerHour: activity.caloriesPerHour || "",
        });
        setAudit({
            createdBy: activity.organizerName || "Unknown",
        });
        if (activity.imageUrl) {
            setImageFile({ url: activity.imageUrl });
        } else {
            setImageFile(null);
        }
    }, [activity]);

    if (activity === undefined || actLoading) {
        return <FullPageLoader />;
    }
    if (activity === null) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="alert alert-error text-lg">
                    Activity data not found.
                </div>
            </div>
        );
    }

    if (!form) return <div className="loading loading-spinner"></div>;

    const validate = () => {
        const errs = {};
        if (!form.title || form.title.length < 5 || form.title.length > 100)
            errs.title = "Title must be 5-100 characters.";
        // summary validation (was description)
        if (
            !form.summary ||
            form.summary
                .replace(/<[^>]+>/g, "")
                .split(/\s+/)
                .filter(Boolean).length > 50
        )
            errs.summary = "Summary must be max 50 words.";
        if (!form.activityType)
            errs.activityType = "Activity type is required.";
        if (!form.date) errs.datetime = "Date is required.";
        else {
            const dt = new Date(form.date);
            if (dt < new Date()) errs.datetime = "Date must be in the future.";
        }
        if (!form.location) errs.location = "Location is required.";
        const cap = parseInt(form.capacity, 10);
        if (!cap || cap < 1 || cap > 1000)
            errs.capacity = "Capacity must be 1-1000.";
        const points = parseFloat(form.totalCaloriesBurnt);
        if (isNaN(points) || points <= 0)
            errs.totalCaloriesBurnt =
                "Total calories burnt must be a positive number.";
        const calories = parseFloat(form.caloriesPerHour);
        if (isNaN(calories) || calories <= 0)
            errs.caloriesPerHour =
                "Calories per hour must be a positive number.";
        if (imageFile === null) errs.images = "An image is required.";
        if (
            imageFile &&
            imageFile.type &&
            !["image/jpeg", "image/png"].includes(imageFile.type)
        )
            errs.image = "Only JPG/PNG allowed.";
        if (imageFile && imageFile.size && imageFile.size > 5 * 1024 * 1024)
            errs.image = "Max size 5MB.";
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleInput = (e) => {
        const { name, value } = e.target;
        setForm((f) => ({ ...f, [name]: value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setImageFile(file);
    };

    const handleImageRemove = () => {
        setImageFile(null);
    };

    const handleSave = async (status = "active") => {
        if (!validate()) return;
        setLoading(true);
        setError("");
        setSuccess("");
        try {
            const activityId = activity.id;
            const formData = new FormData();

            Object.entries(form).forEach(([key, value]) => {
                if (key === "time") return;
                if (value !== "" && value !== null && value !== undefined) {
                    formData.append(key, value);
                }
            });

            if (imageFile && imageFile.url === undefined) {
                formData.append("image", imageFile);
            }
            if (activity.organizerId) {
                formData.append("organizerId", activity.organizerId);
            }

            const { data } = await axios.patch(
                `/api/admin/activities?activityId=${activityId}`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );
            if (setActivities && data && data.activity) {
                setActivities((prev) =>
                    prev.map((act) =>
                        act.id === data.activity.id ? data.activity : act
                    )
                );
            }

            setSuccess("Activity updated successfully!");
            router.push("/admin/activities");
        } catch (e) {
            let msg = "Failed to update activity.";
            if (typeof e === "string") {
                msg = e;
            } else if (e && typeof e.message === "string") {
                msg = e.message;
            } else if (e && typeof e === "object") {
                msg = JSON.stringify(e);
            }
            setError(msg);
        }
        setLoading(false);
    };

    const handleCancel = () => {
        setShowCancelConfirm(true);
    };

    const confirmCancel = () => {
        router.push("/admin/activities");
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-transparent">
            {/* Back Button */}
            <div className="w-full flex justify-start mb-4">
                <button
                    className="btn btn-primary"
                    onClick={() => router.push("/admin/activities")}
                    type="button"
                >
                    &larr; Back
                </button>
            </div>
            <div className="w-full max-w-5xl">
                <h1 className="text-3xl font-bold mb-8 text-base-content">
                    Edit Activity
                </h1>
                {success && (
                    <div className="alert alert-success text-lg">
                        {typeof success === "string"
                            ? success
                            : JSON.stringify(success)}
                    </div>
                )}
                {error && (
                    <div className="alert alert-error text-lg">
                        {typeof error === "string"
                            ? error
                            : JSON.stringify(error)}
                    </div>
                )}
                <form
                    className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6"
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleSave();
                    }}
                >
                    {/* Upload Image - full width */}
                    <div className="md:col-span-2">
                        <label className="label text-lg font-semibold mb-2 text-white">
                            Upload Image
                        </label>
                        <div className="relative flex flex-col items-center justify-center bg-[#181C23] border-2 border-dashed border-[#3B82F6] rounded-xl p-8 min-h-[180px]">
                            <input
                                type="file"
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                accept="image/jpeg,image/png"
                                multiple={false}
                                ref={fileInputRef}
                                onChange={handleImageChange}
                                disabled={!!imageFile}
                                style={{ zIndex: 2 }}
                            />
                            {!imageFile && (
                                <div className="flex flex-col items-center pointer-events-none select-none">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-12 w-12 text-[#3B82F6] mb-2"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M7 16V4a1 1 0 011-1h8a1 1 0 011 1v12m-4 4h-4a1 1 0 01-1-1v-4h6v4a1 1 0 01-1 1z"
                                        />
                                    </svg>
                                    <span className="text-[#3B82F6] font-medium">
                                        Drop image or{" "}
                                        <span className="underline cursor-pointer text-[#3B82F6]">
                                            browse
                                        </span>
                                    </span>
                                    <span className="text-xs text-gray-400 mt-1">
                                        JPG, PNG
                                    </span>
                                </div>
                            )}
                            {imageFile && (
                                <div className="relative w-full flex justify-center">
                                    <div
                                        className="bg-black flex items-center justify-center"
                                        style={{
                                            width: "100%",
                                            minHeight: "320px",
                                            maxHeight: "420px",
                                            aspectRatio: "16/9",
                                            borderRadius: "0.75rem",
                                            overflow: "hidden",
                                        }}
                                    >
                                        <img
                                            src={
                                                imageFile.url
                                                    ? imageFile.url
                                                    : URL.createObjectURL(
                                                          imageFile
                                                      )
                                            }
                                            alt="Activity"
                                            className="w-auto h-full max-h-[420px] max-w-full object-contain"
                                            style={{
                                                display: "block",
                                                margin: "0 auto",
                                            }}
                                        />
                                        {/* Pencil icon (lucide-react) for changing image */}
                                        <button
                                            type="button"
                                            className="absolute top-4 right-4 bg-white rounded-full p-1 shadow hover:bg-gray-100"
                                            style={{ zIndex: 10 }}
                                            onClick={() => {
                                                if (fileInputRef.current) {
                                                    fileInputRef.current.value =
                                                        "";
                                                    fileInputRef.current.disabled = false;
                                                    fileInputRef.current.click();
                                                }
                                            }}
                                            tabIndex={0}
                                            aria-label="Change image"
                                        >
                                            <Pencil className="text-[#3B82F6] w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                        {errors.images && (
                            <span className="text-error text-base">
                                {errors.images}
                            </span>
                        )}
                        {errors.image && (
                            <span className="text-error text-base">
                                {errors.image}
                            </span>
                        )}
                    </div>
                    {/* Left column */}
                    <div className="flex flex-col gap-6">
                        {/* Activity Title */}
                        <div className="form-control w-full">
                            <label className="label text-lg font-semibold mb-2">
                                Activity Title
                            </label>
                            <input
                                className="input input-bordered input-lg w-full"
                                name="title"
                                value={form.title}
                                onChange={handleInput}
                                maxLength={100}
                                required
                            />
                            {errors.title && (
                                <span className="text-error text-base">
                                    {errors.title}
                                </span>
                            )}
                        </div>
                        {/* Activity Type */}
                        <div className="form-control w-full">
                            <label className="label text-lg font-semibold mb-2">
                                Activity Type
                            </label>
                            <select
                                className="select select-bordered select-lg w-full"
                                name="activityType"
                                value={form.activityType}
                                onChange={handleInput}
                                required
                            >
                                <option value="">Select activity type</option>
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
                            {errors.activityType && (
                                <span className="text-error text-base">
                                    {errors.activityType}
                                </span>
                            )}
                        </div>
                        {/* Summary */}
                        <div className="form-control w-full">
                            <label className="label text-lg font-semibold mb-2">
                                Summary
                            </label>
                            <textarea
                                className="textarea textarea-bordered textarea-lg w-full"
                                name="summary"
                                value={form.summary}
                                onChange={handleInput}
                                maxLength={400} // ~50 words
                                required
                                rows={3}
                                placeholder="Enter summary (max 50 words)"
                            />
                            <div className="flex justify-between text-xs text-gray-400 mt-1">
                                <span>
                                    {form.summary
                                        ? form.summary
                                              .split(/\s+/)
                                              .filter(Boolean).length
                                        : 0}{" "}
                                    / 50 words
                                </span>
                            </div>
                            {errors.summary && (
                                <span className="text-error text-base">
                                    {errors.summary}
                                </span>
                            )}
                        </div>
                        {/* Start Date & Time */}
                        <div className="form-control w-full">
                            <label className="label text-lg font-semibold mb-2">
                                Start Date & Time
                            </label>
                            <input
                                type="date"
                                className="input input-bordered input-lg w-full"
                                name="date"
                                value={form.date}
                                onChange={handleInput}
                                required
                            />
                        </div>
                        {errors.datetime && (
                            <span className="text-error text-base">
                                {errors.datetime}
                            </span>
                        )}
                    </div>
                    {/* Right column */}
                    <div className="flex flex-col gap-6">
                        {/* Location */}
                        <div className="form-control w-full">
                            <label className="label text-lg font-semibold mb-2">
                                Location
                            </label>
                            <input
                                className="input input-bordered input-lg w-full"
                                name="location"
                                value={form.location}
                                onChange={handleInput}
                                required
                                placeholder="Enter activity location"
                            />
                            {errors.location && (
                                <span className="text-error text-base">
                                    {errors.location}
                                </span>
                            )}
                        </div>
                        {/* Capacity */}
                        <div className="form-control w-full">
                            <label className="label text-lg font-semibold mb-2">
                                Capacity
                            </label>
                            <input
                                type="number"
                                className="input input-bordered input-lg w-full"
                                name="capacity"
                                value={form.capacity}
                                onChange={handleInput}
                                min={1}
                                max={1000}
                                required
                                placeholder="Enter participant limit"
                            />
                            {errors.capacity && (
                                <span className="text-error text-base">
                                    {errors.capacity}
                                </span>
                            )}
                        </div>
                        {/* Points Per Participant */}
                        <div className="form-control w-full">
                            <label className="label text-lg font-semibold mb-2">
                                Points Per Participant
                            </label>
                            <input
                                type="number"
                                className="input input-bordered input-lg w-full"
                                name="pointsPerParticipant"
                                value={form.pointsPerParticipant}
                                onChange={handleInput}
                                min={0.01}
                                step="any"
                                required
                                placeholder="Enter points per participant"
                            />
                            {errors.pointsPerParticipant && (
                                <span className="text-error text-base">
                                    {errors.pointsPerParticipant}
                                </span>
                            )}
                        </div>
                        {/* Calories Per Hour */}
                        <div className="form-control w-full">
                            <label className="label text-lg font-semibold mb-2">
                                Calories Per Hour
                            </label>
                            <input
                                type="number"
                                className="input input-bordered input-lg w-full"
                                name="caloriesPerHour"
                                value={form.caloriesPerHour}
                                onChange={handleInput}
                                min={0.01}
                                step="any"
                                required
                                placeholder="Enter calories per hour"
                            />
                            {errors.caloriesPerHour && (
                                <span className="text-error text-base">
                                    {errors.caloriesPerHour}
                                </span>
                            )}
                        </div>
                        {/* Status */}
                        <div className="form-control w-full">
                            <label className="label text-lg font-semibold mb-2">
                                Status
                            </label>
                            <select
                                className="select select-bordered select-lg w-full"
                                name="status"
                                value={form.status}
                                onChange={handleInput}
                            >
                                <option value="draft">Draft</option>
                                <option value="upcoming">Upcoming</option>
                                <option value="active">Active</option>
                                <option value="closed">Closed</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>
                    </div>
                    {/* Actions - full width */}
                    <div className="md:col-span-2 flex gap-4 mt-6">
                        <button
                            type="submit"
                            className="btn btn-primary btn-lg flex-1"
                            disabled={loading}
                        >
                            Save
                        </button>
                        <button
                            type="button"
                            className="btn btn-outline btn-lg flex-1"
                            onClick={handleCancel}
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        {loading && (
                            <span className="loading loading-spinner"></span>
                        )}
                    </div>
                  
                </form>
                {/* Cancel Confirmation */}
                {showCancelConfirm && (
                    <div className="modal modal-open">
                        <div className="modal-box">
                            <p className="text-lg">
                                Are you sure you want to cancel? Unsaved changes
                                will be lost.
                            </p>
                            <div className="btn-group mt-4">
                                <button
                                    className="btn btn-error btn-lg"
                                    onClick={confirmCancel}
                                >
                                    Yes, Cancel
                                </button>
                                <button
                                    className="btn btn-lg"
                                    onClick={() => setShowCancelConfirm(false)}
                                >
                                    No
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
