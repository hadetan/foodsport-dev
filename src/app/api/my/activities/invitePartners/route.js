import { executeTransaction, getById, updateById } from '@/lib/prisma/db-utils';
import { requireUser } from '@/lib/prisma/require-user';
import { validateRequiredFields } from '@/utils/validation';
import { NextResponse } from 'next/server';
import { generateUniqueTicketCode } from '@/utils/generateUniqueTicketCode';
import serverApi from '@/utils/axios/serverApi';
import { createServerClient } from '@/lib/supabase/server-only';

export async function POST(request) {
    const supabase = await createServerClient();
    const { error, user } = await requireUser(supabase, NextResponse, request);
    if (error) return error;

    try {
        const body = await request.json();
        const validation = validateRequiredFields(body, ['activityId', 'partners']);
        if (!validation.isValid || !Array.isArray(body.partners) || body.partners.length === 0) {
            return Response.json(
                { error: 'Missing required fields', details: validation.error },
                { status: 400 }
            );
        }

        const activity = await getById('activity', body.activityId, { title: true, status: true, participantLimit: true });
        if (!activity) {
            return Response.json({ error: 'Activity not found' }, { status: 404 });
        }
        if (activity.status !== 'active') {
            return Response.json({ error: 'Activity is not active' }, { status: 400 });
        }

        const partnerEmails = body.partners.map(p => (typeof p === 'string' ? p : p.email)).filter(Boolean);
        if (partnerEmails.length === 0) {
            return Response.json({ error: 'No partner emails provided' }, { status: 400 });
        }

        for (const emailRaw of partnerEmails) {
            const email = String(emailRaw).trim().toLowerCase();
            if (!email) {
                return Response.json({ error: `Invalid email provided: ${emailRaw}` }, { status: 400 });
            }

            const invited = await executeTransaction(async (tx) => {
                const joinedCount = await tx.userActivity.count({ where: { activityId: body.activityId } });
                if (joinedCount >= activity.participantLimit) {
                    throw new Error('Activity is full');
                }

                const existingUser = await tx.user.findUnique({ where: { email } });
                const existingTempUser = await tx.tempUser.findUnique({ where: { email } });

                let invitedUser = null;
                if (!existingTempUser && !existingUser) {
                    invitedUser = await tx.invitedUser.findFirst({ where: { email, activityId: body.activityId } });
                    if (!invitedUser) {
                        invitedUser = await tx.invitedUser.create({
                            data: {
                                email,
                                activityId: body.activityId,
                                inviterId: user ? user.id : null,
                                tempUserId: null,
                            }
                        });

                        await tx.user.updateMany({ where: { id: user.id, hasReferredBefore: false }, data: { hasReferredBefore: true } });
                    }
                }

                if (existingTempUser) {
                    const alreadyJoined = await tx.userActivity.findFirst({ where: { tempUserId: existingTempUser.id, activityId: body.activityId } });
                    if (alreadyJoined) {
                        throw new Error(`Invited user has already joined the activity: ${email}`);
                    }
                }

                if (existingUser) {
                    const alreadyJoinedUser = await tx.userActivity.findFirst({ where: { userId: existingUser.id, activityId: body.activityId } });
                    if (alreadyJoinedUser) {
                        throw new Error(`Invited user has already joined the activity: ${email}`);
                    }
                }

                const existingTicket = await tx.ticket.findFirst({
                    where: {
                        activityId: body.activityId,
                        revoked: false,
                        OR: [
                            existingUser ? { userId: existingUser.id } : undefined,
                            existingTempUser ? { tempUserId: existingTempUser.id } : undefined,
                            invitedUser ? { invitedUserId: invitedUser.id } : undefined,
                        ].filter(Boolean),
                    }
                });
                if (existingTicket) {
                    throw new Error(`Ticket already exists for ${email} in this activity`);
                }

                const ticketCode = await generateUniqueTicketCode(tx);

                const ticketData = {
                    ticketCode,
                    activityId: body.activityId,
                    status: 'active',
                    ticketSent: false,
                    ticketUsed: false,
                    invitedUserId: invitedUser ? invitedUser.id : null,
                    tempUserId: existingTempUser ? existingTempUser.id : null,
                    userId: existingUser ? existingUser.id : null,
                };

                const ticket = await tx.ticket.create({ data: ticketData });

                if (existingTempUser || existingUser) {
                    await tx.userActivity.create({
                        data: {
                            tempUserId: existingTempUser ? existingTempUser.id : null,
                            userId: existingUser ? existingUser.id : null,
                            activityId: body.activityId,
                            ticketId: ticket.id,
                        }
                    });
                }

                return { existingTempUser, ticket };
            }, { isolationLevel: 'Serializable' });

            if (!invited || invited.error || !invited.ticket) {
                const details = invited && invited.error ? invited.error : 'Failed to create ticket';
                return Response.json({ error: 'Failed to invite partners', details }, { status: 500 });
            }

            const templateId = 191;
            const params = {
                name: invited.existingTempUser ? `${invited.existingTempUser.firstname} ${invited.existingTempUser.lastname}` : email,
                code: invited.ticket.ticketCode,
                title: activity.title,
            };
            const emailRes = await serverApi.post(
                `/admin/email/template_email`,
                {
                    to: email,
                    templateId,
                    params,
                },
                {
                    headers: {
                        'x-internal-api': process.env.INTERNAL_API_SECRET,
                    },
                }
            );

            if (!emailRes?.data || !emailRes.data.success) {
                return Response.json({ error: 'Failed to send ticket email', details: emailRes?.data || 'email api error' }, { status: 500 });
            }

            try {
                await updateById('ticket', invited.ticket.id, { ticketSent: true });
            } catch (err) {
                console.error('Failed to mark ticket as sent:', err);
            }
        }

        return Response.json({ message: 'Partners invited successfully. Tickets sent.' });
    } catch (error) {
        return Response.json(
            { error: 'Failed to invite partners', details: error.message },
            { status: 500 }
        );
    }
}