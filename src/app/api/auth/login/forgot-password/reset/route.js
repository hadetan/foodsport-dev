import { resetPasswordWithToken } from '@/lib/auth/password-reset';

export async function POST(req) {
	try {
		const { email, token, password, confirmPassword } = await req.json();
		if (!email || !token || !password) {
			return Response.json(
				{ error: 'Missing email, token, or password' },
				{ status: 400 }
			);
		}

		if (confirmPassword && confirmPassword !== password) {
			return Response.json({ error: 'Passwords do not match' }, { status: 400 });
		}

		const normalizedEmail = String(email).trim().toLowerCase();
		await resetPasswordWithToken({
			email: normalizedEmail,
			password,
			token,
		});

		return Response.json({ success: true });
	} catch (error) {
		const status = error?.statusCode || 500;
		if (status >= 500) {
			console.error('Forgot password reset failed', error);
		}
		return Response.json(
			{ error: error?.message || 'Failed to reset password' },
			{ status }
		);
	}
}


