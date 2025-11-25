"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ImageUp, ArrowLeft, Plus, X } from "lucide-react";
import ErrorAlert from "@/app/shared/components/ErrorAlert";
import axiosClient from "@/utils/axios/api";
import { MAX_IMAGE_SIZE_MB, ALLOWED_RULE_TYPES } from "@/app/constants/constants";
import { useAdminActivities } from "@/app/shared/contexts/AdminActivitiesContext";

const EditBadgePage = () => {
    const router = useRouter();
    const params = useParams();
    const badgeId = params.id;
    const { activities, loading: activitiesLoading } = useAdminActivities();
    const [formData, setFormData] = useState({
        name: "",
        nameZh: "",
        description: "",
        descriptionZh: "",
        image: null,
        existingImageUrl: "",
        isSeasonal: false,
        seasonalStartDate: "",
        seasonalEndDate: "",
        activityId: "",
        isLimitedEdition: false,
        fsPointsCost: "",
        place: "",
    });
    const [error, setError] = useState("");
    const [fieldErrors, setFieldErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(true);
    const fileInputRef = useRef(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [activitySearchTerm, setActivitySearchTerm] = useState("");
    const [showActivityDropdown, setShowActivityDropdown] = useState(false);
    const activityDropdownRef = useRef(null);
    const [showRulesDialog, setShowRulesDialog] = useState(false);
    const [rules, setRules] = useState([]);

    // Fetch existing badge data
    useEffect(() => {
        const fetchBadge = async () => {
            try {
                setFetchLoading(true);
                const response = await axiosClient.get(`/admin/badges/${badgeId}`);
                const badge = response.data;

                setFormData({
                    name: badge.name || "",
                    nameZh: badge.nameZh || "",
                    description: badge.description || "",
                    descriptionZh: badge.descriptionZh || "",
                    image: null,
                    existingImageUrl: badge.imageUrl || "",
                    isSeasonal: badge.isSeasonal || false,
                    seasonalStartDate: badge.seasonalStartDate ? badge.seasonalStartDate.split('T')[0] : "",
                    seasonalEndDate: badge.seasonalEndDate ? badge.seasonalEndDate.split('T')[0] : "",
                    activityId: badge.activityId || "",
                    isLimitedEdition: badge.isLimitedEdition || false,
                    fsPointsCost: badge.fsPointsCost || "",
                    place: badge.place || "",
                });

                // Set image preview to existing image
                if (badge.imageUrl) {
                    setImagePreview(badge.imageUrl);
                }

                // Set activity search term if activity is linked
                if (badge.activityId && activities.length > 0) {
                    const linkedActivity = activities.find(a => a.id === badge.activityId);
                    if (linkedActivity) {
                        setActivitySearchTerm(linkedActivity.title || linkedActivity.titleZh || "");
                    }
                }

                // Load existing rules
                if (badge.rules && badge.rules.length > 0) {
                    setRules(badge.rules.map(r => ({
                        ruleType: r.ruleType,
                        targetValue: r.targetValue,
                        params: r.params,
                        isAuto: false
                    })));
                }
            } catch (err) {
                console.error("Error fetching badge:", err);
                setError(
                    err.response?.data?.error ||
                    err.response?.data?.message ||
                    "Failed to fetch badge details."
                );
            } finally {
                setFetchLoading(false);
            }
        };

        if (badgeId) {
            fetchBadge();
        }
    }, [badgeId]);

    // Update activity search term when activities load
    useEffect(() => {
        if (formData.activityId && activities.length > 0 && !activitySearchTerm) {
            const linkedActivity = activities.find(a => a.id === formData.activityId);
            if (linkedActivity) {
                setActivitySearchTerm(linkedActivity.title || linkedActivity.titleZh || "");
            }
        }
    }, [activities, formData.activityId]);

    // Auto-add rules based on toggles and activityId
    useEffect(() => {
        const autoRules = [];

        // Auto-add redeem_purchase if isLimitedEdition is true
        if (formData.isLimitedEdition) {
            const hasRedeemPurchase = rules.some(r => r.ruleType === 'redeem_purchase');
            if (!hasRedeemPurchase) {
                autoRules.push({
                    ruleType: 'redeem_purchase',
                    targetValue: null,
                    params: null,
                    isAuto: true
                });
            }
        }

        // Auto-add activity_specific_participation if activityId is given
        if (formData.activityId) {
            const hasActivityParticipation = rules.some(r => r.ruleType === 'activity_specific_participation');
            if (!hasActivityParticipation) {
                autoRules.push({
                    ruleType: 'activity_specific_participation',
                    targetValue: null,
                    params: null,
                    isAuto: true
                });
            }
        }

        if (autoRules.length > 0) {
            setRules(prev => {
                // Remove auto rules that are no longer applicable
                const filtered = prev.filter(r => {
                    if (r.ruleType === 'redeem_purchase' && r.isAuto && !formData.isLimitedEdition) {
                        return false;
                    }
                    if (r.ruleType === 'activity_specific_participation' && r.isAuto && !formData.activityId) {
                        return false;
                    }
                    return true;
                });

                // Add new auto rules that don't exist
                const newRules = [...filtered];
                autoRules.forEach(autoRule => {
                    if (!newRules.some(r => r.ruleType === autoRule.ruleType)) {
                        newRules.push(autoRule);
                    }
                });

                return newRules;
            });
        } else {
            // Remove auto rules when conditions are no longer met
            setRules(prev => prev.filter(r => {
                if (r.ruleType === 'redeem_purchase' && r.isAuto && !formData.isLimitedEdition) {
                    return false;
                }
                if (r.ruleType === 'activity_specific_participation' && r.isAuto && !formData.activityId) {
                    return false;
                }
                return true;
            }));
        }
    }, [formData.isLimitedEdition, formData.activityId]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                activityDropdownRef.current &&
                !activityDropdownRef.current.contains(event.target)
            ) {
                setShowActivityDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const validateFields = () => {
        const errors = {};

        if (!formData.name.trim()) {
            errors.name = "Badge name is required.";
        }

        if (!formData.description.trim()) {
            errors.description = "Description is required.";
        }

        if (!formData.image && !formData.existingImageUrl) {
            errors.image = "Badge image is required.";
        }

        if (formData.isSeasonal) {
            if (!formData.seasonalStartDate) {
                errors.seasonalStartDate = "Seasonal start date is required.";
            }
            if (!formData.seasonalEndDate) {
                errors.seasonalEndDate = "Seasonal end date is required.";
            }
            if (formData.seasonalStartDate && formData.seasonalEndDate) {
                if (new Date(formData.seasonalStartDate) >= new Date(formData.seasonalEndDate)) {
                    errors.seasonalEndDate = "End date must be after start date.";
                }
            }
        }

        if (formData.isLimitedEdition) {
            if (!formData.fsPointsCost || formData.fsPointsCost <= 0) {
                errors.fsPointsCost = "Points cost must be greater than 0.";
            }
        }

        if (formData.place && (isNaN(formData.place) || formData.place < 0)) {
            errors.place = "Place must be a valid number.";
        }

        if (rules.length === 0) {
            errors.rules = "At least one badge rule is required.";
        }

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleFormChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFieldErrors((prev) => ({
            ...prev,
            [name]: undefined,
        }));
        setError("");

        let finalValue = value;

        // Handle toggle switches
        if (type === "checkbox") {
            finalValue = checked;
        }

        // Handle numeric fields - only allow numbers
        if (name === "place" || name === "fsPointsCost") {
            // Remove any non-digit characters
            finalValue = value.replace(/\D/g, "");
        }

        setFormData((prev) => ({
            ...prev,
            [name]: finalValue,
        }));
    };

    const handleActivitySelect = (activity) => {
        setFormData((prev) => ({
            ...prev,
            activityId: activity.id,
        }));
        setActivitySearchTerm(activity.title || activity.titleZh || "");
        setShowActivityDropdown(false);
        setFieldErrors((prev) => ({
            ...prev,
            activityId: undefined,
        }));
    };

    const filteredActivities = activities.filter((activity) => {
        const searchLower = activitySearchTerm.toLowerCase();
        return (
            activity.title?.toLowerCase().includes(searchLower) ||
            activity.titleZh?.toLowerCase().includes(searchLower) ||
            activity.id?.toLowerCase().includes(searchLower)
        );
    });

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Check if file is PNG
        if (file.type !== "image/png") {
            setFieldErrors((prev) => ({
                ...prev,
                image: "Only PNG images are allowed.",
            }));
            return;
        }

        // Check file size
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

        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);

        setFormData((prev) => ({
            ...prev,
            image: file,
        }));
    };

    const handleUpdateBadge = async () => {
        if (!validateFields()) {
            setError("Please fix the errors in the form.");
            return;
        }

        try {
            setLoading(true);

            const formDataToSend = new FormData();
            formDataToSend.append("name", formData.name);
            formDataToSend.append("nameZh", formData.nameZh || "");
            formDataToSend.append("description", formData.description);
            formDataToSend.append("descriptionZh", formData.descriptionZh || "");

            // Only append image if a new one was uploaded
            if (formData.image) {
                formDataToSend.append("image", formData.image);
            }

            formDataToSend.append("isSeasonal", formData.isSeasonal);

            if (formData.isSeasonal) {
                formDataToSend.append("seasonalStartDate", formData.seasonalStartDate);
                formDataToSend.append("seasonalEndDate", formData.seasonalEndDate);
            }

            if (formData.activityId) {
                formDataToSend.append("activityId", formData.activityId);
            }

            formDataToSend.append("isLimitedEdition", formData.isLimitedEdition);

            if (formData.isLimitedEdition && formData.fsPointsCost) {
                formDataToSend.append("fsPointsCost", formData.fsPointsCost);
            }

            if (formData.place) {
                formDataToSend.append("place", formData.place);
            }

            // Add rules
            if (rules.length > 0) {
                formDataToSend.append("rules", JSON.stringify(rules.map(r => ({
                    ruleType: r.ruleType,
                    targetValue: r.targetValue,
                    params: r.params
                }))));
            }

            const response = await axiosClient.put(
                `/admin/badges/${badgeId}`,
                formDataToSend,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            if (response.status === 200) {
                router.push("/admin/badges");
            }
        } catch (err) {
            console.error("Error updating badge:", err);
            setError(
                err.response?.data?.error ||
                err.response?.data?.message ||
                "Failed to update badge. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    if (fetchLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <span className="loading loading-spinner loading-lg"></span>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={() => router.push("/admin/badges")}
                    className="btn btn-ghost btn-circle"
                >
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-3xl font-bold">Edit Badge</h1>
            </div>

            {/* Error Alert */}
            {error && (
                <ErrorAlert
                    message={error}
                    onClose={() => setError("")}
                />
            )}

            {/* Form */}
            <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                    {/* Image Upload Section */}
                    <div className="form-control mb-6">
                        <label className="label">
                            <span className="label-text font-semibold">
                                Badge Image (PNG only) *
                            </span>
                        </label>
                        <div
                            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors ${fieldErrors.image ? "border-error" : "border-gray-300"
                                }`}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleImageUpload}
                                accept="image/png"
                                className="hidden"
                            />
                            {imagePreview ? (
                                <div className="flex flex-col items-center gap-4">
                                    <img
                                        src={imagePreview}
                                        alt="Badge preview"
                                        className="w-32 h-32 object-contain"
                                    />
                                    <p className="text-sm text-gray-500">
                                        Click to change image
                                    </p>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-2">
                                    <ImageUp size={48} className="text-gray-400" />
                                    <p className="text-lg font-medium">
                                        Click to upload badge image
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        PNG format only, max {MAX_IMAGE_SIZE_MB}MB
                                    </p>
                                </div>
                            )}
                        </div>
                        {fieldErrors.image && (
                            <label className="label">
                                <span className="label-text-alt text-error">
                                    {fieldErrors.image}
                                </span>
                            </label>
                        )}
                    </div>

                    {/* Badge Name (English) */}
                    <div className="form-control mb-4">
                        <label className="label">
                            <span className="label-text font-semibold">
                                Badge Name *
                            </span>
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleFormChange}
                            placeholder="Enter badge name in English"
                            className={`input input-bordered w-full ${fieldErrors.name ? "input-error" : ""
                                }`}
                        />
                        {fieldErrors.name && (
                            <label className="label">
                                <span className="label-text-alt text-error">
                                    {fieldErrors.name}
                                </span>
                            </label>
                        )}
                    </div>

                    {/* Badge Name (Chinese) */}
                    <div className="form-control mb-4">
                        <label className="label">
                            <span className="label-text font-semibold">
                                Badge Name (Chinese)
                            </span>
                        </label>
                        <input
                            type="text"
                            name="nameZh"
                            value={formData.nameZh}
                            onChange={handleFormChange}
                            placeholder="輸入徽章名稱（中文）"
                            className="input input-bordered w-full"
                        />
                    </div>

                    {/* Description (English) */}
                    <div className="form-control mb-4">
                        <label className="label">
                            <span className="label-text font-semibold">
                                Description  *
                            </span>
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleFormChange}
                            placeholder="Enter badge description in English"
                            rows="4"
                            className={`textarea textarea-bordered w-full ${fieldErrors.description ? "textarea-error" : ""
                                }`}
                        />
                        {fieldErrors.description && (
                            <label className="label">
                                <span className="label-text-alt text-error">
                                    {fieldErrors.description}
                                </span>
                            </label>
                        )}
                    </div>

                    {/* Description (Chinese) */}
                    <div className="form-control mb-6">
                        <label className="label">
                            <span className="label-text font-semibold">
                                Description (Chinese)
                            </span>
                        </label>
                        <textarea
                            name="descriptionZh"
                            value={formData.descriptionZh}
                            onChange={handleFormChange}
                            placeholder="輸入徽章描述（中文）"
                            rows="4"
                            className="textarea textarea-bordered w-full"
                        />
                    </div>

                    {/* Seasonal Toggle */}
                    <div className="form-control mb-4">
                        <label className="label cursor-pointer justify-start gap-4">
                            <input
                                type="checkbox"
                                name="isSeasonal"
                                checked={formData.isSeasonal}
                                onChange={handleFormChange}
                                className="toggle toggle-primary"
                            />
                            <span className="label-text font-semibold">
                                Is Seasonal Badge
                            </span>
                        </label>
                    </div>

                    {/* Seasonal Date Fields - Only shown when isSeasonal is true */}
                    {formData.isSeasonal && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text font-semibold">
                                        Seasonal Start Date *
                                    </span>
                                </label>
                                <input
                                    type="date"
                                    name="seasonalStartDate"
                                    value={formData.seasonalStartDate}
                                    onChange={handleFormChange}
                                    className={`input input-bordered w-full ${fieldErrors.seasonalStartDate ? "input-error" : ""
                                        }`}
                                />
                                {fieldErrors.seasonalStartDate && (
                                    <label className="label">
                                        <span className="label-text-alt text-error">
                                            {fieldErrors.seasonalStartDate}
                                        </span>
                                    </label>
                                )}
                            </div>

                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text font-semibold">
                                        Seasonal End Date *
                                    </span>
                                </label>
                                <input
                                    type="date"
                                    name="seasonalEndDate"
                                    value={formData.seasonalEndDate}
                                    onChange={handleFormChange}
                                    className={`input input-bordered w-full ${fieldErrors.seasonalEndDate ? "input-error" : ""
                                        }`}
                                />
                                {fieldErrors.seasonalEndDate && (
                                    <label className="label">
                                        <span className="label-text-alt text-error">
                                            {fieldErrors.seasonalEndDate}
                                        </span>
                                    </label>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Activity Searchable Dropdown */}
                    <div className="form-control mb-4">
                        <label className="label">
                            <span className="label-text font-semibold">
                                Activity (Optional)
                            </span>
                        </label>
                        <div className="relative" ref={activityDropdownRef}>
                            <input
                                type="text"
                                value={activitySearchTerm}
                                onChange={(e) => {
                                    setActivitySearchTerm(e.target.value);
                                    setShowActivityDropdown(true);
                                }}
                                onFocus={() => setShowActivityDropdown(true)}
                                placeholder={
                                    activitiesLoading
                                        ? "Loading activities..."
                                        : "Search for an activity..."
                                }
                                disabled={activitiesLoading}
                                className={`input input-bordered w-full ${fieldErrors.activityId ? "input-error" : ""
                                    }`}
                            />
                            {showActivityDropdown && !activitiesLoading && (
                                <div className="absolute z-50 w-full mt-1 bg-base-100 border border-base-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                    {filteredActivities.length > 0 ? (
                                        <ul className="menu p-2">
                                            {filteredActivities.map((activity) => (
                                                <li key={activity.id}>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleActivitySelect(activity)
                                                        }
                                                        className="text-left w-full"
                                                    >
                                                        <div>
                                                            <div className="font-semibold">
                                                                {activity.title || activity.titleZh}
                                                            </div>
                                                            <div className="text-xs text-gray-500">
                                                                {activity.activityType} •{" "}
                                                                {activity.location}
                                                            </div>
                                                        </div>
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <div className="p-4 text-center text-gray-500">
                                            No activities found
                                        </div>
                                    )}
                                </div>
                            )}
                            {formData.activityId && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setFormData((prev) => ({
                                            ...prev,
                                            activityId: "",
                                        }));
                                        setActivitySearchTerm("");
                                    }}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    ✕
                                </button>
                            )}
                        </div>
                        {fieldErrors.activityId && (
                            <label className="label">
                                <span className="label-text-alt text-error">
                                    {fieldErrors.activityId}
                                </span>
                            </label>
                        )}
                    </div>

                    {/* Limited Edition Toggle */}
                    <div className="form-control mb-4">
                        <label className="label cursor-pointer justify-start gap-4">
                            <input
                                type="checkbox"
                                name="isLimitedEdition"
                                checked={formData.isLimitedEdition}
                                onChange={handleFormChange}
                                className="toggle toggle-primary"
                            />
                            <span className="label-text font-semibold">
                                Is Limited Edition
                            </span>
                        </label>
                    </div>

                    {/* FS Points Cost - Only shown when isLimitedEdition is true */}
                    {formData.isLimitedEdition && (
                        <div className="form-control mb-4">
                            <label className="label">
                                <span className="label-text font-semibold">
                                    FS Points Cost *
                                </span>
                            </label>
                            <input
                                type="text"
                                name="fsPointsCost"
                                value={formData.fsPointsCost}
                                onChange={handleFormChange}
                                placeholder="Enter points cost (numbers only)"
                                className={`input input-bordered w-full ${fieldErrors.fsPointsCost ? "input-error" : ""
                                    }`}
                            />
                            {fieldErrors.fsPointsCost && (
                                <label className="label">
                                    <span className="label-text-alt text-error">
                                        {fieldErrors.fsPointsCost}
                                    </span>
                                </label>
                            )}
                        </div>
                    )}

                    {/* Place Field */}
                    <div className="form-control mb-6">
                        <label className="label">
                            <span className="label-text font-semibold">
                                Place (Optional)
                            </span>
                        </label>
                        <input
                            type="text"
                            name="place"
                            value={formData.place}
                            onChange={handleFormChange}
                            placeholder="Enter display order (numbers only)"
                            className={`input input-bordered w-full ${fieldErrors.place ? "input-error" : ""
                                }`}
                        />
                        <label className="label">
                            <span className="label-text-alt text-gray-500">
                                Leave empty to auto-assign the next available place
                            </span>
                        </label>
                        {fieldErrors.place && (
                            <label className="label">
                                <span className="label-text-alt text-error">
                                    {fieldErrors.place}
                                </span>
                            </label>
                        )}
                    </div>

                    {/* Badge Rules Section */}
                    <div className="form-control mb-6">
                        <div className="flex justify-between items-center mb-4">
                            <label className="label">
                                <span className="label-text font-semibold text-lg">
                                    Badge Rules *
                                </span>
                            </label>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowRulesDialog(true);
                                    setFieldErrors((prev) => ({
                                        ...prev,
                                        rules: undefined,
                                    }));
                                }}
                                className="btn btn-sm btn-outline btn-primary gap-2"
                            >
                                <Plus size={16} />
                                Add Rules
                            </button>
                        </div>

                        {/* Display current rules */}
                        {rules.length > 0 ? (
                            <div className="space-y-2">
                                {rules.map((rule, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between p-3 bg-base-200 rounded-lg"
                                    >
                                        <div className="flex-1">
                                            <div className="font-semibold">
                                                {rule.ruleType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                            </div>
                                            {rule.targetValue && (
                                                <div className="text-sm text-gray-600">
                                                    Target: {rule.targetValue}
                                                </div>
                                            )}
                                            {rule.isAuto && (
                                                <div className="text-xs text-primary mt-1">
                                                    Auto-selected
                                                </div>
                                            )}
                                        </div>
                                        {!rule.isAuto && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setRules(prev => prev.filter((_, i) => i !== index));
                                                }}
                                                className="btn btn-sm btn-ghost btn-circle text-error"
                                            >
                                                <X size={16} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-4 text-center text-gray-500 bg-base-200 rounded-lg">
                                No rules added yet. Click "Add Rules" to get started.
                            </div>
                        )}

                        {/* Show info message when activity is selected */}
                        {formData.activityId && (
                            <div className="mt-3">
                                <div className="text-sm text-info flex items-center gap-2">
                                    <span>ℹ️</span>
                                    <span>
                                        <strong>Activity Specific Participation</strong> rule is automatically selected when an Activity is linked
                                    </span>
                                </div>
                            </div>
                        )}

                        {fieldErrors.rules && (
                            <label className="label">
                                <span className="label-text-alt text-error">
                                    {fieldErrors.rules}
                                </span>
                            </label>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4 justify-end">
                        <button
                            onClick={() => router.push("/admin/badges")}
                            className="btn btn-ghost"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleUpdateBadge}
                            className="btn btn-primary"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="loading loading-spinner loading-sm"></span>
                                    Updating...
                                </>
                            ) : (
                                "Update Badge"
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Rules Dialog */}
            {showRulesDialog && (
                <dialog className="modal modal-open">
                    <div className="modal-box max-w-2xl">
                        <h3 className="font-bold text-lg mb-4">Add Badge Rules</h3>
                        <p className="text-sm text-gray-600 mb-4">
                            Select rule types to add to this badge. Each rule must be satisfied for users to earn the badge.
                        </p>

                        <div className="space-y-3 max-h-96 overflow-y-auto">
                            {Array.from(ALLOWED_RULE_TYPES).map((ruleType) => {
                                const isAutoSelected =
                                    (ruleType === 'redeem_purchase' && formData.isLimitedEdition) ||
                                    (ruleType === 'activity_specific_participation' && formData.activityId);

                                const isAlreadyAdded = rules.some(r => r.ruleType === ruleType);

                                const isDisabled = isAutoSelected;

                                return (
                                    <div
                                        key={ruleType}
                                        className={`p-4 border rounded-lg ${isDisabled ? 'bg-base-200 border-info' : 'hover:border-primary cursor-pointer'
                                            } ${isAlreadyAdded && !isAutoSelected ? 'border-primary bg-primary/5' : ''}`}
                                    >
                                        <label className="flex items-start gap-3 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={isAlreadyAdded}
                                                disabled={isDisabled}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setRules(prev => [
                                                            ...prev,
                                                            {
                                                                ruleType,
                                                                targetValue: null,
                                                                params: null,
                                                                isAuto: false
                                                            }
                                                        ]);
                                                    } else {
                                                        setRules(prev => prev.filter(r => r.ruleType !== ruleType));
                                                    }
                                                }}
                                                className="checkbox checkbox-primary mt-1"
                                            />
                                            <div className="flex-1">
                                                <div className="font-semibold">
                                                    {ruleType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                                </div>
                                                <div className="text-sm text-gray-600 mt-1">
                                                    {getRuleDescription(ruleType)}
                                                </div>
                                                {isAutoSelected && (
                                                    <div className="text-xs text-info mt-2 font-medium">
                                                        ✓ Auto-selected (
                                                        {ruleType === 'redeem_purchase' ? 'Limited Edition enabled' : 'Activity linked'}
                                                        )
                                                    </div>
                                                )}
                                            </div>
                                        </label>

                                        {/* Target Value Input for rules that need it */}
                                        {isAlreadyAdded && !isAutoSelected && needsTargetValue(ruleType) && (
                                            <div className="mt-3 ml-8">
                                                <label className="label">
                                                    <span className="label-text text-sm">Target Value</span>
                                                </label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    placeholder="Enter target value"
                                                    value={rules.find(r => r.ruleType === ruleType)?.targetValue || ''}
                                                    onChange={(e) => {
                                                        const value = e.target.value ? parseInt(e.target.value) : null;
                                                        setRules(prev => prev.map(r =>
                                                            r.ruleType === ruleType
                                                                ? { ...r, targetValue: value }
                                                                : r
                                                        ));
                                                    }}
                                                    className="input input-bordered input-sm w-full"
                                                />
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        <div className="modal-action">
                            <button
                                type="button"
                                onClick={() => setShowRulesDialog(false)}
                                className="btn"
                            >
                                Done
                            </button>
                        </div>
                    </div>
                    <form method="dialog" className="modal-backdrop">
                        <button onClick={() => setShowRulesDialog(false)}>close</button>
                    </form>
                </dialog>
            )}
        </div>
    );
};

// Helper function to get rule descriptions
function getRuleDescription(ruleType) {
    const descriptions = {
        calorie_single_activity: "User must burn a specific number of calories in a single activity",
        calorie_cumulative: "User must burn a cumulative number of calories across all activities",
        activity_participation_count: "User must participate in a certain number of activities",
        activity_specific_participation: "User must participate in a specific activity",
        consecutive_days_calories: "User must burn calories on consecutive days",
        invite_count: "User must invite a certain number of people",
        social_share: "User must share on social media",
        frequency_count: "User must participate with a specific frequency over time",
        points_cumulative: "User must accumulate a certain number of FS points",
        redeem_first: "User must be among the first to redeem this badge",
        redeem_points_cumulative: "User must spend a certain number of FS points on redemptions",
        redeem_purchase: "User must purchase/redeem this badge with FS points"
    };
    return descriptions[ruleType] || "Custom rule";
}

// Helper function to check if a rule needs target value
function needsTargetValue(ruleType) {
    const targetRequiredRules = [
        'calorie_single_activity',
        'calorie_cumulative',
        'activity_participation_count',
        'consecutive_days_calories',
        'invite_count',
        'frequency_count',
        'points_cumulative',
        'redeem_points_cumulative'
    ];
    return targetRequiredRules.includes(ruleType);
}

export default EditBadgePage;
