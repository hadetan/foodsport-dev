"use client";

import { useMemo, useState } from "react";
import RewardCards from "../Components/rewardCards";
import redeemTitle from "@/app/shared/components/redeemTitle";

const categories = [
    { key: "food", label: "Food & Beverages" },
    { key: "wellness", label: "Wellness" },
    { key: "home", label: "Home" },
    { key: "electronics", label: "Electronics" },
    { key: "entertainment", label: "Entertainments" },
    { key: "fashion", label: "Fashion & Beauty" },
    { key: "travel", label: "Travel" },
];

export default function RedeemPage() {
    const [active, setActive] = useState("electronics");
    const [min, setMin] = useState(190);
    const [max, setMax] = useState(340);

    const items = useMemo(
        () => [
            {
                id: 1,
                title: "Smart Watch",
                description: "Garmin Forerunner 965S Smart Watch",
                points: 200000,
                image: "/redeemCardsImage/smartWatch.jpg",
            },
            {
                id: 2,
                title: "Iphone",
                description: "Nike Gift Card",
                points: 50000,
                image: "/redeemCardsImage/iphone.jpg",
            },
            {
                id: 3,
                title: "Ear Buds",
                description: "AirPods (3rd generation)",
                points: 90000,
                image: "/redeemCardsImage/air.jpg",
            },
            {
                id: 4,
                title: "Neck Band",
                description: "Garmin Forerunner 965S Smart Watch",
                points: 200000,
                image: "/redeemCardsImage/neckband.jpg",
            },
            {
                id: 5,
                title: "Sound Bar",
                description: "Nike Gift Card",
                points: 50000,
                image: "/redeemCardsImage/soundBar.jpeg",
            },
            {
                id: 6,
                title: "Ear phone",
                description: "AirPods (3rd generation)",
                points: 90000,
                image: "/redeemCardsImage/earphone.jpg",
            },
        ],
        []
    );

    const handleMinChange = (v) => {
        const val = Number(v);
        if (val >= max) return setMin(max - 1);
        setMin(val);
    };

    const handleMaxChange = (v) => {
        const val = Number(v);
        if (val <= min) return setMax(min + 1);
        setMax(val);
    };

    return (
        <div className="min-h-screen bg-[#fff]">
            {/* Rewards banner image */}
            <div className="w-full px-0 ">
                {redeemTitle()}
            </div>

            {/* Filters row */}
            <div className="container mx-auto px-4">
                <div className="mt-6 flex flex-col gap-4">
                    <div className="flex w-full flex-col gap-3 rounded-2xl bg-[#fff] p-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
                                {categories.map((c) => {
                                    const isActive = c.key === active;
                                    return (
                                        <button
                                            key={c.key}
                                            onClick={() => setActive(c.key)}
                                            disabled={true}
                                            className={`whitespace-nowrap rounded-full border px-4 py-2 text-sm transition cursor-not-allowed  ${isActive
                                                ? "bg-[#E8E1D7] border-amber-400 text-gray-900 shadow"
                                                : "bg-[#dadada] border-gray-200 text-gray-600 hover:text-gray-900"
                                                }`}
                                        >
                                            {c.label}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Range filter */}
                            <div className="flex items-center gap-3">
                                <div className="rounded-full bg-amber-300/70 text-gray-900 text-sm font-semibold px-3 py-1">
                                    {min} - {max}
                                </div>
                                <div className="hidden sm:flex items-center gap-2 text-xs text-gray-600">
                                    <span>10</span>
                                    <div className="relative w-56">
                                        {/* double range slider */}
                                        <input
                                            type="range"
                                            min={10}
                                            max={500}
                                            value={min}
                                            onChange={(e) =>
                                                handleMinChange(e.target.value)
                                            }
                                            className="absolute z-20 h-2 w-full appearance-none bg-transparent pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-amber-500 [&::-webkit-slider-thumb]:cursor-pointer"
                                            aria-label="Minimum points"
                                        />
                                        <input
                                            type="range"
                                            min={10}
                                            max={500}
                                            value={max}
                                            onChange={(e) =>
                                                handleMaxChange(e.target.value)
                                            }
                                            className="absolute z-10 h-2 w-full appearance-none bg-transparent pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-amber-500 [&::-webkit-slider-thumb]:cursor-pointer"
                                            aria-label="Maximum points"
                                        />
                                        <div className="relative h-2 w-full rounded-full bg-gray-200" />
                                    </div>
                                    <span>500</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Cards */}
                    <RewardCards items={items} />

                    {/* CTA */}
                    <div className="flex items-center justify-center py-8">
                        <button className="rounded-full bg-[#D3CDC6] px-6 py-3 text-sm font-semibold uppercase tracking-wide text-gray-700 shadow hover:bg-[#cfc8c0]">
                            Explore more awards
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
