"use client";

import { useState, useRef, useEffect } from "react";
import ReactCrop, { centerCrop, makeAspectCrop } from "react-image-crop";
import { X, Check, Move } from "lucide-react";
// Import directly from node_modules to ensure CSS is loaded properly
import "react-image-crop/dist/ReactCrop.css";

const ImageCropModal = ({ imageUrl, targetSize, onCropComplete, onCancel }) => {
    const [crop, setCrop] = useState();
    const [isLoading, setIsLoading] = useState(true);
    const imgRef = useRef(null);

    // Preload the image before rendering to prevent loading issues
    useEffect(() => {
        const img = new Image();
        img.src = imageUrl;
        img.onload = () => {
            setIsLoading(false);
        };
        img.onerror = () => {
            console.error("Failed to load image");
            setIsLoading(false);
        };
    }, [imageUrl]);

    // Initialize crop to center when image loads
    const onImageLoad = (e) => {
        const { width, height } = e.currentTarget;

        // Set initial crop area to a square that fits within the image
        const size = Math.min(width, height);
        const x = (width - size) / 2;
        const y = (height - size) / 2;

        setCrop({
            unit: "px",
            x,
            y,
            width: size,
            height: size,
            aspect: 1,
        });
    };

    // Create a canvas with the cropped image
    const getCroppedImg = () => {
        if (!crop || !imgRef.current) return;

        const canvas = document.createElement("canvas");
        const image = imgRef.current;
        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;

        canvas.width = targetSize;
        canvas.height = targetSize;

        const ctx = canvas.getContext("2d");

        ctx.drawImage(
            image,
            crop.x * scaleX,
            crop.y * scaleY,
            crop.width * scaleX,
            crop.height * scaleY,
            0,
            0,
            targetSize,
            targetSize
        );

        return new Promise((resolve) => {
            canvas.toBlob(
                (blob) => {
                    if (!blob) return;
                    blob.name = "cropped-image.jpg";
                    resolve(blob);
                },
                "image/jpeg",
                0.95
            );
        });
    };

    const handleCropApply = async () => {
        try {
            const croppedImageBlob = await getCroppedImg();
            onCropComplete(croppedImageBlob);
        } catch (err) {
            console.error("Error cropping image:", err);
        }
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-60 flex items-center justify-center p-4">
            <div className="bg-base-100 rounded-lg max-w-4xl w-full mx-auto">
                <div className="flex justify-between items-center p-4 border-b">
                    <h3 className="font-bold text-lg">
                        Crop Image ({targetSize}×{targetSize})
                    </h3>
                    <button
                        className="btn btn-sm btn-circle btn-ghost"
                        onClick={onCancel}
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="p-6">
                    {isLoading ? (
                        <div className="flex justify-center items-center h-64">
                            <span className="loading loading-spinner loading-lg"></span>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center">
                            <div className="relative max-h-[60vh] overflow-hidden">
                                <ReactCrop
                                    crop={crop}
                                    onChange={(c) => setCrop(c)}
                                    aspect={1}
                                    minWidth={50}
                                    circularCrop={false}
                                    className="max-w-full max-h-[60vh]"
                                >
                                    <img
                                        ref={imgRef}
                                        src={imageUrl}
                                        alt="Crop Preview"
                                        onLoad={onImageLoad}
                                        className="max-h-[60vh] max-w-full object-contain"
                                    />
                                </ReactCrop>

                                {crop && (
                                    <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs flex items-center">
                                        <Move className="mr-1" size={14} />
                                        Drag to adjust
                                    </div>
                                )}
                            </div>

                            <p className="text-sm text-gray-500 mt-4">
                                Position and resize the crop area to select a{" "}
                                {targetSize}×{targetSize} pixel square.
                            </p>
                        </div>
                    )}
                </div>

                <div className="flex justify-end gap-2 p-4 border-t">
                    <button className="btn btn-outline" onClick={onCancel}>
                        <X size={16} className="mr-1" />
                        Cancel
                    </button>

                    <button
                        className="btn btn-primary"
                        onClick={handleCropApply}
                        disabled={isLoading || !crop}
                    >
                        <Check size={16} className="mr-1" />
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ImageCropModal;
