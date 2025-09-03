import { createServerClient } from '@/lib/supabase/server-only';
import { prisma } from '@/lib/prisma/db';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// POST /api/admin/login
export async function POST(req) {
	try {
		const { email, password } = await req.json();
		if (!email || !password) {
			return NextResponse.json(
				{ error: 'Email and password are required.' },
				{ status: 400 }
			);
		}

		const supabase = await createServerClient();
		const { data: session, error: authError } = await supabase.auth.signInWithPassword({ email, password });
		if (authError || !session || !session.user) {
			return NextResponse.json(
				{ error: 'Invalid credentials.' },
				{ status: 401 }
			);
		}
		const adminUser = await prisma.adminUser.findUnique({
			where: { email: session.user.email },
			select: { id: true, name: true, email: true, status: true },
		});
		if (!adminUser || adminUser.status !== 'active') {
			return NextResponse.json(
				{ error: 'Access denied.' },
				{ status: 403 }
			);
		}
		const cookieStore = await cookies();
		if (session.session?.access_token) {
			cookieStore.set('admin_auth_token', session.session.access_token, {
				httpOnly: true,
				path: '/',
				sameSite: 'lax',
				maxAge: session.session.expires_in || 3600,
			});
			if (session.session.refresh_token) {
				cookieStore.set('admin_refresh_token', session.session.refresh_token, {
					httpOnly: true,
					path: '/',
					sameSite: 'lax',
					maxAge: 10,
				});
			}
		}
		return NextResponse.json({
			session: session.session,
			admin: {
				id: adminUser.id,
				name: adminUser.name,
				email: adminUser.email,
			},
		});
	} catch (error) {
		console.error('Error in POST /api/admin/login:', error);
		return new NextResponse(
			JSON.stringify({ error: 'Failed to login. Please try again later.', message: error.message }),
			{
				status: 500,
				headers: { 'Content-Type': 'application/json' },
			}
		);
	}
}
