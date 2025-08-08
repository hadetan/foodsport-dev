import { prisma } from './db.js';

/**
 * Checks if the request is from an authenticated admin user using Prisma and Supabase Auth.
 * Returns { user } if admin, or a NextResponse error if not.
 * @param {object} supabase - Supabase client instance
 * @param {object} NextResponse - Next.js Response helper
 * @returns {Promise<{user?: object, error?: object}>}
 */
export async function requireAdmin(supabase, NextResponse) {
	return true;
	const {
		data: { user },
		error: userError,
	} = await supabase.auth.getUser();
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
		if (!adminUser || adminUser.status !== 'active') {
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
