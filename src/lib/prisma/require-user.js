import { prisma } from './db.js';
import { cookies } from 'next/headers';
import { getAuthenticatedUser } from '@/lib/supabase/server-only.js';

/**
 * Checks if the request is from an authenticated user using Supabase Auth.
 * Returns { user } if authenticated, or a NextResponse error if not.
 * @param {object} supabase - Supabase server client instance
 * @param {object} NextResponse - Next.js Response helper
 * @param {object} request - Next.js request object
 * @returns {Promise<{user?: object, error?: object}>}
 */
export async function requireUser(supabase, NextResponse) {
	const cookieStore = await cookies();
	const token = cookieStore.get('auth_token');
	const refreshToken = cookieStore.get('refresh_token');

	if (!token) {
		return {
			error: NextResponse.json(
				{ error: 'Token was not given' },
				{ status: 401 }
			),
		};
	}

	let user = await getAuthenticatedUser();
	let userError = null;
	if (!user) {
		userError = true;
	}

	if (userError && refreshToken) {
		const { data: refreshed, error: refreshError } =
			await supabase.auth.refreshSession({
				refresh_token: refreshToken.value,
			});
		if (refreshError || !refreshed?.session?.access_token) {
			return {
				error: NextResponse.json(
					{ error: 'Unauthorized' },
					{ status: 401 }
				),
			};
		}
		cookieStore.set('auth_token', refreshed.session.access_token, {
			httpOnly: true,
			path: '/',
			sameSite: 'lax',
			maxAge: refreshed.session.expires_in || 3600,
		});
		cookieStore.set('refresh_token', refreshed.session.refresh_token, {
			httpOnly: true,
			path: '/',
			sameSite: 'lax',
			maxAge: refreshed.session.expires_in
				? refreshed.session.expires_in * 10
				: 60 * 60 * 24 * 30,
		});
		const retryUser = await getAuthenticatedUser();
		if (!retryUser) {
			return {
				error: NextResponse.json(
					{ error: 'Unauthorized' },
					{ status: 401 }
				),
			};
		}
		userError = null;
		user = retryUser;
	}

	if (userError || !user) {
		return {
			error: NextResponse.json(
				{ error: 'Unauthorized' },
				{ status: 401 }
			),
		};
	}

	try {
		const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
		if (!dbUser || dbUser.isActive === false) {
			return {
				error: NextResponse.json(
					{ error: 'Forbidden: Users only' },
					{ status: 403 }
				),
			};
		}
		return { user };
	} catch (err) {
		return {
			error: NextResponse.json(
				{ error: 'Server error', details: err.message },
				{ status: 500 }
			),
		};
	}
}
