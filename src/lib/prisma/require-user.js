import { prisma } from './db.js';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { getAuthenticatedUser } from '@/lib/supabase/server-only.js';

/**
 * Checks if the request is from an authenticated user using Supabase Auth.
 * Returns { user } if authenticated, or a NextResponse error if not.
 * @param {object} supabase - Supabase server client instance
 * @param {object} NextResponse - Next.js Response helper
 * @param {object} request - Next.js request object
 * @returns {Promise<{user?: object, error?: object}>}
 */
export async function requireUser(_ ,NextResponse) {
	const cookieStore = await cookies();
	const token = cookieStore.get('auth_token')?.value;
	if (!token) {
		return {
			error: NextResponse.json(
				{ error: 'Token was not given' },
				{ status: 401 }
			),
		};
	}
	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		if (!decoded || !decoded.exp) {
			return {
				error: NextResponse.json(
					{ error: 'Unauthorized: Invalid token' },
					{ status: 401 }
				),
			};
		}
		const now = Math.floor(Date.now() / 1000);
		if (decoded.exp < now) {
			return {
				error: NextResponse.json(
					{ error: 'Unauthorized: Token expired' },
					{ status: 401 }
				),
			};
		}
	} catch (err) {
		return {
			error: NextResponse.json(
				{ error: 'Unauthorized: Invalid or expired token', details: err.message },
				{ status: 401 }
			),
		};
	}
	let user = await getAuthenticatedUser();
	let userError = null;
	if (!user) {
		userError = true;
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
					{ error: 'user_forbidden' },
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
