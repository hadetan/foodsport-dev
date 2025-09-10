"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import Sidebar from "@/components/sidebar";
import LoadingBarTopClient from "@/app/LoadingBarTopClient";

export default function MyNutrition() {
    const [nutritionData, setNutritionData] = useState({
        totalCalories: 0,
        totalProtein: 0,
        totalCarbs: 0,
    });

    useEffect(() => {
        const fetchData = async () => {
            const client = createClient();
            const { data, error } = await client
                .from("nutrition")
                .select("totalCalories, totalProtein, totalCarbs")
                .single();

            if (!error && data) {
                setNutritionData(data);
            }
        };

        fetchData();
    }, []);

    return (
        <div className="flex min-h-screen bg-white">
            <Sidebar />
            <main className="flex-1 p-6">
                <LoadingBarTopClient />

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {[
                        {
                            label: "Calories",
                            value: nutritionData.totalCalories,
                            unit: "kcal",
                        },
                        {
                            label: "Protein",
                            value: nutritionData.totalProtein,
                            unit: "g",
                        },
                        {
                            label: "Carbs",
                            value: nutritionData.totalCarbs,
                            unit: "g",
                        },
                    ].map((stat) => (
                        <div
                            key={stat.label}
                            className="bg-white p-6 rounded-lg shadow-md border"
                        >
                            <h3 className="text-lg font-semibold text-gray-700">
                                {stat.label}
                            </h3>
                            <p className="text-3xl font-bold text-primary">
                                {stat.value}{" "}
                                <span className="text-lg">{stat.unit}</span>
                            </p>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}
