import { getById, updateById } from '@/lib/prisma/db-utils';
import { requireUser } from '@/lib/prisma/require-user';
import { supabase } from '@/lib/supabase/server';
import { validateRequiredFields } from '@/utils/validation';
import { NextResponse } from 'next/server';

// POST /api/my/activities/join
export async function POST(request) {
	const { error, user: User } = await requireUser(supabase, NextResponse, request);
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

		const user = await getById('user', User.id, { id: true });
		if (!user) {
			return Response.json(
				{
					error: 'User not found',
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

		if (
			typeof activity.participantLimit === 'number' &&
			activity.currentParticipants >= activity.participantLimit
		) {
			return Response.json(
				{
					error: 'Activity is full',
				},
				{ status: 400 }
			);
		}

		if (user.totalActivities && user.totalActivities.includes(body.activityId)) {
			return Response.json(
				{
					error: 'User has already joined this activity',
				},
				{ status: 400 }
			);
		}

		const updatedActivity = await updateById('activity', body.activityId, {
			currentParticipants: { increment: 1 },
		});

		const updatedUser = await updateById('user', user.id, {
			totalActivities: { push: body.activityId },
		});

		return Response.json({ message: 'Joined activity successfully.', user: updatedUser, participantCount: updatedActivity.currentParticipants });
	} catch (error) {
		return Response.json(
			{
				error: 'Failed to join activity',
				details: error.message,
			},
			{ status: 500 }
		);
	}
}
