import { createServerClient } from '@/lib/supabase/server-only';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function DELETE(_) {
	try {
		const cookieStore = await cookies();
		cookieStore.delete('admin_auth_token');
		cookieStore.delete('admin_refresh_token');
		const supabase = await createServerClient();
		await supabase.auth.signOut();
		const all = typeof cookieStore.getAll === 'function' ? cookieStore.getAll() : [];
		for (const c of all) {
			if (c?.name?.startsWith && c.name.startsWith('sb')) {
				cookieStore.delete?.(c.name) || cookieStore.set(c.name, '', { path: '/', maxAge: 0 });
			}
		}
		return NextResponse.json({ message: 'Logged out successfully.' });
	} catch (err) {
		return NextResponse.json({ error: 'Logout failed.', details: err.message }, { status: 500 });
	}
}
