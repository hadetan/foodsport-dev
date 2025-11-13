import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function DELETE(_) {
	try {
		const cookieStore = await cookies();
		const allCookies = typeof cookieStore.getAll === 'function' ? cookieStore.getAll() : [];
		for (const c of allCookies) {
			if (!c || !c.name) continue;
			if (c.name === 'admin_auth_token' || c.name === 'admin_refresh_token' || c.name.startsWith?.('sb')) {
				try {
					cookieStore.delete?.(c.name, { path: c.path || '/', domain: c.domain });
				} catch (e) {
					cookieStore.set?.(c.name, '', {
						path: c.path || '/',
						domain: c.domain,
						maxAge: 0,
					});
				}
			}
		}
		return NextResponse.json({ message: 'Logged out successfully.' });
	} catch (err) {
		return NextResponse.json(
			{ error: 'Logout failed.', details: err.message },
			{ status: 500 }
		);
	}
}
