"use client";

import { useState, useRef } from "react";
import ActivityDetailsStep from "./descriptionBox";

export default function Tabs({
    setTab,
    activeTab,
    activityId,
    summary,
    summaryZh,
    setActivities,
}) {
    const [hasUnsavedEnglishChanges, setHasUnsavedEnglishChanges] =
        useState(false);
    const [hasUnsavedChineseChanges, setHasUnsavedChineseChanges] =
        useState(false);
    const [showUnsavedWarning, setShowUnsavedWarning] = useState(false);
    const pendingTabRef = useRef(null);

    const handleTabSwitch = (targetTab) => {
        // Check if switching away from description (English) with unsaved changes
        if (
            activeTab === "description" &&
            targetTab !== "description" &&
            hasUnsavedEnglishChanges
        ) {
            pendingTabRef.current = targetTab;
            setShowUnsavedWarning(true);
            return;
        }

        // Check if switching away from chinese description with unsaved changes
        if (
            activeTab === "chinese" &&
            targetTab !== "chinese" &&
            hasUnsavedChineseChanges
        ) {
            pendingTabRef.current = targetTab;
            setShowUnsavedWarning(true);
            return;
        }

        setTab(targetTab);
    };

    const handleUnsavedEnglishChange = (hasChanges) => {
        setHasUnsavedEnglishChanges(hasChanges);
    };

    const handleUnsavedChineseChange = (hasChanges) => {
        setHasUnsavedChineseChanges(hasChanges);
    };

    return (
        <div className="w-full">
            <div role="tablist" className="tabs tabs-border  gap-2 mb-6">
                <a
                    role="tab"
                    href="#"
                    className={`tab tab-lg rounded-lg font-semibold ${
                        activeTab === "details" ? "tab-active" : ""
                    }`}
                    onClick={(e) => {
                        e.preventDefault();
                        handleTabSwitch("details");
                    }}
                >
                    Activity Details
                </a>
                <a
                    role="tab"
                    href="#"
                    className={`tab tab-lg rounded-lg font-semibold ${
                        activeTab === "description" ? "tab-active" : ""
                    }`}
                    onClick={(e) => {
                        e.preventDefault();
                        handleTabSwitch("description");
                    }}
                >
                    Description
                </a>
                <a
                    role="tab"
                    href="#"
                    className={`tab tab-lg rounded-lg font-semibold ${
                        activeTab === "chinese" ? "tab-active" : ""
                    }`}
                    onClick={(e) => {
                        e.preventDefault();
                        handleTabSwitch("chinese");
                    }}
                >
                    Chinese Description
                </a>
            </div>
            {activeTab === "description" && (
                <ActivityDetailsStep
                    activityId={activityId}
                    isChinese={false}
                    setTab={setTab}
                    summary={summary}
                    summaryZh={summaryZh}
                    setActivities={setActivities}
                    onUnsavedChange={handleUnsavedEnglishChange}
                />
            )}
            {activeTab === "chinese" && (
                <ActivityDetailsStep
                    activityId={activityId}
                    isChinese={true}
                    setTab={setTab}
                    summary={summary}
                    summaryZh={summaryZh}
                    setActivities={setActivities}
                    onUnsavedChange={handleUnsavedChineseChange}
                />
            )}

            {/* Unsaved Changes Warning Popup */}
            {showUnsavedWarning && (
                <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
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
}
