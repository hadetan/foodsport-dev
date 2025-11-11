import React, { useEffect, useMemo, useState } from "react";
import axios from "@/utils/axios/api";

const emptyInvitee = { email: "" };

const emailRegex =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@(([^<>()[\]\\.,;:\s@"]+\.)+[^<>()[\]\\.,;:\s@"]{2,})$/i;

export default function InviteParticipantsDialogAdmin({
    open,
    onClose,
    activityId,
    onSuccess,
}) {
    const [invitees, setInvitees] = useState([{ ...emptyInvitee }]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!open) {
            setInvitees([{ ...emptyInvitee }]);
            setError("");
            setLoading(false);
        }
    }, [open]);

    const allEmails = useMemo(
        () =>
            invitees
                .map((invitee) => invitee.email.trim().toLowerCase())
                .filter(Boolean),
        [invitees]
    );

    if (!open) return null;

    const updateInvitee = (index, value) => {
        setInvitees((prev) =>
            prev.map((invitee, i) =>
                i === index ? { ...invitee, email: value } : invitee
            )
        );
    };

    const addInviteeField = () => {
        setInvitees((prev) => [...prev, { ...emptyInvitee }]);
    };

    const removeInviteeField = (index) => {
        setInvitees((prev) => prev.filter((_, i) => i !== index));
    };

    const validateEmails = () => {
        if (!activityId) {
            setError("Missing activity context. Please reload the page.");
            return false;
        }
        if (!allEmails.length) {
            setError("Enter at least one email address.");
            return false;
        }
        for (const email of allEmails) {
            if (!emailRegex.test(email)) {
                setError(`Invalid email: ${email}`);
                return false;
            }
        }
        return true;
    };

    const handleInvite = async () => {
        if (!validateEmails()) {
            return;
        }
        setLoading(true);
        setError("");
        try {
            const payload = {
                activityId,
                partners: allEmails,
            };
            const { data } = await axios.post(
                "/admin/activities/inviteParticipants",
                payload
            );
            if (onSuccess) {
                onSuccess(
                    data?.message || "Invitations sent successfully.",
                    data?.recipients || allEmails
                );
            }
            onClose();
        } catch (err) {
            const message =
                err?.response?.data?.error || "Failed to send invitations.";
            const details = err?.response?.data?.details;
            setError(details ? `${message}: ${details}` : message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4 py-6">
            <div className="relative w-full max-w-xl rounded-xl bg-white shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">
                            Invite Participants
                        </h2>
                        <p className="text-sm text-slate-500">
                            Send ticket codes to participants who are not yet in
                            the app.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => {
                            if (!loading) onClose();
                        }}
                        className="rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
                        aria-label="Close dialog"
                    >
                        <span className="text-xl leading-none">&times;</span>
                    </button>
                </div>

                <div className="px-6 py-5">
                    {error && (
                        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        {invitees.map((invitee, index) => (
                            <div key={index} className="flex gap-3">
                                <input
                                    type="email"
                                    className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                                    placeholder="participant@email.com"
                                    value={invitee.email}
                                    onChange={(event) =>
                                        updateInvitee(index, event.target.value)
                                    }
                                    required
                                />
                                {invitees.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeInviteeField(index)}
                                        className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-500 transition hover:border-red-400 hover:text-red-600"
                                        disabled={loading}
                                    >
                                        Remove
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="mt-4">
                        <button
                            type="button"
                            onClick={addInviteeField}
                            className="text-sm font-medium text-indigo-600 transition hover:text-indigo-700"
                            disabled={loading}
                        >
                            + Add another email
                        </button>
                    </div>
                </div>

                <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-6 py-4">
                    <button
                        type="button"
                        onClick={() => {
                            if (!loading) onClose();
                        }}
                        className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleInvite}
                        className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-70"
                        disabled={loading}
                    >
                        {loading ? "Sending..." : "Send invitations"}
                    </button>
                </div>
            </div>
        </div>
    );
}

