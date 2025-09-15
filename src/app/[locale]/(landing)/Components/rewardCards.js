import Image from "next/image";

export default function RewardCards({ items = [] }) {
    if (!Array.isArray(items) || items.length === 0) return null;

    const formatPoints = (n) => new Intl.NumberFormat().format(n ?? 0);

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item, idx) => (
                <div
                    key={item.id ?? `${item.title}-${idx}`}
                    className="rounded-2xl overflow-hidden bg-white shadow-[0_6px_20px_rgba(0,0,0,0.08)] border border-gray-100"
                >
                    <div className="relative bg-gray-100 aspect-[16/9]">
                        {item.image ? (
                            <Image
                                src={item.image}
                                alt={item.title ?? "Reward image"}
                                fill
                                sizes="(max-width: 1024px) 100vw, 33vw"
                                className="object-cover"
                                priority={idx === 0}
                            />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200" />
                        )}
                    </div>

                    <div className="p-4">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <div className="text-gray-900 font-semibold leading-tight">
                                    {item.title}
                                </div>
                                {item.description ? (
                                    <div className="text-gray-500 text-sm">
                                        {item.description}
                                    </div>
                                ) : null}
                            </div>
                            <button
                                type="button"
                                aria-label="Save reward"
                                className="p-2 rounded-md border border-gray-200 bg-gray-50 text-gray-400 hover:text-yellow-500 transition"
                            >
                                {/* Star icon */}
                                <svg
                                    width="20"
                                    height="20"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                    aria-hidden="true"
                                >
                                    <path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                                </svg>
                            </button>
                        </div>

                        {/* Points row */}
                        <div className="mt-3 flex items-center justify-end">
                            <div className="inline-flex items-center gap-1 text-amber-600 font-semibold">
                                {/* Coin icon */}
                                <svg
                                    width="18"
                                    height="18"
                                    viewBox="0 0 24 24"
                                    aria-hidden="true"
                                    className="text-amber-500"
                                    fill="currentColor"
                                >
                                    <circle
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        className="opacity-20"
                                    />
                                    <path d="M12 6c3.31 0 6 1.79 6 4s-2.69 4-6 4-6-1.79-6-4 2.69-4 6-4zm0 10c-3.31 0-6-1.79-6-4v2c0 2.21 2.69 4 6 4s6-1.79 6-4v-2c0 2.21-2.69 4-6 4z" />
                                </svg>
                                <span>{formatPoints(item.points)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-gray-200 px-4 py-3 flex items-stretch bg-gray-50">
                        <button
                            type="button"
                            className="flex-1 flex items-center justify-center gap-2 text-gray-500 hover:text-gray-700 transition"
                        >
                            {/* Share icon */}
                            <svg
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                                aria-hidden="true"
                            >
                                <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7a3.27 3.27 0 0 0 0-1.39l7-4.11A3 3 0 1 0 14 5a3 3 0 0 0 .04.49L7.1 9.6a3 3 0 1 0 0 4.79l6.94 4.03c-.03.19-.04.38-.04.58a3 3 0 1 0 3-3z" />
                            </svg>
                            <span className="uppercase tracking-wide text-sm">
                                Share
                            </span>
                        </button>
                        <div className="w-px bg-gray-200" />
                        <button
                            type="button"
                            className="flex-1 flex items-center justify-center gap-2 text-gray-400 cursor-not-allowed"
                        >
                            {/* Gift icon */}
                            <svg
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                                aria-hidden="true"
                            >
                                <path d="M20 7h-2.18A3 3 0 0 0 12 5.1 3 3 0 0 0 6.18 7H4a1 1 0 0 0-1 1v3h18V8a1 1 0 0 0-1-1zM7 6a2 2 0 1 1 2 2H7a2 2 0 0 1 0-2zm10 0a2 2 0 1 1-2 2h2a2 2 0 0 1 0-2zM3 20a1 1 0 0 0 1 1h6v-8H3v7zm11 1h6a1 1 0 0 0 1-1v-7h-7v8z" />
                            </svg>
                            <span className="uppercase tracking-wide text-sm">
                                Redeem Now
                            </span>
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}
