import { NextResponse } from 'next/server';
import { createSupabaseClient } from '@/lib/supabase/client';
import { requireAdmin } from '@/lib/supabase/require-admin';

// POST /api/admin/register
export async function POST(req) {
  const supabase = createServerClient();
  const { error } = await requireAdmin(supabase, NextResponse);
  if (error) return error;

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
  const { name, email, password } = body;
  if (!name || !email || !password) {
    return NextResponse.json({ error: 'Name, email, and password are required.' }, { status: 400 });
  }

  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({ email, password });
  if (signUpError) {
    let msg = 'Failed to create admin user.';
    if (signUpError.message && signUpError.message.toLowerCase().includes('already')) {
      msg = 'Email already exists.';
    }
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  const newUserId = signUpData.user.id;
  const { error: updateError } = await supabase
    .from('users')
    .update({ is_admin: true, name })
    .eq('id', newUserId);
  if (updateError) {
    return NextResponse.json({ error: 'Failed to set admin role.' }, { status: 500 });
  }

  return NextResponse.json({
    message: 'Admin user created successfully.',
    session: signUpData.session || null,
  });
}