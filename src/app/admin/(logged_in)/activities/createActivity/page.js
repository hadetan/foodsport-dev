"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ErrorAlert from "@/app/shared/components/ErrorAlert";
import RichTextEditor from "@/app/shared/components/RichTextEditor";

const CreateActivityPage = () => {
    const router = useRouter();
    const [formData, setFormData] = useState({
        title: "",
        type: "",
        description: "",
        date: "",
        time: "",
        location: "",
        capacity: "",
        images: [],
        status: "draft",
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        setFormData((prev) => ({
            ...prev,
            images: [...prev.images, ...files],
        }));
    };

    const removeImage = (index) => {
        setFormData((prev) => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index),
        }));
    };

    const handleSubmit = async (isDraft = false) => {
        try {
            setLoading(true);
            const payload = {
                ...formData,
                status: isDraft ? "draft" : "active",
            };
            // TODO: Implement API call to create activity
            await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call
            router.push("/admin/activities");
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-base-200 p-6">
            <div className="max-w-screen-2xl mx-auto">
                <div className="flex items-center mb-6 relative">
                    <button
                        className="btn btn-outline absolute left-0"
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

                <div className="card bg-base-100 shadow-xl">
                    <div className="card-body p-6 space-y-8">
                        {/* Title */}
                        <div className="form-control flex items-center gap-4">
                            <span className="w-32 text-white">
                                Activity Title
                            </span>
                            <label className="flex-1">
                                <input
                                    type="text"
                                    name="title"
                                    placeholder="Enter activity title"
                                    className="input input-md"
                                    value={formData.title}
                                    onChange={handleFormChange}
                                />
                            </label>
                        </div>

                        {/* Type */}
                        <div className="form-control flex items-center gap-4">
                            <span className="w-32 text-white">
                                Activity Type
                            </span>
                            <label className="flex-1">
                                <select
                                    name="type"
                                    className="select select-bordered"
                                    value={formData.type}
                                    onChange={handleFormChange}
                                >
                                    <option value="">
                                        Select activity type
                                    </option>
                                    <option value="yoga">Yoga</option>
                                    <option value="running">Running</option>
                                    <option value="cycling">Cycling</option>
                                    <option value="swimming">Swimming</option>
                                </select>
                            </label>
                        </div>

                        {/* Description (Rich Text Editor) */}
                        <div className="form-control flex items-center gap-4">
                            <span className="w-32 text-white">Summary</span>
                            <label className="flex-1 max-w-xl w-1/2">
                                <RichTextEditor
                                    value={formData.description}
                                    onChange={(val) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            description: val,
                                        }))
                                    }
                                    className="text-black dark:text-inherit"
                                />
                            </label>
                        </div>

                        {/* Date */}
                        <div className="form-control flex items-center gap-4">
                            <span className="w-32 text-white">Date</span>
                            <label className="flex-1">
                                <input
                                    type="date"
                                    name="date"
                                    className="input input-bordered"
                                    value={formData.date}
                                    onChange={handleFormChange}
                                />
                            </label>
                        </div>

                        {/* Time */}
                        <div className="form-control flex items-center gap-4">
                            <span className="w-32 text-white">Time</span>
                            <label className="flex-1">
                                <input
                                    type="time"
                                    name="time"
                                    className="input input-bordered"
                                    value={formData.time}
                                    onChange={handleFormChange}
                                />
                            </label>
                        </div>

                        {/* Location */}
                        <div className="form-control flex items-center gap-4">
                            <span className="w-32 text-white">Location</span>
                            <label className="flex-1">
                                <input
                                    type="text"
                                    name="location"
                                    placeholder="Enter activity location"
                                    className="input input-bordered"
                                    value={formData.location}
                                    onChange={handleFormChange}
                                />
                            </label>
                        </div>

                        {/* Capacity */}
                        <div className="form-control flex items-center gap-4">
                            <span className="w-32 text-white">Capacity</span>
                            <label className="flex-1">
                                <input
                                    type="number"
                                    name="capacity"
                                    placeholder="Enter participant limit"
                                    className="input input-bordered"
                                    value={formData.capacity}
                                    onChange={handleFormChange}
                                    min="1"
                                />
                            </label>
                        </div>

                        {/* Images */}
                        <div className="form-control flex items-center gap-4">
                            <span className="w-32 text-white">
                                Upload Images
                            </span>
                            <label className="flex-1">
                                <input
                                    type="file"
                                    className="file-input file-input-bordered"
                                    accept="image/*"
                                    multiple
                                    onChange={handleImageUpload}
                                />
                            </label>
                        </div>

                        {formData.images.length > 0 && (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                                {formData.images.map((image, index) => (
                                    <div key={index} className="relative group">
                                        <img
                                            src={URL.createObjectURL(image)}
                                            alt={`Preview ${index + 1}`}
                                            className="w-full h-32 object-cover rounded-lg"
                                        />
                                        <button
                                            className="btn btn-circle btn-sm btn-error absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={() => removeImage(index)}
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Submit Buttons */}
                        <div className="flex justify-start gap-4">
                            <button
                                className="btn btn-outline"
                                onClick={() => handleSubmit(true)}
                                disabled={loading}
                            >
                                Save as Draft
                            </button>
                            <button
                                className={`btn btn-primary ${
                                    loading ? "loading" : ""
                                }`}
                                onClick={() => handleSubmit(false)}
                                disabled={loading}
                            >
                                SAVE
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateActivityPage;
