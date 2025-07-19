import { getById, updateById, remove } from '@/lib/prisma/db-utils';
import { validateRequiredFields } from '@/utils/validation';

// POST /api/my/activities/leave
export async function DELETE(request) {
	const { error } = await requireUser(supabase, NextResponse);
	if (error) return error;

	try {
		const body = await request.json();
		const validation = validateRequiredFields(body, [
			'activityId',
			'userId',
		]);
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

		const userActivity = await getById('userActivity', {
			userId: body.userId,
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

		await remove('userActivity', {
			userId: body.userId,
			activityId: body.activityId,
		});

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
