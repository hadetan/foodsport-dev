"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";

export default function VerifyTicketPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [activityId, setActivityId] = useState("");
    const [ticketCode, setTicketCode] = useState("");
    const [verifying, setVerifying] = useState(false);
    const [verifyError, setVerifyError] = useState(null);
    const [verifySuccess, setVerifySuccess] = useState(null);

    useEffect(() => {
        const qActivityId = searchParams.get("activityId");
        if (qActivityId) setActivityId(qActivityId);
    }, [searchParams]);

    async function handleVerify() {
        setVerifying(true);
        setVerifyError(null);
        setVerifySuccess(null);
        try {
            if (!activityId || !ticketCode.trim()) {
                setVerifyError(
                    "Please provide both Activity ID and Ticket Code."
                );
                return;
            }
            const res = await axios.post("/api/admin/verifyTicket", {
                activityId,
                ticketCode: ticketCode.trim(),
            });
            const data = res.data;
            setVerifySuccess(data.message || "Ticket verified successfully!");
            setTicketCode("");
        } catch (error) {
            if (error?.response?.data?.error) {
                setVerifyError(error.response.data.error);
            } else {
                setVerifyError("An error occurred while verifying the ticket.");
            }
        } finally {
            setVerifying(false);
        }
    }

    const canGoBackToActivity = !!activityId;

    return (
        <div className="w-full min-h-screen bg-white">
            <div className="container mx-auto px-4 pt-6">
                <div className="flex items-center justify-between mb-6">
                    <button
                        className="flex items-center bg-indigo-500 hover:bg-indigo-600 text-white font-medium px-5 py-2 rounded-lg shadow transition-colors"
                        onClick={() => {
                            if (canGoBackToActivity) {
                                router.push(
                                    `/admin/activities/viewActivity/${activityId}`
                                );
                            } else {
                                router.push("/admin/activities");
                            }
                        }}
                    >
                        <svg
                            className="w-5 h-5 mr-2"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2}
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M15 19l-7-7 7-7"
                            />
                        </svg>
                        Back
                    </button>

                    <h1 className="text-xl font-bold text-gray-800">
                        Verify Tickets
                    </h1>

                    <div />
                </div>

                <div className="max-w-xl">
                    <div className="bg-white rounded-lg shadow border border-gray-200">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <span className="text-lg font-semibold text-gray-800">
                                Verify ticket
                            </span>
                            <div className="text-xs text-gray-400 mt-1">
                                Enter activity and ticket code to verify
                            </div>
                        </div>

                        <div className="px-6 pb-6 pt-4">
                            {verifyError && (
                                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4 text-sm">
                                    {verifyError}
                                </div>
                            )}

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                                <div className="flex-1">
                                    <label className="block text-sm text-gray-600 mb-1">
                                        Activity ID
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50"
                                        placeholder="e.g. 123 or UUID"
                                        value={activityId}
                                        onChange={(e) =>
                                            setActivityId(e.target.value)
                                        }
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-sm text-gray-600 mb-1">
                                        Ticket Code
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50"
                                        placeholder="Enter ticket code"
                                        value={ticketCode}
                                        onChange={(e) =>
                                            setTicketCode(e.target.value)
                                        }
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter")
                                                handleVerify();
                                        }}
                                    />
                                </div>
                            </div>

                            <button
                                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2 rounded shadow disabled:opacity-60"
                                onClick={handleVerify}
                                disabled={verifying}
                            >
                                {verifying ? "Verifying..." : "Verify"}
                            </button>

                            {verifySuccess && (
                                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded mt-4 text-sm">
                                    {verifySuccess}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
