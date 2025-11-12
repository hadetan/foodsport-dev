"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from '@/utils/axios/api';
import { useVerifiedAttendees } from "@/app/shared/contexts/VerifiedAttendeesContext";
import { useAdminActivities } from "@/app/shared/contexts/AdminActivitiesContext";
import { useUsers } from "@/app/shared/contexts/usersContext";
import FullPageLoader from "../../components/FullPageLoader";
import InviteParticipantsDialogAdmin from "../components/InviteParticipantsDialogAdmin";

function VerifiedAttendeesTable({
    attendees,
    loading,
    ActivityLoading,
    error,
}) {
    if (loading || ActivityLoading) return <FullPageLoader />;

    const hasAttendees = attendees.length > 0;

    return (
        <section className="mt-12">
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                            Attendance
                        </p>
                        <h2 className="mt-1 text-xl font-semibold text-slate-900">
                            Verified attendees
                        </h2>
                    </div>
                    <span className="inline-flex items-center rounded-full bg-indigo-50 px-4 py-1 text-sm font-semibold text-indigo-600">
                        {attendees.length}
                    </span>
                </div>

                {error ? (
                    <div className="px-6 py-5 text-sm text-red-600">{error}</div>
                ) : hasAttendees ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50 whitespace-nowrap">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Name
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Email
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Type
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Ticket code
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Joined at
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                                {attendees.map((attendee) => {
                                    const fullName = [
                                        attendee.participant?.firstname,
                                        attendee.participant?.lastname,
                                    ]
                                        .filter(Boolean)
                                        .join(" ");
                                    const type =
                                        attendee.participant?.type === "tempUser"
                                            ? "Invited guest"
                                            : attendee.participant?.type ||
                                              "-";
                                    const ticketCode =
                                        attendee.ticketCode?.toUpperCase() ||
                                        "-";
                                    const joinedAt = attendee.joinedAt
                                        ? new Date(
                                              attendee.joinedAt
                                          ).toLocaleString()
                                        : "-";

                                    return (
                                        <tr
                                            key={attendee.userActivityId}
                                            className="transition hover:bg-slate-50/60"
                                        >
                                            <td className="whitespace-nowrap px-6 py-3 text-sm font-medium text-slate-800">
                                                {fullName || "—"}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-3 text-sm text-slate-600">
                                                {attendee.participant?.email ||
                                                    "—"}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-3 text-sm text-slate-600">
                                                <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                                                    {type}
                                                </span>
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-3 text-sm font-mono font-semibold uppercase tracking-wider text-slate-700">
                                                {ticketCode}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-3 text-sm text-slate-600">
                                                {joinedAt}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="px-6 py-12 text-center text-sm text-slate-500">
                        No verified attendees yet. Verified users will appear
                        here once their tickets are marked as present.
                    </div>
                )}
            </div>
        </section>
    );
}

export default function VerifyTicketPage() {
    const router = useRouter();
    const { attendees, loading, error, setAttendees, setError, setLoading } = useVerifiedAttendees();
    const { getActivityNameById, loading: ActivityLoading } = useAdminActivities();
    const { setUsers } = useUsers();

    const [activityId, setActivityId] = useState("");
    const [ticketCode, setTicketCode] = useState("");
    const [verifying, setVerifying] = useState(false);
    const [verifyError, setVerifyError] = useState(null);
    const [verifySuccess, setVerifySuccess] = useState(null);
    const [activityName, setActivityName] = useState("");
    const [inviteDialogOpen, setInviteDialogOpen] = useState(false);

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

    const updateUserPresentStatus = (userEmail, activityId) => {
        if (!userEmail || !activityId) return;

        setUsers(prevUsers => {
            return prevUsers.map(user => {
                if (user.email === userEmail) {
                    return {
                        ...user, joinedActivities: user.joinedActivities.map(activity => {
                            if (activity.id === activityId) {
                                return { ...activity, wasPresent: true };
                            }
                            return activity;
                        })
                    };
                }
                return user;
            });
        });
    };

    const fetchAttendees = async () => {
        if (!activityId) return;
        try {
            setLoading(true);
            const { data } = await axios.get("/admin/verifyTicket", {
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
            const res = await axios.post("/admin/verifyTicket", {
                activityId,
                ticketCode: ticketCode.trim().toUpperCase(),
            });
            const data = res.data;

            if (data?.status === "invited_needs_info") {
                setInvitedMeta({ ticketCode: (data.ticketCode || '').toUpperCase() });
                setInvitedForm((prev) => ({
                    ...prev,
                    email: data.email || prev.email || "",
                }));
                return;
            }

            setVerifySuccess(data.message || "Ticket verified successfully!");
            setTicketCode("");
            if (data?.attendee) {
                setAttendees((prev) => [...prev, data.attendee]);
                const userEmail = data.attendee?.participant?.email;
                if (userEmail) {
                    updateUserPresentStatus(userEmail, activityId);
                }
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
                ticketCode: (invitedMeta.ticketCode || '').toUpperCase(),
                email: invitedForm.email?.trim() || "",
                firstname: invitedForm.firstname?.trim() || "",
                lastname: invitedForm.lastname?.trim() || "",
                dateOfBirth: invitedForm.dateOfBirth || "",
                weight: invitedForm.weight || "",
                height: invitedForm.height || "",
            };
            const res = await axios.post(
                "/admin/verifyInvitedTicket",
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
                const userEmail = res.data.attendee?.participant?.email || invitedForm.email;
                if (userEmail) {
                    updateUserPresentStatus(userEmail, activityId);
                }
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

    const handleInviteSuccess = (message) => {
        setVerifySuccess(message);
        setVerifyError(null);
    };

    const canGoBackToActivity = !!activityId;
    const verifiedCount = attendees.length;
    const lastAttendee =
        attendees.length > 0 ? attendees[attendees.length - 1] : null;
    const lastVerifiedAt = lastAttendee?.joinedAt
        ? new Date(lastAttendee.joinedAt).toLocaleString()
        : null;
    const lastVerifiedName = lastAttendee?.participant
        ? [
              lastAttendee.participant.firstname,
              lastAttendee.participant.lastname,
          ]
              .filter(Boolean)
              .join(" ")
        : "";

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
            <div className="mx-auto px-4 py-8">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <button
                        className="inline-flex items-center rounded-xl border border-indigo-200 bg-white px-4 py-2 text-sm font-medium text-indigo-600 shadow-sm transition hover:border-indigo-300 hover:bg-indigo-50"
                        onClick={() =>
                            canGoBackToActivity
                                ? router.push("/admin/activities")
                                : router.push("/admin/activities")
                        }
                    >
                        <svg
                            className="mr-2 h-4 w-4"
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
                        Back to activities
                    </button>
                    <div className="text-right">
                        <h1 className="text-2xl font-semibold text-slate-900">
                            Verify tickets
                        </h1>
                    </div>
                </div>

                <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
                    <div className="space-y-6 min-w-0">
                        <div className="rounded-2xl border border-slate-200 bg-white/90 px-6 py-6 shadow-sm backdrop-blur">
                            <div className="flex flex-wrap items-start justify-between gap-4">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                        Ticket verification
                                    </p>
                                    <h2 className="mt-1 text-2xl font-semibold text-slate-900">
                                        {activityName || "Select an activity"}
                                    </h2>
                                </div>
                                {activityId && (
                                    <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-right">
                                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                            Activity ID
                                        </p>
                                        <p className="font-mono text-sm font-semibold text-slate-700">
                                            {activityId}
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="mt-6 space-y-4">
                                {verifyError && (
                                    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                        {verifyError}
                                    </div>
                                )}

                                {verifySuccess && (
                                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                                        {verifySuccess}
                                    </div>
                                )}

                                {!invitedMeta && (
                                    <>
                                        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                                            <div className="flex-1">
                                                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                    Ticket code
                                                </label>
                                                <input
                                                    type="text"
                                                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-slate-700 shadow-inner transition focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
                                                    placeholder="ABC-123"
                                                    value={ticketCode}
                                                    onChange={(e) =>
                                                        setTicketCode(
                                                            e.target.value.toUpperCase()
                                                        )
                                                    }
                                                    onKeyDown={(e) => {
                                                        if (e.key === "Enter")
                                                            handleVerify();
                                                    }}
                                                />
                                            </div>
                                            <button
                                                className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                                                onClick={handleVerify}
                                                disabled={verifying}
                                            >
                                                {verifying
                                                    ? "Verifying..."
                                                    : "Verify ticket"}
                                            </button>
                                        </div>
                                        <p className="text-xs text-slate-400">
                                            Tip: press Enter to submit faster.
                                        </p>
                                    </>
                                )}

                                {invitedMeta && (
                                    <div className="rounded-2xl border border-indigo-200 bg-indigo-50/70 px-5 py-5">
                                        <div className="flex flex-wrap items-center justify-between gap-3">
                                            <div>
                                                <h3 className="text-base font-semibold text-indigo-800">
                                                    Invited attendee detected
                                                </h3>
                                                <p className="mt-1 text-sm text-indigo-700/90">
                                                    Complete their profile to
                                                    finalise the check-in.
                                                </p>
                                            </div>
                                            <span className="inline-flex items-center rounded-full bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-indigo-700">
                                                Ticket{" "}
                                                {(invitedMeta.ticketCode || "").toUpperCase()}
                                            </span>
                                        </div>
                                        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                                            <div>
                                                <label className="text-xs font-semibold uppercase tracking-wide text-indigo-700">
                                                    Email
                                                </label>
                                                <input
                                                    type="email"
                                                    className="mt-1 w-full rounded-xl border border-indigo-200 bg-white px-4 py-2.5 text-sm text-indigo-900 shadow-sm transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
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
                                                <label className="text-xs font-semibold uppercase tracking-wide text-indigo-700">
                                                    First name
                                                </label>
                                                <input
                                                    type="text"
                                                    className="mt-1 w-full rounded-xl border border-indigo-200 bg-white px-4 py-2.5 text-sm text-indigo-900 shadow-sm transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
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
                                                <label className="text-xs font-semibold uppercase tracking-wide text-indigo-700">
                                                    Last name
                                                </label>
                                                <input
                                                    type="text"
                                                    className="mt-1 w-full rounded-xl border border-indigo-200 bg-white px-4 py-2.5 text-sm text-indigo-900 shadow-sm transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
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
                                                <label className="text-xs font-semibold uppercase tracking-wide text-indigo-700">
                                                    Date of birth
                                                </label>
                                                <input
                                                    type="date"
                                                    className="mt-1 w-full rounded-xl border border-indigo-200 bg-white px-4 py-2.5 text-sm text-indigo-900 shadow-sm transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
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
                                                <label className="text-xs font-semibold uppercase tracking-wide text-indigo-700">
                                                    Weight (kg)
                                                </label>
                                                <input
                                                    type="number"
                                                    className="mt-1 w-full rounded-xl border border-indigo-200 bg-white px-4 py-2.5 text-sm text-indigo-900 shadow-sm transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
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
                                                <label className="text-xs font-semibold uppercase tracking-wide text-indigo-700">
                                                    Height (cm)
                                                </label>
                                                <input
                                                    type="number"
                                                    className="mt-1 w-full rounded-xl border border-indigo-200 bg-white px-4 py-2.5 text-sm text-indigo-900 shadow-sm transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
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

                                        <div className="mt-5 flex flex-wrap items-center gap-3">
                                            <button
                                                className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                                                onClick={handleSubmitInvitedInfo}
                                                disabled={submittingInvited}
                                            >
                                                {submittingInvited
                                                    ? "Submitting..."
                                                    : "Complete check-in"}
                                            </button>
                                            <button
                                                type="button"
                                                className="inline-flex items-center justify-center rounded-xl border border-indigo-200 bg-white px-4 py-2.5 text-sm font-semibold text-indigo-600 transition hover:border-indigo-300 hover:bg-indigo-50"
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

                        <VerifiedAttendeesTable
                            attendees={attendees}
                            loading={loading}
                            ActivityLoading={ActivityLoading}
                            error={error}
                        />
                    </div>

                    <aside className="space-y-6">
                        <div className="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm backdrop-blur">
                            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                Activity snapshot
                            </h3>
                            <div className="mt-4 space-y-4 text-sm text-slate-600">
                                <div className="flex items-start justify-between gap-3">
                                    <span>Activity</span>
                                    <span className="text-right font-medium text-slate-900">
                                        {activityName || "Not available"}
                                    </span>
                                </div>
                                <div className="flex items-start justify-between gap-3">
                                    <span>Verified attendees</span>
                                    <span className="text-right font-semibold text-slate-900">
                                        {verifiedCount}
                                    </span>
                                </div>
                                <div className="flex items-start justify-between gap-3">
                                    <span>Last check-in</span>
                                    <span className="text-right text-slate-700">
                                        {lastVerifiedAt
                                            ? `${lastVerifiedAt}${
                                                  lastVerifiedName
                                                      ? ` • ${lastVerifiedName}`
                                                      : ""
                                              }`
                                            : "Waiting for first check-in"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-6 shadow-sm">
                            <h3 className="text-lg font-semibold text-indigo-800">
                                Quick invitation
                            </h3>
                            <p className="mt-2 text-sm text-indigo-700">
                                Send or Re-send tickets to participants.
                            </p>
                            <ul className="mt-4 space-y-1 text-xs text-indigo-700/90">
                                <li>• Invite un-registered participants.</li>
                                <li>• Regenerate and send new tickets.</li>
                            </ul>
                            <button
                                type="button"
                                className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                                onClick={() => {
                                    if (!activityId) return;
                                    setVerifyError(null);
                                    setVerifySuccess(null);
                                    setInviteDialogOpen(true);
                                }}
                                disabled={!activityId}
                            >
                                Send invitations
                            </button>
                            {!activityId && (
                                <p className="mt-3 text-xs text-indigo-600/80">
                                    Open this page from an activity to enable
                                    invitations.
                                </p>
                            )}
                        </div>
                    </aside>
                </div>
            </div>

            <InviteParticipantsDialogAdmin
                open={inviteDialogOpen}
                onClose={() => setInviteDialogOpen(false)}
                activityId={activityId}
                onSuccess={handleInviteSuccess}
            />
        </div>
    );
}
