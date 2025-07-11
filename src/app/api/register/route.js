import { prisma } from '@/lib/prisma/client'
import { supabase } from '@/lib/supabase/client'

export async function POST(req) {
  try {
    const { email, password, firstname, lastname, dateOfBirth } = await req.json();
    if (!email || !password || !firstname || !lastname || !dateOfBirth) {
      return Response.json({ error: 'Missing required fields.' }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return Response.json({ error: 'Email already exists.' }, { status: 409 });
    }

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { firstname, lastname }
    });
    if (error) {
      return Response.json({ error: error.message }, { status: 400 });
    }
    const userId = data.user?.id;
    if (!userId) {
      return Response.json({ error: 'Failed to create user.' }, { status: 500 });
    }

    await prisma.user.create({
      data: {
        id: userId,
        dateOfBirth: new Date(dateOfBirth),
        email,
        firstname,
        lastname
      }
    });

    return Response.json({ message: 'User registered successfully.', userId });
  } catch (err) {
    return Response.json({ error: 'Internal server error.\n' + err }, { status: 500 });
  }
}
