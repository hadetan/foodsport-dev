import { executeTransaction, getById, getCount } from '@/lib/prisma/db-utils';
import { requireUser } from '@/lib/prisma/require-user';
import { createServerClient } from '@/lib/supabase/server-only';
import { validateRequiredFields } from '@/utils/validation';
import { NextResponse } from 'next/server';
import { generateUniqueTicketCode } from '@/utils/generateUniqueTicketCode';
import serverApi from '@/utils/axios/serverApi';

// POST /api/my/activities/join
export async function POST(request) {
	const supabase = await createServerClient();
	const { error, user: User } = await requireUser(supabase, NextResponse, request);
	if (error) return error;

	try {
		const body = await request.json();
		const validation = validateRequiredFields(body, ['activityId']);
		if (!validation.isValid) {
			return Response.json(
			{ error: 'Missing required fields', details: validation.error },
				{ status: 400 }
			);
		}

		const activity = await getById('activity', body.activityId, {
			status: true,
			participantLimit: true,
			title: true,
		});
		if (!activity) {
			return Response.json(
				{ error: 'Activity not found' },
				{ status: 404 }
			);
		}

		const user = await getById('user', User.id, {
			id: true,
			height: true,
			weight: true,
			email: true,
			firstname: true,
			lastname: true,
		});
		if (!user) {
			return Response.json({ error: 'User not found' }, { status: 404 });
		}
		if (!user.height || !user.weight) {
			return Response.json(
				{ error: 'Please fill in your height and weight before joining an activity.' },
				{ status: 400 }
			);
		}

		if (activity.status !== 'active' || activity.status === 'cancelled' || activity.status === 'closed') {
			let reason = 'Activity is not active';
			if (activity.status === 'cancelled') reason = 'Activity is cancelled';
			if (activity.status === 'closed') reason = 'Activity is closed';
			return Response.json(
				{ error: reason },
				{ status: 400 }
			);
		}

		const result = await executeTransaction(async (tx) => {
			const participantCount = await tx.userActivity.count({
				where: { activityId: body.activityId },
			});
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

			const ticketCode = await generateUniqueTicketCode(tx);

			let ticket, userActivity;
			try {
				ticket = await tx.ticket.create({
					data: {
						ticketCode,
						activityId: body.activityId,
						userId: user.id,
						status: 'active',
						ticketSent: false,
						ticketUsed: false,
					},
				});
			} catch (err) {
				console.error('Failed to create ticket:', err);
				throw new Error('Failed to create ticket', err);
			}

			try {
				userActivity = await tx.userActivity.create({
					data: {
						userId: user.id,
						activityId: body.activityId,
						ticketId: ticket?.id,
					},
				});
			} catch (err) {
				console.error('Failed to create userActivity:', err);
				throw new Error('Failed to create userActivity');
			}

			if (!ticket || !userActivity) {
				console.error('Transaction result missing ticket or userActivity:', { ticket, userActivity });
				throw new Error('Internal error: ticket or userActivity not created');
			}

			const templateId = 191;
			const params = {
				name: `${user.firstname} ${user.lastname}`,
				code: ticket.ticketCode,
				title: activity.title,
			};
			let emailRes;
			try {
				emailRes = await serverApi.post(
					`/admin/email/template_email`,
					{
						to: user.email,
						templateId,
						params,
					},
					{
						headers: {
							'x-internal-api': process.env.INTERNAL_API_SECRET,
						},
					}
				);
			} catch (err) {
				throw new Error('Failed to send ticket email');
			}
			if (!emailRes.data || !emailRes.data.success) {
				throw new Error('Failed to send ticket email');
			}

			try {
				await tx.ticket.update({
					where: { id: ticket.id },
					data: { ticketSent: true },
				});
			} catch (error) {
				console.log("Error while updating the ticket: ", error.message);
			}

			return { ticket, userActivity };
		}, { isolationLevel: 'Serializable' });

		if (!result || result.error || !result.userActivity) {
			const details = result && result.error ? result.error : 'Failed to create ticket or send email';
			return Response.json(
				{ error: 'Failed to join activity', details },
				{ status: 500 }
			);
		}

		const updatedCount = await getCount('userActivity', {
			activityId: body.activityId,
		});
		return Response.json({
			message: 'Joined activity successfully. Ticket sent.',
			userActivity: result.userActivity,
			participantCount: updatedCount,
		});
	} catch (error) {
		return Response.json(
			{ error: 'Failed to join activity', details: error.message },
			{ status: 500 }
		);
	}
}
