import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server-only';
import { requireAdmin } from '@/lib/prisma/require-admin';
import { executeTransaction, getById, updateById } from '@/lib/prisma/db-utils';
import { validateRequiredFields } from '@/utils/validation';
import { generateUniqueTicketCode } from '@/utils/generateUniqueTicketCode';
import serverApi from '@/utils/axios/serverApi';

export async function POST(request) {
    const supabase = await createServerClient();
    const { error } = await requireAdmin(supabase, NextResponse, request);
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

    const validation = validateRequiredFields(body, ['activityId', 'partners']);
    if (
        !validation.isValid ||
        !Array.isArray(body.partners) ||
        body.partners.length === 0
    ) {
        return NextResponse.json(
            {
                error: 'Missing required fields',
                details: validation.error || 'No participants provided',
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
        return NextResponse.json(
            { error: 'Activity not found' },
            { status: 404 }
        );
    }
    if (activity.status !== 'active') {
        return NextResponse.json(
            { error: 'Activity is not active' },
            { status: 400 }
        );
    }

    const partnerEmails = body.partners
        .map((p) => (typeof p === 'string' ? p : p?.email))
        .filter(Boolean);

    if (!partnerEmails.length) {
        return NextResponse.json(
            { error: 'No participant emails provided' },
            { status: 400 }
        );
    }

    for (const emailRaw of partnerEmails) {
        const email = String(emailRaw).trim().toLowerCase();
        if (!email) {
            return NextResponse.json(
                { error: `Invalid email provided: ${emailRaw}` },
                { status: 400 }
            );
        }

        const invited = await executeTransaction(
            async (tx) => {
                const joinedCount = await tx.userActivity.count({
                    where: { activityId: body.activityId },
                });
                if (joinedCount >= activity.participantLimit) {
                    throw new Error('Activity is full');
                }

                const existingUser = await tx.user.findUnique({
                    where: { email },
                });
                const existingTempUser = await tx.tempUser.findUnique({
                    where: { email },
                });

                let invitedUser = null;
                if (!existingTempUser && !existingUser) {
                    invitedUser = await tx.invitedUser.findFirst({
                        where: { email, activityId: body.activityId },
                    });
                    if (!invitedUser) {
                        invitedUser = await tx.invitedUser.create({
                            data: {
                                email,
                                activityId: body.activityId,
                                inviterId: null,
                                tempUserId: null,
                            },
                        });
                    }
                }

                const existingTempUserActivity = existingTempUser
                    ? await tx.userActivity.findFirst({
                        where: {
                            tempUserId: existingTempUser.id,
                            activityId: body.activityId,
                        },
                        include: {
                            ticket: {
                                select: { id: true, ticketUsed: true, status: true },
                            },
                        },
                    })
                    : null;
                if (
                    existingTempUserActivity &&
                    (existingTempUserActivity.wasPresent ||
                        existingTempUserActivity.ticket?.ticketUsed)
                ) {
                    throw new Error(
                        `Invited user has already joined the activity: ${email}`
                    );
                }

                const existingUserActivity = existingUser
                    ? await tx.userActivity.findFirst({
                        where: {
                            userId: existingUser.id,
                            activityId: body.activityId,
                        },
                        include: {
                            ticket: {
                                select: { id: true, ticketUsed: true, status: true },
                            },
                        },
                    })
                    : null;
                if (
                    existingUserActivity &&
                    (existingUserActivity.wasPresent ||
                        existingUserActivity.ticket?.ticketUsed)
                ) {
                    throw new Error(
                        `Invited user has already joined the activity: ${email}`
                    );
                }

                let ticketToRevoke = null;
                if (existingUserActivity?.ticket) {
                    ticketToRevoke = existingUserActivity.ticket;
                } else if (existingTempUserActivity?.ticket) {
                    ticketToRevoke = existingTempUserActivity.ticket;
                } else {
                    ticketToRevoke = await tx.ticket.findFirst({
                        where: {
                            activityId: body.activityId,
                            revoked: false,
                            OR: [
                                existingUser
                                    ? { userId: existingUser.id }
                                    : undefined,
                                existingTempUser
                                    ? { tempUserId: existingTempUser.id }
                                    : undefined,
                                invitedUser
                                    ? { invitedUserId: invitedUser.id }
                                    : undefined,
                            ].filter(Boolean),
                        },
                    });
                }

                if (ticketToRevoke) {
                    if (ticketToRevoke.ticketUsed) {
                        throw new Error(
                            `Ticket already exists for ${email} in this activity`
                        );
                    }
                    await tx.ticket.update({
                        where: { id: ticketToRevoke.id },
                        data: {
                            revoked: true,
                            status: 'cancelled',
                        },
                    });
                }

                const ticketCode = await generateUniqueTicketCode(tx);

                const ticket = await tx.ticket.create({
                    data: {
                        ticketCode,
                        activityId: body.activityId,
                        status: 'active',
                        ticketSent: false,
                        ticketUsed: false,
                        invitedUserId: invitedUser ? invitedUser.id : null,
                        tempUserId: existingTempUser ? existingTempUser.id : null,
                        userId: existingUser ? existingUser.id : null,
                    },
                });

                if (existingTempUserActivity) {
                    await tx.userActivity.update({
                        where: { id: existingTempUserActivity.id },
                        data: { ticketId: ticket.id },
                    });
                } else if (existingTempUser) {
                    await tx.userActivity.create({
                        data: {
                            tempUserId: existingTempUser.id,
                            userId: null,
                            activityId: body.activityId,
                            ticketId: ticket.id,
                        },
                    });
                }

                if (existingUserActivity) {
                    await tx.userActivity.update({
                        where: { id: existingUserActivity.id },
                        data: { ticketId: ticket.id },
                    });
                } else if (existingUser) {
                    await tx.userActivity.create({
                        data: {
                            tempUserId: null,
                            userId: existingUser.id,
                            activityId: body.activityId,
                            ticketId: ticket.id,
                        },
                    });
                }

                return { existingTempUser, ticket };
            },
            { isolationLevel: 'Serializable' }
        );

        if (!invited || invited.error || !invited.ticket) {
            const details =
                invited && invited.error
                    ? invited.error.message || invited.error.toString()
                    : 'Failed to create ticket';
            return NextResponse.json(
                { error: 'Failed to invite participants', details },
                { status: 500 }
            );
        }

        const templateId = process.env.INVITE_PARTNER_TICKET_TEMPLATE_ID;
        const params = {
            name: invited.existingTempUser
                ? `${invited.existingTempUser.firstname} ${invited.existingTempUser.lastname}`
                : email,
            code: invited.ticket.ticketCode.toUpperCase(),
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
            return NextResponse.json(
                {
                    error: 'Failed to send ticket email',
                    details: emailRes?.data || 'Email API error',
                },
                { status: 500 }
            );
        }

        try {
            await updateById('ticket', invited.ticket.id, {
                ticketSent: true,
            });
        } catch (err) {
            console.error('Failed to mark ticket as sent:', err);
        }
    }

    return NextResponse.json({
        message: `Invitations sent to ${partnerEmails.length} participant${
            partnerEmails.length > 1 ? 's' : ''
        }.`,
        recipients: partnerEmails,
    });
}

