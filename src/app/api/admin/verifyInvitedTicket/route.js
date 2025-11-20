import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server-only';
import { requireAdmin } from '@/lib/prisma/require-admin';
import { prisma } from '@/lib/prisma/db';
import serverApi from '@/utils/axios/serverApi';
import { validateRequiredFields } from '@/utils/validation';
import { awardBadgesForActivityProgress, awardInviteBadges } from '@/lib/badges/ruleEvaluator';

// POST /api/admin/verifyInvitedTicket
export async function POST(request) {
	const supabase = await createServerClient();
	const { error } = await requireAdmin(supabase, NextResponse);
	if (error) return error;

	let body;
	try {
		body = await request.json();
	} catch (err) {
		return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
	}

	const required = ['ticketCode', 'email', 'firstname', 'lastname', 'dateOfBirth', 'weight', 'height', 'activityId'];
	const validation = validateRequiredFields(body, required);
	if (!validation.isValid) {
		return NextResponse.json({ error: 'Missing required fields', details: validation.error }, { status: 400 });
	}

	const { ticketCode, email, firstname, lastname, dateOfBirth, weight, height, activityId } = body;

	const ticket = await prisma.ticket.findUnique({ where: { ticketCode: ticketCode.toLowerCase() } });
	if (!ticket) return NextResponse.json({ error: 'Invalid ticket code.' }, { status: 404 });
	if (ticket.activityId !== activityId) return NextResponse.json({ error: 'Ticket not valid for this activity.' }, { status: 400 });
	if (ticket.ticketUsed) return NextResponse.json({ error: 'This ticket has already been used.' }, { status: 400 });
	if (ticket.status !== 'active') return NextResponse.json({ error: `This ticket is not active. Status: ${ticket.status}` }, { status: 400 });

	if (!ticket.invitedUserId) return NextResponse.json({ error: 'This ticket is not an invited-ticket or has already been associated.' }, { status: 400 });
	if (ticket.tempUserId || ticket.userId) return NextResponse.json({ error: 'Ticket already has associated user.' }, { status: 400 });

	const existingTemp = await prisma.tempUser.findUnique({ where: { email } });
	if (existingTemp) {
		return NextResponse.json({ error: 'Invited user has already been registered' }, { status: 409 });
	}

	const existingUser = await prisma.user.findUnique({ where: { email } });

	try {
		const result = await prisma.$transaction(async (tx) => {
			const invitedRecord = await tx.invitedUser.findUnique({
				where: { id: ticket.invitedUserId },
				select: { inviterId: true },
			});

			await tx.invitedUser.deleteMany({ where: { id: ticket.invitedUserId } });

			if (existingUser) {
				const updatedTicket = await tx.ticket.update({
					where: { id: ticket.id },
					data: { userId: existingUser.id, tempUserId: null, ticketUsed: true, status: 'used', usedAt: new Date() },
				});
				const createdActivity = await tx.userActivity.create({
					data: {
						userId: existingUser.id,
						activityId,
						ticketId: updatedTicket.id,
						wasPresent: true,
					},
					select: { id: true, wasPresent: true, joinedAt: true, userId: true },
				});

				await awardBadgesForActivityProgress(tx, {
					userId: existingUser.id,
					activityId,
					wasPresent: true,
					source: `verifyInvited:${activityId}`,
				});

				if (invitedRecord?.inviterId) {
					await awardInviteBadges(tx, {
						userId: invitedRecord.inviterId,
						source: `invite:${activityId}`,
					});
				}

				const participant = await tx.user.findUnique({
					where: { id: existingUser.id },
					select: { id: true, email: true, firstname: true, lastname: true, profilePictureUrl: true },
				});

				return {
					attendee: {
						userActivityId: createdActivity.id,
						ticketCode: ticket.ticketCode || null,
						wasPresent: createdActivity.wasPresent,
						joinedAt: createdActivity.joinedAt,
						participant: participant ? { type: 'user', ...participant } : null,
					},
					tempUser: null,
					userActivity: createdActivity,
				};
			}

			const tempUser = await tx.tempUser.create({
				data: {
					email,
					firstname,
					lastname,
					dateOfBirth: new Date(dateOfBirth),
					weight,
					height,
				},
			});

			await tx.ticket.update({
				where: { id: ticket.id },
				data: { tempUserId: tempUser.id, ticketUsed: true, status: 'used', usedAt: new Date() },
			});

			const userActivity = await tx.userActivity.create({
				data: {
					tempUserId: tempUser.id,
					activityId,
					ticketId: ticket.id,
					wasPresent: true,
				},
				select: { id: true, wasPresent: true, joinedAt: true },
			});

			if (invitedRecord?.inviterId) {
				await awardInviteBadges(tx, {
					userId: invitedRecord.inviterId,
					source: `invite:${activityId}`,
				});
			}

			return {
				tempUser,
				attendee: {
					userActivityId: userActivity.id,
					ticketCode: ticket.ticketCode || null,
					wasPresent: userActivity.wasPresent,
					joinedAt: userActivity.joinedAt,
					participant: { type: 'tempUser', ...tempUser },
				},
				userActivity,
			};
		});

		if (result.tempUser) {
			try {
				const templateId = process.env.INVITED_USER_TEMPLATE_ID;
				const params = { name: `${result.tempUser.firstname} ${result.tempUser.lastname}` };
				const res = await serverApi.post(
					'/admin/email/template_email',
					{ to: result.tempUser.email, templateId, params },
					{ headers: { 'x-internal-api': process.env.INTERNAL_API_SECRET } }
				);
				if (!res?.data?.success) throw new Error('Email send failed');
			} catch (err) {
				console.error('Failed to send inviting email', err);
				return NextResponse.json({ error: 'Failed to send inviting email' }, { status: 500 });
			}
		}

		return NextResponse.json({ success: true, attendee: result.attendee, tempUser: result.tempUser ?? null, userActivity: result.userActivity ?? null });
	} catch (err) {
		return NextResponse.json({ error: 'Failed to verify invited ticket', details: err.message }, { status: 500 });
	}
}
