"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import ErrorAlert from "@/app/shared/components/ErrorAlert";
import axiosClient from "@/utils/axios/api";
import ActivityStatus, {
    MAX_IMAGE_SIZE_MB,
} from "@/app/constants/ActivityStatus";
import { ImageUp } from "lucide-react";

const MAX_SUMMARY_WORDS = 50;

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
    const [fieldErrors, setFieldErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [imageAspect, setImageAspect] = useState(null); // {width, height}
    const imgRef = useRef(null);

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

    const isValidYear = (dateStr) => {
        if (!dateStr) return true;
        const year = dateStr.split("-")[0];
        return /^\d{1,4}$/.test(year);
    };

    // Helper to count words
    const countWords = (text) =>
        text
            ? text
                  .replace(/<[^>]+>/g, " ")
                  .split(/\s+/)
                  .filter((w) => w.length > 0).length
            : 0;

    // Helper to check required fields and set field errors
    const validateFields = () => {
        // The following fields are compulsory (required):
        // title, activityType, description, startDateTime, endDateTime, location,
        // capacity, pointsPerParticipant, caloriesPerHour, image, status
        const requiredFields = [
            "title",
            "activityType",
            "description",
            "startDateTime",
            "endDateTime",
            "location",
            "capacity",
            "pointsPerParticipant",
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
                // errors[field] = " This field is required."; // <-- commented out for development
            }
        });

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
            // Go to next step page after successful save
            router.push("/admin/activities/createActivity/details");
        } catch (err) {
            setError(err?.response?.data?.error || err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-base-200 p-2 text-base flex flex-col">
            <div className="max-w-screen-xl mx-auto w-full flex flex-col flex-1">
                <div className="flex items-center mb-4 relative">
                    <button
                        className="btn btn-outline btn-sm absolute left-0 text-base"
                        onClick={() => router.push("/admin/activities")}
                    >
                        Back to Activities
                    </button>
                    <h1 className="text-2xl font-bold mx-auto text-center w-full">
                        Create Activity
                    </h1>
                </div>

                {error && (
                    <ErrorAlert message={error} onClose={() => setError("")} />
                )}

                <div className="card bg-base-100 shadow-xl flex-1 flex flex-col min-h-0">
                    <div className="card-body p-2 sm:p-4 md:p-6 text-base flex-1 min-h-0 overflow-y-auto">
                        {/* Image Upload Field */}
                        <div className="form-control flex flex-col gap-1 mb-3 items-center">
                            <label
                                className="text-white text-base mb-1 self-start"
                                htmlFor="activity-image-upload"
                            >
                                Upload Image
                            </label>
                            <div className="flex-1 w-full flex justify-center">
                                <label
                                    htmlFor="activity-image-upload"
                                    className="w-full flex flex-col items-center justify-center border-2 border-dashed border-blue-300 bg-blue-50 hover:bg-blue-100 transition-colors rounded-2xl cursor-pointer relative group min-h-[120px] max-h-[180px] max-w-md min-w-[220px]"
                                    style={{ aspectRatio: "16/9" }}
                                >
                                    {formData.image ? (
                                        <>
                                            <img
                                                ref={imgRef}
                                                src={URL.createObjectURL(
                                                    formData.image
                                                )}
                                                alt="Preview"
                                                className="w-full h-full object-contain rounded-2xl max-h-[170px]"
                                                style={{
                                                    maxHeight: "170px",
                                                    maxWidth: "100%",
                                                }}
                                            />
                                            <button
                                                type="button"
                                                className="btn btn-circle btn-sm btn-error absolute top-2 right-2 opacity-90 hover:opacity-100 transition-opacity z-10"
                                                onClick={removeImage}
                                            >
                                                ×
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <div className="flex flex-col items-center justify-center py-4">
                                                {/* Lucide ImageUp icon for upload */}
                                                <ImageUp className="w-8 h-8 text-blue-400 mb-1" />
                                                <span className="text-sm text-blue-500 font-medium">
                                                    Drop image or{" "}
                                                    <span className="underline">
                                                        browse
                                                    </span>
                                                </span>
                                                <span className="text-xs text-gray-400 mt-1">
                                                    JPG, PNG
                                                </span>
                                            </div>
                                        </>
                                    )}
                                    <input
                                        id="activity-image-upload"
                                        type="file"
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        tabIndex={-1}
                                    />
                                </label>
                            </div>
                            {fieldErrors.image && (
                                <span className="text-error text-xs mt-1 block self-start">
                                    {fieldErrors.image}
                                </span>
                            )}
                        </div>
                        <div className="flex flex-col md:flex-row gap-3 md:gap-4">
                            {/* Left column: first 6 fields */}
                            <div className="flex-1 flex flex-col gap-2 md:gap-3 min-w-0">
                                {/* Activity Title */}
                                <div className="form-control flex flex-col gap-1">
                                    <label
                                        className="text-white text-base mb-1"
                                        htmlFor="activity-title"
                                    >
                                        Activity Title
                                    </label>
                                    <input
                                        id="activity-title"
                                        type="text"
                                        name="title"
                                        placeholder="Enter activity title"
                                        className="input input-sm text-base w-full"
                                        value={formData.title}
                                        onChange={handleFormChange}
                                    />
                                    {fieldErrors.title && (
                                        <span className="text-error text-xs mt-1 block">
                                            {fieldErrors.title}
                                        </span>
                                    )}
                                </div>
                                {/* Activity Type */}
                                <div className="form-control flex flex-col gap-1">
                                    <label
                                        className="text-white text-base mb-1"
                                        htmlFor="activity-type"
                                    >
                                        Activity Type
                                    </label>
                                    <select
                                        id="activity-type"
                                        name="activityType"
                                        className="select select-bordered select-sm text-base w-full"
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
                                        <option value="swimming">
                                            Swimming
                                        </option>
                                        <option value="dancing">Dancing</option>
                                        <option value="boxing">Boxing</option>
                                        <option value="other">Other</option>
                                    </select>
                                    {fieldErrors.activityType && (
                                        <span className="text-error text-xs mt-1 block">
                                            {fieldErrors.activityType}
                                        </span>
                                    )}
                                </div>
                                {/* Summary */}
                                <div className="form-control flex flex-col gap-1">
                                    <label
                                        className="text-white text-base mb-1"
                                        htmlFor="activity-description"
                                    >
                                        Summary
                                    </label>
                                    <textarea
                                        id="activity-description"
                                        name="description"
                                        placeholder="Enter summary (max 50 words)"
                                        className="textarea textarea-bordered text-base w-full min-h-[40px] max-h-[60px]"
                                        value={formData.description}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            const words = countWords(value);
                                            if (words <= MAX_SUMMARY_WORDS) {
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    description: value,
                                                }));
                                                setFieldErrors((prev) => ({
                                                    ...prev,
                                                    description: undefined,
                                                }));
                                            }
                                        }}
                                        rows={2}
                                    />
                                    <div className="flex justify-between items-center mt-1">
                                        <span className="text-xs text-gray-400">
                                            {countWords(formData.description)} /{" "}
                                            {MAX_SUMMARY_WORDS} words
                                        </span>
                                        {fieldErrors.description && (
                                            <span className="text-error text-xs mt-1 block">
                                                {fieldErrors.description}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                {/* Start DateTime */}
                                <div className="form-control flex flex-col gap-1">
                                    <label
                                        className="text-white text-base mb-1"
                                        htmlFor="activity-startDateTime"
                                    >
                                        Start Date & Time
                                    </label>
                                    <input
                                        id="activity-startDateTime"
                                        type="datetime-local"
                                        name="startDateTime"
                                        className="input input-bordered input-sm text-base w-full"
                                        value={formData.startDateTime}
                                        onChange={handleFormChange}
                                        max="9999-12-31T23:59"
                                    />
                                    {fieldErrors.startDateTime && (
                                        <span className="text-error text-xs mt-1 block">
                                            {fieldErrors.startDateTime}
                                        </span>
                                    )}
                                </div>
                                {/* End DateTime */}
                                <div className="form-control flex flex-col gap-1">
                                    <label
                                        className="text-white text-base mb-1"
                                        htmlFor="activity-endDateTime"
                                    >
                                        End Date & Time
                                    </label>
                                    <input
                                        id="activity-endDateTime"
                                        type="datetime-local"
                                        name="endDateTime"
                                        className="input input-bordered input-sm text-base w-full"
                                        value={formData.endDateTime}
                                        onChange={handleFormChange}
                                        max="9999-12-31T23:59"
                                    />
                                    {fieldErrors.endDateTime && (
                                        <span className="text-error text-xs mt-1 block">
                                            {fieldErrors.endDateTime}
                                        </span>
                                    )}
                                </div>
                            </div>
                            {/* Right column: next 5 fields */}
                            <div className="flex-1 flex flex-col gap-2 md:gap-3 min-w-0">
                                {/* Location */}
                                <div className="form-control flex flex-col gap-1">
                                    <label
                                        className="text-white text-base mb-1"
                                        htmlFor="activity-location"
                                    >
                                        Location
                                    </label>
                                    <input
                                        id="activity-location"
                                        type="text"
                                        name="location"
                                        placeholder="Enter activity location"
                                        className="input input-bordered input-sm text-base w-full"
                                        value={formData.location}
                                        onChange={handleFormChange}
                                    />
                                    {fieldErrors.location && (
                                        <span className="text-error text-xs mt-1 block">
                                            {fieldErrors.location}
                                        </span>
                                    )}
                                </div>
                                {/* Capacity */}
                                <div className="form-control flex flex-col gap-1">
                                    <label
                                        className="text-white text-base mb-1"
                                        htmlFor="activity-capacity"
                                    >
                                        Capacity
                                    </label>
                                    <input
                                        id="activity-capacity"
                                        type="number"
                                        name="capacity"
                                        placeholder="Enter participant limit"
                                        className="input input-bordered input-sm text-base w-full"
                                        value={formData.capacity}
                                        onChange={handleFormChange}
                                        min="1"
                                    />
                                    {fieldErrors.capacity && (
                                        <span className="text-error text-xs mt-1 block">
                                            {fieldErrors.capacity}
                                        </span>
                                    )}
                                </div>
                                {/* Points Per Participant */}
                                <div className="form-control flex flex-col gap-1">
                                    <label
                                        className="text-white text-base mb-1"
                                        htmlFor="activity-pointsPerParticipant"
                                    >
                                        Points Per Participant
                                    </label>
                                    <input
                                        id="activity-pointsPerParticipant"
                                        type="number"
                                        name="pointsPerParticipant"
                                        placeholder="Enter points per participant"
                                        className="input input-bordered input-sm text-base w-full"
                                        value={formData.pointsPerParticipant}
                                        onChange={handleFormChange}
                                        min="0"
                                    />
                                    {fieldErrors.pointsPerParticipant && (
                                        <span className="text-error text-xs mt-1 block">
                                            {fieldErrors.pointsPerParticipant}
                                        </span>
                                    )}
                                </div>
                                {/* Calories Per Hour */}
                                <div className="form-control flex flex-col gap-1">
                                    <label
                                        className="text-white text-base mb-1"
                                        htmlFor="activity-caloriesPerHour"
                                    >
                                        Calories Per Hour
                                    </label>
                                    <input
                                        id="activity-caloriesPerHour"
                                        type="number"
                                        name="caloriesPerHour"
                                        placeholder="Enter calories per hour"
                                        className="input input-bordered input-sm text-base w-full"
                                        value={formData.caloriesPerHour}
                                        onChange={handleFormChange}
                                        min="0"
                                    />
                                    {fieldErrors.caloriesPerHour && (
                                        <span className="text-error text-xs mt-1 block">
                                            {fieldErrors.caloriesPerHour}
                                        </span>
                                    )}
                                </div>
                                {/* Status Dropdown at the bottom */}
                                <div className="form-control flex flex-col gap-1">
                                    <label
                                        className="text-white text-base mb-1"
                                        htmlFor="activity-status"
                                    >
                                        Status
                                    </label>
                                    <select
                                        id="activity-status"
                                        name="status"
                                        className="select select-bordered select-sm text-base w-full"
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
                                        <span className="text-error text-xs mt-1 block">
                                            {fieldErrors.status}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                        {/* Submit Button */}
                        <div className="flex flex-col sm:flex-row justify-start gap-2 mt-4">
                            <button
                                className={`btn btn-primary btn-sm text-base ${
                                    loading ? "loading" : ""
                                }`}
                                onClick={handleSubmit}
                                disabled={loading}
                            >
                                Save & Next Step
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateActivityPage;
