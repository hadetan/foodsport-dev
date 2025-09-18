import { prisma } from '@/lib/prisma/db';
import serverApi from '@/utils/axios/serverApi';
import bcrypt from 'bcryptjs';
import { generateOtp } from '@/utils/generateOtp';
import { NextResponse } from 'next/server';

// POST /api/admin/login
export async function POST(req) {
	try {
		const { email, password } = await req.json();
		if (!email || !password) {
			return NextResponse.json({ error: 'Missing email or password.' }, { status: 400 });
		}

		const admin = await prisma.adminUser.findUnique({ where: { email } });
		const otpCode = generateOtp(6);
		const hashed = await bcrypt.hash(otpCode, 10);
		const ttlMinutes = parseInt(process.env.OTP_TTL_MINUTES || '5', 10);
		const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);
		if (!admin) {
			await new Promise((resolve) => setTimeout(resolve, 500));
			return NextResponse.json({ error: 'Invalid credentials.' }, { status: 400 });
		}

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
			const templateId = parseInt(process.env.OTP_TEMPLATE_ID || '191', 10);
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
