import { remove, getById, updateById, getByIdComposite } from '@/lib/prisma/db-utils';
import { requireUser } from '@/lib/prisma/require-user';
import { supabase } from '@/lib/supabase/server';
import { validateRequiredFields } from '@/utils/validation';
import { NextResponse } from 'next/server';

// POST /api/my/activities/leave
export async function DELETE(request) {
  const { error } = await requireUser(supabase, NextResponse);
  if (error) return error;

  try {
    const body = await request.json();
    const requiredFields = ['activityId', 'userId'];
    const validation = validateRequiredFields(body, requiredFields);
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

    const user = await getById('user', body.userId, { id: true });
    if (!user) {
      return Response.json(
        {
          error: 'User not found',
        },
        { status: 404 }
      );
    }

    const joined = await getByIdComposite('userActivity', {
      userId: body.userId,
      activityId: body.activityId,
    });
    if (!joined || joined.error) {
      return Response.json(
        {
          error: 'User has not joined this activity',
        },
        { status: 400 }
      );
    }

    const removeResult = await remove('userActivity', {
      userId_activityId: {
        userId: body.userId,
        activityId: body.activityId,
      },
    });
    if (removeResult && removeResult.error) {
      console.error('Remove userActivity error:', removeResult);
      return Response.json(
        {
          error: 'Failed to leave activity',
          details: removeResult.error,
        },
        { status: 500 }
      );
    }

    await updateById('activity', body.activityId, {
      currentParticipants: { decrement: 1 },
    });

    await updateById('user', body.userId, {
      totalActivities: { decrement: 1 },
    });

    return Response.json({ message: 'Left activity successfully.' });
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