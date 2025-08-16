"use client";

import { useState, useRef } from "react";
import TiptapEditor from "@/app/shared/components/TiptapEditor";
import { useUsers } from "@/app/shared/contexts/usersContenxt";

// User picker component
const UserPicker = ({ selectedUsers, setSelectedUsers }) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const { users, loading } = useUsers();

    // Helper to validate email format
    const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    const handleSearch = (e) => {
        const term = e.target.value;
        setSearchTerm(term);

        if (term.length < 1) {
            setSearchResults([]);
            return;
        }

        // Filter users from the context based on the search term
        // Show results as soon as user starts typing (length >= 1)
        const filteredUsers = users.filter(
            (user) =>
                (user.name?.toLowerCase().includes(term.toLowerCase()) ||
                    user.email?.toLowerCase().includes(term.toLowerCase())) &&
                // Don't show already selected users
                !selectedUsers.some((selected) => selected.email === user.email)
        );

        // Limit results to a reasonable number for better UX
        setSearchResults(filteredUsers.slice(0, 10));
    };

    const selectUser = (user) => {
        if (!selectedUsers.some((selected) => selected.email === user.email)) {
            setSelectedUsers([...selectedUsers, user]);
        }
        setSearchTerm("");
        setSearchResults([]);
    };

    const addEmail = () => {
        const email = searchTerm.trim();
        if (
            isValidEmail(email) &&
            !selectedUsers.some((u) => u.email === email)
        ) {
            setSelectedUsers([
                ...selectedUsers,
                { id: email, name: email, email },
            ]);
            setSearchTerm("");
            setSearchResults([]);
        }
    };

    const removeUser = (userId) => {
        setSelectedUsers(selectedUsers.filter((user) => user.id !== userId));
    };

    return (
        <div className="form-control w-full">
            <div className="flex flex-wrap gap-2 mb-2">
                {selectedUsers.map((user) => (
                    <div
                        key={user.id}
                        className="badge badge-primary gap-2 flex items-center"
                    >
                        <div className="flex flex-col items-start">
                            <span>{user.name}</span>
                            <span className="text-xs opacity-70">
                                {user.email}
                            </span>
                        </div>
                        <button
                            onClick={() => removeUser(user.id)}
                            className="btn btn-xs btn-circle"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                className="w-4 h-4 stroke-current"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M6 18L18 6M6 6l12 12"
                                ></path>
                            </svg>
                        </button>
                    </div>
                ))}
            </div>
            <div className="relative flex items-center gap-2 ">
                <input
                    type="text"
                    placeholder="Add email or search..."
                    className="input input-bordered input-l w-48"
                    value={searchTerm}
                    onChange={handleSearch}
                    onKeyDown={(e) => {
                        if (
                            e.key === "Enter" &&
                            isValidEmail(searchTerm.trim())
                        ) {
                            e.preventDefault();
                            addEmail();
                        }
                    }}
                />
                {loading && (
                    <div className="absolute right-3 top-2">
                        <span className="loading loading-spinner loading-sm"></span>
                    </div>
                )}
            </div>
            {searchResults.length > 0 && (
                <ul className="menu bg-base-100 shadow-lg rounded-box w-64 max-h-64 overflow-y-auto absolute z-10 mt-1 border border-base-800">
                    {searchResults.map((user, idx) => (
                        <li
                            key={user.id}
                            className={
                                idx !== searchResults.length - 1
                                    ? "border-b border-base-800"
                                    : ""
                            }
                        >
                            <a
                                onClick={() => selectUser(user)}
                                className="hover:bg-base-200 focus:bg-base-200 px-4 py-2 cursor-pointer flex flex-col"
                            >
                                <span className="font-semibold">
                                    {user.name}
                                </span>
                                <span className="text-sm opacity-70">
                                    {user.email}
                                </span>
                            </a>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

const EmailPreview = ({ subject, content, recipients, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="card bg-base-100 w-full max-w-3xl shadow-xl">
                <div className="card-body">
                    <h2 className="card-title">Email Preview</h2>

                    <div className="divider my-2"></div>

                    <div className="bg-base-200 p-4 rounded-lg">
                        <div className="mb-4">
                            <strong>To:</strong>{" "}
                            {recipients.map((r) => r.name).join(", ")}
                        </div>
                        <div className="mb-4">
                            <strong>Subject:</strong> {subject}
                        </div>
                        <div className="divider my-2"></div>
                        <div className="prose max-w-none">
                            <div
                                dangerouslySetInnerHTML={{ __html: content }}
                            />
                        </div>
                    </div>

                    <div className="card-actions justify-end mt-4">
                        <button className="btn btn-primary" onClick={onClose}>
                            Close Preview
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

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
            // In a real implementation, this would be an API call
            // Mocking API call for demonstration
            await new Promise((resolve) => setTimeout(resolve, 1500));

            // Success feedback
            setFeedback({
                show: true,
                type: "success",
                message: "Email sent successfully!",
            });

            // Reset form
            setSubject("");
            setContent("");
            setSelectedUsers([]);
            formRef.current.reset();
        } catch (error) {
            setFeedback({
                show: true,
                type: "error",
                message: "Failed to send email. Please try again later.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Send Email to Users</h1>
            </div>

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

            <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                    <form
                        ref={formRef}
                        onSubmit={handleSubmit}
                        className="grid grid-cols-1 md:grid-cols-12 gap-y-6 gap-x-0"
                    >
                        {/* Recipients */}
                        <div className="md:col-span-2 flex items-center justify-end pr-4">
                            <span className="label-text font-medium">
                                Recipients
                            </span>
                        </div>
                        <div className="md:col-span-10">
                            <UserPicker
                                selectedUsers={selectedUsers}
                                setSelectedUsers={setSelectedUsers}
                            />
                        </div>

                        {/* Subject */}
                        <div className="md:col-span-2 flex items-center justify-end pr-4">
                            <span className="label-text font-medium">
                                Subject
                            </span>
                        </div>
                        <div className="md:col-span-10">
                            <input
                                type="text"
                                placeholder="Email subject"
                                className="input input-bordered input-lg w-xl"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                maxLength="150"
                                required
                            />
                            <label className="label">
                                <span className="label-text-alt">
                                    {subject.length}/150 characters
                                </span>
                            </label>
                        </div>

                        {/* Email Body */}
                        <div className="md:col-span-2 flex items-center justify-end pr-4">
                            <span className="label-text font-medium">
                                Email Body
                            </span>
                        </div>
                        <div className="md:col-span-10">
                            <div className="border border-base-300 rounded-lg bg-base-200 p-2">
                                <TiptapEditor
                                    value={content}
                                    onChange={setContent}
                                />
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="md:col-span-2"></div>
                        <div className="md:col-span-10">
                            <div className="card-actions justify-end mt-6">
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
