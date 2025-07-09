import { getMany, insert } from '@/lib/prisma/db-utils';
import { validateRequiredFields } from '@/utils/validation';
import { sanitizeData } from '@/utils/sanitize';
import { formatDbError } from '@/utils/formatDbError';

// GET /api/activities - Get all activities with optional filters
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const location = searchParams.get('location');
    const date = searchParams.get('date');
    const limit = parseInt(searchParams.get('limit')) || 50;
    const page = parseInt(searchParams.get('page')) || 0;

    // Build filters
    const filters = {};
    if (status) filters.status = status;
    if (type) filters.type = type;
    if (location) filters.location = location;
    if (date) filters.date = date;

    // Prisma options
    const options = {
      limit,
      skip: page * limit,
      orderBy: { created_at: 'desc' }
    };

    // Get activities from database
    const activities = await getMany('activity', filters, {
      id: true, title: true, description: true, type: true, location: true, date: true, time: true,
      status: true, participant_limit: true, current_participants: true, organizer_id: true,
      image_url: true, created_at: true, updated_at: true
    }, options);

    // Get organizer names for each activity
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

    return Response.json({
      activities: activitiesWithOrganizers,
      pagination: {
        page,
        limit,
        total: activitiesWithOrganizers.length
      }
    });
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

// POST /api/activities - Create a new activity
export async function POST(request) {
  try {
    const body = await request.json();
    const requiredFields = ['title', 'description', 'type', 'location', 'date', 'time', 'organizer_id'];
    const validation = validateRequiredFields(body, requiredFields);
    if (!validation.isValid) {
      return Response.json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Missing required fields',
          details: validation.error
        }
      }, { status: 400 });
    }
    const allowedFields = [
      'title', 'description', 'type', 'location', 'date', 'time',
      'participant_limit', 'organizer_id', 'image_url'
    ];
    const sanitizedData = sanitizeData(body, allowedFields);
    sanitizedData.status = 'upcoming';
    sanitizedData.current_participants = 0;
    sanitizedData.created_at = new Date().toISOString();
    sanitizedData.updated_at = new Date().toISOString();
    const activity = await insert('activity', sanitizedData);
    if (activity && activity.error) {
      const formattedError = formatDbError(activity.error);
      return Response.json({ error: formattedError }, { status: 400 });
    }
    return Response.json({
      message: 'Activity created successfully',
      activity
    }, { status: 201 });
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
