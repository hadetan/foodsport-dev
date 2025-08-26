"use client";

import { useState, useRef } from "react";
import UsersDropdown from "../components/UsersDropdown";
import EmailPreview from "../components/EmailPreview";
import TiptapEditor from "@/app/shared/components/TiptapEditor";
import UserPicker from "../components/UserPicker";
import axios from "axios";

export default function AdminEmailPage() {
    const [subject, setSubject] = useState("");
    const [content, setContent] = useState("");
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [feedback, setFeedback] = useState({
        show: false,
        type: "",
        message: "",
    });

    const formRef = useRef(null);

    const validateForm = () => {
        if (selectedUsers.length === 0) {
            setFeedback({
                show: true,
                type: "error",
                message: "Please select at least one recipient",
            });
            return false;
        }

        if (!subject || subject.trim().length === 0) {
            setFeedback({
                show: true,
                type: "error",
                message: "Subject is required",
            });
            return false;
        }

        if (subject.length > 150) {
            setFeedback({
                show: true,
                type: "error",
                message: "Subject must be less than 150 characters",
            });
            return false;
        }

        if (!content || content.replace(/<[^>]*>/g, "").trim().length < 10) {
            setFeedback({
                show: true,
                type: "error",
                message: "Email body must contain at least 10 characters",
            });
            return false;
        }

        return true;
    };

    const handlePreview = (e) => {
        e.preventDefault();

        if (validateForm()) {
            setShowPreview(true);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsLoading(true);
        setFeedback({ show: false, type: "", message: "" });

        try {
            // Call the backend API to send the email using axios
            const response = await axios.post("/api/admin/email/custom_email", {
                to: selectedUsers.map((u) => u.email),
                subject,
                html: content,
            });

            const data = response.data;

            setFeedback({
                show: true,
                type: "success",
                message: "Email sent successfully!",
            });

            setSubject("");
            setContent("");
            setSelectedUsers([]);
            formRef.current.reset();
        } catch (error) {
            setFeedback({
                show: true,
                type: "error",
                message:
                    error.response?.data?.error ||
                    "Failed to send email. Please try again later.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const removeUser = (userId) => {
        setSelectedUsers(selectedUsers.filter((user) => user.id !== userId));
    };

    return (
        <div className="h-screen flex flex-col items-stretch justify-start bg-base-100 py-0">
            <div className="w-full h-full bg-base-200 rounded-2xl shadow-lg border border-base-300 px-0 flex flex-col flex-grow">
                <div className="flex items-center gap-2 px-16 pt-10 pb-2">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 48 48"
                        className="w-8 h-8 text-red-500"
                    >
                        <path
                            fill="currentColor"
                            d="M44 8v32H4V8l20 16Zm-2.5 0H6.5L24 21.95Z"
                        />
                    </svg>
                    <h1 className="text-2xl font-semibold tracking-tight text-base-content">
                        Send New Email
                    </h1>
                </div>
                <div className="divider my-0"></div>
                <div className="px-16 pb-12 pt-2 flex-grow flex flex-col">
                    {feedback.show && (
                        <div
                            className={`alert ${
                                feedback.type === "error"
                                    ? "alert-error"
                                    : "alert-success"
                            } mb-4`}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                className="stroke-current shrink-0 w-6 h-6"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d={
                                        feedback.type === "error"
                                            ? "M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                                            : "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                    }
                                ></path>
                            </svg>
                            <span>{feedback.message}</span>
                            <button
                                className="btn btn-sm"
                                onClick={() => setFeedback({ show: false })}
                            >
                                Dismiss
                            </button>
                        </div>
                    )}
                    <form
                        ref={formRef}
                        onSubmit={handleSubmit}
                        className="flex flex-col gap-4"
                    >
                        {/* Recipients + Actions Row */}
                        <div>
                            <label className="block text-xl font-medium text-base-content mb-1 pl-2">
                                To:
                            </label>
                            <div className="flex flex-row items-end gap-2 w-full">
                                <div className="flex-1 min-w-0">
                                    <UserPicker
                                        selectedUsers={selectedUsers}
                                        setSelectedUsers={setSelectedUsers}
                                    />
                                    <UsersDropdown
                                        users={selectedUsers}
                                        onRemove={removeUser}
                                    />
                                </div>
                                <div className="flex flex-row gap-2 pb-1">
                                    <button
                                        type="button"
                                        className="btn btn-outline"
                                        onClick={handlePreview}
                                        disabled={isLoading}
                                    >
                                        Preview Email
                                    </button>

                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <>
                                                <span className="loading loading-spinner loading-sm"></span>
                                                Sending...
                                            </>
                                        ) : (
                                            "Send Email"
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Subject */}
                        <div>
                            <label className="block text-xl font-medium text-base-content mb-1 pl-2">
                                Subject:
                            </label>
                            <input
                                type="text"
                                placeholder="Email subject"
                                className="input input-bordered input-lg w-full rounded-[2px] bg-base-100 text-base-content"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                maxLength="150"
                                required
                            />
                            <label className="label">
                                <span className="label-text-alt text-sm text-base-content">
                                    {subject.length}/150 characters
                                </span>
                            </label>
                        </div>

                        {/* Email Body */}
                        <div>
                            <label className="block text-xl font-medium text-base-content mb-1 pl-2">
                                Email Body:
                            </label>
                            <div className="rounded-lg border border-base-300 bg-base-100">
                                <TiptapEditor
                                    value={content}
                                    onChange={setContent}
                                />
                            </div>
                        </div>
                    </form>
                </div>
            </div>

            {showPreview && (
                <EmailPreview
                    subject={subject}
                    content={content}
                    recipients={selectedUsers}
                    onClose={() => setShowPreview(false)}
                />
            )}
        </div>
    );
}
