"use client";
import React, { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

// Dummy fetch function for activity data (replace with real API)
async function fetchActivity(id) {
    // Replace with real fetch logic
    return {
        title: "Sample Activity",
        description: "Write summary",
        category: "sports",
        date: "2024-07-01",
        time: "10:00",
        location: "Sample Location",
        capacity: "100",
        status: "active",
        images: [], // Should be URLs or File objects
        createdBy: "admin@example.com",
        createdAt: "2024-06-01T12:00:00Z",
        updatedBy: "admin@example.com",
        updatedAt: "2024-06-10T15:00:00Z",
    };
}

export default function EditActivityPage() {
    const [form, setForm] = useState(null);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [imageFiles, setImageFiles] = useState([]);
    const [imageOrder, setImageOrder] = useState([]);
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");
    const [audit, setAudit] = useState({});
    const router = useRouter();
    const fileInputRef = useRef();
    const searchParams = useSearchParams();
    const activityId = searchParams.get("id");

    useEffect(() => {
        // Fetch activity data by ID
        async function load() {
            const data = await fetchActivity(activityId);
            setForm({
                title: data.title,
                description: data.description,
                category: data.category,
                date: data.date,
                time: data.time,
                location: data.location,
                capacity: data.capacity,
                status: data.status,
            });
            setAudit({
                createdBy: data.createdBy,
                createdAt: data.createdAt,
                updatedBy: data.updatedBy,
                updatedAt: data.updatedAt,
            });
            setImageFiles(data.images || []);
            setImageOrder((data.images || []).map((_, i) => i));
        }
        load();
    }, [activityId]);

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
        if (!form.category) errs.category = "Category is required.";
        if (!form.date || !form.time)
            errs.datetime = "Date and time are required.";
        else {
            const dt = new Date(`${form.date}T${form.time}`);
            if (dt < new Date())
                errs.datetime = "Date/time must be in the future.";
        }
        if (!form.location) errs.location = "Location is required.";
        const cap = parseInt(form.capacity, 10);
        if (!cap || cap < 1 || cap > 1000)
            errs.capacity = "Capacity must be 1-1000.";
        if (imageFiles.length === 0)
            errs.images = "At least one image is required.";
        if (imageFiles.length > 5) errs.images = "Maximum 5 images allowed.";
        imageFiles.forEach((img, idx) => {
            if (img.type && !["image/jpeg", "image/png"].includes(img.type))
                errs[`image_${idx}`] = "Only JPG/PNG allowed.";
            if (img.size && img.size > 5 * 1024 * 1024)
                errs[`image_${idx}`] = "Max size 5MB.";
            // ...resolution check can be added here...
        });
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    // --- Handlers ---
    const handleInput = (e) => {
        const { name, value } = e.target;
        setForm((f) => ({ ...f, [name]: value }));
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (imageFiles.length + files.length > 5) {
            setError("Maximum 5 images allowed.");
            return;
        }
        setImageFiles((imgs) => [...imgs, ...files]);
        setImageOrder((order) => [
            ...order,
            ...files.map((_, i) => imageFiles.length + i),
        ]);
    };

    const handleImageRemove = (idx) => {
        setImageFiles((imgs) => imgs.filter((_, i) => i !== idx));
        setImageOrder((order) => order.filter((i) => i !== idx));
    };

    const handleImageReorder = (fromIdx, toIdx) => {
        const newOrder = [...imageOrder];
        const [moved] = newOrder.splice(fromIdx, 1);
        newOrder.splice(toIdx, 0, moved);
        setImageOrder(newOrder);
    };

    const handleSave = async (status = "active") => {
        if (!validate()) return;
        setLoading(true);
        setError("");
        setSuccess("");
        try {
            // ...submit form data and images to API...
            setSuccess("Activity updated successfully!");
            setTimeout(() => router.push("/admin/activities"), 1500);
        } catch (e) {
            setError("Failed to update activity.");
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
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-8 text-base-content">
                Edit Activity
            </h1>
            {success && (
                <div className="alert alert-success text-lg">{success}</div>
            )}
            {error && <div className="alert alert-error text-lg">{error}</div>}
            <form
                className="space-y-6 max-w-xl"
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
                {/* Category */}
                <div className="form-control w-full">
                    <label className="label text-lg font-semibold mb-2">
                        Category
                    </label>
                    <select
                        className="select select-bordered select-lg w-full"
                        name="category"
                        value={form.category}
                        onChange={handleInput}
                        required
                    >
                        <option value="">Select category</option>
                        <option value="sports">Sports</option>
                        <option value="charity">Charity</option>
                        {/* ... */}
                    </select>
                    {errors.category && (
                        <span className="text-error text-base">
                            {errors.category}
                        </span>
                    )}
                </div>
                {/* Date & Time */}
                <div className="flex flex-col md:flex-row gap-4 w-full">
                    <div className="form-control flex-1">
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
                    <div className="form-control flex-1">
                        <label className="label text-lg font-semibold mb-2">
                            Time
                        </label>
                        <input
                            type="time"
                            className="input input-bordered input-lg w-full"
                            name="time"
                            value={form.time}
                            onChange={handleInput}
                            required
                        />
                    </div>
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
                {/* Images */}
                <div className="form-control w-full">
                    <label className="label text-lg font-semibold mb-2">
                        Images
                    </label>
                    <input
                        type="file"
                        className="file-input file-input-bordered file-input-lg w-full"
                        accept="image/jpeg,image/png"
                        multiple
                        ref={fileInputRef}
                        onChange={handleImageChange}
                        disabled={imageFiles.length >= 5}
                    />
                    {errors.images && (
                        <span className="text-error text-base">
                            {errors.images}
                        </span>
                    )}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mt-2">
                        {imageFiles.map((img, idx) => (
                            <div key={idx} className="card relative">
                                <img
                                    src={
                                        img.url
                                            ? img.url
                                            : URL.createObjectURL(img)
                                    }
                                    alt={`img-${idx}`}
                                    className="w-full h-24 object-cover rounded-lg"
                                />
                                <button
                                    type="button"
                                    className="btn btn-xs btn-error absolute top-1 right-1"
                                    onClick={() => handleImageRemove(idx)}
                                >
                                    ✕
                                </button>
                                {/* Drag handle for reordering */}
                                <span
                                    className="btn btn-xs btn-ghost absolute bottom-1 right-1 cursor-move"
                                    draggable
                                    onDragStart={(e) =>
                                        e.dataTransfer.setData("idx", idx)
                                    }
                                    onDrop={(e) => {
                                        const from = parseInt(
                                            e.dataTransfer.getData("idx"),
                                            10
                                        );
                                        handleImageReorder(from, idx);
                                    }}
                                    onDragOver={(e) => e.preventDefault()}
                                >
                                    ⇅
                                </span>
                                {errors[`image_${idx}`] && (
                                    <span className="text-error text-base">
                                        {errors[`image_${idx}`]}
                                    </span>
                                )}
                            </div>
                        ))}
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
                        Created By
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
                    />
                </div>
                <div className="form-control w-full">
                    <label className="label text-lg font-semibold mb-2">
                        Created At
                    </label>
                    <input
                        className="input input-bordered input-lg w-full"
                        name="createdAt"
                        value={audit.createdAt || ""}
                        onChange={(e) =>
                            setAudit((a) => ({
                                ...a,
                                createdAt: e.target.value,
                            }))
                        }
                        placeholder="Created at"
                    />
                </div>
                <div className="form-control w-full">
                    <label className="label text-lg font-semibold mb-2">
                        Updated By
                    </label>
                    <input
                        className="input input-bordered input-lg w-full"
                        name="updatedBy"
                        value={audit.updatedBy || ""}
                        onChange={(e) =>
                            setAudit((a) => ({
                                ...a,
                                updatedBy: e.target.value,
                            }))
                        }
                        placeholder="Updated by"
                    />
                </div>
                <div className="form-control w-full">
                    <label className="label text-lg font-semibold mb-2">
                        Updated At
                    </label>
                    <input
                        className="input input-bordered input-lg w-full"
                        name="updatedAt"
                        value={audit.updatedAt || ""}
                        onChange={(e) =>
                            setAudit((a) => ({
                                ...a,
                                updatedAt: e.target.value,
                            }))
                        }
                        placeholder="Updated at"
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
                {loading && <span className="loading loading-spinner"></span>}
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
    );
}
