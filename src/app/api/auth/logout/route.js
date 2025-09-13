import { cookies } from 'next/headers';

export async function DELETE() {
	const cookieStore = await cookies();
	cookieStore.set('auth_token', '', {
		path: '/',
		sameSite: 'lax',
		maxAge: 0,
	});
	cookieStore.set('refresh_token', '', {
		path: '/',
		sameSite: 'lax',
		maxAge: 0,
	});
	const allCookies = typeof cookieStore.getAll === 'function' ? cookieStore.getAll() : [];
	for (const c of allCookies) {
		if (c && c.name && c.name.startsWith('sb')) {
			cookieStore.set(c.name, '', {
				path: '/',
				sameSite: 'lax',
				maxAge: 0,
			});
		}
	}

	return Response.json({ message: 'Logged out', success: true });
}
