import { createServerClient } from "@/lib/supabase/server-only";
import { NextResponse } from "next/server";
import axios from "axios";
import { requireAdmin } from "@/lib/prisma/require-admin";

export async function GET() {
	const supabase = await createServerClient();
	const { error } = await requireAdmin(supabase, NextResponse);
	if (error) return error;

	const { BREVO_API_KEY, BREVO_TEMPLATE_URL } = process.env;
	if (!BREVO_API_KEY) {
		return NextResponse.json({ error: "Missing BREVO_API_KEY env variable" }, { status: 500 });
	}
	if (!BREVO_TEMPLATE_URL) {
		return NextResponse.json({ error: "Missing BREVO_TEMPLATE_URL env variable" }, { status: 500 });
	}

	try {
		const brevoRes = await axios.get(BREVO_TEMPLATE_URL, {
			headers: {
				"api-key": BREVO_API_KEY,
				"Accept": "application/json",
			},
		});
        return NextResponse.json({ templates: (brevoRes.data.templates || []).map(({ id, name }) => ({ id, name })) });
	} catch (err) {
		const brevoData = err.response?.data;
		return NextResponse.json({ error: brevoData?.message || "Error fetching templates", details: err.message }, { status: 500 });
	}
}
