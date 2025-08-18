import React from "react";
import { Trash2 } from "lucide-react";

const ImageCard = ({ image, previewUrl, onRemove }) => {
    return (
        <div className="card bg-base-100 shadow-md hover:shadow-lg transition-shadow duration-300">
            <figure className="relative h-48 bg-base-200">
                <img
                    src={previewUrl}
                    alt="Social media preview"
                    className="object-cover w-full h-full"
                />
            </figure>

            <div className="card-body p-4">
                <h3 className="card-title text-sm truncate">{image.name}</h3>
                <div className="text-xs text-base-content/70 mb-2">
                    {(image.size / 1024).toFixed(1)} KB
                </div>

                <div className="card-actions justify-end mt-2">
                    <button
                        className="btn btn-sm btn-error btn-outline"
                        onClick={onRemove}
                    >
                        <Trash2 size={16} className="mr-1" />
                        Remove
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ImageCard;
