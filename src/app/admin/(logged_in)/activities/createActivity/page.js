"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import ErrorAlert from "@/app/shared/components/ErrorAlert";
import axiosClient from "@/utils/axios/api";
import { MAX_IMAGE_SIZE_MB } from "@/app/constants/constants";
import { ImageUp, Pencil } from "lucide-react";
import { useAdminActivities } from "@/app/shared/contexts/AdminActivitiesContext";
import {
    ACTIVITY_TYPES,
    ACTIVITY_TYPES_FORMATTED,
} from "@/app/constants/constants";

const CreateActivityPage = () => {
    const router = useRouter();
    const [formData, setFormData] = useState({
        title: "",
        titleZh: "",
        activityType: "",
        description: "",
        descriptionZh: "",
        startDateTime: "",
        endDateTime: "",
        location: "",
        mapLocation: "",
        capacity: "",
        caloriesPerHourMin: "",
        caloriesPerHourMax: "",
        image: null,
        status: "draft",
        mapUrl: "",
        tncId: "",
        organizationName: "",
        isFeatured: false,
    });
    const { setActivities } = useAdminActivities();
    const [error, setError] = useState("");
    const [fieldErrors, setFieldErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const imgRef = useRef(null);
    const fileInputRef = useRef(null);
    const [mapUrl, setMapUrl] = useState(
        "https://www.google.com/maps?q=&output=embed"
    );
    const [tncOptions, setTncOptions] = useState([]);
    const [tncLoading, setTncLoading] = useState(false);

    const getMapUrl = (location) => `https://www.google.com/maps?q=${location}&output=embed&z=14`

    useEffect(() => {
        if (formData.mapLocation) {
            const encodedLocation = encodeURIComponent(
                formData.mapLocation + ", Hong Kong"
            );
            const url = getMapUrl(encodedLocation);
            setMapUrl(url);
            setFormData((prev) => ({
                ...prev,
                mapUrl: url,
            }));
        } else {
            const url = "https://www.google.com/maps?q=Hong+Kong&output=embed&z=12";
            setMapUrl(url);
            setFormData((prev) => ({
                ...prev,
                mapUrl: url,
            }));
        }
    }, [formData.mapLocation]);

    const fetchTncs = async () => {
        try {
            setTncLoading(true);
            const res = await axiosClient.get("/admin/tnc");
            if (Array.isArray(res.data)) {
                setTncOptions(res.data);
            } else if (Array.isArray(res.data?.data)) {
                setTncOptions(res.data.data);
            } else if (Array.isArray(res.data?.tncs)) {
                setTncOptions(res.data.tncs);
            }
        } catch (e) {
            console.error(e.message);
        } finally {
            setTncLoading(false);
        }
    };
    useEffect(() => {
        fetchTncs();
    }, []);

    const isValidYear = (dateStr) => {
        if (!dateStr) return true;
        const year = dateStr.split("-")[0];
        return /^\d{1,4}$/.test(year);
    };

    const validateFields = () => {
        const requiredFields = [
            "title",
            "titleZh",
            "activityType",
            "description",
            "descriptionZh",
            "location",
            "capacity",
            "caloriesPerHourMin",
            "caloriesPerHourMax",
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
        if (
            formData.caloriesPerHourMin &&
            formData.caloriesPerHourMax &&
            !isNaN(Number(formData.caloriesPerHourMin)) &&
            !isNaN(Number(formData.caloriesPerHourMax))
        ) {
            if (
                Number(formData.caloriesPerHourMin) >
                Number(formData.caloriesPerHourMax)
            ) {
                errors.caloriesPerHourMin =
                    "Minimum must be less than or equal to maximum.";
                errors.caloriesPerHourMax =
                    "Maximum must be greater than or equal to minimum.";
            }
        }
        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleFormChange = (e) => {
        const { name, value, type, checked } = e.target;
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
            [name]: type === "checkbox" ? checked : value,
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
            const caloriesPerHour =
                formData.caloriesPerHourMin && formData.caloriesPerHourMax
                    ? `${formData.caloriesPerHourMin}-${formData.caloriesPerHourMax}`
                    : "";
            const payload = {
                title: formData.title,
                titleZh: formData.titleZh,
                activityType: formData.activityType,
                location: formData.location,
                startDate: startISO,
                endDate: endISO,
                startTime: startISO,
                endTime: endISO,
                description: formData.description,
                descriptionZh: formData.descriptionZh,
                status: formData.status,
                participantLimit: Number(formData.capacity),
                caloriesPerHour,
                image: formData.image,
                mapUrl: formData.mapUrl,
                tncId: formData.tncId || "",
                organizationName: formData.organizationName || "",
                isFeatured: !!formData.isFeatured,
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
                setActivities((prev) =>
                    Array.isArray(prev)
                        ? [...prev, response?.data]
                        : [response?.data]
                );
                router.push(`/admin/activities/${response.data.id}?tab=description`);
            }
        } catch (err) {
            setError(err?.response?.data?.error || err.message);
        } finally {
            setLoading(false);
        }
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
            <div className="w-full bg-white  overflow-y-auto mb-2">                
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
                            onSubmit={async (e) => {
                                e.preventDefault();
                                await handleCreateActivity();
                            }}
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6" style={{alignItems: 'center'}}>
                                {/* Upload Image - full width */}
                                <div className="col-span-full">
                                    <label className="label text-lg font-semibold mb-2 text-black">
                                        Upload Image
                                    </label>
                                    <div className="relative flex flex-col items-center justify-center bg-white border-2 border-dashed border-[#3B82F6] rounded-xl p-4 sm:p-8 min-h-[120px] sm:min-h-[180px] w-full">
                                        <input
                                            id="activity-image-upload"
                                            type="file"
                                            ref={fileInputRef}
                                            className="absolute inset-0 opacity-0"
                                            accept="image/jpeg,image/png,image/webp"
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
                                                    JPG, PNG, WEBP
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
                                                        className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-white rounded-full p-1 shadow hover:bg-gray-100 cursor-pointer"
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
                                    {fieldErrors.image && (
                                        <span className="text-error text-base">
                                            {fieldErrors.image}
                                        </span>
                                    )}
                                </div>

                                {/* Activity Title */}
                                <div className="form-control w-full col-span-1">
                                    <label className="label text-lg font-semibold mb-2 text-black">
                                        Activity Title
                                    </label>
                                    <input
                                        className="input input-bordered input-lg w-full bg-white text-black mb-0"
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

                                {/* Chinese Title (titleZh) */}
                                <div className="form-control w-full col-span-1">
                                    <label className="label text-lg font-semibold mb-1 text-black">
                                        Chinese Title
                                    </label>
                                    <input
                                        className="input input-bordered input-lg w-full bg-white text-black mb-0"
                                        name="titleZh"
                                        value={formData.titleZh}
                                        onChange={handleFormChange}
                                        maxLength={100}
                                        required
                                    />
                                    {fieldErrors.titleZh && (
                                        <span className="text-error text-base">
                                            {fieldErrors.titleZh}
                                        </span>
                                    )}
                                </div>

                                {/* Activity Type */}
                                <div className="form-control w-full col-span-1">
                                    <label className="label text-lg font-semibold mb-1 text-black">
                                        Activity Type
                                    </label>
                                    <select
                                        className="select select-bordered select-lg w-full bg-white text-black mb-0"
                                        name="activityType"
                                        value={formData.activityType}
                                        onChange={handleFormChange}
                                        required
                                    >
                                        <option value="">
                                            Select activity type
                                        </option>
                                        {ACTIVITY_TYPES_FORMATTED.map(
                                            (formatted, idx) => (
                                                <option
                                                    key={formatted}
                                                    value={formatted}
                                                >
                                                    {ACTIVITY_TYPES[idx]
                                                        .charAt(0)
                                                        .toUpperCase() +
                                                        ACTIVITY_TYPES[
                                                            idx
                                                        ].slice(1)}
                                                </option>
                                            )
                                        )}
                                    </select>
                                    {fieldErrors.activityType && (
                                        <span className="text-error text-base">
                                            {fieldErrors.activityType}
                                        </span>
                                    )}
                                </div>

                                {/* Should be featured? checkbox */}
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
                                                checked={!!formData.isFeatured}
                                                onChange={handleFormChange}
                                                aria-label="Feature this activity"
                                            />
                                        </label>
                                    </div>
                                </div>

                                {/* Summary (description) */}
                                <div className="form-control w-full col-span-1 xl:col-span-1">
                                    <label className="label text-lg font-semibold mb-2 text-black">
                                        Summary
                                    </label>
                                    <textarea
                                        className="textarea textarea-bordered textarea-lg w-full bg-white text-black resize-none min-h-[92px]"
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

                                {/* Chinese Summary (descriptionZh) */}
                                <div className="form-control w-full col-span-1 xl:col-span-1">
                                    <label className="label text-lg font-semibold mb-2 text-black">
                                        Chinese Summary
                                    </label>
                                    <textarea
                                        className="textarea textarea-bordered textarea-lg w-full bg-white text-black resize-none min-h-[92px]"
                                        name="descriptionZh"
                                        value={formData.descriptionZh}
                                        onChange={handleFormChange}
                                        required
                                        rows={3}
                                        placeholder="Enter Chinese summary"
                                    />
                                    {fieldErrors.descriptionZh && (
                                        <span className="text-error text-base">
                                            {fieldErrors.descriptionZh}
                                        </span>
                                    )}
                                </div>

                                {/* Start Date & Time */}
                                <div className="form-control w-full col-span-1">
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

                                {/* End Date & Time */}
                                <div className="form-control w-full col-span-1">
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

                                {/* Location (Event Address) */}
                                <div className="form-control w-full col-span-1">
                                    <label className="label text-lg font-semibold mb-2 text-black">
                                        Location
                                    </label>
                                    <input
                                        className="input input-bordered input-lg w-full bg-white text-black"
                                        name="location"
                                        value={formData.location || ""}
                                        onChange={handleFormChange}
                                        placeholder="Enter event address"
                                    />
                                    {fieldErrors.location && (
                                        <span className="text-error text-base">
                                            {fieldErrors.location}
                                        </span>
                                    )}
                                </div>

                                {/* Capacity */}
                                <div className="form-control w-full col-span-1">
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
                                <div className="form-control w-full col-span-1">
                                    <label className="label text-lg font-semibold mb-2 text-black">
                                        Calories Per Hour
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="number"
                                            className="input input-bordered input-lg w-1/2 bg-white text-black"
                                            name="caloriesPerHourMin"
                                            value={formData.caloriesPerHourMin}
                                            onChange={handleFormChange}
                                            min={0}
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
                                            value={formData.caloriesPerHourMax}
                                            onChange={handleFormChange}
                                            min={0}
                                            required
                                            placeholder="Max"
                                        />
                                    </div>
                                    {(fieldErrors.caloriesPerHourMin ||
                                        fieldErrors.caloriesPerHourMax) && (
                                        <span className="text-error text-base">
                                            {fieldErrors.caloriesPerHourMin ||
                                                fieldErrors.caloriesPerHourMax}
                                        </span>
                                    )}
                                </div>


                                {/* T&C Selection */}
                                <div className="form-control w-full col-span-1">
                                    <label className="label text-lg font-semibold mb-2 text-black">
                                        Terms & Conditions
                                    </label>
                                    <select
                                        className="select select-bordered select-lg w-full bg-white text-black"
                                        name="tncId"
                                        value={formData.tncId}
                                        onChange={handleFormChange}
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
                                    {fieldErrors.tncId && (
                                        <span className="text-error text-base">
                                            {fieldErrors.tncId}
                                        </span>
                                    )}
                                </div>
                                <div className="form-control w-full col-span-1">
                                    <label className="label text-lg font-semibold mb-2 text-black">
                                        Organization Name
                                    </label>
                                    <input
                                        className="input input-bordered input-lg w-full bg-white text-black"
                                        name="organizationName"
                                        value={formData.organizationName || ""}
                                        onChange={handleFormChange}
                                        placeholder="Name of organizer of this activity"
                                    />
                                </div>

                                {/* Search Map - full width */}
                                <div className="col-span-full">
                                    <div className="form-control w-full">
                                        <input
                                            className="input input-bordered input-lg w-full bg-white text-black"
                                            name="mapLocation"
                                            value={formData.mapLocation || ""}
                                            onChange={handleFormChange}
                                            required
                                            placeholder="Search In Map"
                                        />
                                        {fieldErrors.mapLocation && (
                                            <span className="text-error text-base">
                                                {fieldErrors.mapLocation}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            {/* Google Map at the bottom */}
                            <div className="w-full mt-8 mb-4">
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
                            {/* Actions - full width */}
                            <div className="md:col-span-2 flex flex-col sm:flex-row gap-3 sm:gap-4 mt-6 w-full">
                                <button
                                    type="submit"
                                    className={`btn btn-primary btn-lg flex-1`}
                                    disabled={loading}
                                >
                                    {loading ? 'Creating Activity' : 'Save & Continue'}
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
            </div>
        </div>
    );
};

export default CreateActivityPage;
