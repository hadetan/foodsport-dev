"use client";
import React, { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";

export default function EditActivityPage({
    activity: initialActivity,
    setShowEdit,
    setActivities,
}) {
    const [form, setForm] = useState(null);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [imageFile, setImageFile] = useState(null);
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");
    const [audit, setAudit] = useState({});
    const [activity, setActivity] = useState(initialActivity);
    const router = useRouter();
    const fileInputRef = useRef();
    const searchParams = useSearchParams();

    useEffect(() => {
        if (!activity) return;
        setForm({
            title: activity.title || "",
            description: activity.description || "",
            activityType: activity.activityType || "",
            date: activity.startDate ? activity.startDate.slice(0, 10) : "",
            location: activity.location || "",
            capacity: activity.participantLimit || "",
            status: activity.status || "active",
            pointsPerParticipant: activity.pointsPerParticipant || "",
            caloriesPerHour: activity.caloriesPerHour || "",
        });
        setAudit({
            createdBy: activity.organizerName || "Unknown",
        });
        // Set imageFile from imageUrl if present
        if (activity.imageUrl) {
            setImageFile({ url: activity.imageUrl });
        } else {
            setImageFile(null);
        }
    }, [activity]);

    if (!activity) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="alert alert-error text-lg">
                    Activity data not found.
                </div>
            </div>
        );
    }

    if (!form) return <div className="loading loading-spinner"></div>;

    // --- Validation helpers ---
    const validate = () => {
        const errs = {};
        if (!form.title || form.title.length < 5 || form.title.length > 100)
            errs.title = "Title must be 5-100 characters.";
        if (
            !form.description ||
            form.description.replace(/<[^>]+>/g, "").length < 50
        )
            errs.description = "Description must be at least 50 characters.";
        if (!form.activityType)
            errs.activityType = "Activity type is required.";
        if (!form.date /*|| !form.time*/) errs.datetime = "Date is required.";
        else {
            const dt = new Date(form.date /*+ "T" + form.time*/); // REMOVE time
            if (dt < new Date()) errs.datetime = "Date must be in the future.";
        }
        if (!form.location) errs.location = "Location is required.";
        const cap = parseInt(form.capacity, 10);
        if (!cap || cap < 1 || cap > 1000)
            errs.capacity = "Capacity must be 1-1000.";
        // Points per participant validation
        const points = parseFloat(form.pointsPerParticipant);
        if (isNaN(points) || points <= 0)
            errs.pointsPerParticipant =
                "Points per participant must be a positive number.";
        // Calories per hour validation
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

    // --- Handlers ---
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

    // PATCH API call
    const handleSave = async (status = "active") => {
        if (!validate()) return;
        setLoading(true);
        setError("");
        setSuccess("");
        try {
            const activityId = activity.id;
            const formData = new FormData();

            // Only append fields that are non-empty (like Postman)
            Object.entries(form).forEach(([key, value]) => {
                if (key === "time") return; // REMOVE time from FormData
                if (value !== "" && value !== null && value !== undefined) {
                    formData.append(key, value);
                }
            });

            // Only send image if changed
            if (imageFile && imageFile.url === undefined) {
                formData.append("image", imageFile);
            }
            if (activity.organizerId) {
                formData.append("organizerId", activity.organizerId);
            }

            //use axios.
            const res = await axios.patch(
                `/api/admin/activities?activityId=${activityId}`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );
            const result = res.data;
            //call setActivities and save prev value first then save new value using result.data.activity
            if (setActivities && result.data && result.data.activity) {
                setActivities((prev) =>
                    prev.map((act) =>
                        act.id === result.data.activity.id
                            ? result.data.activity
                            : act
                    )
                );
            }
           
            setSuccess("Activity updated successfully!");
            router.push("/admin/activities"); // <-- redirect after save
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
        setShowEdit(false);
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-transparent">
            {/* Back Button */}
            <div className="w-full flex justify-start mb-4">
                <button
                    className="btn btn-primary"
                    onClick={() => router.push("/admin/activities?view=list")}
                    type="button"
                >
                    &larr; Back
                </button>
            </div>
            <div className="w-full max-w-3xl">
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
                    className="space-y-6"
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleSave();
                    }}
                >
                    {/* Title */}
                    <div className="form-control w-full">
                        <label className="label text-lg font-semibold mb-2">
                            Title
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
                    {/* Description */}
                    <div className="form-control w-full">
                        <label className="label text-lg font-semibold mb-2">
                            Description
                        </label>
                        <textarea
                            className="textarea textarea-bordered textarea-lg w-full"
                            name="description"
                            value={form.description}
                            onChange={handleInput}
                            minLength={50}
                            required
                            rows={4}
                        />
                        {errors.description && (
                            <span className="text-error text-base">
                                {errors.description}
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
                    {/* Date */}
                    <div className="form-control w-full">
                        <label className="label text-lg font-semibold mb-2">
                            Date
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
                        />
                        {errors.caloriesPerHour && (
                            <span className="text-error text-base">
                                {errors.caloriesPerHour}
                            </span>
                        )}
                    </div>
                    {/* Images */}
                    <div className="form-control w-full">
                        <label className="label text-lg font-semibold mb-2">
                            Images
                        </label>
                        <input
                            type="file"
                            className="file-input file-input-bordered file-input-lg w-full"
                            accept="image/jpeg,image/png"
                            multiple={false}
                            ref={fileInputRef}
                            onChange={handleImageChange}
                            disabled={!!imageFile}
                        />
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
                        <div className="grid grid-cols-1 md:grid-cols-1 gap-2 mt-2">
                            {imageFile && (
                                <div className="card relative">
                                    <img
                                        src={
                                            imageFile.url
                                                ? imageFile.url
                                                : URL.createObjectURL(imageFile)
                                        }
                                        alt={`img-0`}
                                        className="w-full h-24 object-cover rounded-lg"
                                    />
                                    <button
                                        type="button"
                                        className="btn btn-xs btn-error absolute top-1 right-1"
                                        onClick={handleImageRemove}
                                    >
                                        ✕
                                    </button>
                                </div>
                            )}
                        </div>
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
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="draft">Draft</option>
                        </select>
                    </div>
                    {/* Audit Fields */}
                    <div className="form-control w-full">
                        <label className="label text-lg font-semibold mb-2">
                            Organized By
                        </label>
                        <input
                            className="input input-bordered input-lg w-full"
                            name="createdBy"
                            value={audit.createdBy || ""}
                            onChange={(e) =>
                                setAudit((a) => ({
                                    ...a,
                                    createdBy: e.target.value,
                                }))
                            }
                            placeholder="Created by"
                            disabled
                        />
                    </div>
                    {/* Actions */}
                    <div className="flex gap-4 mt-6">
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
                    </div>
                    {loading && (
                        <span className="loading loading-spinner"></span>
                    )}
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
