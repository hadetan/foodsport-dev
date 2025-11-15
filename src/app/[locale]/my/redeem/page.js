"use client";

import { useEffect, useMemo, useState } from "react";
import RewardCards from "@/app/[locale]/(landing)/Components/rewardCards";
import redeemTitle from "@/app/shared/components/redeemTitle";
import { useProducts } from "@/app/shared/contexts/productsContext";

export default function RedeemPage() {
    const { products = [], categories = [], loading, error } = useProducts();
    const [activeCategory, setActiveCategory] = useState("all");
    const [priceRange, setPriceRange] = useState({ min: null, max: null });

    const priceBounds = useMemo(() => {
        if (!products.length) {
            return { min: 0, max: 0 };
        }
        const values = products
            .map((item) => Number.parseFloat(item.price))
            .filter((val) => Number.isFinite(val));
        if (!values.length) {
            return { min: 0, max: 0 };
        }
        return {
            min: Math.min(...values),
            max: Math.max(...values),
        };
    }, [products]);

    useEffect(() => {
        if (!products.length) return;
        setPriceRange((prev) => ({
            min: prev.min ?? priceBounds.min,
            max: prev.max ?? priceBounds.max,
        }));
    }, [products.length, priceBounds.min, priceBounds.max]);

    const availableCategories = useMemo(() => {
        const safeCategories = Array.isArray(categories) ? categories : [];
        return [
            { id: "all", name: "All" },
            ...safeCategories.map((cat) => ({ id: cat.id, name: cat.name })),
        ];
    }, [categories]);

    const currentMin = priceRange.min ?? priceBounds.min ?? 0;
    const currentMax = priceRange.max ?? priceBounds.max ?? 0;

    const filteredProducts = useMemo(() => {
        if (!products.length) return [];
        return products.filter((product) => {
            const categoryId = product.category?.id;
            const numericPrice = Number.parseFloat(product.price);
            const matchesCategory =
                activeCategory === "all" || categoryId === activeCategory;
            const matchesPrice =
                (Number.isFinite(currentMin) ? numericPrice >= currentMin : true) &&
                (Number.isFinite(currentMax) ? numericPrice <= currentMax : true);
            return matchesCategory && matchesPrice;
        });
    }, [products, activeCategory, currentMin, currentMax]);

    const handleCategoryClick = (categoryId) => {
        setActiveCategory(categoryId);
    };

    const handleMinChange = (value) => {
        const val = Number(value);
        if (!Number.isFinite(val)) return;
        setPriceRange((prev) => ({
            ...prev,
            min: Math.max(priceBounds.min, Math.min(val, currentMax)),
        }));
    };

    const handleMaxChange = (value) => {
        const val = Number(value);
        if (!Number.isFinite(val)) return;
        setPriceRange((prev) => ({
            ...prev,
            max: Math.min(priceBounds.max, Math.max(val, currentMin)),
        }));
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
                                {availableCategories.map((category) => {
                                    const isActive = category.id === activeCategory;
                                    return (
                                        <button
                                            key={category.id}
                                            onClick={() => handleCategoryClick(category.id)}
                                            className={`whitespace-nowrap rounded-full border px-4 py-2 text-sm transition  ${
                                                isActive
                                                    ? "bg-[#E8E1D7] border-amber-400 text-gray-900 shadow"
                                                    : "bg-[#dadada] border-gray-200 text-gray-600 hover:text-gray-900"
                                            }`}
                                            disabled={loading}
                                        >
                                            {category.name}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Range filter */}
                            <div className="flex items-center gap-3">
                                <div className="rounded-full bg-amber-300/70 text-gray-900 text-sm font-semibold px-3 py-1">
                                    {Math.round(currentMin)} - {Math.round(currentMax)}
                                </div>
                                <div className="hidden sm:flex items-center gap-2 text-xs text-gray-600">
                                    <span>{Math.round(priceBounds.min)}</span>
                                    <div className="relative w-56">
                                        {/* double range slider */}
                                        <input
                                            type="range"
                                            min={priceBounds.min}
                                            max={priceBounds.max}
                                            value={currentMin}
                                            onChange={(e) => handleMinChange(e.target.value)}
                                            className="absolute z-20 h-2 w-full appearance-none bg-transparent pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-amber-500 [&::-webkit-slider-thumb]:cursor-pointer"
                                            aria-label="Minimum points"
                                            disabled={!products.length}
                                        />
                                        <input
                                            type="range"
                                            min={priceBounds.min}
                                            max={priceBounds.max}
                                            value={currentMax}
                                            onChange={(e) => handleMaxChange(e.target.value)}
                                            className="absolute z-10 h-2 w-full appearance-none bg-transparent pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-amber-500 [&::-webkit-slider-thumb]:cursor-pointer"
                                            aria-label="Maximum points"
                                            disabled={!products.length}
                                        />
                                        <div className="relative h-2 w-full rounded-full bg-gray-200" />
                                    </div>
                                    <span>{Math.round(priceBounds.max)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Cards */}
                    {error ? (
                        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-6 text-center text-sm text-red-600">
                            {error}
                        </div>
                    ) : (
                        <RewardCards
                            items={filteredProducts}
                            loading={loading}
                            limit={filteredProducts.length || 3}
                        />
                    )}

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
