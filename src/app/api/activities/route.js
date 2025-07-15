import { getMany } from '@/lib/prisma/db-utils';
const { getCache, setCache } = await import('@/utils/cache');

// GET /api/activities - Get all activities with optional filters
export async function GET(request) {
  try {
    const cacheKey = 'activities';
    const cached = getCache(cacheKey);
    if (cached) {
      return Response.json(cached);
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const location = searchParams.get('location');
    const date = searchParams.get('date');
    const limit = parseInt(searchParams.get('limit')) || 50;
    const page = parseInt(searchParams.get('page')) || 0;

    const filters = {};
    if (status) filters.status = status;
    if (type) filters.type = type;
    if (location) filters.location = location;
    if (date) filters.date = date;

    const options = {
      limit,
      skip: page * limit,
      orderBy: { created_at: 'desc' }
    };

    const activities = await getMany('activity', filters, {
      id: true, title: true, description: true, type: true, location: true, date: true, time: true,
      status: true, participant_limit: true, current_participants: true, organizer_id: true,
      image_url: true, created_at: true, updated_at: true
    }, options);

    const activitiesWithOrganizers = await Promise.all(
      activities.map(async (activity) => {
        if (activity.organizer_id) {
          const organizer = await getMany('user', { id: activity.organizer_id }, { name: true, profile_picture: true });
          return {
            ...activity,
            organizer: organizer?.[0]?.name || 'Unknown',
            organizerPicture: organizer?.[0]?.profile_picture || null
          };
        }
        return {
          ...activity,
          organizer: 'Unknown',
          organizerPicture: null
        };
      })
    );

    const response = {
      activities: activitiesWithOrganizers,
      pagination: {
        page,
        limit,
        total: activitiesWithOrganizers.length
      }
    };
    setCache(cacheKey, response, 60);
    return Response.json(response);
  } catch (error) {
    return Response.json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Internal server error',
        details: error.message
      }
    }, { status: 500 });
  }
}
