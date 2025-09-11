import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server-only';
import { requireAdmin } from '@/lib/prisma/require-admin';
import { prisma } from '@/lib/prisma/db';

// POST /api/admin/verifyTicket
export async function POST(request) {
	const supabase = await createServerClient();
	const { error } = await requireAdmin(supabase, NextResponse);
	if (error) return error;

	let body;
	try {
		body = await request.json();
	} catch {
		return NextResponse.json(
			{ error: 'Invalid JSON body' },
			{ status: 400 }
		);
	}

	const { activityId, ticketCode } = body;
	if (!activityId || !ticketCode) {
		return NextResponse.json(
			{ error: 'Missing activityId or ticketCode' },
			{ status: 400 }
		);
	}

	const ticket = await prisma.ticket.findUnique({
		where: { ticketCode: ticketCode.toLowerCase() },
	});
	if (!ticket) {
		return NextResponse.json(
			{ error: 'Invalid ticket code.' },
			{ status: 404 }
		);
	}

	if (ticket.status !== 'active') {
		return NextResponse.json(
			{ error: `This ticket is not active and cannot be used. The tickets status is ${ticket.status}` },
			{ status: 400 }
		);
	}

	if (ticket.activityId !== activityId) {
		return NextResponse.json(
			{ error: 'This ticket is not valid for this event.' },
			{ status: 400 }
		);
	}

	if (ticket.ticketUsed) {
		return NextResponse.json(
			{ error: 'This ticket has already been used.' },
			{ status: 400 }
		);
	}

	if (ticket.invitedUserId && !ticket.tempUserId && !ticket.userId) {
		const invited = await prisma.invitedUser.findUnique({ where: { id: ticket.invitedUserId } });
		return NextResponse.json({
			status: 'invited_needs_info',
			email: invited?.email || null,
			ticketCode: ticket.ticketCode,
		});
	}

	const participantWhere = ticket.userId
		? { userId: ticket.userId, activityId: ticket.activityId }
		: { tempUserId: ticket.tempUserId, activityId: ticket.activityId };

	let userActivity = await prisma.userActivity.findFirst({ where: participantWhere });

	if (!userActivity.ticketId || userActivity.ticketId !== ticket.id) {
		return NextResponse.json(
			{ error: 'This ticket is not valid for this user and event. Please ensure you are using the most recent ticket sent to your email.' },
			{ status: 400 }
		);
	}

	await prisma.$transaction([
		prisma.ticket.update({ where: { id: ticket.id }, data: { ticketUsed: true, status: 'used', usedAt: new Date() } }),
		prisma.userActivity.update({ where: { id: userActivity.id }, data: { wasPresent: true } }),
	]);

	let user = null;
	let tempUser = null;
	if (ticket.userId) {
		user = await prisma.user.findUnique({
			where: { id: ticket.userId },
			select: { id: true, email: true, firstname: true, lastname: true, profilePictureUrl: true }
		});
	} else if (ticket.tempUserId) {
		tempUser = await prisma.tempUser.findUnique({
			where: { id: ticket.tempUserId },
			select: { id: true, email: true, firstname: true, lastname: true, dateOfBirth: true, weight: true, height: true }
		});
	}

	const responseBody = { message: 'Ticket verified and marked as present.' };
	if (user) responseBody.user = user;
	if (tempUser) responseBody.tempUser = tempUser;

	return NextResponse.json(responseBody);
}

export async function GET(request) {
	const supabase = await createServerClient();
	const { error } = await requireAdmin(supabase, NextResponse);
	if (error) return error;

	try {
		const url = new URL(request.url);
		const activityId = url.searchParams.get('activityId');
		if (!activityId) {
			return NextResponse.json({ error: 'Missing activityId' }, { status: 400 });
		}

		const attendees = await prisma.userActivity.findMany({
			where: { activityId, wasPresent: true },
			include: {
				user: { select: { id: true, email: true, firstname: true, lastname: true, profilePictureUrl: true } },
				tempUser: { select: { id: true, email: true, firstname: true, lastname: true, dateOfBirth: true } },
				ticket: { select: { ticketCode: true } },
			},
			orderBy: { joinedAt: 'asc' },
		});

		const result = attendees.map((a) => ({
			userActivityId: a.id,
			ticketCode: a.ticket?.ticketCode || null,
			wasPresent: a.wasPresent,
			joinedAt: a.joinedAt,
			participant: a.user ? { type: 'user', ...a.user } : a.tempUser ? { type: 'tempUser', ...a.tempUser } : null,
		}));

		return NextResponse.json({ attendees: result });
	} catch (err) {
		return NextResponse.json({ error: 'Failed to fetch verified attendees', details: err.message }, { status: 500 });
	}
}

