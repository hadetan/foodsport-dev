import { supabaseClient } from '@/lib/supabase/client';
import { prisma } from '@/lib/prisma/client';
import { cookies } from 'next/headers';

export async function POST(req) {
	try {
		const { email, password } = await req.json();
		if (!email || !password) {
			return Response.json(
				{ error: 'Missing email or password.' },
				{ status: 400 }
			);
		}
		const { data, error } = await supabaseClient.auth.signInWithPassword({
			email,
			password,
		});
		if (error) {
			return Response.json(
				{ error: 'Invalid credentials. ' + error },
				{ status: 401 }
			);
		}
		const user = await prisma.user.findUnique({ where: { email } });
		if (!user) {
			return Response.json({ error: 'User not found.' }, { status: 404 });
		}
		if (data.session?.access_token) {
			const cookieStore = await cookies();
			cookieStore.set('auth_token', data.session.access_token, {
				httpOnly: true,
				path: '/',
				sameSite: 'lax',
				maxAge: data.session.expires_in || 3600,
			});
			if (data.session.refresh_token) {
				cookieStore.set('refresh_token', data.session.refresh_token, {
					httpOnly: true,
					path: '/',
					sameSite: 'lax',
					maxAge: 60 * 60 * 24 * 30,
				});
			}
		}
		return Response.json({
			session: data.session,
			user: {
				id: user.id,
				firstname: user.firstname,
				lastname: user.lastname,
				email: user.email,
			},
		});
	} catch (err) {
		return Response.json(
			{ error: 'Internal server error.' },
			{ status: 500 }
		);
	}
}
