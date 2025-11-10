import { prisma } from '@/lib/prisma/db';
import { createServerClient } from '@/lib/supabase/server-only';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';

export async function POST(req) {
    try {
        const { otpId, code, email, password, firstname, lastname, dateOfBirth } = await req.json();
        if (!otpId || !code || !email || !password || !firstname || !lastname || !dateOfBirth) {
            return Response.json({ error: 'Missing required fields.' }, { status: 400 });
        }

        const otp = await prisma.otp.findUnique({ where: { id: otpId } });
        if (!otp) return Response.json({ error: 'OTP not found' }, { status: 404 });
        if (otp.status !== 'active') return Response.json({ error: 'OTP not active' }, { status: 400 });
        if (new Date() > otp.expiresAt) {
            await prisma.otp.update({ where: { id: otpId }, data: { status: 'expired' } });
            return Response.json({ error: 'OTP expired' }, { status: 400 });
        }

            const disableOtp = (process.env.USER_DISABLE_OTP === 'true' || process.env.NEXT_PUBLIC_USER_DISABLE_OTP === 'true');
            const devOtp = process.env.DEV_OTP;

            let match = false;
            if (disableOtp && devOtp && code === devOtp) {
                match = true;
            } else {
                match = await bcrypt.compare(code, otp.hashedCode);
            }

        if (!match) {
            await prisma.otp.update({ where: { id: otpId }, data: { attempts: { increment: 1 } } });
            const updated = await prisma.otp.findUnique({ where: { id: otpId } });
            return Response.json({ error: 'Invalid code', attemptsLeft: Math.max(0, updated.maxAttempts - updated.attempts) }, { status: 401 });
        }

        await prisma.otp.update({ where: { id: otpId }, data: { status: 'used', usedAt: new Date() } });

        const supabase = await createServerClient();
        const { data: data, error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: { data: { firstname, lastname } },
        });
        if (signUpError) {
            console.error('Supabase signUp failed on register verify', signUpError.message || signUpError);
            return Response.json({ error: 'Registration failed' }, { status: 400 });
        }

        const userId = data.user?.id;
        if (!userId) return Response.json({ error: 'Failed to create user' }, { status: 500 });

        const tempUser = await prisma.tempUser.findUnique({ where: { email } });
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

            await prisma.userActivity.updateMany({ where: { tempUserId: tempUser.id }, data: { userId: userId, tempUserId: null } });
            await prisma.ticket.updateMany({ where: { tempUserId: tempUser.id }, data: { userId: userId, tempUserId: null } });
            await prisma.tempUser.delete({ where: { id: tempUser.id } });
        } else {
            await prisma.user.create({ data: { id: userId, email, firstname, lastname, dateOfBirth: new Date(dateOfBirth) } });
        }

        const cookieStore = await cookies();
        if (data.session.access_token) {
            cookieStore.set('auth_token', data.session.access_token, { httpOnly: true, path: '/', sameSite: 'lax', maxAge: data.session.expires_in || 3600 });
        }
        if (data.session.refresh_token) {
            cookieStore.set('refresh_token', data.session.refresh_token, { httpOnly: true, path: '/', sameSite: 'lax', maxAge: 60 * 60 * 24 * 30 });
        }

        const user = await prisma.user.findUnique({ where: { id: userId } });
        return Response.json({ session: data.session, user: { id: user.id, firstname: user.firstname, lastname: user.lastname, email: user.email } });
    } catch (err) {
        console.error(err);
        return Response.json({ error: 'Internal server error' }, { status: 500 });
    }
}
