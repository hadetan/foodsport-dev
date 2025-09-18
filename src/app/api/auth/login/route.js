import { prisma } from '@/lib/prisma/db';
import serverApi from '@/utils/axios/serverApi';
import bcrypt from 'bcryptjs';
import { generateOtp } from '@/utils/generateOtp';

// POST /api/auth/login
export async function POST(req) {
	try {
		const { email, password } = await req.json();
		if (!email || !password) {
			return Response.json({ error: 'Missing email or password.' }, { status: 400 });
		}

		const user = await prisma.user.findUnique({ where: { email } });
		const otpCode = generateOtp(6);
		const hashed = await bcrypt.hash(otpCode, 10);
		const ttlMinutes = parseInt(process.env.OTP_TTL_MINUTES || '5', 10);
		const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);
		if (!user) {
			await new Promise((resolve) => setTimeout(resolve, 500));
			return Response.json({ error: 'Invalid credentials.' }, { status: 400 });
		}

		const result = await prisma.$transaction(async (tx) => {
			await tx.otp.updateMany({ where: { userId: user.id, status: 'active' }, data: { status: 'cancelled' } });

			const otp = await tx.otp.create({
				data: {
					userId: user.id,
					entityType: 'email_verification',
					entityName: 'login',
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
			const params = { code: result.otpCode, name: `${user.firstname || ''} ${user.lastname || ''}` };
			const res = await serverApi.post(
				'/admin/email/template_email',
				{ to: user.email, templateId, params },
				{ headers: { 'x-internal-api': process.env.INTERNAL_API_SECRET } }
			);
			if (!res?.data?.success) throw new Error('Email send failed');
		} catch (err) {
			console.error('Failed to send OTP email', err || err);
			await prisma.otp.updateMany({ where: { id: result.otp.id }, data: { status: 'cancelled' } });
			return Response.json({ error: 'Failed to send OTP email' }, { status: 500 });
		}

		return Response.json({ sessionId: result.otp.id });
	} catch (err) {
		console.error(err);
		return Response.json({ error: 'Internal server error.' }, { status: 500 });
	}
}
