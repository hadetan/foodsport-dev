"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import ErrorAlert from "@/app/shared/components/ErrorAlert";
import axiosClient from "@/utils/axios/api";
import ActivityStatus, { MAX_IMAGE_SIZE_MB } from "@/app/constants/constants";
import { ImageUp, Pencil } from "lucide-react";
import Tabs from "@/app/admin/(logged_in)/components/Tabs";
import ActivityDetailsStep from "@/app/admin/(logged_in)/components/descriptionBox";
import { useAdminActivities } from "@/app/shared/contexts/AdminActivitiesContext";
import { ACTIVITY_TYPES } from "@/app/constants/constants";

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
        caloriesPerHour: "",
        image: null,
        status: "draft",
    });
    const { setActivities } = useAdminActivities();
    const [error, setError] = useState("");
    const [fieldErrors, setFieldErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [imageAspect, setImageAspect] = useState(null); // {width, height}
    const imgRef = useRef(null);
    const [tab, setTab] = useState("details");
    const [activityId, setActivityId] = useState(null);
    const [mapUrl, setMapUrl] = useState(
        "https://www.google.com/maps?q=&output=embed"
    );

    useEffect(() => {
        if (formData.image && imgRef.current) {
            const img = imgRef.current;
            if (img.complete) {
                setImageAspect({
                    width: img.naturalWidth,
                    height: img.naturalHeight,
                });
            } else {
                img.onload = () => {
                    setImageAspect({
                        width: img.naturalWidth,
                        height: img.naturalHeight,
                    });
                };
            }
        } else {
            setImageAspect(null);
        }
    }, [formData.image]);

    useEffect(() => {
        if (formData.location) {
            const encodedLocation = encodeURIComponent(
                formData.location + ", Hong Kong"
            );
            setMapUrl(
                `https://www.google.com/maps?q=${encodedLocation}&output=embed&z=14`
            );
        } else {
            // Center on Hong Kong only
            setMapUrl(
                "https://www.google.com/maps?q=Hong+Kong&output=embed&z=12"
            );
        }
    }, [formData.location]);

    const isValidYear = (dateStr) => {
        if (!dateStr) return true;
        const year = dateStr.split("-")[0];
        return /^\d{1,4}$/.test(year);
    };

    const validateFields = () => {
        const requiredFields = [
            "title",
            "activityType",
            "description",
            "location",
            "capacity",
            "caloriesPerHour",
            "image",
            "status",
            "startDateTime",
            "endDateTime",
        ];
        const errors = {};
        requiredFields.forEach((field) => {
            if (
                formData[field] === "" ||
                formData[field] === null ||
                typeof formData[field] === "undefined"
            ) {
                errors[field] = "This field is required.";
            }
        });
        // Validate that startDateTime is before endDateTime
        if (formData.startDateTime && formData.endDateTime) {
            const start = new Date(formData.startDateTime);
            const end = new Date(formData.endDateTime);
            if (start > end) {
                errors.startDateTime =
                    "Start date/time cannot be after end date/time.";
                errors.endDateTime =
                    "End date/time cannot be before start date/time.";
            }
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

    const handleCreateActivity = async () => {
        if (!validateFields()) {
            setError("Please fix the errors in the form.");
            return;
        }
        try {
            setLoading(true);
            const startISO = formData.startDateTime
                ? new Date(formData.startDateTime).toISOString()
                : "";
            const endISO = formData.endDateTime
                ? new Date(formData.endDateTime).toISOString()
                : "";
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
            const response = await axiosClient.post(
                "/admin/activities",
                formDataToSend,
                {
                    headers: { "Content-Type": "multipart/form-data" },
                }
            );
            if (response?.data?.id) {
                setActivityId(response?.data?.id);
                setActivities((prev) =>
                    Array.isArray(prev)
                        ? [...prev, response?.data]
                        : [response?.data]
                );
            }

            setTab("description");
        } catch (err) {
            setError(err?.response?.data?.error || err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center w-full h-full min-h-0 bg-white px-2 sm:px-4 md:px-8 lg:px-16 flex-1">
            {/* Back Button */}
            <div className="w-full max-w-5xl flex justify-start mb-4">
                <button
                    className="btn btn-primary"
                    onClick={() => router.push("/admin/activities")}
                    type="button"
                >
                    &larr; Back
                </button>
            </div>
            <div className="w-full max-w-5xl bg-white  overflow-y-auto rounded-xl">
                {/* Tabs */}
                <Tabs setTab={setTab} activeTab={tab} />

                {tab === "details" ? (
                    <>
                        <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-black">
                            Create Activity
                        </h1>
                        {error && (
                            <ErrorAlert
                                message={error}
                                onClose={() => setError("")}
                            />
                        )}
                        <form
                            className="grid grid-cols-1 md:grid-cols-2 gap-x-4 md:gap-x-8 gap-y-6"
                            onSubmit={async (e) => {
                                e.preventDefault();
                                await handleCreateActivity();
                            }}
                        >
                            {/* Upload Image - full width */}
                            <div className="md:col-span-2">
                                <label className="label text-lg font-semibold mb-2 text-black">
                                    Upload Image
                                </label>
                                <div className="relative flex flex-col items-center justify-center bg-white border-2 border-dashed border-[#3B82F6] rounded-xl p-4 sm:p-8 min-h-[120px] sm:min-h-[180px] w-full">
                                    <input
                                        id="activity-image-upload"
                                        type="file"
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        disabled={!!formData.image}
                                        style={{ zIndex: 2 }}
                                    />
                                    {!formData.image && (
                                        <div className="flex flex-col items-center pointer-events-none select-none">
                                            <ImageUp className="w-10 h-10 sm:w-12 sm:h-12 text-[#3B82F6] mb-2" />
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
                                    {formData.image && (
                                        <div className="relative w-full flex justify-center">
                                            <div
                                                className="bg-white flex items-center justify-center w-full"
                                                style={{
                                                    width: "100%",
                                                    maxWidth: "100%",
                                                    minHeight: "180px",
                                                    maxHeight: "320px",
                                                    aspectRatio: "16/9",
                                                    borderRadius: "0.75rem",
                                                    overflow: "hidden",
                                                }}
                                            >
                                                <img
                                                    ref={imgRef}
                                                    src={
                                                        typeof formData.image ===
                                                        "string"
                                                            ? formData.image
                                                            : URL.createObjectURL(
                                                                  formData.image
                                                              )
                                                    }
                                                    alt="Preview"
                                                    className="w-full h-auto max-h-[320px] object-contain"
                                                    style={{
                                                        display: "block",
                                                        margin: "0 auto",
                                                    }}
                                                />
                                                {/* Pencil icon for changing image */}
                                                <button
                                                    type="button"
                                                    className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-white rounded-full p-1 shadow hover:bg-gray-100"
                                                    style={{ zIndex: 10 }}
                                                    onClick={() => {
                                                        setFormData((prev) => ({
                                                            ...prev,
                                                            image: null,
                                                        }));
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
                                {fieldErrors.image && (
                                    <span className="text-error text-base">
                                        {fieldErrors.image}
                                    </span>
                                )}
                            </div>
                            {/* Left column */}
                            <div className="flex flex-col gap-4 sm:gap-6">
                                {/* Activity Title */}
                                <div className="form-control w-full">
                                    <label className="label text-lg font-semibold mb-2 text-black">
                                        Activity Title
                                    </label>
                                    <input
                                        className="input input-bordered input-lg w-full bg-white text-black"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleFormChange}
                                        maxLength={100}
                                        required
                                    />
                                    {fieldErrors.title && (
                                        <span className="text-error text-base">
                                            {fieldErrors.title}
                                        </span>
                                    )}
                                </div>
                                {/* Activity Type */}
                                <div className="form-control w-full">
                                    <label className="label text-lg font-semibold mb-2 text-black">
                                        Activity Type
                                    </label>
                                    <select
                                        className="select select-bordered select-lg w-full bg-white text-black"
                                        name="activityType"
                                        value={formData.activityType}
                                        onChange={handleFormChange}
                                        required
                                    >
                                        <option value="">
                                            Select activity type
                                        </option>
                                        {ACTIVITY_TYPES.map((type) => (
                                            <option key={type} value={type}>
                                                {type.charAt(0).toUpperCase() +
                                                    type.slice(1)}
                                            </option>
                                        ))}
                                    </select>
                                    {fieldErrors.activityType && (
                                        <span className="text-error text-base">
                                            {fieldErrors.activityType}
                                        </span>
                                    )}
                                </div>
                                {/* Summary */}
                                <div className="form-control w-full">
                                    <label className="label text-lg font-semibold mb-2 text-black">
                                        Summary
                                    </label>
                                    <textarea
                                        className="textarea textarea-bordered textarea-lg w-full bg-white text-black"
                                        name="description"
                                        value={formData.description}
                                        onChange={(e) => {
                                            setFormData((prev) => ({
                                                ...prev,
                                                description: e.target.value,
                                            }));
                                            setFieldErrors((prev) => ({
                                                ...prev,
                                                description: undefined,
                                            }));
                                        }}
                                        required
                                        rows={3}
                                        placeholder="Enter summary"
                                    />
                                    {fieldErrors.description && (
                                        <span className="text-error text-base">
                                            {fieldErrors.description}
                                        </span>
                                    )}
                                </div>
                                {/* Start Date & Time */}
                                <div className="form-control w-full">
                                    <label className="label text-lg font-semibold mb-2 text-black">
                                        Start Date &amp; Time
                                    </label>
                                    <input
                                        type="datetime-local"
                                        className="input input-bordered input-lg w-full bg-white text-black"
                                        name="startDateTime"
                                        value={formData.startDateTime}
                                        onChange={handleFormChange}
                                        required
                                    />
                                    {fieldErrors.startDateTime && (
                                        <span className="text-error text-base">
                                            {fieldErrors.startDateTime}
                                        </span>
                                    )}
                                </div>
                            </div>
                            {/* Right column */}
                            <div className="flex flex-col gap-4 sm:gap-6">
                                {/* Location */}
                                <div className="form-control w-full">
                                    <label className="label text-lg font-semibold mb-2 text-black">
                                        Location
                                    </label>
                                    <input
                                        className="input input-bordered input-lg w-full bg-white text-black"
                                        name="location"
                                        value={formData.location}
                                        onChange={handleFormChange}
                                        required
                                        placeholder="Enter activity location"
                                    />
                                    {fieldErrors.location && (
                                        <span className="text-error text-base">
                                            {fieldErrors.location}
                                        </span>
                                    )}
                                </div>
                                {/* Capacity */}
                                <div className="form-control w-full">
                                    <label className="label text-lg font-semibold mb-2 text-black">
                                        Capacity
                                    </label>
                                    <input
                                        type="number"
                                        className="input input-bordered input-lg w-full bg-white text-black"
                                        name="capacity"
                                        value={formData.capacity}
                                        onChange={handleFormChange}
                                        min={1}
                                        required
                                        placeholder="Enter participant limit"
                                    />
                                    {fieldErrors.capacity && (
                                        <span className="text-error text-base">
                                            {fieldErrors.capacity}
                                        </span>
                                    )}
                                </div>
                                {/* Calories Per Hour */}
                                <div className="form-control w-full">
                                    <label className="label text-lg font-semibold mb-2 text-black">
                                        Calories Per Hour
                                    </label>
                                    <input
                                        type="number"
                                        className="input input-bordered input-lg w-full bg-white text-black"
                                        name="caloriesPerHour"
                                        value={formData.caloriesPerHour}
                                        onChange={handleFormChange}
                                        min={0.01}
                                        step="any"
                                        required
                                        placeholder="Enter calories per hour"
                                    />
                                    {fieldErrors.caloriesPerHour && (
                                        <span className="text-error text-base">
                                            {fieldErrors.caloriesPerHour}
                                        </span>
                                    )}
                                </div>
                                {/* End Date & Time */}
                                <div className="form-control w-full">
                                    <label className="label text-lg font-semibold mb-2 text-black">
                                        End Date &amp; Time
                                    </label>
                                    <input
                                        type="datetime-local"
                                        className="input input-bordered input-lg w-full bg-white text-black"
                                        name="endDateTime"
                                        value={formData.endDateTime}
                                        onChange={handleFormChange}
                                        required
                                    />
                                    {fieldErrors.endDateTime && (
                                        <span className="text-error text-base">
                                            {fieldErrors.endDateTime}
                                        </span>
                                    )}
                                </div>
                                {/* Status */}
                                <div className="form-control w-full">
                                    <label className="label text-lg font-semibold mb-2 text-black">
                                        Status
                                    </label>
                                    <select
                                        className="select select-bordered select-lg w-full bg-white text-black"
                                        name="status"
                                        value={formData.status}
                                        onChange={handleFormChange}
                                    >
                                        {ActivityStatus.map((status) => (
                                            <option key={status} value={status}>
                                                {status
                                                    .charAt(0)
                                                    .toUpperCase() +
                                                    status.slice(1)}
                                            </option>
                                        ))}
                                    </select>
                                    {fieldErrors.status && (
                                        <span className="text-error text-base">
                                            {fieldErrors.status}
                                        </span>
                                    )}
                                </div>
                            </div>
                            {/* Actions - full width */}
                            <div className="md:col-span-2 flex flex-col sm:flex-row gap-3 sm:gap-4 mt-6 w-full">
                                <button
                                    type="submit"
                                    className={`btn btn-primary btn-lg flex-1 ${
                                        loading ? "loading" : ""
                                    }`}
                                    disabled={loading}
                                >
                                    Save & Continue
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-outline btn-lg flex-1"
                                    onClick={() =>
                                        router.push("/admin/activities")
                                    }
                                    disabled={loading}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </>
                ) : (
                    <ActivityDetailsStep activityId={activityId} />
                )}
            </div>
            {/* Google Map at the bottom */}
            <div className="w-full max-w-5xl mt-8 mb-4">
                <h2 className="text-lg font-semibold mb-2 text-black">
                    Location Map
                </h2>
                <div className="w-full h-[320px] rounded-xl overflow-hidden border border-gray-200">
                    <iframe
                        title="Google Map"
                        width="100%"
                        height="100%"
                        style={{ border: 0, width: "100%", height: "100%" }}
                        loading="lazy"
                        allowFullScreen
                        referrerPolicy="no-referrer-when-downgrade"
                        src={mapUrl}
                    ></iframe>
                </div>
            </div>
        </div>
    );
};

export default CreateActivityPage;
