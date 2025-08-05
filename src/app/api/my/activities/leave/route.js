import { getById, getByIdComposite, getCount, remove } from '@/lib/prisma/db-utils';
import { requireUser } from '@/lib/prisma/require-user';
import { createServerClient } from '@/lib/supabase/server-only';
import { validateRequiredFields } from '@/utils/validation';
import { NextResponse } from 'next/server';

// POST /api/my/activities/leave
export async function DELETE(request) {
	const supabase = await createServerClient();
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

		const user = await getById('user', User.id, { id: true });
		if (!user) {
			return Response.json(
				{
					error: 'User not found',
				},
				{ status: 404 }
			);
		}

		const userActivity = await getByIdComposite('userActivity', {
			userId: user.id,
			activityId: body.activityId,
		});
		if (!userActivity) {
			return Response.json(
				{
					error: 'User has not joined this activity',
				},
				{ status: 400 }
			);
		}

		const currentCount = await getCount('userActivity', {
			activityId: body.activityId,
		});
		await remove('userActivity', { id: userActivity.id });
		const updatedCount = currentCount - 1;

		return Response.json({
			message: 'Left activity successfully.',
			participantCount: updatedCount,
		});
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
