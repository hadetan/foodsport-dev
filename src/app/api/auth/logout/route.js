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
  return Response.json({ message: 'Logged out' });
}
