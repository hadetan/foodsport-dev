import { prisma } from '@/lib/prisma/db';
import serverApi from '@/utils/axios/serverApi';
import bcrypt from 'bcryptjs';
import { generateOtp } from '@/utils/generateOtp';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@/lib/supabase/server-only';

// POST /api/admin/login
export async function POST(req) {
	try {
		const { email, password } = await req.json();
		if (!email || !password) {
			return NextResponse.json({ error: 'Missing email or password.' }, { status: 400 });
		}

		const admin = await prisma.adminUser.findUnique({ where: { email } });
		if (!admin) {
			await new Promise((resolve) => setTimeout(resolve, 500));
			return NextResponse.json({ error: 'Invalid credentials.' }, { status: 400 });
		}

		const otpDisabled = process.env.ADMIN_LOGIN_DISABLE_OTP === 'true';
		if (otpDisabled) {
			const supabase = await createServerClient();
			const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
			if (signInError || !data?.session) {
				console.error('Admin login dev bypass failed to sign in', signInError?.message || signInError);
				return NextResponse.json({ error: 'Invalid credentials.' }, { status: 401 });
			}

			const cookieStore = await cookies();
			if (data.session.access_token) {
				cookieStore.set('admin_auth_token', data.session.access_token, { httpOnly: true, path: '/', sameSite: 'lax', maxAge: 3600 });
			}
			if (data.session.refresh_token) {
				cookieStore.set('admin_refresh_token', data.session.refresh_token, { httpOnly: true, path: '/', sameSite: 'lax', maxAge: 60 * 60 * 24 * 30 });
			}

			return NextResponse.json({
				session: data.session,
				admin: { id: admin.id, name: admin.name, email: admin.email }
			});
		}
		const otpCode = generateOtp(6);
		const hashed = await bcrypt.hash(otpCode, 10);
		const ttlMinutes = parseInt(process.env.OTP_TTL_MINUTES || '5', 10);
		const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);

		const result = await prisma.$transaction(async (tx) => {
			await tx.otp.updateMany({ where: { adminUserId: admin.id, status: 'active' }, data: { status: 'cancelled' } });

			const otp = await tx.otp.create({
				data: {
					adminUserId: admin.id,
					entityType: 'email_verification',
					entityName: 'admin_login',
					hashedCode: hashed,
					expiresAt,
					sentTo: email,
					status: 'active',
				},
			});

			return { otp, otpCode };
		});

		try {
			const templateId = process.env.ADMIN_LOGIN_OTP_TEMPLATE_ID;
			const params = { code: result.otpCode, name: admin.name };
			const res = await serverApi.post(
				'/admin/email/template_email',
				{ to: admin.email, templateId, params },
				{ headers: { 'x-internal-api': process.env.INTERNAL_API_SECRET } }
			);
			if (!res?.data?.success) throw new Error('Email send failed');
		} catch (err) {
			console.error('Failed to send OTP email', err || err);
			await prisma.otp.updateMany({ where: { id: result.otp.id }, data: { status: 'cancelled' } });
			return NextResponse.json({ error: 'Failed to send OTP email' }, { status: 500 });
		}

		return NextResponse.json({ sessionId: result.otp.id });
	} catch (err) {
		console.error(err);
		return new NextResponse(JSON.stringify({ error: 'Internal server error.' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
	}
}
