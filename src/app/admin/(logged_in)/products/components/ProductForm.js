"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ImageUp, Pencil } from "lucide-react";
import ErrorAlert from "@/app/shared/components/ErrorAlert";
import axiosClient from "@/utils/axios/api";
import { MAX_IMAGE_SIZE_MB } from "@/app/constants/constants";
import { useAdminProducts } from "@/app/shared/contexts/adminProductsContext";
import { useAdminCategories } from "@/app/shared/contexts/adminCategoriesContext";

const allowedMimeTypes = ["image/jpeg", "image/png"];

export default function ProductForm({
    mode = "create",
    productId,
    initialValues,
    onSuccess,
    onCancel,
}) {
    const isEditMode = mode === "edit";
    const router = useRouter();
    const fileInputRef = useRef(null);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [fieldErrors, setFieldErrors] = useState({});

    const { setProducts } = useAdminProducts();
    const { categories, setCategories } = useAdminCategories() ?? {};

    const [formState, setFormState] = useState(() => ({
        title: initialValues?.title ?? "",
        summary: initialValues?.summary ?? "",
        description: initialValues?.description ?? "",
        price: initialValues?.price ? String(initialValues.price) : "",
        category: initialValues?.category?.name ?? "",
        isFeatured: Boolean(initialValues?.isFeatured),
        imageFile: null,
        imagePreview: initialValues?.productImageUrl ?? null,
    }));

    useEffect(() => {
        return () => {
            if (formState.imagePreview && formState.imagePreview.startsWith("blob:")) {
                URL.revokeObjectURL(formState.imagePreview);
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        setFormState((prev) => ({
            ...prev,
            title: initialValues?.title ?? "",
            summary: initialValues?.summary ?? "",
            description: initialValues?.description ?? "",
            price: initialValues?.price ? String(initialValues.price) : "",
            category: initialValues?.category?.name ?? "",
            isFeatured: Boolean(initialValues?.isFeatured),
            imageFile: null,
            imagePreview: initialValues?.productImageUrl ?? null,
        }));
    }, [initialValues]);

    const categorySuggestions = useMemo(() => {
        if (!Array.isArray(categories)) return [];
        return categories
            .map((cat) => cat?.name)
            .filter(Boolean)
            .sort((a, b) => a.localeCompare(b));
    }, [categories]);

    const filteredCategorySuggestions = useMemo(() => {
        const q = String(formState.category || "").trim().toLowerCase();
        if (!q) return categorySuggestions;
        const matches = categorySuggestions.filter((n) => n.toLowerCase().includes(q));
        return matches;
    }, [categorySuggestions, formState.category]);

    const resetErrors = () => {
        setError("");
        setFieldErrors({});
    };

    const updateField = (name, value) => {
        resetErrors();
        setFormState((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleFileSelection = (file) => {
        if (!file) return;

        if (!allowedMimeTypes.includes(file.type)) {
            setFieldErrors((prev) => ({
                ...prev,
                image: "Only JPEG and PNG images are supported.",
            }));
            return;
        }

        if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
            setFieldErrors((prev) => ({
                ...prev,
                image: `Image size must be ≤ ${MAX_IMAGE_SIZE_MB}MB.`,
            }));
            return;
        }

        setFieldErrors((prev) => ({
            ...prev,
            image: undefined,
        }));
        setError("");
        setFormState((prev) => {
            if (prev.imagePreview && prev.imagePreview.startsWith("blob:")) {
                URL.revokeObjectURL(prev.imagePreview);
            }
            return {
                ...prev,
                imageFile: file,
                imagePreview: URL.createObjectURL(file),
            };
        });
    };

    const validate = () => {
        const errors = {};
        const title = formState.title.trim();
        const description = formState.description.trim();
        const category = formState.category.trim();
        const priceRaw = formState.price.toString().trim();

        if (!title) errors.title = "Title is required.";
        if (!description) errors.description = "Description is required.";
        if (!category) errors.category = "Category is required.";

        if (!priceRaw) {
            errors.price = "Price is required.";
        } else if (Number.isNaN(Number(priceRaw))) {
            errors.price = "Price must be a valid number.";
        } else if (Number(priceRaw) <= 0) {
            errors.price = "Price must be greater than 0.";
        }

        if (!isEditMode && !formState.imageFile) {
            errors.image = "Image is required.";
        }

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const buildFormData = () => {
        const fd = new FormData();
        fd.set("title", formState.title.trim());
        fd.set("description", formState.description.trim());
        fd.set("price", formState.price.toString().trim());
        fd.set("category", formState.category.trim());
        fd.set("isFeatured", formState.isFeatured ? "true" : "false");

        if (formState.summary?.trim()) {
            fd.set("summary", formState.summary.trim());
        }
        if (formState.imageFile) {
            fd.set("image", formState.imageFile);
        }

        return fd;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        resetErrors();

        if (!validate()) return;

        const formData = buildFormData();

        try {
            setSubmitting(true);
            const endpoint = isEditMode
                ? `/admin/products?productId=${encodeURIComponent(productId)}`
                : "/admin/products";
            const method = isEditMode ? "patch" : "post";

            const response = await axiosClient[method](endpoint, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            const data = response?.data ?? null;

            try {
                if (data) {
                    setProducts((prev) => {
                        const arr = prev.slice() || [];
                        const existingIndex = arr.findIndex((p) => String(p?.id) === String(data.id));
                        if (existingIndex !== -1) {
                            arr[existingIndex] = data;
                            return arr;
                        }
                        return [data, ...arr];
                    });
                }

                if (data && data.category) {
                    const incomingCat = data.category;
                    const exists = Array.isArray(categories) && categories.some((c) => String(c?.id) === String(incomingCat.id));
                    if (!exists) {
                        setCategories((prev) => ([...prev, incomingCat]));
                    }
                }
            } catch (ctxErr) {
                console.error("Failed updating local contexts after product submit:", ctxErr);
            }

            if (onSuccess) {
                onSuccess(data);
            }
        } catch (apiError) {
            const message =
                apiError?.response?.data?.error ||
                apiError?.response?.data?.message ||
                apiError?.message ||
                "Failed to submit product";
            setError(message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleRemoveImagePreview = () => {
        setFormState((prev) => {
            if (prev.imagePreview && prev.imagePreview.startsWith("blob:")) {
                URL.revokeObjectURL(prev.imagePreview);
            }
            return {
                ...prev,
                imageFile: null,
                imagePreview: null,
            };
        });
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
    const categoryWrapperRef = useRef(null);
    const categoryInputRef = useRef(null);
    const [isCategoryFocused, setIsCategoryFocused] = useState(false);

    useEffect(() => {
        function handleDocClick(e) {
            if (!categoryWrapperRef.current) return;
            if (!categoryWrapperRef.current.contains(e.target)) {
                setShowCategoryDropdown(false);
            }
        }
        document.addEventListener("mousedown", handleDocClick);
        return () => document.removeEventListener("mousedown", handleDocClick);
    }, []);

    useEffect(() => {
        // Only show when the category input is focused and there are suggestions.
        if (isCategoryFocused && filteredCategorySuggestions.length > 0) {
            setShowCategoryDropdown(true);
        } else {
            setShowCategoryDropdown(false);
        }
    }, [filteredCategorySuggestions, isCategoryFocused]);

    const renderCategorySuggestions = () => {
        if (!filteredCategorySuggestions.length || !showCategoryDropdown) return null;
        return (
            <ul
                role="listbox"
                aria-label="Category suggestions"
                className="absolute z-50 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow max-h-48 overflow-auto"
            >
                {filteredCategorySuggestions.map((name) => (
                    <li
                        key={name}
                        role="option"
                        tabIndex={0}
                        onMouseDown={(e) => {
                            e.preventDefault();
                            updateField("category", name);
                            setShowCategoryDropdown(false);
                        }}
                        className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                    >
                        {name}
                    </li>
                ))}
            </ul>
        );
    };

    const submitLabel = submitting
        ? isEditMode
            ? "Updating Product..."
            : "Creating Product..."
        : isEditMode
            ? "Save Changes"
            : "Create Product";

    return (
        <form
            onSubmit={handleSubmit}
            className="w-full bg-white rounded-xl shadow-sm p-6 md:p-8 space-y-6"
            noValidate
        >
            {error ? (
                <ErrorAlert message={error} onClose={() => setError("")} />
            ) : null}

            <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-4">
                    <label className="block text-sm font-medium text-gray-700">
                        Product Image
                    </label>

                    <div
                        className="relative rounded-lg border border-dashed border-gray-300 bg-gray-50 hover:border-indigo-300 transition-colors"
                        style={{ aspectRatio: "4 / 3" }}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/png"
                            className={`absolute inset-0 w-full h-full opacity-0 cursor-pointer ${formState.imagePreview ? "z-0" : "z-10"}`}
                            onChange={(event) => {
                                const file = event.target.files?.[0];
                                handleFileSelection(file);
                            }}
                            aria-label="Upload product image"
                        />

                        {formState.imagePreview ? (
                            <>
                                <img
                                    src={formState.imagePreview}
                                    alt="Product preview"
                                    className="w-full h-full object-cover"
                                />

                                {formState.imageFile ? (
                                    <button
                                        type="button"
                                        className="absolute top-3 right-3 bg-white/90 hover:bg-white rounded-full px-3 py-1 text-xs font-medium text-gray-700 shadow transition"
                                        onClick={(event) => {
                                            event.preventDefault();
                                            handleRemoveImagePreview();
                                        }}
                                    >
                                        Remove
                                    </button>
                                ) : null}

                                <button
                                    type="button"
                                    className="absolute bottom-3 right-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium px-3 py-1.5 rounded-md shadow flex items-center gap-1"
                                    onClick={(event) => {
                                        event.preventDefault();
                                        fileInputRef.current?.click();
                                    }}
                                >
                                    <Pencil className="w-3.5 h-3.5" />
                                    Change Image
                                </button>
                            </>
                        ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 gap-2">
                                <ImageUp className="w-10 h-10 text-indigo-500" />
                                <span className="font-medium text-sm text-gray-700">
                                    Click or drag to upload
                                </span>
                                <span className="text-xs text-gray-500">
                                    JPG or PNG up to {MAX_IMAGE_SIZE_MB}MB
                                </span>
                            </div>
                        )}
                    </div>
                    {fieldErrors.image ? (
                        <p className="text-sm text-error mt-2">{fieldErrors.image}</p>
                    ) : (
                        <p className="text-xs text-gray-500">
                            Images are stored in Supabase and must be JPEG or PNG format.
                        </p>
                    )}

                    <label className="flex items-center gap-3 mt-4">
                        <input
                            type="checkbox"
                            className="toggle toggle-primary"
                            checked={formState.isFeatured}
                            onChange={(event) => updateField("isFeatured", event.target.checked)}
                        />
                        <span className="text-sm font-medium text-gray-700">
                            Feature this product
                        </span>
                    </label>
                    <p className="text-xs text-gray-500">
                        Featured products can be promoted across the platform.
                    </p>
                </div>

                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2 flex flex-col gap-1">
                        <label className="text-sm font-medium text-gray-700" htmlFor="product-title">
                            Title
                        </label>
                        <input
                            id="product-title"
                            type="text"
                            className={`input input-bordered w-full${fieldErrors.title ? " input-error" : ""}`}
                            value={formState.title}
                            onChange={(event) => updateField("title", event.target.value)}
                            maxLength={120}
                            placeholder="e.g. Plant-based protein bar"
                        />
                        {fieldErrors.title ? (
                            <p className="text-sm text-error">{fieldErrors.title}</p>
                        ) : null}
                    </div>

                    <div className="md:col-span-2 flex flex-col gap-1">
                        <label className="text-sm font-medium text-gray-700" htmlFor="product-summary">
                            Summary (optional)
                        </label>
                        <textarea
                            id="product-summary"
                            className="textarea textarea-bordered w-full"
                            rows={3}
                            value={formState.summary}
                            onChange={(event) => updateField("summary", event.target.value)}
                            placeholder="Short highlight used in product cards"
                        />
                    </div>

                    <div className="md:col-span-2 flex flex-col gap-1">
                        <label className="text-sm font-medium text-gray-700" htmlFor="product-description">
                            Description
                        </label>
                        <textarea
                            id="product-description"
                            className={`textarea textarea-bordered w-full min-h-[140px]${fieldErrors.description ? " textarea-error" : ""}`}
                            value={formState.description}
                            onChange={(event) => updateField("description", event.target.value)}
                            placeholder="Full product details"
                        />
                        {fieldErrors.description ? (
                            <p className="text-sm text-error">{fieldErrors.description}</p>
                        ) : null}
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-gray-700" htmlFor="product-price">
                            Price (HKD)
                        </label>
                        <input
                            id="product-price"
                            type="number"
                            min="0"
                            step="0.01"
                            className={`input input-bordered w-full${fieldErrors.price ? " input-error" : ""}`}
                            value={formState.price}
                            onChange={(event) => updateField("price", event.target.value)}
                            placeholder="e.g. 99.90"
                        />
                        {fieldErrors.price ? (
                            <p className="text-sm text-error">{fieldErrors.price}</p>
                        ) : null}
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-gray-700" htmlFor="product-category">
                            Category
                        </label>
                        <div className="relative" ref={categoryWrapperRef}>
                            <input
                                ref={categoryInputRef}
                                id="product-category"
                                type="text"
                                className={`input input-bordered w-full${fieldErrors.category ? " input-error" : ""}`}
                                value={formState.category}
                                onChange={(event) => {
                                    updateField("category", event.target.value);
                                }}
                                onFocus={() => setIsCategoryFocused(true)}
                                onBlur={() => setIsCategoryFocused(false)}
                                placeholder="e.g. Nutrition"
                                autoComplete="off"
                                aria-autocomplete="list"
                            />
                            {renderCategorySuggestions()}
                        </div>
                        {fieldErrors.category ? (
                            <p className="text-sm text-error">{fieldErrors.category}</p>
                        ) : (
                            <p className="text-xs text-gray-500">
                                Start typing to reuse an existing category or create a new one.
                            </p>
                        )}
                    </div>
                </div>
            </section>

            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => {
                        if (onCancel) {
                            onCancel();
                        } else {
                            router.back();
                        }
                    }}
                    disabled={submitting}
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={submitting}
                >
                    {submitLabel}
                </button>
            </div>
        </form>
    );
}
