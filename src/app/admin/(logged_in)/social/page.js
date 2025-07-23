"use client";

import { useState, useRef, useEffect } from "react";
import { ImagePlus, Trash2, Upload, Info, Pencil } from "lucide-react";
import ImageCropModal from "./components/ImageCropModal";
import ErrorAlert from "@/app/shared/components/ErrorAlert";
import axiosClient from "@/utils/axios/api";

export default function SocialMediaPage() {
    const MAX_IMAGES = 5;
    const TARGET_RESOLUTION = 200;

    const [images, setImages] = useState([]);
    const [currentImage, setCurrentImage] = useState(null);
    const [currentImageUrl, setCurrentImageUrl] = useState(null);
    const [editingIndex, setEditingIndex] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [notification, setNotification] = useState({
        show: false,
        message: "",
    });

    const fileInputRef = useRef(null);

    const fetchImages = async () => {
        try {
            const response = await axiosClient.get("/admin/social");
            if (Array.isArray(response.data.images)) {
                setImages(response.data.images);
            } else {
                setImages([]);
            }
        } catch (err) {
            setError(err.message || "Failed to fetch images");
        }
    };

    useEffect(() => {
        fetchImages();
    }, []);

    const handlePostImage = async (imageBlob, socialMediaUrl) => {
        try {
            const formData = new FormData();
            const file = new File([imageBlob], "cropped-image.jpg", {
                type: imageBlob.type || "image/jpeg",
            });
            formData.append("file", file);
            formData.append("socialMediaUrl", socialMediaUrl);

            const result = await axiosClient.post("/admin/social", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            if (result.data.image) {
                setImages((prev) => [...prev, result.data.image]);
            } else {
                setImages([]);
            }

            window.dispatchEvent(new Event("socialImagesUpdated"));
        } catch (err) {
            setError(err.message || "Failed to upload image");
        }
    };

    const handleFileSelect = (e) => {
        if (!e.target.files || e.target.files.length === 0) return;

        const file = e.target.files[0];
        if (fileInputRef.current) fileInputRef.current.value = "";
        const imageUrl = URL.createObjectURL(file);
        setCurrentImage(file);
        setCurrentImageUrl(imageUrl);
    };

    const handleCropComplete = async (croppedImageBlob, socialMediaUrl) => {
        try {
            setIsLoading(true);

            if (editingIndex !== null) {
                setEditingIndex(null);
                showNotification("Image updated successfully");
            } else {
                showNotification("Image saved successfully");
            }
            setCurrentImage(null);
            if (currentImageUrl) {
                URL.revokeObjectURL(currentImageUrl);
                setCurrentImageUrl(null);
            }
            await handlePostImage(croppedImageBlob, socialMediaUrl);
        } catch (err) {
            setError(err.message || "Failed to save image");
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = (id) => {
        const index = images.findIndex((img) => img.id === id);
        setEditingIndex(index);
        fileInputRef.current?.click();
    };

    const handleCancelCrop = () => {
        if (currentImageUrl) {
            URL.revokeObjectURL(currentImageUrl);
        }

        setCurrentImage(null);
        setCurrentImageUrl(null);
        setEditingIndex(null);
    };

    const handleDeleteImage = async (id) => {
        try {
            console.log(id);
            setIsLoading(true);
            await axiosClient.delete(`/admin/social?id=${id}`);
            await fetchImages();
            showNotification("Image deleted successfully");
            window.dispatchEvent(new Event("socialImagesUpdated"));
        } catch (err) {
            setError(err.message || "Failed to delete image");
        } finally {
            setIsLoading(false);
        }
    };

    const showNotification = (message) => {
        setNotification({ show: true, message });
        setTimeout(() => setNotification({ show: false, message: "" }), 3000);
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="bg-base-100 shadow-xl rounded-lg p-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 border-b pb-4">
                    <h1 className="text-2xl font-bold mb-2 sm:mb-0 flex items-center">
                        <ImagePlus className="mr-2 text-primary" size={24} />
                        Social Media Images
                    </h1>

                    <div className="flex items-center text-sm text-base-content/70">
                        <Info size={16} className="mr-1" />
                        <span>
                            All images will be cropped to {TARGET_RESOLUTION}×
                            {TARGET_RESOLUTION} pixels
                        </span>
                    </div>
                </div>

                {/* Error Alert */}
                {error && (
                    <ErrorAlert message={error} onClose={() => setError("")} />
                )}

                {/* Upload Area */}
                <div className="mb-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4">
                        <label className="text-lg font-medium mb-2 sm:mb-0">
                            Upload Images ({images.length}/{MAX_IMAGES})
                        </label>

                        <button
                            className="btn btn-sm btn-primary"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={
                                images.length >= MAX_IMAGES ||
                                isLoading ||
                                currentImage !== null
                            }
                        >
                            <Upload size={16} className="mr-1" />
                            Select Image
                        </button>
                    </div>

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png"
                        className="hidden"
                        onChange={handleFileSelect}
                        disabled={
                            images.length >= MAX_IMAGES || currentImage !== null
                        }
                    />

                    {images.length === 0 && !currentImage && (
                        <div className="border-2 border-dashed border-base-300 rounded-lg p-10 text-center">
                            <ImagePlus
                                size={40}
                                className="mx-auto mb-3 text-base-content/50"
                            />
                            <p className="text-base-content/70">
                                Upload up to 5 images for social media sharing
                            </p>
                            <p className="text-xs text-base-content/50 mt-2">
                                Each image will be cropped to{" "}
                                {TARGET_RESOLUTION}×{TARGET_RESOLUTION} pixels
                            </p>
                        </div>
                    )}
                </div>

                {/* Image Gallery - Exact 200x200 size */}
                {images.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
                        {images.map((img, index) => (
                            <div
                                key={img.id}
                                className="card bg-base-100 shadow-md hover:shadow-lg transition-shadow"
                            >
                                {/* Exact 200x200 image container with fixed dimensions */}
                                <div className="relative w-[200px] h-[200px] mx-auto">
                                    <img
                                        src={img.imageUrl}
                                        alt={`Social media ${index + 1}`}
                                        className="w-[200px] h-[200px] object-cover"
                                    />
                                    <div className="absolute bottom-0 right-0 flex">
                                        <button
                                            className="btn btn-sm btn-primary btn-circle mr-2"
                                            onClick={() => handleEdit(img.id)}
                                            title="Edit Image"
                                        >
                                            <Pencil size={16} />
                                        </button>
                                        <button
                                            className="btn btn-sm btn-error btn-circle"
                                            onClick={() =>
                                                handleDeleteImage(img.id)
                                            }
                                            title="Remove Image"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>

                                <div className="card-body p-3">
                                    <p className="text-xs text-center text-base-content/70">
                                        cropped-image-{index + 1}.jpg
                                    </p>
                                    {/* Optionally show size if available */}
                                    {/* <p className="text-xs text-center text-base-content/50">
                                        {(images[index].size / 1024).toFixed(1)} KB
                                    </p> */}
                                </div>
                            </div>
                        ))}

                        {/* Add Image Button - maintain same dimensions */}
                        {images.length < MAX_IMAGES && !currentImage && (
                            <div
                                className="border-2 border-dashed border-base-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-base-200 transition-colors w-[200px] h-[200px] mx-auto"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <ImagePlus
                                    size={32}
                                    className="text-base-content/50 mb-2"
                                />
                                <p className="text-sm text-base-content/70">
                                    Add Image
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* Notification Toast */}
                {notification.show && (
                    <div className="toast toast-top toast-end">
                        <div className="alert alert-success">
                            <span>{notification.message}</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Crop Modal - Opens immediately when an image is selected */}
            {currentImage && currentImageUrl && (
                <ImageCropModal
                    imageUrl={currentImageUrl}
                    targetSize={TARGET_RESOLUTION}
                    onCropComplete={handleCropComplete}
                    onCancel={handleCancelCrop}
                />
            )}
        </div>
    );
}
