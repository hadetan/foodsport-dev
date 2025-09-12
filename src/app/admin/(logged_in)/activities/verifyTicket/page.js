"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import {
    useVerifiedAttendees,
} from "@/app/shared/contexts/VerifiedAttendeesContext";
import api from "@/utils/axios/api";

function VerifiedAttendeesTable({ attendees, loading, error }) {
    if (loading)
        return <div className="mt-8">Loading verified attendees...</div>;
    if (error) return <div className="mt-8 text-red-600">{error}</div>;
    if (!attendees.length)
        return <div className="mt-8">No verified attendees yet.</div>;
    return (
        <div className="mt-8">
            <h2 className="text-lg font-semibold mb-2">Verified Attendees</h2>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200 rounded">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">
                                Name
                            </th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">
                                Email
                            </th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">
                                Type
                            </th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">
                                Ticket Code
                            </th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">
                                Joined At
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {attendees.map((a) => (
                            <tr key={a.userActivityId} className="border-t">
                                <td className="px-3 py-2">
                                    {a.participant?.firstname || "-"}{" "}
                                    {a.participant?.lastname || ""}
                                </td>
                                <td className="px-3 py-2">
                                    {a.participant?.email || "-"}
                                </td>
                                <td className="px-3 py-2">
                                    {a.participant?.type || "-"}
                                </td>
                                <td className="px-3 py-2">
                                    {a.ticketCode || "-"}
                                </td>
                                <td className="px-3 py-2 text-xs">
                                    {a.joinedAt
                                        ? new Date(a.joinedAt).toLocaleString()
                                        : "-"}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default function VerifyTicketPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { attendees, loading, error, setAttendees, setError, setLoading } = useVerifiedAttendees();

    const [activityId, setActivityId] = useState(searchParams.get("activityId"));
    const [ticketCode, setTicketCode] = useState("");
    const [verifying, setVerifying] = useState(false);
    const [verifyError, setVerifyError] = useState(null);
    const [verifySuccess, setVerifySuccess] = useState(null);


    const fetchAttendees = async () => {
        try {
            setLoading(true);
            const { data } = await api.get("/admin/verifyTicket", { params: { activityId } })
            setAttendees(data.attendees || []);
            setError(null);
        } catch (error) {
            setError(
                error?.response?.data?.error || "Failed to fetch attendees."
            );
        } finally {
            setLoading(false);
        }
        
    }

    useEffect(() => {
        fetchAttendees();
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
            if (data.user || data.tempUser) {
                setAttendees({
                    user: data.user,
                    tempUser: data.tempUser,
                });
            }
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
                                    router.push(`/admin/activities`);
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

                    <VerifiedAttendeesTable
                        attendees={attendees}
                        loading={loading}
                        error={error}
                    />
                </div>
            </div>
    );
}
