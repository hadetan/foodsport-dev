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

	let { templateId, params } = body;
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
		let html = template.htmlContent || "";
		const placeholderRegex = /{{\s*([\w.]+)\s*}}/g;
		let match;
		const placeholders = new Set();
		while ((match = placeholderRegex.exec(html)) !== null) {
			placeholders.add(match[1]);
		}
		if (params && typeof params === 'object') {
			html = html.replace(placeholderRegex, (m, key) => {
				const shortKey = key.startsWith('params.') ? key.slice(7) : key;
				return params[shortKey] !== undefined ? params[shortKey] : m;
			});
		}
		return NextResponse.json({ html });
	} catch (err) {
		const brevoData = err.response?.data;
		return NextResponse.json({ error: brevoData?.message || "Error fetching template preview", details: err.message }, { status: 500 });
	}
}
