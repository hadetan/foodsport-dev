"use client";

export default function InternalErrorPage() {
    return (
        <div className="hero min-h-screen bg-base-200">
            <div className="hero-content text-center">
                <div className="max-w-md">
                    <h1 className="text-5xl font-bold text-error">500</h1>
                    <p className="py-6">
                        Internal Server Error. Something went wrong on our end.
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        className="btn btn-outline mr-2"
                    >
                        Try Again
                    </button>
                    <a href="/admin" className="btn btn-outline">
                        Back to Dashboard
                    </a>
                </div>
            </div>
        </div>
    );
}
