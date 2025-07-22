
import { prisma } from '@/lib/prisma/client';
import { supabase } from '@/lib/supabase/server';
import { requireUser } from '@/lib/prisma/require-user';

// GET /api/my/profile - Returns all user data for the authenticated user
export async function GET() {
  const { error, user } = await requireUser(supabase, Response);
  if (error) return error;

  try {
    const User = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        userActivities: true,
        calorieSubmissions: true,
        calorieDonations: true,
        userBadges: true,
        referralsGiven: true,
      },
    });
    if (!User) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }
    return Response.json({ user: User });
  } catch (err) {
    return Response.json({ error: 'Failed to fetch user profile', details: err.message }, { status: 500 });
  }
}
