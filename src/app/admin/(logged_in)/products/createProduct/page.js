"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import ProductForm from "../components/ProductForm";
import { toast } from "@/utils/Toast";

export default function CreateProductPage() {
    const router = useRouter();

    const handleSuccess = () => {
        toast.success("Product created successfully.");
        router.push("/admin/products");
    };

    return (
        <div className="flex flex-col gap-6 w-full min-h-screen bg-[#F9FAFB] px-3 sm:px-6 lg:px-12 py-6">
            <div className="flex items-center justify-start">
                <button
                    type="button"
                    className="flex items-center gap-2 px-4 py-2 rounded-md bg-white border border-gray-200 hover:bg-gray-50 text-gray-700"
                    onClick={() => router.push("/admin/products")}
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span className="text-sm font-medium">Back to products</span>
                </button>
            </div>

            <div className="space-y-3">
                <h1 className="text-2xl font-semibold text-gray-900">Create Product</h1>
                <p className="text-sm text-gray-600 max-w-2xl">
                    Upload an image, add basic details, and decide whether the product should be featured. All fields marked as required must be completed before saving.
                </p>
            </div>

            <ProductForm mode="create" onSuccess={handleSuccess} />
        </div>
    );
}
