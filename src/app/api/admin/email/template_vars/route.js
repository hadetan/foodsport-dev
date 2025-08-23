import { createServerClient } from "@/lib/supabase/server-only";
import { NextResponse } from "next/server";
import axios from "axios";
import { requireAdmin } from "@/lib/prisma/require-admin";

export async function POST(req) {
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

	let body;
	try {
		body = await req.json();
	} catch {
		return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
	}

	let { templateId } = body;
	if (!templateId) {
		return NextResponse.json({ error: "Missing templateId" }, { status: 400 });
	}
	if (typeof templateId === "string") {
		const numId = Number(templateId);
		if (Number.isNaN(numId) || !Number.isFinite(numId)) {
			return NextResponse.json({ error: "templateId must be a valid number or numeric string" }, { status: 400 });
		}
		templateId = numId;
	}
	if (typeof templateId !== "number" || !Number.isFinite(templateId)) {
		return NextResponse.json({ error: "templateId must be a valid number" }, { status: 400 });
	}

	try {
		const brevoRes = await axios.get(
			`${BREVO_TEMPLATE_URL}/${templateId}`,
			{
				headers: {
					"api-key": BREVO_API_KEY,
					"Accept": "application/json",
				},
			}
		);
		const template = brevoRes.data;
		let variables = [];

		if (template.htmlContent) {
			const matches = template.htmlContent.match(/{{\s*([\w.]+)\s*}}/g);
			if (matches) variables = Array.from(new Set(matches.map(m => m.replace(/{{\s*|\s*}}/g, ""))));
		}

	// Only keep variables that start with `params.`, and strip the prefix
	return NextResponse.json({ variables: variables.filter(v => v.startsWith('params.')).map(v => v.slice(7)) });
	} catch (err) {
		const brevoData = err.response?.data;
		return NextResponse.json({ error: brevoData?.message || "Error fetching template", details: err.message }, { status: 500 });
	}
}
