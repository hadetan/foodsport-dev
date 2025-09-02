import { createServerClient } from '@/lib/supabase/server-only';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(_) {
	try {
		const cookieStore = await cookies();
		const refreshToken = cookieStore.get('admin_refresh_token')?.value;
		if (!refreshToken) {
			return NextResponse.json({ error: 'No refresh token.' }, { status: 401 });
		}
		const supabase = await createServerClient();
		const { data, error } = await supabase.auth.refreshSession({ refresh_token: refreshToken });
		if (error || !data.session) {
			return NextResponse.json({ error: 'Failed to refresh session.' }, { status: 401 });
		}
		// Update cookies with new tokens
		cookieStore.set('admin_auth_token', data.session.access_token, {
			httpOnly: true,
			path: '/',
			sameSite: 'lax',
			maxAge: data.session.expires_in || 3600,
		});
		if (data.session.refresh_token) {
			cookieStore.set('admin_refresh_token', data.session.refresh_token, {
				httpOnly: true,
				path: '/',
				sameSite: 'lax',
				maxAge: 60 * 60 * 24 * 30,
			});
		}
		return NextResponse.json({ session: data.session });
	} catch (err) {
		return NextResponse.json({ error: 'Server error', details: err.message }, { status: 500 });
	}
}
