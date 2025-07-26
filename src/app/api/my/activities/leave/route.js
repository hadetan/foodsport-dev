import { getById, updateById } from '@/lib/prisma/db-utils';
import { requireUser } from '@/lib/prisma/require-user';
import { supabase } from '@/lib/supabase/server';
import { validateRequiredFields } from '@/utils/validation';
import { NextResponse } from 'next/server';

// POST /api/my/activities/leave
export async function DELETE(request) {
  const { error, user: User } = await requireUser(supabase, NextResponse);
  if (error) return error;

  try {
    const body = await request.json();
    const validation = validateRequiredFields(body, ['activityId']);
    if (!validation.isValid) {
      return Response.json(
        {
          error: 'Missing required fields',
          details: validation.error,
        },
        { status: 400 }
      );
    }

    const activity = await getById('activity', body.activityId, {
      status: true,
      participantLimit: true,
      currentParticipants: true,
    });
    if (!activity) {
      return Response.json(
        {
          error: 'Activity not found',
        },
        { status: 404 }
      );
    }

    if (activity.status !== 'active') {
      return Response.json(
        {
          error: 'Activity is not active',
        },
        { status: 400 }
      );
    }

    const user = await getById('user', User.id, { id: true, totalActivities: true });
		if (!user) {
			return Response.json(
				{
					error: 'User not found',
				},
				{ status: 404 }
			);
		}

    if (!user.totalActivities || !user.totalActivities.includes(body.activityId)) {
      return Response.json(
        {
          error: 'User has not joined this activity',
        },
        { status: 400 }
      );
    }
    
    const updatedActivity = await updateById('activity', body.activityId, {
      currentParticipants: { decrement: 1 },
    });
    
    const updatedUser = await updateById('User', user.id, {
      totalActivities: { set: user.totalActivities.filter(id => id !== body.activityId) },
    });

    return Response.json({ message: 'Left activity successfully.', user: updatedUser, participantCount: updatedActivity.currentParticipants });
  } catch (error) {
    return Response.json(
      {
        error: 'Failed to leave activity',
        details: error.message,
      },
      { status: 500 }
    );
  }
}