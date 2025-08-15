"use client";

import { useState, useRef } from "react";

// User picker component
const UserPicker = ({ selectedUsers, setSelectedUsers }) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // Helper to validate email format
    const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    const handleSearch = async (e) => {
        const term = e.target.value;
        setSearchTerm(term);

        if (term.length < 2) {
            setSearchResults([]);
            return;
        }

        setIsLoading(true);
        // In a real implementation, this would be an API call
        // Mocking for demonstration
        setTimeout(() => {
            setSearchResults(
                [
                    {
                        id: 1,
                        name: "Jane Smith",
                        email: "jane.smith@example.com",
                    },
                    { id: 2, name: "John Doe", email: "john.doe@example.com" },
                    {
                        id: 3,
                        name: "Alice Johnson",
                        email: "alice@example.com",
                    },
                ].filter(
                    (user) =>
                        user.name.toLowerCase().includes(term.toLowerCase()) ||
                        user.email.toLowerCase().includes(term.toLowerCase())
                )
            );
            setIsLoading(false);
        }, 500);
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
            <label className="label">
                <span className="label-text">Recipients</span>
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
                {selectedUsers.map((user) => (
                    <div key={user.id} className="badge badge-primary gap-2">
                        {user.name}
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
            <div className="relative flex items-center gap-2">
                <input
                    type="text"
                    placeholder="Add email or search..."
                    className="input input-bordered input-sm w-48"
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
                <button
                    type="button"
                    className="btn btn-sm btn-circle btn-outline"
                    onClick={addEmail}
                    disabled={!isValidEmail(searchTerm.trim())}
                    title="Add email"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4v16m8-8H4"
                        />
                    </svg>
                </button>
                {isLoading && (
                    <div className="absolute right-3 top-2">
                        <span className="loading loading-spinner loading-sm"></span>
                    </div>
                )}
            </div>
            {searchResults.length > 0 && (
                <ul className="menu bg-base-100 shadow-lg rounded-box w-full absolute z-10 mt-1">
                    {searchResults.map((user) => (
                        <li key={user.id}>
                            <a onClick={() => selectUser(user)}>
                                <div>
                                    <div className="font-semibold">
                                        {user.name}
                                    </div>
                                    <div className="text-sm opacity-70">
                                        {user.email}
                                    </div>
                                </div>
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
                        className="flex flex-col gap-6"
                    >
                        <UserPicker
                            selectedUsers={selectedUsers}
                            setSelectedUsers={setSelectedUsers}
                        />

                        <div className="form-control w-full">
                            <label className="label mb-0">
                                <span className="label-text">Subject</span>
                            </label>
                            <input
                                type="text"
                                placeholder="Email subject"
                                className="input input-bordered input-md w-full"
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

                        <div className="form-control w-full">
                            <label className="label mb-0">
                                <span className="label-text">Email Body</span>
                            </label>
                            <textarea
                                className="textarea textarea-bordered w-full h-64"
                                placeholder="Compose your email here..."
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                minLength={10}
                                required
                            />
                        </div>

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
