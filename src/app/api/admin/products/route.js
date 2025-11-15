import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/prisma/require-admin";
import { insert, getMany, getById, updateById } from "@/lib/prisma/db-utils";
import { formatDbError } from "@/utils/formatDbError";
import { createServerClient } from "@/lib/supabase/server-only";
import { MAX_IMAGE_SIZE_MB } from "@/app/constants/constants";

function slugify(text) {
    return String(text)
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "")
        .replace(/-+/g, "-");
}

// GET /api/admin/products
export async function GET(req) {
    try {
        const supabase = await createServerClient();
        const { error } = await requireAdmin(supabase, NextResponse);
        if (error) return error;

        const url = new URL(req.url);
        const searchParams = url.searchParams;
        const page = parseInt(searchParams.get("page") || "1", 10);
        const limit = parseInt(searchParams.get("limit") || "10000", 10);
        const skip = (page - 1) * limit;

        const filters = {};
        const isFeatured = searchParams.get("isFeatured");
        const categoryId = searchParams.get("categoryId");
        if (isFeatured === "true" || isFeatured === "1") filters.isFeatured = true;
        if (categoryId) filters.categoryId = categoryId;

        const options = { limit, skip, orderBy: { createdAt: "desc" } };

        const products = await getMany(
            "product",
            filters,
            {
                id: true,
                productImageUrl: true,
                title: true,
                summary: true,
                description: true,
                price: true,
                isFeatured: true,
                createdAt: true,
                updatedAt: true,
                category: { select: { id: true, name: true, slug: true, description: true } },
            },
            options
        );

        return NextResponse.json({ products, pagination: { page, limit, total: Array.isArray(products) ? products.length : 0 } }, { status: 200 });
    } catch (error) {
        console.error("Error in GET /api/admin/products:", error);
        return new NextResponse(JSON.stringify({ error: "Failed to fetch products.", message: error.message }), { status: 500, headers: { "Content-Type": "application/json" } });
    }
}

