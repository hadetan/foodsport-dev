import { executeTransaction, getById, getByIdComposite, getCount, insert } from '@/lib/prisma/db-utils';
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

		const userActivity = await executeTransaction(async (tx) => {
 			const participantCount = await tx.userActivity.count({ where: { activityId: body.activityId } });
 			if (
 				typeof activity.participantLimit === 'number' &&
 				participantCount >= activity.participantLimit
 			) {
 				throw new Error('Activity is full');
 			}
 
 			const alreadyJoined = await tx.userActivity.findUnique({
 				where: {
 					userId_activityId: {
 						userId: user.id,
 						activityId: body.activityId,
 					},
 				},
 			});
 			if (alreadyJoined) {
 				throw new Error('User has already joined this activity');
 			}
 
 			return await tx.userActivity.create({
 				data: {
 					userId: user.id,
 					activityId: body.activityId,
 				},
 			});
 		});

		const updatedCount = await getCount('userActivity', { activityId: body.activityId });

		return Response.json({ message: 'Joined activity successfully.', userActivity, participantCount: updatedCount });
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
