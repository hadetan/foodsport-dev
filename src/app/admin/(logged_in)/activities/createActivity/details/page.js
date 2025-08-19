"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import TiptapEditor from "@/app/shared/components/TiptapEditor";

const ActivityDetailsStep = () => {
    const router = useRouter();
    const [details, setDetails] = useState("");

    const handleSave = () => {
        // Save logic here (e.g., API call)
        router.push("/admin/activities");
    };

    return (
        <div className="min-h-screen w-full text-base">
            <div className="flex items-center justify-between mb-10 px-0 md:px-8 pt-8">
                <button
                    className="btn btn-outline btn-md text-base"
                    onClick={() => router.back()}
                >
                    Back
                </button>
                <h1 className="text-4xl font-bold text-center flex-1 tracking-tight">
                    Add Detailed Description
                </h1>
                <button
                    className="btn btn-primary btn-md text-base ml-4"
                    onClick={handleSave}
                >
                    Save
                </button>
            </div>
            <label className="block mb-4 mt-2 ml-2 text-xl font-semibold text-neutral-800 dark:text-neutral-100">
                Detailed Description
            </label>
            <TiptapEditor
                value={details}
                onChange={setDetails}
            />
        </div>
    );
};

export default ActivityDetailsStep;
