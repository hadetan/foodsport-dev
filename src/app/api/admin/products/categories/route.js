import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/prisma/require-admin";
import { createServerClient } from "@/lib/supabase/server-only";
import { getMany } from "@/lib/prisma/db-utils";

// GET /api/admin/products/categories
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

        const options = { limit, skip, orderBy: { createdAt: "desc" } };

        const categories = await getMany(
            "category",
            {},
            { id: true, name: true, slug: true, description: true, createdAt: true, updatedAt: true },
            options
        );

        return NextResponse.json({ categories, pagination: { page, limit, total: Array.isArray(categories) ? categories.length : 0 } }, { status: 200 });
    } catch (error) {
        console.error("Error in GET /api/admin/products/categories:", error);
        return new NextResponse(JSON.stringify({ error: "Failed to fetch categories.", message: error.message }), { status: 500, headers: { "Content-Type": "application/json" } });
    }
}
