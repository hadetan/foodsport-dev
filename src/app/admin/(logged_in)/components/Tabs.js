"use client";

import { useRouter } from "next/navigation";
import ActivityDetailsStep from "./descriptionBox";

export default function Tabs({ setTab, activeTab }) {
    const router = useRouter();

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
                            ${
                                activeTab === "details" &&
                                "bg-primary text-white border-primary"
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
                      ${
                         activeTab ===  "description" && "bg-primary text-white border-primary"
                        }

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
