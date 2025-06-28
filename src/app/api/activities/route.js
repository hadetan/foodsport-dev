import { getMany, insert, validateRequiredFields, sanitizeData, formatDbError } from '@/lib/supabase/db-utils';

// GET /api/activities - Get all activities with optional filters
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    // Extract query parameters
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

    // Build options
    const options = {
      limit,
      range: {
        from: page * limit,
        to: (page + 1) * limit - 1
      },
      orderBy: {
        column: 'created_at',
        ascending: false
      }
    };

    // Get activities from database
    const { data: activities, error } = await getMany('activities', filters, [
      'id', 'title', 'description', 'type', 'location', 'date', 'time',
      'status', 'participant_limit', 'current_participants', 'organizer_id',
      'image_url', 'created_at', 'updated_at'
    ], options);

    if (error) {
      console.error('Database error:', error);
      return Response.json({
        error: {
          code: 'DATABASE_ERROR',
          message: 'Failed to fetch activities',
          details: error.message
        }
      }, { status: 500 });
    }

    // Get organizer names for each activity
    const activitiesWithOrganizers = await Promise.all(
      activities.map(async (activity) => {
        if (activity.organizer_id) {
          const { data: organizer } = await getMany('users',
            { id: activity.organizer_id },
            ['name', 'profile_picture']
          );
          return {
            ...activity,
            organizer: organizer?.[0]?.name || 'Unknown',
            organizerPicture: organizer?.[0]?.profile_picture
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
        total: activities.length
      }
    });

  } catch (error) {
    console.error('API error:', error);
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

    // Validate required fields
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

    // Sanitize data
    const allowedFields = [
      'title', 'description', 'type', 'location', 'date', 'time',
      'participant_limit', 'organizer_id', 'image_url'
    ];
    const sanitizedData = sanitizeData(body, allowedFields);

    // Set default values
    sanitizedData.status = 'upcoming';
    sanitizedData.current_participants = 0;
    sanitizedData.created_at = new Date().toISOString();
    sanitizedData.updated_at = new Date().toISOString();

    // Insert into database
    const { data: activity, error } = await insert('activities', sanitizedData);

    if (error) {
      const formattedError = formatDbError(error);
      return Response.json({
        error: formattedError
      }, { status: 400 });
    }

    return Response.json({
      message: 'Activity created successfully',
      activity
    }, { status: 201 });

  } catch (error) {
    console.error('API error:', error);
    return Response.json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Internal server error',
        details: error.message
      }
    }, { status: 500 });
  }
}
