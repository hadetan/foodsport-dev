import { executeTransaction, getById } from '@/lib/prisma/db-utils';
import { requireUser } from '@/lib/prisma/require-user';
import { validateRequiredFields } from '@/utils/validation';
import { NextResponse } from 'next/server';
import { generateUniqueTicketCode } from '@/utils/generateUniqueTicketCode';
import serverApi from '@/utils/axios/serverApi';
import { prisma } from '@/lib/prisma/db';
import { createServerClient } from '@/lib/supabase/server-only';

export async function POST(request) {
    // const supabase = await createServerClient();
    // const { error } = await requireUser(supabase, NextResponse, request);
    // if (error) return error;

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

        for (const partner of body.partners) {
            const { email, firstname, lastname, dateOfBirth, weight, height } = partner;
            if (!email || !firstname || !lastname || !dateOfBirth || !weight || !height) {
                return Response.json({ error: `Missing required fields for partner: ${email}` }, { status: 400 });
            }

            const existingUser = await prisma.user.findUnique({ where: { email } });
            if (existingUser) {
                return Response.json({ error: `Email already registered: ${email}` }, { status: 409 });
            }

            let tempUser = await prisma.tempUser.findUnique({ where: { email } });
            if (!tempUser) {
                tempUser = await prisma.tempUser.create({
                    data: {
                        email,
                        firstname,
                        lastname,
                        dateOfBirth: new Date(dateOfBirth),
                        weight,
                        height,
                    }
                });
            }

            const alreadyJoined = await prisma.userActivity.findFirst({
                where: { tempUserId: tempUser.id, activityId: body.activityId }
            });
            if (alreadyJoined) {
                return Response.json({ error: `Invited user has already joined the activity: ${email}` }, { status: 409 });
            }

            await executeTransaction(async (tx) => {
                const participantCount = await tx.userActivity.count({ where: { activityId: body.activityId } });
                if (typeof activity.participantLimit === 'number' && participantCount >= activity.participantLimit) {
                    throw new Error('Activity is full');
                }

                const ticketCode = await generateUniqueTicketCode(tx);

                const ticket = await tx.ticket.create({
                    data: {
                        ticketCode,
                        activityId: body.activityId,
                        tempUserId: tempUser.id,
                        status: 'active',
                        ticketSent: false,
                        ticketUsed: false,
                    },
                });

                await tx.userActivity.create({
                    data: {
                        tempUserId: tempUser.id,
                        activityId: body.activityId,
                        ticketId: ticket.id,
                    },
                });

                const templateId = 191;
                const params = {
                    name: `${firstname} ${lastname}`,
                    code: ticket.ticketCode,
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
                if (!emailRes.data || !emailRes.data.success) {
                    throw new Error('Failed to send ticket email');
                }

                await tx.ticket.update({
                    where: { id: ticket.id },
                    data: { ticketSent: true },
                });
            });
        }

        return Response.json({ message: 'Partners invited successfully. Tickets sent.' });
    } catch (error) {
        return Response.json(
            { error: 'Failed to invite partners', details: error.message },
            { status: 500 }
        );
    }
}