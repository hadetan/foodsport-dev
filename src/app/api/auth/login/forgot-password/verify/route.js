import { verifyPasswordResetOtp } from '@/lib/auth/password-reset';

export async function POST(req) {
	try {
		const { otpId, code, email } = await req.json();
		if (!otpId || !code || !email) {
			return Response.json(
				{ error: 'Missing otpId, code, or email' },
				{ status: 400 }
			);
		}

		const normalizedEmail = String(email).trim().toLowerCase();
		const { resetToken, tokenExpiresAt } = await verifyPasswordResetOtp({
			otpId,
			code,
			email: normalizedEmail,
		});

		return Response.json({
			resetToken,
			tokenExpiresAt,
		});
	} catch (error) {
		const status = error?.statusCode || 500;
		if (status >= 500) {
			console.error('Forgot password OTP verify failed', error);
		}
		const payload = { error: error?.message || 'Failed to verify OTP' };
		if (typeof error?.attemptsLeft === 'number') {
			payload.attemptsLeft = error.attemptsLeft;
		}
		return Response.json(payload, { status });
	}
}


