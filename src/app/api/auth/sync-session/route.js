import { createServerClient } from '@/lib/supabase/server-only';
import { cookies } from 'next/headers';

export async function POST(req) {
  try {
    const { access_token, refresh_token } = await req.json();
    if (!access_token) {
      return Response.json({ error: 'Missing access_token' }, { status: 400 });
    }

    // Verify token with Supabase server client
    const supabase = await createServerClient();
    const { data: { user }, error } = await supabase.auth.getUser(access_token);
    if (error || !user) {
      return Response.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Persist Supabase tokens in cookies so existing flows keep working
    const cookieStore = await cookies();
    cookieStore.set('auth_token', access_token, {
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
      maxAge: 86400,
    });
    if (refresh_token) {
      cookieStore.set('refresh_token', refresh_token, {
        httpOnly: true,
        path: '/',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30,
      });
    }

    return Response.json({ ok: true, user: { id: user.id, email: user.email } });
  } catch (err) {
    return Response.json({ error: 'Internal server error', details: err.message }, { status: 500 });
  }
}
