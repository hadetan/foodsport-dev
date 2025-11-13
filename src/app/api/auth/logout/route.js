import { cookies } from 'next/headers';

export async function DELETE() {
	const cookieStore = await cookies();
	const allCookies = typeof cookieStore.getAll === 'function' ? cookieStore.getAll() : [];
	for (const c of allCookies) {
		if (!c || !c.name) continue;
		if (c.name === 'auth_token' || c.name === 'refresh_token' || c.name.startsWith?.('sb')) {
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

	return Response.json({ message: 'Logged out', success: true });
}