// POST /api/admin/products
export async function POST(req) {
    try {
        const supabase = await createServerClient();
        const { error, user } = await requireAdmin(supabase, NextResponse);
        if (error) return error;

        const contentType = req.headers.get("content-type") || "";
        if (!contentType.includes("multipart/form-data")) {
            return NextResponse.json({ error: "Content-Type must be multipart/form-data" }, { status: 400 });
        }

        let formData;
        try {
            formData = await req.formData();
        } catch {
            return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
        }

        const required = ["title", "description", "price", "category", "image"];
        const missing = required.filter((f) => !formData.get(f));
        if (missing.length > 0) {
            return NextResponse.json({ error: `Missing required fields: ${missing.join(", ")}` }, { status: 400 });
        }

        const file = formData.get("image");
        if (!file || typeof file === "string") {
            return NextResponse.json({ error: "Image file is required" }, { status: 400 });
        }

        const allowedTypes = ["image/jpeg", "image/png"];
        const maxSize = MAX_IMAGE_SIZE_MB * 1024 * 1024;
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json({ error: "Invalid image type. Only JPEG and PNG are allowed." }, { status: 400 });
        }
        if (file.size > maxSize) {
            return NextResponse.json({ error: `Image size exceeds the maximum limit of ${MAX_IMAGE_SIZE_MB}MB.` }, { status: 400 });
        }

        // Upload image
        const bucket = "product-images";
        const ext = file.name.split(".").pop();
        const fileName = `product_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;

        const { error: uploadError } = await supabase.storage.from(bucket).upload(fileName, file, {
            cacheControl: "3600",
            upsert: false,
            contentType: file.type,
        });
        if (uploadError) {
            return NextResponse.json({ error: "Failed to upload image", details: uploadError.message }, { status: 500 });
        }

        const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(fileName);
        const productImageUrl = publicUrlData?.publicUrl;
        if (!productImageUrl) {
            return NextResponse.json({ error: "Failed to get image URL" }, { status: 500 });
        }

        // Category handling - use existing or create new
        const rawCategory = String(formData.get("category") || "").trim();
        if (!rawCategory) {
            return NextResponse.json({ error: "category is required" }, { status: 400 });
        }

        let categoryId = null;
        const existing = await getMany("category", { name: rawCategory }, { id: true, name: true });
        if (Array.isArray(existing) && existing.length > 0) {
            categoryId = existing[0].id;
        } else {
            const slug = slugify(rawCategory);
            const created = await insert("category", { name: rawCategory, slug });
            if (created && created.error) {
                const retry = await getMany("category", { name: rawCategory }, { id: true, name: true });
                if (Array.isArray(retry) && retry.length > 0) {
                    categoryId = retry[0].id;
                } else {
                    return NextResponse.json({ error: formatDbError(created.error), details: created.error }, { status: 500 });
                }
            } else {
                categoryId = created.id;
            }
        }

        const title = String(formData.get("title") || "").trim();
        const description = String(formData.get("description") || "").trim();
        const summary = formData.get("summary") ? String(formData.get("summary")) : null;
        const priceRaw = String(formData.get("price") || "").trim();
        const isFeaturedRaw = formData.get("isFeatured");
        const isFeatured = isFeaturedRaw === "true" || isFeaturedRaw === "1";

        const priceNum = Number(priceRaw);
        if (isNaN(priceNum)) {
            return NextResponse.json({ error: "price must be a valid number" }, { status: 400 });
        }
        if (priceNum <= 0) {
            return NextResponse.json({ error: "price must be greater than 0" }, { status: 400 });
        }

        const productData = {
            productImageUrl,
            title,
            description,
            summary,
            price: priceRaw,
            categoryId,
            isFeatured,
        };

        const createdProduct = await insert("product", productData);
        if (createdProduct && createdProduct.error) {
            return NextResponse.json({ error: formatDbError(createdProduct.error), details: createdProduct.error }, { status: 500 });
        }

        const product = await getById(
            "product",
            createdProduct.id,
            {
                id: true,
                productImageUrl: true,
                title: true,
                summary: true,
                description: true,
                price: true,
                isFeatured: true,
                createdAt: true,
                updatedAt: true,
                category: { select: { id: true, name: true, slug: true, description: true } },
            }
        );
        if (product && product.error) {
            return NextResponse.json({ error: formatDbError(product.error), details: product.error }, { status: 500 });
        }

        return NextResponse.json(product, { status: 201 });
    } catch (error) {
        console.error("Error in POST /api/admin/products:", error);
        return new NextResponse(JSON.stringify({ error: "Failed to create product. Please try again later.", message: error.message }), { status: 500, headers: { "Content-Type": "application/json" } });
    }
}

// PATCH /api/admin/products?productId=<id>
export async function PATCH(req) {
    try {
        const supabase = await createServerClient();
        const { error } = await requireAdmin(supabase, NextResponse);
        if (error) return error;

        const url = new URL(req.url);
        const productId = url.searchParams.get("productId");
        if (!productId) {
            return NextResponse.json({ error: "Missing productId" }, { status: 400 });
        }

        let formData;
        try {
            formData = await req.formData();
        } catch {
            return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
        }

        const allowedFields = [
            "title",
            "summary",
            "description",
            "price",
            "isFeatured",
            "category",
        ];

        const file = formData.get("image");
        if (file && typeof file === "string") {
            return NextResponse.json({ error: "Image must be provided as a file upload." }, { status: 400 });
        }

        const updates = {};

        for (const field of allowedFields) {
            if (formData.has(field)) {
                if (field === "isFeatured") {
                    const val = formData.get(field);
                    updates.isFeatured = val === "true" || val === "1";
                } else if (field === "price") {
                    updates.price = String(formData.get(field) || "").trim();
                } else if (field === "category") {
                    // handle separately below
                } else {
                    updates[field] = formData.get(field);
                }
            }
        }

        const bucket = "product-images";
        let newImageUrl = null;
        let oldImageUrl = null;
        let oldImageFilePath = null;

        if (file && typeof file !== "string") {
            const current = await getMany("product", { id: productId }, { productImageUrl: true });
            const currentProduct = current && current[0] ? current[0] : null;
            if (currentProduct) {
                oldImageUrl = currentProduct.productImageUrl || null;
            }

            const allowedTypes = ["image/jpeg", "image/png"];
            const maxSize = MAX_IMAGE_SIZE_MB * 1024 * 1024;
            if (!allowedTypes.includes(file.type)) {
                return NextResponse.json({ error: "Invalid image type. Only JPEG and PNG are allowed." }, { status: 400 });
            }
            if (file.size > maxSize) {
                return NextResponse.json({ error: `Image size exceeds the maximum limit of ${MAX_IMAGE_SIZE_MB}MB.` }, { status: 400 });
            }

            if (oldImageUrl) {
                try {
                    const urlObj = new URL(oldImageUrl);
                    const pathParts = urlObj.pathname.split("/");
                    const bucketIndex = pathParts.findIndex((p) => p === bucket);
                    if (bucketIndex !== -1) {
                        oldImageFilePath = pathParts.slice(bucketIndex + 1).join("/");
                    }
                } catch (e) {
                    // ignore parsing errors
                }
            }

            const ext = file.name.split(".").pop();
            const fileName = `product_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;
            const { error: uploadError } = await supabase.storage.from(bucket).upload(fileName, file, {
                cacheControl: "3600",
                upsert: false,
                contentType: file.type,
            });
            if (uploadError) {
                return NextResponse.json({ error: "Failed to upload image", details: uploadError.message }, { status: 500 });
            }
            const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(fileName);
            newImageUrl = publicUrlData?.publicUrl;
            if (!newImageUrl) {
                return NextResponse.json({ error: "Failed to get image URL" }, { status: 500 });
            }
            updates.productImageUrl = newImageUrl;
        }

        if (formData.has("category")) {
            const rawCategory = String(formData.get("category") || "").trim();
            if (!rawCategory) {
                return NextResponse.json({ error: "category cannot be empty" }, { status: 400 });
            }
            let categoryId = null;
            const existing = await getMany("category", { name: rawCategory }, { id: true, name: true });
            if (Array.isArray(existing) && existing.length > 0) {
                categoryId = existing[0].id;
            } else {
                const slug = slugify(rawCategory);
                const created = await insert("category", { name: rawCategory, slug });
                if (created && created.error) {
                    const retry = await getMany("category", { name: rawCategory }, { id: true, name: true });
                    if (Array.isArray(retry) && retry.length > 0) {
                        categoryId = retry[0].id;
                    } else {
                        return NextResponse.json({ error: formatDbError(created.error), details: created.error }, { status: 500 });
                    }
                } else {
                    categoryId = created.id;
                }
            }
            updates.categoryId = categoryId;
        }

        if (updates.price !== undefined) {
            const priceRaw = String(updates.price || "").trim();
            const priceNum = Number(priceRaw);
            if (isNaN(priceNum)) {
                return NextResponse.json({ error: "price must be a valid number" }, { status: 400 });
            }
            if (priceNum <= 0) {
                return NextResponse.json({ error: "price must be greater than 0" }, { status: 400 });
            }
            updates.price = priceRaw; // keep as string for Prisma Decimal
        }

        if (updates.title !== undefined) updates.title = String(updates.title).trim();
        if (updates.summary !== undefined) updates.summary = String(updates.summary).trim();
        if (updates.description !== undefined) updates.description = String(updates.description);

        if (Object.keys(updates).length === 0) {
            return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
        }

        const updated = await updateById("product", productId, updates);
        if (updated && updated.error) {
            return NextResponse.json({ error: formatDbError(updated.error), details: updated.error }, { status: 500 });
        }

        if (newImageUrl && oldImageFilePath) {
            const { error: removeError } = await supabase.storage.from(bucket).remove([oldImageFilePath]);
            if (removeError) {
                console.error("Failed to remove old product image:", removeError.message);
            }
        }

        const product = await getById(
            "product",
            productId,
            {
                id: true,
                productImageUrl: true,
                title: true,
                summary: true,
                description: true,
                price: true,
                isFeatured: true,
                createdAt: true,
                updatedAt: true,
                category: { select: { id: true, name: true, slug: true, description: true } },
            }
        );
        if (product && product.error) {
            return NextResponse.json({ error: formatDbError(product.error), details: product.error }, { status: 500 });
        }

        return NextResponse.json(product, { status: 200 });
    } catch (error) {
        console.error("Error in PATCH /api/admin/products:", error);
        return new NextResponse(JSON.stringify({ error: "Failed to update product. Please try again later.", message: error.message }), { status: 500, headers: { "Content-Type": "application/json" } });
    }
}
