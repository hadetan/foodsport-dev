import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(req) {
  try {
    const { session } = await req.json();
    if (!session || !session.refresh_token || !session.access_token) {
      return NextResponse.json({ error: 'No valid session or tokens provided.' }, { status: 401 });
    }
    const cookieStore = await cookies();
    cookieStore.set('auth_token', session.access_token, {
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
      maxAge: session.expires_in || 3600
    });
    cookieStore.set('refresh_token', session.refresh_token, {
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message || 'Unexpected error.' }, { status: 500 });
  }
}
