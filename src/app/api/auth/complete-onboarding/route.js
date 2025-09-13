import { createServerClient } from '@/lib/supabase/server-only';
import { prisma } from '@/lib/prisma/db';
import { cookies } from 'next/headers';

export async function POST(req) {
  try {
    const body = await req.json();
    const { dateOfBirth, weight, height, district } = body;
    if (!dateOfBirth) {
      return Response.json({ error: 'Missing required fields.' }, { status: 400 });
    }

    const supabase = await createServerClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find preProfile
    const pre = await prisma.preProfile.findUnique({ where: { supabaseUserId: user.id } });
    if (!pre) {
      return Response.json({ error: 'PreProfile not found' }, { status: 404 });
    }

    // Check for email collision
    const existingByEmail = await prisma.user.findUnique({ where: { email: pre.email } });
    if (existingByEmail) {
      return Response.json({ error: 'Email already exists. Please login with existing account to link.' }, { status: 409 });
    }

    // Create user with id set to supabase user id OR use generated id
    const created = await prisma.user.create({
      data: {
        id: user.id, // set canonical id to supabase user id
        email: pre.email,
        firstname: pre.firstname,
        lastname: pre.lastname,
        dateOfBirth: new Date(dateOfBirth),
        weight: weight ? Number(weight) : undefined,
        height: height ? Number(height) : undefined,
        district: district || undefined,
        profilePictureUrl: pre.pictureUrl || undefined,
        googleId: user.id,
        emailVerified: pre.emailVerified || false,
      }
    });

    // Delete preProfile
    await prisma.preProfile.delete({ where: { id: pre.id } });

    // Return created user
    return Response.json({ user: { id: created.id, email: created.email } });
  } catch (err) {
    return Response.json({ error: 'Internal server error', details: err.message }, { status: 500 });
  }
}
