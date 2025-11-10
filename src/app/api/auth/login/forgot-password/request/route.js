import { requestPasswordReset } from '@/lib/auth/password-reset';

export async function POST(req) {
	try {
		const { email } = await req.json();
		if (!email) {
			return Response.json({ error: 'Missing email' }, { status: 400 });
		}

		const normalizedEmail = String(email).trim().toLowerCase();
		const { otpId, expiresAt } = await requestPasswordReset(normalizedEmail);

		return Response.json({
			otpId,
			expiresAt,
		});
	} catch (error) {
		const status = error?.statusCode || 500;
		if (status >= 500) {
			console.error('Forgot password request failed', error);
		}
		return Response.json(
			{ error: error?.message || 'Failed to request password reset' },
			{ status }
		);
	}
}


