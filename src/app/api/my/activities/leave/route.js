import { getById, getByIdComposite, getCount, remove } from '@/lib/prisma/db-utils';
import api from '@/utils/axios/api';
import { prisma } from '@/lib/prisma/db';
import { requireUser } from '@/lib/prisma/require-user';
import { createServerClient } from '@/lib/supabase/server-only';
import { validateRequiredFields } from '@/utils/validation';
import { NextResponse } from 'next/server';

// DELETE /api/my/activities/leave
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
			title: true,
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

		const user = await getById('user', User.id, { id: true, firstname: true, lastname: true, email: true });
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

		const templateId = 192;
		const params = {
			name: `${user.firstname} ${user.lastname}`,
			activity: activity.title,
		};
		let emailError;
		try {
			await api.post('/admin/email/template_email', {
				to: user.email,
				templateId,
				params,
			});
		} catch (e) {
			emailError = e;
		}

		// Transaction: cancel tickets and remove userActivity atomically
		await prisma.$transaction([
			prisma.ticket.updateMany({
				where: {
					userId: user.id,
					activityId: body.activityId,
				},
				data: {
					status: 'cancelled',
				},
			}),
			prisma.userActivity.delete({
				where: { id: userActivity.id },
			}),
		]);

		const updatedCount = await getCount('userActivity', {
			activityId: body.activityId,
		});

		return Response.json({
			message: 'Left activity successfully.',
			participantCount: updatedCount,
			emailError,
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
