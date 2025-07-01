"use client";

export default function ForbiddenPage() {
    return (
        <div className="hero min-h-screen bg-base-200">
            <div className="hero-content text-center">
                <div className="max-w-md">
                    <h1 className="text-5xl font-bold text-error">403</h1>
                    <p className="py-6">
                        Access Forbidden. You do not have permission to view
                        this page.
                    </p>
                    <a href="/admin" className="btn btn-outline">
                        Back to Dashboard
                    </a>
                </div>
            </div>
        </div>
    );
}
