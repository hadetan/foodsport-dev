"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import ProductForm from "@/app/admin/(logged_in)/products/components/ProductForm";
import { useAdminProducts } from "@/app/shared/contexts/adminProductsContext";
import FullPageLoader from "@/app/admin/(logged_in)/components/FullPageLoader";
import { toast } from "@/utils/Toast";

export default function EditProductPage() {
    const params = useParams();
    const router = useRouter();
    const productId = useMemo(() => (params?.id ? String(params.id) : null), [params?.id]);

    const { getProductById, fetchProducts, loading: productsLoading } = useAdminProducts() ?? {};

    const [product, setProduct] = useState(null);
    const [fetching, setFetching] = useState(false);
    const [attemptedFetch, setAttemptedFetch] = useState(false);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        if (!productId) return;

        const existing = getProductById ? getProductById(productId) : null;
        if (existing) {
            setProduct(existing);
            setNotFound(false);
            return;
        }

        if (!attemptedFetch && fetchProducts) {
            setAttemptedFetch(true);
            setFetching(true);
            const maybePromise = fetchProducts();
            if (maybePromise && typeof maybePromise.finally === "function") {
                maybePromise.finally(() => setFetching(false));
            } else {
                setFetching(false);
            }
        }
    }, [productId, getProductById, fetchProducts, attemptedFetch]);

    useEffect(() => {
        if (!productId) return;
        const existing = getProductById ? getProductById(productId) : null;
        if (existing) {
            setProduct(existing);
            setNotFound(false);
        } else if (attemptedFetch && !fetching && !productsLoading) {
            setNotFound(true);
        }
    }, [productId, getProductById, attemptedFetch, fetching, productsLoading]);

    const handleSuccess = () => {
        toast.success("Product updated successfully.");
        router.push("/admin/products");
    };

    if (!productId) {
        return (
            <div className="p-6">
                <p className="text-sm text-gray-500">Invalid product identifier.</p>
            </div>
        );
    }

    if ((productsLoading && !product) || fetching) {
        return <FullPageLoader />;
    }

    if (notFound || !product) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-4">
                <h2 className="text-2xl font-semibold text-gray-800">Product not found</h2>
                <p className="text-gray-600 max-w-md">
                    We couldn't locate this product. It may have been removed or you might not have access to edit it.
                </p>
                <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => router.push("/admin/products")}
                >
                    Back to products
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 w-full min-h-screen bg-[#F9FAFB] px-3 sm:px-6 lg:px-12 py-6">
            <div className="flex items-center justify-start">
                <button
                    type="button"
                    className="flex items-center gap-2 px-4 py-2 rounded-md bg-white border border-gray-200 hover:bg-gray-50 text-gray-700"
                    onClick={() => router.push(`/admin/products/viewProduct/${productId}`)}
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span className="text-sm font-medium">Back to product</span>
                </button>
            </div>

            <div className="space-y-3">
                <h1 className="text-2xl font-semibold text-gray-900">Edit Product</h1>
                <p className="text-sm text-gray-600 max-w-2xl">
                    Update any details for this product. If you upload a new image it will replace the existing one in Supabase storage.
                </p>
            </div>

            <ProductForm
                mode="edit"
                productId={productId}
                initialValues={product}
                onSuccess={handleSuccess}
                onCancel={() => router.push(`/admin/products/viewProduct/${productId}`)}
            />
        </div>
    );
}
