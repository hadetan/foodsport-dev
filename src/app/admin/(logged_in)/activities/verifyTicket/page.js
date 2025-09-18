"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useVerifiedAttendees } from "@/app/shared/contexts/VerifiedAttendeesContext";
import { useAdminActivities } from "@/app/shared/contexts/AdminActivitiesContext";
import FullPageLoader from "../../components/FullPageLoader";

function VerifiedAttendeesTable({ attendees, loading, ActivityLoading, error }) {
    if (loading || ActivityLoading)
        return <FullPageLoader />
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
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 whitespace-nowrap">
                                Name
                            </th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 whitespace-nowrap">
                                Email
                            </th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 whitespace-nowrap">
                                Type
                            </th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 whitespace-nowrap">
                                Ticket Code
                            </th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 whitespace-nowrap">
                                Joined At
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {attendees.map((a) => (
                            <tr key={a.userActivityId} className="border-t">
                                <td className="px-3 py-2 whitespace-nowrap">
                                    {a.participant?.firstname || "-"}{" "}
                                    {a.participant?.lastname || ""}
                                </td>
                                <td className="px-3 py-2 whitespace-nowrap">
                                    {a.participant?.email || "-"}
                                </td>
                                <td className="px-3 py-2 whitespace-nowrap">
                                    {a.participant?.type === "tempUser"
                                        ? "Invited User"
                                        : a.participant?.type || "-"}
                                </td>
                                <td className="px-3 py-2 whitespace-nowrap">
                                    {a.ticketCode || "-"}
                                </td>
                                <td className="px-3 py-2 whitespace-nowrap">
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
    const { attendees, loading, error, setAttendees, setError, setLoading } =
        useVerifiedAttendees();
    const { getActivityNameById, loading: ActivityLoading } = useAdminActivities();

    const [activityId, setActivityId] = useState("");
    const [ticketCode, setTicketCode] = useState("");
    const [verifying, setVerifying] = useState(false);
    const [verifyError, setVerifyError] = useState(null);
    const [verifySuccess, setVerifySuccess] = useState(null);
    const [activityName, setActivityName] = useState("");

    const [invitedMeta, setInvitedMeta] = useState(null);
    const [invitedForm, setInvitedForm] = useState({
        email: "",
        firstname: "",
        lastname: "",
        dateOfBirth: "",
        weight: "",
        height: "",
    });
    const [submittingInvited, setSubmittingInvited] = useState(false);

    const fetchAttendees = async () => {
        if (!activityId) return;
        try {
            setLoading(true);
            const { data } = await axios.get("/api/admin/verifyTicket", {
                params: { activityId },
            });
            setAttendees(data.attendees || []);
            setError(null);
        } catch (error) {
            setError(
                error?.response?.data?.error || "Failed to fetch attendees."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        function readActivityIdFromLocation() {
            try {
                if (typeof window === "undefined") return "";
                const params = new URLSearchParams(window.location.search);
                return params.get("activityId") || "";
            } catch (e) {
                return "";
            }
        }

        const update = () => setActivityId(readActivityIdFromLocation());
        update();
        window.addEventListener("popstate", update);

        return () => window.removeEventListener("popstate", update);
    }, []);

    useEffect(() => {
        fetchAttendees();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activityId]);

    useEffect(() => {
        if (!activityId) {
            setActivityName("");
            return;
        }
        setActivityName(getActivityNameById(activityId));
    }, [activityId, getActivityNameById]);

    console.log(attendees);

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

            if (data?.status === "invited_needs_info") {
                setInvitedMeta({ ticketCode: data.ticketCode });
                setInvitedForm((prev) => ({
                    ...prev,
                    email: data.email || prev.email || "",
                }));
                return;
            }

            setVerifySuccess(data.message || "Ticket verified successfully!");
            setTicketCode("");
            if (data?.attendee) setAttendees((prev) => [...prev, data.attendee]);
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

    async function handleSubmitInvitedInfo() {
        if (!activityId || !invitedMeta?.ticketCode) {
            setVerifyError("Missing activity or ticket context.");
            setInvitedMeta(null);
            return;
        }
        setSubmittingInvited(true);
        setVerifyError(null);
        setVerifySuccess(null);
        try {
            const payload = {
                activityId,
                ticketCode: invitedMeta.ticketCode,
                email: invitedForm.email?.trim() || "",
                firstname: invitedForm.firstname?.trim() || "",
                lastname: invitedForm.lastname?.trim() || "",
                dateOfBirth: invitedForm.dateOfBirth || "",
                weight: invitedForm.weight || "",
                height: invitedForm.height || "",
            };
            const res = await axios.post(
                "/api/admin/verifyInvitedTicket",
                payload
            );
            setVerifySuccess(
                res?.data?.message || "Ticket verified successfully!"
            );
            setInvitedMeta(null);
            setInvitedForm({
                email: "",
                firstname: "",
                lastname: "",
                dateOfBirth: "",
                weight: "",
                height: "",
            });
            setTicketCode("");
            if (res?.data?.attendee) {
                setAttendees((prev) => [...prev, res.data.attendee]);
            }
        } catch (error) {
            setVerifyError(
                error?.response?.data?.error ||
                    "Failed to verify invited ticket."
            );
            setInvitedMeta(null);
        } finally {
            setSubmittingInvited(false);
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
                            {/* Show activity name big in h1 */}
                            {activityId && activityName && (
                                <h1 className="text-2xl font-bold text-indigo-700 mt-2">
                                    {activityName}
                                </h1>
                            )}
                        </div>

                        <div className="px-6 pb-6 pt-4">
                            {verifyError && (
                                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4 text-sm">
                                    {verifyError}
                                </div>
                            )}

                            {/* Ticket code form - hidden when invitedMeta is present */}
                            {!invitedMeta && (
                                <>
                                    <div className="grid grid-cols-1 gap-3 mb-3">
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
                                                    setTicketCode(
                                                        e.target.value
                                                    )
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
                                </>
                            )}

                            {/* Success message shows for both flows */}
                            {verifySuccess && (
                                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded mt-4 text-sm">
                                    {verifySuccess}
                                </div>
                            )}

                            {/* Invited attendee extra info form */}
                            {invitedMeta && (
                                <div className="mt-6 border-t border-gray-200 pt-4">
                                    <div className="text-sm font-semibold text-gray-800 mb-3">
                                        Invited attendee detected. Please fill
                                        in their details to complete
                                        verification.
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-sm text-gray-600 mb-1">
                                                Email
                                            </label>
                                            <input
                                                type="email"
                                                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50"
                                                value={invitedForm.email}
                                                onChange={(e) =>
                                                    setInvitedForm({
                                                        ...invitedForm,
                                                        email: e.target.value,
                                                    })
                                                }
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm text-gray-600 mb-1">
                                                First name
                                            </label>
                                            <input
                                                type="text"
                                                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50"
                                                value={invitedForm.firstname}
                                                onChange={(e) =>
                                                    setInvitedForm({
                                                        ...invitedForm,
                                                        firstname:
                                                            e.target.value,
                                                    })
                                                }
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm text-gray-600 mb-1">
                                                Last name
                                            </label>
                                            <input
                                                type="text"
                                                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50"
                                                value={invitedForm.lastname}
                                                onChange={(e) =>
                                                    setInvitedForm({
                                                        ...invitedForm,
                                                        lastname:
                                                            e.target.value,
                                                    })
                                                }
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm text-gray-600 mb-1">
                                                Date of birth
                                            </label>
                                            <input
                                                type="date"
                                                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50"
                                                value={invitedForm.dateOfBirth}
                                                onChange={(e) =>
                                                    setInvitedForm({
                                                        ...invitedForm,
                                                        dateOfBirth:
                                                            e.target.value,
                                                    })
                                                }
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm text-gray-600 mb-1">
                                                Weight
                                            </label>
                                            <input
                                                type="number"
                                                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50"
                                                value={invitedForm.weight}
                                                onChange={(e) =>
                                                    setInvitedForm({
                                                        ...invitedForm,
                                                        weight: e.target.value,
                                                    })
                                                }
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm text-gray-600 mb-1">
                                                Height
                                            </label>
                                            <input
                                                type="number"
                                                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50"
                                                value={invitedForm.height}
                                                onChange={(e) =>
                                                    setInvitedForm({
                                                        ...invitedForm,
                                                        height: e.target.value,
                                                    })
                                                }
                                            />
                                        </div>
                                    </div>
                                    <div className="mt-4 flex items-center gap-3">
                                        <button
                                            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2 rounded shadow disabled:opacity-60"
                                            onClick={handleSubmitInvitedInfo}
                                            disabled={submittingInvited}
                                        >
                                            {submittingInvited
                                                ? "Submitting..."
                                                : "Submit invited info"}
                                        </button>
                                        <button
                                            type="button"
                                            className="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-50"
                                            onClick={() => {
                                                setInvitedMeta(null);
                                                setInvitedForm({
                                                    email: "",
                                                    firstname: "",
                                                    lastname: "",
                                                    dateOfBirth: "",
                                                    weight: "",
                                                    height: "",
                                                });
                                            }}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <VerifiedAttendeesTable
                    attendees={attendees}
                    loading={loading}
                    ActivityLoading={ActivityLoading}
                    error={error}
                />
            </div>
        </div>
    );
}
