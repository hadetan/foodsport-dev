"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import TiptapEditor from "@/app/shared/components/TiptapEditor";
import axiosClient from "@/utils/axios/api"; // import your axios client

const ActivityDetailsStep = ({
    activityId,
    isChinese,
    setTab,
    summary,
    summaryZh,
}) => {
    const router = useRouter();
    const [details, setDetails] = useState(
        isChinese ? summaryZh || "" : summary || ""
    );
    // Populate later when props arrive (avoid overwriting user edits)
    useEffect(() => {
        if (!details) {
            if (isChinese && summaryZh) setDetails(summaryZh);
            if (!isChinese && summary) setDetails(summary);
        }
    }, [summary, summaryZh, isChinese, details]);
    const [showPreview, setShowPreview] = useState(false);

    const handleSave = async () => {
        try {
            // Send description as JSON
            await axiosClient.patch(
                `/admin/activities/summary?id=${activityId}`,
                isChinese ? { summaryZh: details } : { summary: details },

                {
                    headers: { "Content-Type": "application/json" },
                }
            );
            isChinese && router.push("/admin/activities");
            !isChinese && setTab("chinese");
        } catch (err) {
            alert(
                "Error saving activity: " +
                    (err?.response?.data?.error || err.message)
            );
        }
    };

    console.log(isChinese);

    return (
        <div className="min-h-screen w-full text-base">
            <div className="flex items-center justify-between mb-10 px-0 md:px-8 pt-8">
                <h1 className="text-4xl font-bold text-center flex-1 tracking-tight">
                    {isChinese
                        ? " Add Chinese Description"
                        : "Add English Description"}
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
