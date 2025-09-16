"use client";
import React, { useState, useRef, useEffect } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import axios from "axios";
import { useAdminActivities } from "@/app/shared/contexts/AdminActivitiesContext";
import FullPageLoader from "../../components/FullPageLoader";
import { Pencil } from "lucide-react";
import statusOptions from "@/app/constants/constants";
import { ACTIVITY_TYPES_FORMATTED } from "@/app/constants/constants";
import Tabs from "../../components/Tabs";

function extractMapLocationFromUrl(raw) {
    if (!raw) return "";
    try {
        const urlObj = new URL(raw);
        const q = urlObj.searchParams.get("q");
        return q ? decodeURIComponent(q.replace(/\+/g, " ")) : "";
    } catch {
        return "";
    }
}

function buildEmbedMapUrl(loc) {
    return loc
        ? `https://www.google.com/maps?q=${encodeURIComponent(
              loc + ", Hong Kong"
          )}&output=embed&z=14`
        : "";
}

function formatForInput(iso) {
    if (!iso) return "";
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "";
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
        d.getDate()
    )}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function EditActivityPage() {
    const [form, setForm] = useState(null);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [imageFile, setImageFile] = useState(null);
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");
    const [audit, setAudit] = useState({});
    const [mapUrl, setMapUrl] = useState(
        "https://www.google.com/maps?q=Hong+Kong&output=embed&z=12"
    );
    const router = useRouter();
    const fileInputRef = useRef();
    const params = useParams();
    const activityId = params?.id;
    const searchParams = useSearchParams();
    const {
        activities,
        loading: actLoading,
        setActivities,
    } = useAdminActivities();
    const [activity, setActivity] = useState(undefined);
    const [activeTab, setActiveTab] = useState("details");
    const [tncOptions, setTncOptions] = useState([]);
    const [tncLoading, setTncLoading] = useState(false);
    useEffect(() => {
        // If the URL contains ?tab=description (or chinese), open that tab.
        try {
            const tabFromUrl = searchParams?.get("tab");
            if (tabFromUrl === "description" || tabFromUrl === "chinese") {
                setActiveTab(tabFromUrl);
            }
        } catch (e) {
            // ignore if searchParams not available
        }
        if (!activities || !activityId) return;
        const found =
            activities.find((a) => String(a.id) === String(activityId)) || null;
        setActivity(found);
    }, [activities, activityId]);

    useEffect(() => {
        if (!activity) return;
        let formattedActivityType = "";
        if (activity.activityType) {
            formattedActivityType = activity.activityType;
        }
        let caloriesPerHourMin = "";
        let caloriesPerHourMax = "";
        if (
            activity.caloriesPerHour &&
            typeof activity.caloriesPerHour === "string"
        ) {
            const [min, max] = activity.caloriesPerHour
                .split("-")
                .map((s) => s.trim());
            caloriesPerHourMin = min || "";
            caloriesPerHourMax = max || "";
        }
        setForm({
            title: activity.title || "",
            titleZh: activity.titleZh || "",
            description: activity.description || "",
            descriptionZh: activity.descriptionZh || "",
            summary: activity.summary,
            summaryZh: activity.summaryZh,
            activityType: formattedActivityType,
            startDateTime: formatForInput(
                activity.startTime || activity.startDate
            ),
            endDateTime: formatForInput(activity.endTime || activity.endDate),
            location: activity.location || "",
            mapLocation: extractMapLocationFromUrl(activity.mapUrl) || "",
            capacity: activity.participantLimit || "",
            status: activity.status || "active",
            totalCaloriesBurnt: activity.totalCaloriesBurnt || "",
            caloriesPerHourMin,
            caloriesPerHourMax,
            tncId: activity.tncId,
            isFeatured: !!activity.isFeatured,
            organizationName: activity.organizationName,
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

    useEffect(() => {
        if (form?.mapLocation) {
            const encodedLocation = encodeURIComponent(
                form.mapLocation + ", Hong Kong"
            );
            setMapUrl(
                `https://www.google.com/maps?q=${encodedLocation}&output=embed&z=14`
            );
        } else {
            setMapUrl(
                "https://www.google.com/maps?q=Hong+Kong&output=embed&z=12"
            );
        }
    }, [form?.mapLocation]);

    useEffect(() => {
        const fetchTncs = async () => {
            try {
                setTncLoading(true);
                const { data } = await axios.get("/api/admin/tnc");
                if (Array.isArray(data)) {
                    setTncOptions(data);
                } else if (Array.isArray(data?.data)) {
                    setTncOptions(data.data);
                } else if (Array.isArray(data?.tncs)) {
                    setTncOptions(data.tncs);
                }
            } catch (e) {
            } finally {
                setTncLoading(false);
            }
        };
        fetchTncs();
    }, []);

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
        if (!form.title) errs.title = "Title is required.";
        if (!form.description) errs.description = "Summary is required.";
        if (!form.activityType)
            errs.activityType = "Activity type is required.";
        if (!form.startDateTime)
            errs.startDateTime = "Start date and time are required.";
        else {
            const dt = new Date(form.startDateTime);
            if (dt < new Date())
                errs.startDateTime =
                    "Start date and time must be in the future.";
        }
        if (!form.endDateTime)
            errs.endDateTime = "End date and time are required.";
        else {
            const startDt = new Date(form.startDateTime);
            const endDt = new Date(form.endDateTime);
            if (endDt <= startDt)
                errs.endDateTime =
                    "End date and time must be after start date and time.";
        }
        if (!form.location) errs.location = "Location is required.";
        const cap = parseInt(form.capacity, 10);
        if (!cap || cap < 1 || cap > 1000)
            errs.capacity = "Capacity must be 1-1000.";

        const min = form.caloriesPerHourMin?.trim();
        const max = form.caloriesPerHourMax?.trim();
        if (!min || !max) {
            errs.caloriesPerHour =
                "Both min and max calories per hour are required.";
        } else if (min > max) {
            errs.caloriesPerHour =
                "Min calories per hour should not be greater than max.";
        }
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
        const { name, value, type, checked } = e.target;
        setForm((f) => ({
            ...f,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setImageFile(file);
    };

    const handleSave = async () => {
        if (!validate()) return;
        setLoading(true);
        setError("");
        setSuccess("");
        try {
            const activityId = activity.id;
            const formData = new FormData();

            Object.entries(form).forEach(([key, value]) => {
                if (
                    key === "time" ||
                    key === "caloriesPerHourMin" ||
                    key === "caloriesPerHourMax" ||
                    key === "mapLocation" ||
                    key === "startDateTime" ||
                    key === "endDateTime"
                )
                    return;
                if (value !== "" && value !== null && value !== undefined) {
                    if (key === 'capacity') return;
                    formData.append(key, value);
                }
            });

            if (form.capacity !== undefined && form.capacity !== null && form.capacity !== '') {
                formData.append('participantLimit', String(form.capacity));
            }

            if (form.startDateTime) {
                const start = new Date(form.startDateTime);
                if (!isNaN(start.getTime())) {
                    const iso = start.toISOString();
                    formData.append("startDate", iso);
                    formData.append("startTime", iso);
                }
            }
            if (form.endDateTime) {
                const end = new Date(form.endDateTime);
                if (!isNaN(end.getTime())) {
                    const iso = end.toISOString();
                    formData.append("endDate", iso);
                    formData.append("endTime", iso);
                }
            }

            formData.append(
                "caloriesPerHour",
                `${form.caloriesPerHourMin}-${form.caloriesPerHourMax}`
            );
            formData.append("mapUrl", buildEmbedMapUrl(form.mapLocation));
            formData.append("isFeatured", !!form.isFeatured);

            if (form.description) {
                formData.append("summary", form.description);
            }
            if (form.descriptionZh) {
                formData.append("summaryZh", form.descriptionZh);
            }

            // Ensure organizationName is included when present
            if (form.organizationName !== undefined && form.organizationName !== null) {
                formData.append("organizationName", form.organizationName);
            }

            // Ensure tncId is included when present (can be empty string)
            if (form.tncId !== undefined) {
                formData.append("tncId", form.tncId || "");
            }

            if (imageFile && imageFile.url === undefined) {
                formData.append("image", imageFile);
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
            if (setActivities && data) {
                setActivities((prev) =>
                    prev.map((act) =>
                        String(act.id) === String(data.id)
                            ? { ...act, ...data, mapUrl: data.mapUrl }
                            : act
                    )
                );
            }

            setSuccess("Activity updated successfully!");
            setActiveTab("description");
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
        <div className="flex flex-col items-center justify-center w-full h-full min-h-0 bg-white px-2 sm:px-4 md:px-8 lg:px-16 flex-1">
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
            <div className="w-full  bg-white overflow-y-auto mb-2">
                {/* Tabs */}
                <Tabs
                    setTab={setActiveTab}
                    activeTab={activeTab}
                    activityId={activityId}
                    summary={form.summary}
                    summaryZh={form.summaryZh}
                />
                {activeTab === "details" && (
                    <>
                        <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-black">
                            Edit Activity
                        </h1>
                        {error && (
                            <div className="alert alert-error mb-4">
                                {error}
                            </div>
                        )}
                        {success && (
                            <div className="alert alert-success mb-4">
                                {success}
                            </div>
                        )}
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleSave();
                            }}
                            className="w-full"
                            style={{ marginLeft: 0, marginRight: 0 }}
                        >
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-8 w-full" style={{alignItems: 'center'}}>
                                {/* Upload Image - full width */}
                                <div className="col-span-1 md:col-span-3">
                                    <label className="label text-lg font-semibold mb-2 text-black">
                                        Upload Image
                                    </label>
                                    <div className="relative flex flex-col items-center justify-center bg-white border-2 border-dashed border-[#3B82F6] rounded-xl p-4 sm:p-8 min-h-[120px] sm:min-h-[180px] w-full">
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
                                                        src={
                                                            imageFile.url
                                                                ? imageFile.url
                                                                : URL.createObjectURL(
                                                                      imageFile
                                                                  )
                                                        }
                                                        alt="Activity"
                                                        className="w-full h-auto max-h-[320px] object-contain"
                                                        style={{
                                                            display: "block",
                                                            margin: "0 auto",
                                                        }}
                                                    />
                                                    {/* Pencil icon (lucide-react) for changing image */}
                                                    <button
                                                        type="button"
                                                        className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-white rounded-full p-1 shadow hover:bg-gray-100"
                                                        style={{ zIndex: 10 }}
                                                        onClick={() => {
                                                            if (
                                                                fileInputRef.current
                                                            ) {
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
                                {/* Row 1: Activity Title, Chinese Title, Activity Type */}
                                <div className="form-control w-full">
                                    <label className="label text-lg font-semibold mb-2 text-black">
                                        Activity Title
                                    </label>
                                    <input
                                        className="input input-bordered input-lg w-full bg-white text-black"
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
                                <div className="form-control w-full">
                                    <label className="label text-lg font-semibold mb-2 text-black">
                                        Chinese Title
                                    </label>
                                    <input
                                        className="input input-bordered input-lg w-full bg-white text-black"
                                        name="titleZh"
                                        value={form.titleZh}
                                        onChange={handleInput}
                                        maxLength={100}
                                        placeholder="输入中文标题"
                                    />
                                </div>
                                <div className="form-control w-full">
                                    <label className="label text-lg font-semibold mb-2 text-black">
                                        Activity Type
                                    </label>
                                    <select
                                        className="select select-bordered select-lg w-full bg-white text-black"
                                        name="activityType"
                                        value={form.activityType}
                                        onChange={handleInput}
                                        required
                                    >
                                        <option value="">
                                            Select activity type
                                        </option>
                                        {ACTIVITY_TYPES_FORMATTED.map(
                                            (formatted) => (
                                                <option
                                                    key={formatted}
                                                    value={formatted}
                                                >
                                                    {formatted.replace(
                                                        /_/g,
                                                        " "
                                                    )}
                                                </option>
                                            )
                                        )}
                                    </select>
                                </div>
                                {/* Should be featured, Summary, Chinese Summary */}
                                {/* ? */}
                                <div className="form-control w-full col-span-1">
                                    <label className="label text-lg font-semibold mb-2 text-black">
                                        Featured
                                    </label>
                                    <div className="flex items-center justify-between gap-4">
                                        <p className="text-sm text-gray-600">Feature this activity to highlight it on the landing page.</p>
                                        <label className="inline-flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="toggle toggle-primary"
                                                name="isFeatured"
                                                checked={!!form.isFeatured}
                                                onChange={handleInput}
                                                aria-label="Feature this activity"
                                            />
                                        </label>
                                    </div>
                                </div>
                                <div className="form-control w-full">
                                    <label className="label text-lg font-semibold mb-2 text-black">
                                        Summary
                                    </label>
                                    <textarea
                                        className="textarea textarea-bordered textarea-lg w-full bg-white text-black"
                                        name="description"
                                        value={form.description}
                                        onChange={handleInput}
                                        required
                                        rows={3}
                                        placeholder="Enter summary"
                                    />
                                    {errors.description && (
                                        <span className="text-error text-base">
                                            {errors.description}
                                        </span>
                                    )}
                                </div>
                                <div className="form-control w-full">
                                    <label className="label text-lg font-semibold mb-2 text-black">
                                        Chinese Summary
                                    </label>
                                    <textarea
                                        className="textarea textarea-bordered textarea-lg w-full bg-white text-black"
                                        name="descriptionZh"
                                        value={form.descriptionZh}
                                        onChange={handleInput}
                                        rows={3}
                                        placeholder="输入中文简介"
                                    />
                                </div>
                                <div className="form-control w-full">
                                    <label className="label text-lg font-semibold mb-2 text-black">
                                        Start Date & Time
                                    </label>
                                    <input
                                        type="datetime-local"
                                        className="input input-bordered input-lg w-full bg-white text-black"
                                        name="startDateTime"
                                        value={form.startDateTime}
                                        onChange={handleInput}
                                        required
                                    />
                                    {errors.startDateTime && (
                                        <span className="text-error text-base">
                                            {errors.startDateTime}
                                        </span>
                                    )}
                                </div>
                                <div className="form-control w-full">
                                    <label className="label text-lg font-semibold mb-2 text-black">
                                        End Date & Time
                                    </label>
                                    <input
                                        type="datetime-local"
                                        className="input input-bordered input-lg w-full bg-white text-black"
                                        name="endDateTime"
                                        value={form.endDateTime}
                                        onChange={handleInput}
                                        required
                                    />
                                    {errors.endDateTime && (
                                        <span className="text-error text-base">
                                            {errors.endDateTime}
                                        </span>
                                    )}
                                </div>
                                <div className="form-control w-full">
                                    <label className="label text-lg font-semibold mb-2 text-black">
                                        Location
                                    </label>
                                    <input
                                        className="input input-bordered input-lg w-full bg-white text-black"
                                        name="location"
                                        value={form.location}
                                        onChange={handleInput}
                                        required
                                        placeholder="Search In Map "
                                    />
                                    {errors.location && (
                                        <span className="text-error text-base">
                                            {errors.location}
                                        </span>
                                    )}
                                </div>
                                <div className="form-control w-full">
                                    <label className="label text-lg font-semibold mb-2 text-black">
                                        Capacity
                                    </label>
                                    <input
                                        type="number"
                                        className="input input-bordered input-lg w-full bg-white text-black"
                                        name="capacity"
                                        value={form.capacity}
                                        onChange={handleInput}
                                        min={1}
                                        required
                                        placeholder="Enter participant limit"
                                    />
                                    {errors.capacity && (
                                        <span className="text-error text-base">
                                            {errors.capacity}
                                        </span>
                                    )}
                                </div>
                                {/* Row 4: Calories Per Hour, End Date & Time, Status */}
                                <div className="form-control w-full">
                                    <label className="label text-lg font-semibold mb-2 text-black">
                                        Calories Per Hour
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="number"
                                            className="input input-bordered input-lg w-full bg-white text-black"
                                            name="caloriesPerHourMin"
                                            value={form.caloriesPerHourMin}
                                            onChange={handleInput}
                                            min={0.01}
                                            step="any"
                                            required
                                            placeholder="Min"
                                        />
                                        <span className="self-center text-lg font-bold">
                                            -
                                        </span>
                                        <input
                                            type="number"
                                            className="input input-bordered input-lg w-full bg-white text-black"
                                            name="caloriesPerHourMax"
                                            value={form.caloriesPerHourMax}
                                            onChange={handleInput}
                                            min={0.01}
                                            step="any"
                                            required
                                            placeholder="Max"
                                        />
                                    </div>
                                    {errors.caloriesPerHour && (
                                        <span className="text-error text-base">
                                            {errors.caloriesPerHour}
                                        </span>
                                    )}
                                </div>
                                <div className="form-control w-full">
                                    <label className="label text-lg font-semibold mb-2 text-black">
                                        Status
                                    </label>
                                    <select
                                        className="select select-bordered select-lg w-full bg-white text-black"
                                        name="status"
                                        value={form.status}
                                        onChange={handleInput}
                                    >
                                        {statusOptions.map((status) => (
                                            <option key={status} value={status}>
                                                {status
                                                    .charAt(0)
                                                    .toUpperCase() +
                                                    status.slice(1)}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                {/* Row 5: Terms & Conditions, Map Location (empty for spacing) */}
                                <div className="form-control w-full">
                                    <label className="label text-lg font-semibold mb-2 text-black">
                                        Terms & Conditions
                                    </label>
                                    <select
                                        className="select select-bordered select-lg w-full bg-white text-black"
                                        name="tncId"
                                        value={form.tncId || ""}
                                        onChange={handleInput}
                                        disabled={tncLoading}
                                    >
                                        <option value="">
                                            {tncLoading
                                                ? "Loading..."
                                                : "Select T&C"}
                                        </option>
                                        {tncOptions.map((t) => (
                                            <option key={t.id} value={t.id}>
                                                {t.title}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-control w-full col-span-1">
                                    <label className="label text-lg font-semibold mb-2 text-black">
                                        Organization Name
                                    </label>
                                    <input
                                        className="input input-bordered input-lg w-full bg-white text-black"
                                        name="organizationName"
                                        value={form.organizationName || ""}
                                        onChange={handleInput}
                                        placeholder="Name of organizer of this activity"
                                    />
                                </div>
                                <div className="col-span-full">
                                <div className="form-control w-full">
                                    <input
                                        className="input input-bordered input-lg w-full bg-white text-black"
                                        name="mapLocation"
                                        onChange={handleInput}
                                        value={form.mapLocation}
                                        placeholder="Search In Map"
                                    />
                                    {errors.mapLocation && (
                                        <span className="text-error text-base">
                                            {errors.mapLocation}
                                        </span>
                                    )}
                                </div>
                                </div>
                            </div>
                            {/* Google Map at the bottom */}
                            <div className="w-full max-w-5xl mt-8 mb-4">
                                <div className="w-full h-[320px] rounded-xl overflow-hidden border border-gray-200">
                                    <iframe
                                        title="Google Map"
                                        width="100%"
                                        height="100%"
                                        style={{
                                            border: 0,
                                            width: "100%",
                                            height: "100%",
                                        }}
                                        loading="lazy"
                                        allowFullScreen
                                        referrerPolicy="no-referrer-when-downgrade"
                                        src={mapUrl}
                                    ></iframe>
                                </div>
                            </div>
                            <div className="md:col-span-3 flex flex-col sm:flex-row gap-3 sm:gap-4 mt-6 w-full">
                                <button
                                    type="submit"
                                    className={`btn btn-primary btn-lg flex-1`}
                                    disabled={loading}
                                >
                                    {loading ? 'Saving ...' : 'Save'}
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
                        </form>
                        {/* Cancel Confirmation */}
                        {showCancelConfirm && (
                            <div className="modal modal-open">
                                <div className="modal-box">
                                    <p className="text-lg">
                                        Are you sure you want to cancel? Unsaved
                                        changes will be lost.
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
                                            onClick={() =>
                                                setShowCancelConfirm(false)
                                            }
                                        >
                                            No
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
