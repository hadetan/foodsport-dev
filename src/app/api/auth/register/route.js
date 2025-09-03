import { prisma } from '@/lib/prisma/db';
import { createServerClient } from '@/lib/supabase/server-only';
import { cookies } from 'next/headers';

export async function POST(req) {
    try {
        const { email, password, firstname, lastname, dateOfBirth } =
            await req.json();
        if (!email || !password || !firstname || !lastname || !dateOfBirth) {
            return Response.json(
                { error: 'Missing required fields.' },
                { status: 400 }
            );
        }

        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
            return Response.json(
                { error: 'Email already exists.' },
                { status: 409 }
            );
        }

        // Check if this email exists in TempUser
        const tempUser = await prisma.tempUser.findUnique({ where: { email } });

        const supabase = await createServerClient();
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { firstname, lastname },
            },
        });
        if (error) {
            return Response.json({ error: error.message }, { status: 400 });
        }
        const userId = data.user?.id;
        if (!userId) {
            return Response.json(
                { error: 'Failed to create user.' },
                { status: 500 }
            );
        }

        // If tempUser exists, migrate their data
        if (tempUser) {
            await prisma.user.create({
                data: {
                    id: userId,
                    email,
                    firstname: firstname || tempUser.firstname,
                    lastname: lastname || tempUser.lastname,
                    dateOfBirth: new Date(dateOfBirth) || tempUser.dateOfBirth,
                    weight: tempUser.weight,
                    height: tempUser.height,
                    totalCaloriesBurned: tempUser.totalCaloriesBurned,
                }
            });

            // Migrate UserActivity and Ticket records
            await prisma.userActivity.updateMany({
                where: { tempUserId: tempUser.id },
                data: { userId: userId, tempUserId: null },
            });
            await prisma.ticket.updateMany({
                where: { tempUserId: tempUser.id },
                data: { userId: userId, tempUserId: null },
            });

            // Delete tempUser
            await prisma.tempUser.delete({ where: { id: tempUser.id } });
        } else {
            await prisma.user.create({
                data: {
                    id: userId,
                    email,
                    firstname,
                    lastname,
                    dateOfBirth: new Date(dateOfBirth),
                }
            });
        }

        if (data.session?.access_token) {
            const cookieStore = await cookies();
            cookieStore.set('auth_token', data.session.access_token, {
                httpOnly: true,
                path: '/',
                sameSite: 'lax',
                maxAge: data.session.expires_in || 3600,
            });
            if (data.session.refresh_token) {
                cookieStore.set('refresh_token', data.session.refresh_token, {
                    httpOnly: true,
                    path: '/',
                    sameSite: 'lax',
                    maxAge: 60 * 60 * 24 * 30,
                });
            }
        }

        return Response.json({
            message: 'User registered successfully.',
            userId,
            session: data.session,
        });
    } catch (err) {
        return Response.json(
            { error: 'Internal server error.\n' + err },
            { status: 500 }
        );
    }
}