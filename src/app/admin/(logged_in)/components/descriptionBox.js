"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import TiptapEditor from "@/app/shared/components/TiptapEditor";
import axiosClient from "@/utils/axios/api";

const ActivityDetailsStep = ({
    activityId,
    isChinese,
    setTab,
    summary,
    summaryZh,
    setActivities,
    onUnsavedChange,
}) => {
    const router = useRouter();
    const [details, setDetails] = useState(
        isChinese ? summaryZh || "" : summary || ""
    );
    const initialDetailsRef = useRef(
        isChinese ? summaryZh || "" : summary || ""
    );
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    useEffect(() => {
        if (!details) {
            if (isChinese && summaryZh) setDetails(summaryZh);
            if (!isChinese && summary) setDetails(summary);
        }
    }, [summary, summaryZh, isChinese, details]);

    // Update initial ref when summary props change
    useEffect(() => {
        initialDetailsRef.current = isChinese ? summaryZh || "" : summary || "";
    }, [summary, summaryZh, isChinese]);

    // Track unsaved changes
    useEffect(() => {
        // Normalize content for comparison (strip all HTML tags and whitespace to get text content)
        const normalizeHtml = (html) => {
            if (!html) return "";
            // Remove all HTML tags and normalize whitespace
            const text = html
                .replace(/<[^>]*>/g, "") // Remove all HTML tags
                .replace(/&nbsp;/g, " ") // Replace &nbsp; with space
                .replace(/\s+/g, " ") // Normalize whitespace
                .trim();
            return text;
        };

        const normalizedDetails = normalizeHtml(details);
        const normalizedInitial = normalizeHtml(initialDetailsRef.current);

        // Check if content has meaningfully changed from initial state
        // Only flag as changed if there's actual text content that differs
        const hasChanges =
            normalizedDetails.length > 0 &&
            normalizedDetails !== normalizedInitial;

        setHasUnsavedChanges(hasChanges);
        if (onUnsavedChange) {
            onUnsavedChange(hasChanges);
        }
    }, [details, isChinese, onUnsavedChange]);

    const [showPreview, setShowPreview] = useState(false);
    const [showUnsavedWarning, setShowUnsavedWarning] = useState(false);

    const handleSave = async () => {
        try {
            const { data } = await axiosClient.patch(
                `/admin/activities/summary?id=${activityId}`,
                isChinese ? { summaryZh: details } : { summary: details },

                {
                    headers: { "Content-Type": "application/json" },
                }
            );
            setActivities((prev) => {
                if (!Array.isArray(prev)) return prev;
                return prev.map((act) =>
                    String(act.id) === String(activityId)
                        ? { ...act, ...data }
                        : act
                );
            });
            // Reset unsaved changes state after successful save
            initialDetailsRef.current = details;
            setHasUnsavedChanges(false);
            if (onUnsavedChange) {
                onUnsavedChange(false);
            }

            isChinese && router.push("/admin/activities");
            !isChinese && setTab("chinese");
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
                <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-4xl shadow-lg rounded-lg overflow-hidden max-h-[80vh] flex flex-col">
                        <button
                            className="absolute top-4 right-4 btn btn-sm btn-circle z-10"
                            onClick={() => setShowPreview(false)}
                        >
                            ✕
                        </button>
                        <h2 className="text-2xl font-bold mb-0 px-6 pt-6 pb-2">
                            Preview
                        </h2>
                        <div className="border-t border-neutral-200 mt-2" />
                        <div className="p-6 flex-1 overflow-auto">
                            <div
                                className="tiptap-editor prose max-w-none"
                                style={{ paddingBottom: 0, paddingTop: 0 }}
                                dangerouslySetInnerHTML={{ __html: details }}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Unsaved Changes Warning Popup */}
            {showUnsavedWarning && (
                <div className="fixed inset-0 z-50 bg-opacity-50 flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-md shadow-lg rounded-lg p-6">
                        <h2 className="text-xl font-bold mb-4 text-gray-900">
                            Unsaved Changes
                        </h2>
                        <p className="text-gray-700 mb-6">
                            Please save otherwise you will lose all contents.
                        </p>
                        <div className="flex justify-end">
                            <button
                                className="btn btn-primary px-8"
                                onClick={() => setShowUnsavedWarning(false)}
                            >
                                OK
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ActivityDetailsStep;
