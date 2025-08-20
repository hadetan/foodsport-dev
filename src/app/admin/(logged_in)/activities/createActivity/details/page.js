"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import TiptapEditor from "@/app/shared/components/TiptapEditor";
import axiosClient from "@/utils/axios/api"; // import your axios client

const ActivityDetailsStep = () => {
    const router = useRouter();
    const params = useParams();
    const [details, setDetails] = useState("");

    useEffect(() => {
        // Load saved details from localStorage if available
        const saved = localStorage.getItem("create_activity_form_data");
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (parsed.description) setDetails(parsed.description);
            } catch {}
        }
    }, []);

    const handleSave = async () => {
        try {
            const activityId =
                params?.id || localStorage.getItem("new_activity_id");
            if (!activityId) {
                alert("Missing activity ID. Please create the activity first.");
                return;
            }
            // Get all form data from localStorage
            const saved = localStorage.getItem("create_activity_form_data");
            let payload = { description: details };
            if (saved) {
                try {
                    payload = { ...JSON.parse(saved), description: details };
                } catch {}
            }
            // Save updated details to localStorage for persistence
            localStorage.setItem(
                "create_activity_form_data",
                JSON.stringify(payload)
            );
            // Prepare FormData for PATCH
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
            await axiosClient.patch(
                `/admin/activities?activityId=${activityId}`,
                formDataToSend,
                {
                    headers: { "Content-Type": "multipart/form-data" },
                }
            );
            localStorage.setItem("activities_should_refresh", "1");
            router.push("/admin/activities");
        } catch (err) {
            alert(
                "Error saving activity: " +
                    (err?.response?.data?.error || err.message)
            );
        }
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
                <button
                    className="btn btn-primary btn-md text-base ml-4"
                    onClick={handleSave}
                >
                    Save
                </button>
            </div>
            <label className="block mb-4 mt-2 ml-2 text-xl font-semibold text-neutral-800 dark:text-neutral-100">
                Detailed Description
            </label>
            <TiptapEditor value={details} onChange={setDetails} />
        </div>
    );
};

export default ActivityDetailsStep;
