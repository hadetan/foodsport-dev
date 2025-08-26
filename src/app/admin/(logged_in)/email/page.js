"use client";

import { useState, useRef, useEffect } from "react";
import UsersDropdown from "../components/UsersDropdown";
import EmailPreview from "../components/EmailPreview";
import TiptapEditor from "@/app/shared/components/TiptapEditor";
import UserPicker from "../components/UserPicker";
import axios from "axios";
import Field from "@/app/shared/components/Field";

function TemplatePreviewModal({ open, onClose, templateId, params }) {
    const [html, setHtml] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!open) return;
        setLoading(true);
        setError("");
        setHtml("");
        // Only send params if it has at least one non-empty value
        const filteredParams = Object.fromEntries(
            Object.entries(params || {}).filter(
                ([_, v]) =>
                    v !== undefined && v !== null && String(v).trim() !== ""
            )
        );
        (async () => {
            try {
                const res = await axios.post(
                    "/api/admin/email/template_preview",
                    {
                        templateId,
                        ...(Object.keys(filteredParams).length > 0
                            ? { params: filteredParams }
                            : {}),
                    }
                );
                setHtml(res.data.html || "");
            } catch (err) {
                setError(err.response?.data?.error || "Failed to load preview");
            } finally {
                setLoading(false);
            }
        })();
    }, [open, templateId, params]);

    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-lg shadow-lg max-w-3xl w-full p-6 relative">
                <button
                    className="absolute top-2 right-2 btn btn-sm"
                    onClick={onClose}
                >
                    Close
                </button>
                <h2 className="text-xl font-semibold mb-4">Template Preview</h2>
                {loading && <div>Loading preview...</div>}
                {error && <div className="alert alert-error mb-2">{error}</div>}
                {!loading && !error && html && (
                    <iframe
                        title="Template Preview"
                        srcDoc={html}
                        className="w-full h-[500px] border rounded"
                    />
                )}
            </div>
        </div>
    );
}

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

    // Tab state: "custom" or "template"
    const [activeTab, setActiveTab] = useState("custom");

    // Template email state
    const [templates, setTemplates] = useState([]);
    const [selectedTemplateId, setSelectedTemplateId] = useState(null);
    const [isTemplatesLoading, setIsTemplatesLoading] = useState(false);
    const [templatesError, setTemplatesError] = useState("");
    const [templateVars, setTemplateVars] = useState([]);
    const [params, setParams] = useState({});
    const [isVarsLoading, setIsVarsLoading] = useState(false);
    const [varsError, setVarsError] = useState("");

    // Add state for template email sending
    const [isTemplateSending, setIsTemplateSending] = useState(false);
    const [templateSendFeedback, setTemplateSendFeedback] = useState({
        show: false,
        type: "",
        message: "",
    });

    // Add state for preview modal
    const [showTemplatePreview, setShowTemplatePreview] = useState(false);

    useEffect(() => {
        if (activeTab === "template") {
            setIsTemplatesLoading(true);
            setTemplatesError("");
            axios
                .get("/api/admin/email/all_templates")
                .then((res) => {
                    setTemplates(res.data.templates || []);
                })
                .catch((err) => {
                    setTemplatesError(
                        err.response?.data?.error || "Failed to load templates"
                    );
                })
                .finally(() => setIsTemplatesLoading(false));
        }
    }, [activeTab]);

    useEffect(() => {
        if (selectedTemplateId) {
            setIsVarsLoading(true);
            setVarsError("");
            setTemplateVars([]);
            setParams({});
            axios
                .post("/api/admin/email/template_vars", {
                    templateId: selectedTemplateId,
                })
                .then((res) => {
                    setTemplateVars(res.data.variables || []);
                })
                .catch((err) => {
                    setVarsError(
                        err.response?.data?.error ||
                            "Failed to load template variables"
                    );
                })
                .finally(() => setIsVarsLoading(false));
        } else {
            setTemplateVars([]);
            setParams({});
        }
    }, [selectedTemplateId]);

    function isRichText(varName) {
        // You can customize which fields should be rich text editors
        const richFields = ["description", "body", "content"];
        return richFields.includes(varName.toLowerCase());
    }

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

    // Template email send handler
    const handleTemplateSend = async (e) => {
        e.preventDefault();
        setTemplateSendFeedback({ show: false, type: "", message: "" });
        if (!selectedUsers.length) {
            setTemplateSendFeedback({
                show: true,
                type: "error",
                message: "Please select at least one recipient.",
            });
            return;
        }
        if (!selectedTemplateId) {
            setTemplateSendFeedback({
                show: true,
                type: "error",
                message: "Please select a template.",
            });
            return;
        }
        // Validate all required params are filled
        const filledParams = {};
        for (const v of templateVars) {
            if (
                !params[v] ||
                (typeof params[v] === "string" && params[v].trim() === "")
            ) {
                setTemplateSendFeedback({
                    show: true,
                    type: "error",
                    message: `Please fill the '${v}' field.`,
                });
                return;
            }
            filledParams[v] = params[v];
        }
        setIsTemplateSending(true);
        try {
            const response = await axios.post(
                "/api/admin/email/template_email",
                {
                    to: selectedUsers.map((u) => u.email),
                    templateId: selectedTemplateId,
                    params: filledParams,
                }
            );
            setTemplateSendFeedback({
                show: true,
                type: "success",
                message: "Template email sent successfully!",
            });
            setParams({});
            setSelectedUsers([]);
        } catch (error) {
            setTemplateSendFeedback({
                show: true,
                type: "error",
                message:
                    error.response?.data?.error ||
                    "Failed to send template email.",
            });
        } finally {
            setIsTemplateSending(false);
        }
    };

    const removeUser = (userId) => {
        setSelectedUsers(selectedUsers.filter((user) => user.id !== userId));
    };

    return (
        <div className="h-screen flex flex-col items-stretch justify-start bg-base-100 py-0">
            <div className="w-full h-full bg-base-200 rounded-2xl shadow-lg border border-base-300 px-0 flex flex-col flex-grow">
                {/* Tabs */}
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
                {/* Tab buttons */}
                <div className="px-16 pt-2">
                    <div className="flex gap-2 mb-6">
                        <button
                            className={`px-6 py-2 rounded-lg border-2 font-semibold transition
                                ${
                                    activeTab === "custom"
                                        ? "bg-primary text-white border-primary"
                                        : "bg-background text-primary border-primary"
                                }
                                hover:bg-secondary hover:text-white hover:border-primary-light
                            `}
                            type="button"
                            onClick={() => setActiveTab("custom")}
                        >
                            Custom email
                        </button>
                        <button
                            className={`px-6 py-2 rounded-lg border-2 font-semibold transition
                                ${
                                    activeTab === "template"
                                        ? "bg-primary text-white border-primary"
                                        : "bg-background text-primary border-primary"
                                }
                                hover:bg-secondary hover:text-white hover:border-primary-light
                            `}
                            type="button"
                            onClick={() => setActiveTab("template")}
                        >
                            Template email
                        </button>
                    </div>
                </div>
                <div className="divider my-0"></div>
                <div className="px-16 pb-12 pt-2 flex-grow flex flex-col">
                    {/* Only show the custom email form if the custom tab is active */}
                    {activeTab === "custom" && (
                        <>
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
                                        onClick={() =>
                                            setFeedback({ show: false })
                                        }
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
                                                setSelectedUsers={
                                                    setSelectedUsers
                                                }
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
                                        onChange={(e) =>
                                            setSubject(e.target.value)
                                        }
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
                        </>
                    )}
                    {/* Placeholder for Template email tab */}
                    {activeTab === "template" && (
                        <div className="flex flex-col items-center justify-center h-full text-base-content w-full">
                            <div className="w-full max-w-xl">
                                {/* Feedback for template email send */}
                                {templateSendFeedback.show && (
                                    <div
                                        className={`alert ${
                                            templateSendFeedback.type ===
                                            "error"
                                                ? "alert-error"
                                                : "alert-success"
                                        } mb-4`}
                                    >
                                        <span>
                                            {templateSendFeedback.message}
                                        </span>
                                        <button
                                            className="btn btn-sm"
                                            onClick={() =>
                                                setTemplateSendFeedback({
                                                    show: false,
                                                })
                                            }
                                        >
                                            Dismiss
                                        </button>
                                    </div>
                                )}
                                {/* Recipients for template email */}
                                <label className="block text-xl font-medium text-base-content mb-1 pl-2">
                                    To:
                                </label>
                                <div className="mb-4">
                                    <UserPicker
                                        selectedUsers={selectedUsers}
                                        setSelectedUsers={setSelectedUsers}
                                    />
                                    <UsersDropdown
                                        users={selectedUsers}
                                        onRemove={removeUser}
                                    />
                                </div>
                                {/* Template select */}
                                <label className="block text-xl font-medium text-base-content mb-2 pl-2">
                                    Select Template:
                                </label>
                                <select
                                    className="select select-bordered w-full text-base-content"
                                    value={selectedTemplateId || ""}
                                    onChange={(e) =>
                                        setSelectedTemplateId(e.target.value)
                                    }
                                    disabled={
                                        isTemplatesLoading ||
                                        templates.length === 0
                                    }
                                >
                                    <option value="" disabled>
                                        {isTemplatesLoading
                                            ? "Loading templates..."
                                            : "Choose a template"}
                                    </option>
                                    {templates.map((t) => (
                                        <option key={t.id} value={t.id}>
                                            {t.name}
                                        </option>
                                    ))}
                                </select>
                                {templatesError && (
                                    <div className="alert alert-error mt-4">
                                        {templatesError}
                                    </div>
                                )}
                                {selectedTemplateId && (
                                    <div className="mt-4 text-success">
                                        Selected template ID:{" "}
                                        {selectedTemplateId}
                                    </div>
                                )}
                                {selectedTemplateId && (
                                    <form
                                        className="mt-6 flex flex-col gap-4"
                                        onSubmit={handleTemplateSend}
                                    >
                                        <h2 className="text-lg font-semibold mb-2">
                                            Template Variables
                                        </h2>
                                        {isVarsLoading && (
                                            <div className="text-base-content">
                                                Loading variables...
                                            </div>
                                        )}
                                        {varsError && (
                                            <div className="alert alert-error mt-2">
                                                {varsError}
                                            </div>
                                        )}
                                        {!isVarsLoading &&
                                            !varsError &&
                                            templateVars.length === 0 && (
                                                <div className="text-base-content">
                                                    No variables required for
                                                    this template.
                                                </div>
                                            )}
                                        <div className="flex flex-col gap-4">
                                            {templateVars.map((varName) => (
                                                <Field
                                                    key={varName}
                                                    label={varName}
                                                    value={
                                                        params[varName] || ""
                                                    }
                                                    onChange={(val) =>
                                                        setParams((p) => ({
                                                            ...p,
                                                            [varName]: val,
                                                        }))
                                                    }
                                                    editor={isRichText(varName)}
                                                />
                                            ))}
                                        </div>
                                        <div className="flex flex-row gap-2 mt-4">
                                            <button
                                                type="button"
                                                className="btn btn-outline"
                                                onClick={() =>
                                                    setShowTemplatePreview(true)
                                                }
                                                disabled={isTemplateSending}
                                            >
                                                Preview Template
                                            </button>
                                            <button
                                                type="submit"
                                                className="btn btn-primary"
                                                disabled={isTemplateSending}
                                            >
                                                {isTemplateSending ? (
                                                    <span className="loading loading-spinner loading-sm"></span>
                                                ) : (
                                                    "Send Template Email"
                                                )}
                                            </button>
                                        </div>
                                    </form>
                                )}
                                <TemplatePreviewModal
                                    open={showTemplatePreview}
                                    onClose={() =>
                                        setShowTemplatePreview(false)
                                    }
                                    templateId={selectedTemplateId}
                                    params={params}
                                />
                            </div>
                        </div>
                    )}
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
