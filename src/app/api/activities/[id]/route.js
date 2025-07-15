import { getMany } from '@/lib/prisma/db-utils';
const { getCache, setCache } = await import('@/utils/cache');

// GET /api/activities/[id] - Get details of a specific activity
export async function GET({ params }) {
  try {
    const { id } = params;
    const cacheKey = `activity_${id}`;
    const cached = getCache(cacheKey);
    if (cached) {
      return Response.json(cached);
    }

    const activity = await getMany(
      'activity',
      { id },
      {
        id: true,
        title: true,
        description: true,
        activityType: true,
        location: true,
        startDate: true,
        endDate: true,
        startTime: true,
        endTime: true,
        status: true,
        participantLimit: true,
        currentParticipants: true,
        organizerName: true,
        organizerId: true,
        imageUrl: true,
        pointsPerParticipant: true,
        caloriesPerHour: true,
        isFeatured: true,
        createdAt: true,
        updatedAt: true,
      }
    );
    if (!activity) {
      return Response.json({ error: 'Activity not found' }, { status: 404 });
    }

    const response = {
      ...activity,
      organizerPicture,
    };
    setCache(cacheKey, response, 60);
    return Response.json(response);
  } catch (error) {
    return Response.json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Internal server error',
        details: error.message,
      },
    }, { status: 500 });
  }
}
