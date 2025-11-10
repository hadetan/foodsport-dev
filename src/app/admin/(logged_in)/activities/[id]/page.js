"use client";
import React, { useState, useRef, useEffect } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import axios from "@/utils/axios/api";
import { useAdminActivities } from "@/app/shared/contexts/AdminActivitiesContext";
import FullPageLoader from "../../components/FullPageLoader";
import { Pencil, ArrowLeft, Calendar, MapPin, ImageUp } from "lucide-react";
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

// Helper: whether a given status requires a T&C selection
function requiresTncForStatus(status) {
    const s = String(status || "").toLowerCase();
    return s === "active" || s === "closed" || s === "cancelled";
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
        try {
            const tabFromUrl = searchParams?.get("tab");
            if (tabFromUrl === "description" || tabFromUrl === "chinese") {
                setActiveTab(tabFromUrl);
            }
        } catch (e) {
            // ignore if searchParams not available
        }
    }, [searchParams]);

    useEffect(() => {
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
        const startDateTimeFormatted = formatForInput(
            activity.startTime || activity.startDate
        );
        const endDateTimeFormatted = formatForInput(
            activity.endTime || activity.endDate
        );

        const [startDate, startTime] = startDateTimeFormatted
            ? startDateTimeFormatted.split("T")
            : ["", ""];
        const [endDate, endTime] = endDateTimeFormatted
            ? endDateTimeFormatted.split("T")
            : ["", ""];

        setForm({
            title: activity.title || "",
            titleZh: activity.titleZh || "",
            description: activity.description || "",
            descriptionZh: activity.descriptionZh || "",
            summary: activity.summary,
            summaryZh: activity.summaryZh,
            activityType: formattedActivityType,
            startDate: startDate,
            startTime: startTime,
            endDate: endDate,
            endTime: endTime,
            location: activity.location || "",
            mapLocation: extractMapLocationFromUrl(activity.mapUrl) || "",
            capacity: activity.participantLimit || "",
            status: activity.status || "active",
            totalCaloriesBurnt: activity.totalCaloriesBurnt || "",
            caloriesPerHourMin,
            caloriesPerHourMax,
            tncIds: activity.tnc?.id ? [activity.tnc.id] : [],
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
                const { data } = await axios.get("/admin/tnc");
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

        // Require T&C only when moving out of draft (active/closed/cancelled)
        const requiresTnc = requiresTncForStatus(form.status);
        if (requiresTnc && (!form.tncIds || form.tncIds.length === 0)) {
            errs.tncIds =
                "Please select at least one T&C before switching to active status";
        }
        setErrors(errs);
        if (errs.tncIds) setError(errs.tncIds);
        return Object.keys(errs).length === 0;
    };

    const handleInput = (e) => {
        const { name, value, type, checked } = e.target;
        const newValue = type === "checkbox" ? checked : value;
        setForm((prev) => {
            const next = { ...prev, [name]: newValue };

            if (name === "status") {
                const requiresTnc = requiresTncForStatus(newValue);
                if (requiresTnc && (!next.tncIds || next.tncIds.length === 0)) {
                    const msg =
                        "Please select at least one T&C before switching to active status";
                    setErrors((prevErrs) => ({ ...prevErrs, tncIds: msg }));
                    setError(msg);
                } else {
                    setErrors((prevErrs) => {
                        const { tncIds, ...rest } = prevErrs || {};
                        return rest;
                    });
                    setError("");
                }
            }

            return next;
        });
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
                    key === "startDate" ||
                    key === "startTime" ||
                    key === "endDate" ||
                    key === "endTime" ||
                    key === "tncIds"
                )
                    return;
                if (value !== "" && value !== null && value !== undefined) {
                    if (key === "capacity") return;
                    formData.append(key, value);
                }
            });

            if (
                form.capacity !== undefined &&
                form.capacity !== null &&
                form.capacity !== ""
            ) {
                formData.append("participantLimit", String(form.capacity));
            }

            if (form.startDate && form.startTime) {
                const start = new Date(`${form.startDate}T${form.startTime}`);
                if (!isNaN(start.getTime())) {
                    const iso = start.toISOString();
                    formData.append("startDate", iso);
                    formData.append("startTime", iso);
                }
            }
            if (form.endDate && form.endTime) {
                const end = new Date(`${form.endDate}T${form.endTime}`);
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

            // Ensure organizationName is included when present
            if (
                form.organizationName !== undefined &&
                form.organizationName !== null
            ) {
                formData.append("organizationName", form.organizationName);
            }

            // Add all tncIds as separate form data entries
            if (form.tncIds && form.tncIds.length > 0) {
                // Send first one as tncId for backward compatibility
                formData.append("tncId", form.tncIds[0]);
                // Send all as array
                form.tncIds.forEach((id) => {
                    formData.append("tncIds[]", id);
                });
            } else {
                formData.append("tncId", "");
            }

            if (imageFile && imageFile.url === undefined) {
                formData.append("image", imageFile);
            }

            const { data } = await axios.patch(
                `/admin/activities?activityId=${activityId}`,
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
        <div className="flex flex-col items-center justify-start w-full h-full min-h-0 bg-[#F9FAFB] px-2 sm:px-4 md:px-8 lg:px-16 flex-1">
            {/* Back Button */}
            <div className="w-full flex justify-start mb-4">
                <button
                    className="flex items-center gap-2 px-4 py-2 rounded-md bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 cursor-pointer"
                    onClick={() => router.push("/admin/activities")}
                    type="button"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span className="text-sm font-medium">Back</span>
                </button>
            </div>
            <div className="w-full  bg-white overflow-y-auto mb-2">
                {/* Tabs */}
                <Tabs
                    setTab={setActiveTab}
                    activeTab={activeTab}
                    activityId={activityId}
                    setActivities={setActivities}
                    summary={form.summary}
                    summaryZh={form.summaryZh}
                />
                {activeTab === "details" && (
                    <>
                        {/* Card */}
                        <div className="w-full bg-white rounded-lg shadow-sm p-6 md:p-8 mb-6">
                            <h1 className="text-2xl font-bold mb-6 text-gray-900">
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
                            >
                                {/* Main grid: left preview, right fields */}
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    {/* Left: Image + dates + location */}
                                    <div className="lg:col-span-1">
                                        <label className="block text-sm font-medium text-gray-600 mb-2">
                                            Upload Image
                                        </label>
                                        <div
                                            className="relative group rounded-lg overflow-hidden bg-gray-100 border border-gray-200"
                                            style={{ aspectRatio: "16/9" }}
                                        >
                                            <input
                                                type="file"
                                                className="absolute inset-0 opacity-0 cursor-pointer"
                                                accept="image/jpeg,image/png"
                                                multiple={false}
                                                ref={fileInputRef}
                                                onChange={handleImageChange}
                                                disabled={!!imageFile}
                                                aria-label="Upload image"
                                                style={{ zIndex: 2 }}
                                            />
                                            {imageFile ? (
                                                <>
                                                    <img
                                                        src={
                                                            imageFile.url
                                                                ? imageFile.url
                                                                : URL.createObjectURL(
                                                                      imageFile
                                                                  )
                                                        }
                                                        alt="Activity"
                                                        className="w-full h-full object-contain"
                                                    />
                                                    <button
                                                        type="button"
                                                        className="absolute top-2 right-2 bg-white/90 rounded-full p-1 shadow hover:bg-white cursor-pointer"
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
                                                        <Pencil className="text-indigo-600 w-5 h-5" />
                                                    </button>
                                                </>
                                            ) : (
                                                <div className="absolute inset-0 flex flex-col items-center justify-center text-indigo-600 select-none pointer-events-none">
                                                    <ImageUp className="w-10 h-10 mb-2" />
                                                    <span className="font-medium">
                                                        Drop image or browse
                                                    </span>
                                                    <span className="text-xs text-gray-400 mt-1">
                                                        JPG, PNG
                                                    </span>
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

                                        <div className="mt-4 mb-10">
                                            <label
                                                className="flex items-center cursor-pointer w-full"
                                                style={{
                                                    justifyContent:
                                                        "space-between",
                                                }}
                                                htmlFor="featured-toggle"
                                            >
                                                <div className="">
                                                    <p className="text-sm font-medium text-gray-900">
                                                        Featured
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        Feature this activity to
                                                        highlight it on the
                                                        landing page.
                                                    </p>
                                                </div>
                                                <div
                                                    className="relative"
                                                    role="switch"
                                                    aria-checked={
                                                        !!form.isFeatured
                                                    }
                                                    tabIndex={0}
                                                    onKeyDown={(e) => {
                                                        if (
                                                            e.key === " " ||
                                                            e.key === "Enter"
                                                        ) {
                                                            e.preventDefault();
                                                            document
                                                                .getElementById(
                                                                    "featured-toggle"
                                                                )
                                                                ?.click();
                                                        }
                                                    }}
                                                >
                                                    <input
                                                        id="featured-toggle"
                                                        type="checkbox"
                                                        className="toggle toggle-primary sr-only"
                                                        name="isFeatured"
                                                        checked={
                                                            !!form.isFeatured
                                                        }
                                                        onChange={handleInput}
                                                        tabIndex={-1}
                                                    />
                                                    <div className="block bg-gray-200 w-14 h-8 rounded-full"></div>
                                                    <div className="dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition"></div>
                                                </div>
                                            </label>
                                            <style>{`input#featured-toggle:checked ~ .dot { transform: translateX(100%); } input#featured-toggle:checked ~ .block { background-color: #A5B4FC; }`}</style>
                                        </div>
                                        {/* Capacity */}
                                        <div className="mt-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
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

                                        {/* Organization Name */}
                                        <div className="mt-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Organization Name
                                            </label>
                                            <input
                                                className="input input-bordered input-lg w-full bg-white text-black"
                                                name="organizationName"
                                                value={
                                                    form.organizationName || ""
                                                }
                                                onChange={handleInput}
                                                placeholder="Name of organizer"
                                            />
                                        </div>
                                    </div>

                                    {/* Right: Fields */}
                                    <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Activity Title */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
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

                                        {/* Chinese Title */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Chinese Title
                                            </label>
                                            <input
                                                className="input input-bordered input-lg w-full bg-white text-black"
                                                name="titleZh"
                                                value={form.titleZh}
                                                onChange={handleInput}
                                                maxLength={100}
                                                placeholder="輸入中文標題"
                                            />
                                        </div>

                                        {/* Activity Type & Featured */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
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

                                        {/* Location */}
                                        <div className="">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Location
                                            </label>
                                            <div className="relative">
                                                <input
                                                    className="input input-bordered input-lg w-full bg-white text-black pl-12"
                                                    name="location"
                                                    value={form.location}
                                                    onChange={handleInput}
                                                    required
                                                    placeholder="Enter location"
                                                />
                                                <MapPin className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                                            </div>
                                            {errors.location && (
                                                <span className="text-error text-base">
                                                    {errors.location}
                                                </span>
                                            )}
                                        </div>

                                        {/* Summary */}
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Summary
                                            </label>
                                            <textarea
                                                className="textarea textarea-bordered textarea-lg w-full bg-white text-black"
                                                name="description"
                                                value={form.description}
                                                onChange={handleInput}
                                                required
                                                rows={4}
                                                placeholder="Enter english summary..."
                                            />
                                            {errors.description && (
                                                <span className="text-error text-base">
                                                    {errors.description}
                                                </span>
                                            )}
                                        </div>

                                        {/* Chinese Summary */}
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Chinese Summary
                                            </label>
                                            <textarea
                                                className="textarea textarea-bordered textarea-lg w-full bg-white text-black"
                                                name="descriptionZh"
                                                value={form.descriptionZh}
                                                onChange={handleInput}
                                                rows={4}
                                                placeholder="請輸入中文摘要..."
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Extra fields row (Start Date, Start Time, End Date, End Time, Calories, Status) */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mt-6 pt-6 border-t border-gray-200">
                                    {/* Start Date */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Start Date
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="date"
                                                className="input input-bordered input-lg w-full bg-white text-black pl-12"
                                                name="startDate"
                                                value={form.startDate}
                                                onChange={handleInput}
                                                required
                                            />
                                            <Calendar className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                                        </div>
                                        {errors.startDate && (
                                            <span className="text-error text-base">
                                                {errors.startDate}
                                            </span>
                                        )}
                                    </div>

                                    {/* Start Time */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Start Time
                                        </label>
                                        <input
                                            type="time"
                                            className="input input-bordered input-lg w-full bg-white text-black"
                                            name="startTime"
                                            value={form.startTime}
                                            onChange={handleInput}
                                            required
                                        />
                                        {errors.startTime && (
                                            <span className="text-error text-base">
                                                {errors.startTime}
                                            </span>
                                        )}
                                    </div>

                                    {/* End Date */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            End Date
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="date"
                                                className="input input-bordered input-lg w-full bg-white text-black pl-12"
                                                name="endDate"
                                                value={form.endDate}
                                                onChange={handleInput}
                                                required
                                            />
                                            <Calendar className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                                        </div>
                                        {errors.endDate && (
                                            <span className="text-error text-base">
                                                {errors.endDate}
                                            </span>
                                        )}
                                    </div>

                                    {/* End Time */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            End Time
                                        </label>
                                        <input
                                            type="time"
                                            className="input input-bordered input-lg w-full bg-white text-black"
                                            name="endTime"
                                            value={form.endTime}
                                            onChange={handleInput}
                                            required
                                        />
                                        {errors.endTime && (
                                            <span className="text-error text-base">
                                                {errors.endTime}
                                            </span>
                                        )}
                                    </div>

                                    {/* Calories */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Calories Per Hour
                                        </label>
                                        <div className="flex gap-2">
                                            <input
                                                type="number"
                                                className="input input-bordered input-lg w-1/2 bg-white text-black"
                                                name="caloriesPerHourMin"
                                                value={form.caloriesPerHourMin}
                                                onChange={handleInput}
                                                min={0.01}
                                                step="any"
                                                required
                                                placeholder="Min"
                                            />
                                            <span className="flex items-center px-1 text-lg text-gray-500">
                                                -
                                            </span>
                                            <input
                                                type="number"
                                                className="input input-bordered input-lg w-1/2 bg-white text-black"
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

                                    {/* Status */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Status
                                        </label>
                                        <select
                                            className="select select-bordered select-lg w-full bg-white text-black"
                                            name="status"
                                            value={form.status}
                                            onChange={handleInput}
                                        >
                                            {statusOptions.map((status) => (
                                                <option
                                                    key={status}
                                                    value={status}
                                                >
                                                    {status
                                                        .charAt(0)
                                                        .toUpperCase() +
                                                        status.slice(1)}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Terms & Conditions - Multi Select */}
                                <div className="mt-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Skills
                                    </label>
                                    <div className="relative">
                                        <div className="border border-gray-300 rounded-lg p-3 bg-white min-h-[60px] flex flex-wrap gap-2 items-center">
                                            {form.tncIds &&
                                                form.tncIds.map((tncId) => {
                                                    const tnc = tncOptions.find(
                                                        (t) => t.id === tncId
                                                    );
                                                    return tnc ? (
                                                        <div
                                                            key={tncId}
                                                            className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-full text-sm"
                                                        >
                                                            <span>
                                                                {tnc.title}
                                                            </span>
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setForm(
                                                                        (
                                                                            prev
                                                                        ) => ({
                                                                            ...prev,
                                                                            tncIds: prev.tncIds.filter(
                                                                                (
                                                                                    id
                                                                                ) =>
                                                                                    id !==
                                                                                    tncId
                                                                            ),
                                                                        })
                                                                    );
                                                                }}
                                                                className="text-gray-500 hover:text-gray-700"
                                                            >
                                                                ×
                                                            </button>
                                                        </div>
                                                    ) : null;
                                                })}
                                            <select
                                                className="flex-1 min-w-[200px] outline-none bg-transparent text-gray-700"
                                                value=""
                                                onChange={(e) => {
                                                    const selectedId =
                                                        e.target.value;
                                                    if (
                                                        selectedId &&
                                                        !form.tncIds.includes(
                                                            selectedId
                                                        )
                                                    ) {
                                                        setForm((prev) => ({
                                                            ...prev,
                                                            tncIds: [
                                                                ...prev.tncIds,
                                                                selectedId,
                                                            ],
                                                        }));
                                                    }
                                                }}
                                                disabled={tncLoading}
                                            >
                                                <option value="">
                                                    {tncLoading
                                                        ? "Loading..."
                                                        : "Select skills"}
                                                </option>
                                                {tncOptions
                                                    .filter(
                                                        (t) =>
                                                            !form.tncIds.includes(
                                                                t.id
                                                            )
                                                    )
                                                    .map((t) => (
                                                        <option
                                                            key={t.id}
                                                            value={t.id}
                                                        >
                                                            {t.title}
                                                        </option>
                                                    ))}
                                            </select>
                                        </div>
                                    </div>
                                    {errors.tncIds && (
                                        <span className="text-error text-base">
                                            {errors.tncIds}
                                        </span>
                                    )}
                                </div>

                                {/* Search Map - full width */}
                                <div className="mt-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Search In Map
                                    </label>
                                    <input
                                        className="input input-bordered input-lg w-full bg-white text-black"
                                        name="mapLocation"
                                        onChange={handleInput}
                                        value={form.mapLocation}
                                        placeholder="Enter Map Address"
                                    />
                                    {errors.mapLocation && (
                                        <span className="text-error text-base">
                                            {errors.mapLocation}
                                        </span>
                                    )}
                                </div>

                                {/* Google Map preview */}
                                <div className="w-full mt-6">
                                    <div className="w-full h-[320px] rounded-lg overflow-hidden border border-gray-200">
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
                                        />
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex justify-end gap-4 mt-8">
                                    <button
                                        type="button"
                                        className="px-6 py-2 rounded-md text-sm font-medium bg-gray-200 text-gray-900 hover:bg-gray-300 cursor-pointer"
                                        onClick={handleCancel}
                                        disabled={loading}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-6 py-2 rounded-md text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 cursor-pointer"
                                        disabled={loading}
                                    >
                                        {loading ? "Saving ..." : "Save"}
                                    </button>
                                </div>
                            </form>
                        </div>
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
