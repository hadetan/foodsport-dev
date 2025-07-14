import { supabase } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma/client';
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
    // Prisma: check admin status
    const adminUser = await prisma.adminUser.findUnique({
      where: { email: session.user.email },
      select: { id: true, name: true, email: true, status: true }
    });
    if (!adminUser || adminUser.status !== 'active') {
      return NextResponse.json({ error: 'Access denied.' }, { status: 403 });
    }
    return NextResponse.json({
      session: session.session,
      admin: {
        id: adminUser.id,
        name: adminUser.name,
        email: adminUser.email,
      },
    });
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
