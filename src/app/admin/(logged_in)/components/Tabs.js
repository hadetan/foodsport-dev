"use client";

import ActivityDetailsStep from "./descriptionBox";

export default function Tabs({ setTab, activeTab, activityId }) {
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
                        setTab("details");
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
                        setTab("description");
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
                        setTab("chinese");
                    }}
                >
                    Chinese Description
                </a>
            </div>
            {activeTab === "description" && (
                <ActivityDetailsStep activityId={activityId} isChinese={false} />
            )}
            {activeTab === "chinese" && (
                <ActivityDetailsStep activityId={activityId} isChinese={true} />
            )}
        </div>
    );
}
