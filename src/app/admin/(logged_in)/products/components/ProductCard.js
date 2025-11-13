"use client";

import { Tag, Star, CalendarClock } from "lucide-react";

const formatDateTime = (value) => {
    if (!value) return "—";
    try {
        return new Date(value).toLocaleString("en-HK", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    } catch (error) {
        return String(value);
    }
};

const formatPrice = (price) => {
    if (price === null || price === undefined || price === "") return "—";
    const numeric = Number(price);
    if (Number.isNaN(numeric)) return String(price);
    return `${numeric} Points`;
};

export default function ProductCard({ product }) {
    if (!product) {
        return (
            <div className="border rounded-lg p-6 bg-white shadow-sm">
                <p className="text-sm text-gray-500">Product data is not available.</p>
            </div>
        );
    }

    const {
        productImageUrl,
        title,
        summary,
        description,
        price,
        category,
        isFeatured,
        createdAt,
        updatedAt,
    } = product;

    const categoryName = category?.name;

    return (
        <article className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
            <div className="flex flex-col md:flex-row items-start gap-6 p-6">
                {/* Left: fixed square image */}
                <div className="flex-shrink-0 w-48 h-48 md:w-56 md:h-56 bg-gray-100 rounded-lg overflow-hidden relative">
                    {productImageUrl ? (
                        <img
                            src={productImageUrl}
                            alt={title ?? "Product image"}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-50">
                            <Tag className="w-12 h-12 text-gray-300" />
                        </div>
                    )}

                    {isFeatured ? (
                        <span className="absolute top-3 left-3 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-400 text-sm font-medium text-yellow-900 shadow">
                            <Star className="w-4 h-4" /> Featured
                        </span>
                    ) : null}
                </div>

                {/* Right: content */}
                <div className="flex-1 space-y-4">
                    <header className="flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl font-semibold text-gray-900">
                                    {title || "Untitled product"}
                                </h1>
                                <span className="inline-flex items-center gap-1 text-sm text-gray-600 bg-gray-100 rounded-full px-3 py-1">
                                    <Tag className="w-4 h-4 text-gray-500" />
                                    {categoryName}
                                </span>
                            </div>
                            <p className="text-lg font-medium text-indigo-600">{formatPrice(price)}</p>
                        </div>

                        {summary ? (
                            <p className="text-gray-600 leading-relaxed">{summary}</p>
                        ) : null}
                    </header>

                    <section className="space-y-2">
                        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Description</h2>
                        <p className="text-gray-700 leading-relaxed whitespace-pre-line">{description || "No description provided."}</p>
                    </section>

                    <footer className="grid gap-3 text-sm text-gray-500 md:grid-cols-2">
                        <div className="flex items-center gap-2">
                            <CalendarClock className="w-4 h-4" />
                            <span>
                                Created
                                <span className="ml-1 font-medium text-gray-700">{formatDateTime(createdAt)}</span>
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CalendarClock className="w-4 h-4" />
                            <span>
                                Updated
                                <span className="ml-1 font-medium text-gray-700">{formatDateTime(updatedAt)}</span>
                            </span>
                        </div>
                    </footer>
                </div>
            </div>
        </article>
    );
}
