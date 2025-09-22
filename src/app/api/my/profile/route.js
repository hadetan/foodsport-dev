
import { prisma } from '@/lib/prisma/db';
import { createServerClient } from '@/lib/supabase/server-only';
import { requireUser } from '@/lib/prisma/require-user';
import { cacheGoogleAvatar } from '@/lib/avatar/cacheGoogleAvatar';

// GET /api/my/profile - Returns all user data for the authenticated user
export async function GET() {
  const supabase = await createServerClient();
  const { error, user } = await requireUser(supabase, Response);
  if (error) return error;

  try {
    let User = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        userActivities: { select: { activityId: true, wasPresent: true, totalDuration: true } },
        calorieSubmissions: true,
        calorieDonations: true,
        userBadges: true,
        referralsGiven: true,
      },
    });
    if (!User) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }
    if (User.profilePictureUrl?.includes('googleusercontent.com')) {
      const cachedUrl = await cacheGoogleAvatar(User.id, User.profilePictureUrl);
      if (cachedUrl !== User.profilePictureUrl) {
        User = await prisma.user.findUnique({
          where: { id: user.id },
          include: {
            userActivities: { select: { activityId: true, wasPresent: true, totalDuration: true } },
            calorieSubmissions: true,
            calorieDonations: true,
            userBadges: true,
            referralsGiven: true,
          },
        });
      }
    }
    const joinedActivityIds = User.userActivities.map(ua => ua.activityId);
    return Response.json({ user: {...User, joinedActivityIds} });
  } catch (err) {
    return Response.json({ error: 'Failed to fetch user profile', details: err.message }, { status: 500 });
  }
}
