import { insert, getById, updateById, getByIdComposite } from '@/lib/prisma/db-utils';
import { requireUser } from '@/lib/prisma/require-user';
import { supabase } from '@/lib/supabase/server';
import { validateRequiredFields } from '@/utils/validation';
import { NextResponse } from 'next/server';

// POST /api/my/activities/join
export async function POST(request) {
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

		const user = await getById('user', body.userId, { id: true });
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

		const alreadyJoined = await getByIdComposite('userActivity', {
			userId: body.userId,
			activityId: body.activityId,
		});
		if (alreadyJoined && !alreadyJoined.error) {
			return Response.json(
				{
					error: 'User has already joined this activity',
				},
				{ status: 400 }
			);
		}

		const insertResult = await insert('userActivity', {
			userId: body.userId,
			activityId: body.activityId,
			joinedAt: new Date().toISOString(),
		});
		if (insertResult && insertResult.error) {
			console.error('Insert userActivity error:', insertResult);
			return Response.json(
				{
					error: 'Failed to join activity',
					details: insertResult.error,
				},
				{ status: 500 }
			);
		}

		await updateById('activity', body.activityId, {
			currentParticipants: { increment: 1 },
		});

		await updateById('user', body.userId, {
			totalActivities: { increment: 1 },
		});

		return Response.json({ message: 'Joined activity successfully.' });
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
