import { NextResponse } from "next/server";
import { getMany } from "@/lib/prisma/db-utils";

function parseQueryParams(searchParams) {
    return {
        page: parseInt(searchParams.get("page") || "1", 10),
        limit: parseInt(searchParams.get("limit") || "10000", 10),
        isFeatured: searchParams.get("isFeatured") || "",
        categoryId: searchParams.get("categoryId") || "",
    };
}

// GET /api/products - endpoint returning categories and products
export async function GET(req) {
    try {
        const url = new URL(req.url);
        const { searchParams } = url;
        const { page, limit, isFeatured, categoryId } = parseQueryParams(searchParams);
        const skip = (page - 1) * limit;

        const productFilters = {};
        if (isFeatured === "true" || isFeatured === "1") productFilters.isFeatured = true;
        if (categoryId) productFilters.categoryId = categoryId;

        const options = { limit, skip, orderBy: { createdAt: "desc" } };

        const [categories, products] = await Promise.all([
            getMany(
                "category",
                {},
                { id: true, name: true, slug: true, description: true },
                { limit: 10000 }
            ),
            getMany(
                "product",
                productFilters,
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
                    category: { select: { id: true, name: true, slug: true } },
                },
                options
            ),
        ]);

        return NextResponse.json(
            {
                categories: Array.isArray(categories) ? categories : [],
                products: Array.isArray(products) ? products : [],
                pagination: { page, limit, total: Array.isArray(products) ? products.length : 0 },
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error in GET /api/products:", error);
        return new NextResponse(JSON.stringify({ error: "Failed to fetch products.", message: error.message }), { status: 500, headers: { "Content-Type": "application/json" } });
    }
}
