import { supabase } from '@/lib/supabase/client';
import { NextResponse } from 'next/server';

// POST /api/admin/login
export async function POST(req) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
    }

    const { data: session, error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError || !session || !session.user) {
      return NextResponse.json({ error: 'Invalid credentials.' }, { status: 401 });
    }

    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, name, email')
      .eq('id', session.user.id)
      .match({ id: session.user.id, is_admin: true })
      .single();

    if (userError || !user || !user.is_admin) {
      return NextResponse.json({ error: 'Access denied.' }, { status: 403 });
    }

    return NextResponse.json({
      session: session.session,
      admin: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
