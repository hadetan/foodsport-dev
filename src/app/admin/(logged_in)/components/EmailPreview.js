import DOMPurify from "dompurify";
import React from "react";

const EmailPreview = ({ subject, content, recipients, onClose }) => {
    const sanitizedContent = DOMPurify.sanitize(content);
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
                                dangerouslySetInnerHTML={{ __html: sanitizedContent }}
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

export default EmailPreview;
