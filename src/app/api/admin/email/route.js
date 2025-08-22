import { createServerClient } from "@/lib/supabase/server-only";
import { NextResponse } from "next/server";
import { wrapHtmlEmail } from "@/utils/emailTemplate";
import axios from "axios";
import { requireAdmin } from "@/lib/prisma/require-admin";

export async function POST(req) {
	const supabase = await createServerClient();
    const { error } = await requireAdmin(supabase, NextResponse);
    if (error) return error;

	const { BREVO_API_KEY, SENDER_EMAIL_ID, SENDER_EMAIL_NAME, BREVO_URL } = process.env;
	if (!BREVO_API_KEY) {
		return NextResponse.json({ error: "Missing BREVO_API_KEY env variable" }, { status: 500 });
	}
    if (!SENDER_EMAIL_ID) {
		return NextResponse.json({ error: "Missing SENDER_EMAIL_ID env variable" }, { status: 500 });
	}
    if (!SENDER_EMAIL_NAME) {
		return NextResponse.json({ error: "Missing SENDER_EMAIL_NAME env variable" }, { status: 500 });
	}

	let body;
	try {
		body = await req.json();
	} catch {
		return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
	}

	const { to, subject, html } = body;
	if (!to || !subject || !html) {
		return NextResponse.json({ error: "Missing required fields: to, subject, html" }, { status: 400 });
	}

	const recipients = Array.isArray(to) ? to : [to];
	if (!recipients.every(email => typeof email === "string" && email.includes("@"))) {
		return NextResponse.json({ error: "Invalid email(s) in 'to' field" }, { status: 400 });
	}

	const brevoPayload = {
		sender: {
			name: SENDER_EMAIL_NAME,
			email: SENDER_EMAIL_ID
		},
		to: recipients.map(email => ({ email })),
		subject,
		htmlContent: wrapHtmlEmail(html, subject),
		// templateId and params will be added when using templates
	};
	try {
		const brevoRes = await axios.post(
			BREVO_URL,
			brevoPayload,
			{
				headers: {
					"api-key": BREVO_API_KEY,
					"Content-Type": "application/json",
					"Accept": "application/json",
				},
			}
		);
		const brevoData = brevoRes.data;
		return NextResponse.json({ success: true, messageId: brevoData.messageId, brevoData });
	} catch (err) {
		const brevoData = err.response?.data;
		return NextResponse.json({ error: brevoData?.message || "Error sending email", details: brevoData || err.message }, { status: 500 });
	}
}
