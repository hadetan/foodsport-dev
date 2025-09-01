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

	const userActivity = await prisma.userActivity.findFirst({
		where: {
			userId: ticket.userId,
			activityId: ticket.activityId,
		},
	});
	if (!userActivity) {
		return NextResponse.json(
			{ error: 'User activity not found for this ticket.' },
			{ status: 404 }
		);
	}

	await prisma.ticket.update({
		where: { id: ticket.id },
		data: { ticketUsed: true, status: 'used', usedAt: new Date() },
	});
	await prisma.userActivity.update({
		where: { id: userActivity.id },
		data: { wasPresent: true },
	});

	return NextResponse.json({
		message: 'Ticket verified and marked as present.',
		userId: ticket.userId,
	});
}
