import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server-only';
import { requireAdmin } from '@/lib/prisma/require-admin';
import { prisma } from '@/lib/prisma/db';
import serverApi from '@/utils/axios/serverApi';
import { validateRequiredFields } from '@/utils/validation';

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

	try {
		const result = await prisma.$transaction(async (tx) => {
			let tempUser = null;
			if (!tempUser) {
				tempUser = await tx.tempUser.create({
					data: {
						email: email,
						firstname,
						lastname,
						dateOfBirth: new Date(dateOfBirth),
						weight,
						height,
					},
				});
			}

			await tx.invitedUser.deleteMany({ where: { id: ticket.invitedUserId } });

			await tx.ticket.update({ where: { id: ticket.id }, data: { tempUserId: tempUser.id, ticketUsed: true, status: 'used', usedAt: new Date() } });

			const userActivity = await tx.userActivity.create({
				data: {
					tempUserId: tempUser.id,
					activityId: activityId,
					ticketId: ticket.id,
					wasPresent: true,
				},
			});

			try {
                const templateId = 192;
                await serverApi.post('/admin/email/template_email', { to: email, templateId, params: { name: `${firstname} ${lastname}`, title: '' } }, { headers: { 'x-internal-api': process.env.INTERNAL_API_SECRET } });
            } catch (e) {
                console.log('Error while sending email from verifyInvitedTicket api: ', e);
            }

            return { tempUser, userActivity };
		});

		return NextResponse.json({ success: true, tempUser: result.tempUser, userActivity: result.userActivity });
	} catch (err) {
		return NextResponse.json({ error: 'Failed to verify invited ticket', details: err.message }, { status: 500 });
	}
}
