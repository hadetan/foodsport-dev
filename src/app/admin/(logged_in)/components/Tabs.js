"use client";

export default function Tabs({ setTab, activeTab, activityId }) {
    return (
        <div>
            <div className="flex gap-2 mb-6">
                <button
                    className={`px-6 py-2 rounded-lg border-2 font-semibold transition
                        ${
                            activeTab === "details"
                                ? "bg-primary text-white border-primary"
                                : "bg-background text-primary border-primary"
                        }
                         hover:bg-primary-light hover:text-white hover:border-primary-light
                        `}
                    type="button"
                    onClick={() => setTab("details")}
                >
                    Activity Details
                </button>
                <button
                    className={`px-6 py-2 rounded-lg border-2 font-semibold transition
                        ${
                            activeTab === "description"
                                ? "bg-primary text-white border-primary"
                                : "bg-background text-primary border-primary"
                        }
                        hover:bg-primary-light hover:text-white hover:border-primary-light
                    `}
                    type="button"
                    onClick={() => setTab("description")}
                >
                    Description
                </button>
            </div>
        </div>
    );
}
