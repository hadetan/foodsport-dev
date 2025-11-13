import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(_) {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get('refresh_token')?.value;
    if (!refreshToken) {
      return NextResponse.json({ error: 'No refresh token.' }, { status: 401 });
    }
    // Use Supabase SSR client to refresh session
    const { createServerClient } = await import('@/lib/supabase/server-only');
    const supabase = await createServerClient();
    const { data, error } = await supabase.auth.refreshSession({ refresh_token: refreshToken });
    if (error || !data.session) {
      return NextResponse.json({ error: 'Failed to refresh session.' }, { status: 401 });
    }
    // Update cookies with new tokens
    cookieStore.set('auth_token', data.session.access_token, {
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
      maxAge: 86400,
    });
    if (data.session.refresh_token) {
      cookieStore.set('refresh_token', data.session.refresh_token, {
        httpOnly: true,
        path: '/',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30,
      });
    }
    return NextResponse.json({ session: data.session });
  } catch (err) {
    return NextResponse.json({ error: err.message || 'Unexpected error.' }, { status: 500 });
  }
}
