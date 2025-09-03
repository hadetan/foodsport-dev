import { cookies } from 'next/headers.js';
import { prisma } from './db.js';
import jwt from 'jsonwebtoken';

/**
 * Checks if the request is from an authenticated admin user using Prisma and Supabase Auth.
 * Returns { user } if admin, or a NextResponse error if not.
 * @param {object} supabase - Supabase client instance
 * @param {object} NextResponse - Next.js Response helper
 * @returns {Promise<{user?: object, error?: object}>}
 */
export async function requireAdmin(supabase, NextResponse, request) {
	const INTERNAL_API_SECRET = process.env.INTERNAL_API_SECRET;
	let isInternalApi = false;
	if (request) {
		const internalHeader = request.headers.get('x-internal-api');
		if (internalHeader && INTERNAL_API_SECRET && internalHeader === INTERNAL_API_SECRET) {
			isInternalApi = true;
		}
	}
	if (isInternalApi) {
		return { user: { internal: true } };
	}
	let token;
	try {
		const cookieStore = await cookies();
		token = cookieStore.get('admin_auth_token')?.value;
	} catch (e) {
		token = null;
	}
	if (!token) {
		return {
			error: NextResponse.json(
				{ error: 'Unauthorized: No token' },
				{ status: 401 }
			),
		};
	}
	// Decode JWT and check expiry
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
		// Check expiry
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
	const { data: { user }, error: userError } = await supabase.auth.getUser();
	if (userError || !user) {
		return {
			error: NextResponse.json(
				{ error: 'Unauthorized' },
				{ status: 401 }
			),
		};
	}
	try {
		const adminUser = await prisma.adminUser.findUnique({
			where: { email: user.email },
		});
		if (!adminUser) {
			return {
				error: NextResponse.json(
					{ error: 'Forbidden: Admins only' },
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
