"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import TiptapEditor from "@/app/shared/components/TiptapEditor";
import axiosClient from "@/utils/axios/api"; // import your axios client

const ActivityDetailsStep = () => {
    const router = useRouter();
    const params = useParams();
    const [details, setDetails] = useState("");
    const [showPreview, setShowPreview] = useState(false);

    const handleSave = async () => {
        try {
            const activityId = params?.id;
            if (!activityId) {
                alert("Missing activity ID. Please create the activity first.");
                return;
            }
            // Only send description to API
            const formDataToSend = new FormData();
            formDataToSend.set("description", details);
            await axiosClient.patch(
                `/admin/activities?activityId=${activityId}`,
                formDataToSend,
                {
                    headers: { "Content-Type": "multipart/form-data" },
                }
            );
            router.push("/admin/activities");
        } catch (err) {
            alert(
                "Error saving activity: " +
                    (err?.response?.data?.error || err.message)
            );
        }
    };

    const validate = () => {
        const errs = {};
        if (!form.title || form.title.length < 5 || form.title.length > 100)
            errs.title = "Title must be 5-100 characters.";
       
        if (!form.activityType)
            errs.activityType = "Activity type is required.";
        if (!form.date) errs.datetime = "Date is required.";
        else {
            const dt = new Date(form.date);
            if (dt < new Date()) errs.datetime = "Date must be in the future.";
        }
        if (!form.location) errs.location = "Location is required.";
        const cap = parseInt(form.capacity, 10);
        if (!cap || cap < 1 || cap > 1000)
            errs.capacity = "Capacity must be 1-1000.";
        const points = parseFloat(form.totalCaloriesBurnt);
        if (isNaN(points) || points <= 0)
            errs.totalCaloriesBurnt =
                "Total calories burnt must be a positive number.";
        const calories = parseFloat(form.caloriesPerHour);
        if (isNaN(calories) || calories <= 0)
            errs.caloriesPerHour =
                "Calories per hour must be a positive number.";
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

    return (
        <div className="min-h-screen w-full text-base">
            <div className="flex items-center justify-between mb-10 px-0 md:px-8 pt-8">
                <button
                    className="btn btn-outline btn-md text-base"
                    onClick={() => router.back()}
                >
                    Back
                </button>
                <h1 className="text-4xl font-bold text-center flex-1 tracking-tight">
                    Add Detailed Description
                </h1>
                <div className="flex gap-2">
                    <button
                        className="btn btn-secondary btn-md text-base"
                        onClick={() => setShowPreview(true)}
                        type="button"
                    >
                        Preview
                    </button>
                    <button
                        className="btn btn-primary btn-md text-base ml-2"
                        onClick={handleSave}
                    >
                        Save
                    </button>
                </div>
            </div>
            <label className="block mb-4 mt-2 ml-2 text-xl font-semibold text-neutral-800">
                Detailed Description
            </label>
            <TiptapEditor value={details} onChange={setDetails} />
            {showPreview && (
                <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center">
                    <div className="bg-white w-full h-xxl flex flex-col relative mx-auto md:max-w-7xl md:my-8 md:rounded-lg">
                        <button
                            className="absolute top-4 right-4 btn btn-sm btn-circle z-10"
                            onClick={() => setShowPreview(false)}
                        >
                            ✕
                        </button>
                        <h2 className="text-2xl font-bold mb-0 px-8 pt-8 pb-2">
                            Preview
                        </h2>
                        <div className="border-t border-neutral-200 mt-2" />
                        <div
                            className="tiptap-editor prose max-w-none flex-1 overflow-y-auto px-8"
                            style={{ paddingBottom: 0, paddingTop: 0 }}
                            dangerouslySetInnerHTML={{ __html: details }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default ActivityDetailsStep;
