import { prisma } from '@/lib/prisma/db';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { createServerClient } from '@/lib/supabase/server-only';

export async function POST(req) {
    try {
        const { otpId, code, email, password } = await req.json();
        if (!otpId || !code || !email || !password) return Response.json({ error: 'Missing otpId, code, email or password' }, { status: 400 });

        const disableOtp = (process.env.USER_DISABLE_OTP === 'true' || process.env.NEXT_PUBLIC_USER_DISABLE_OTP === 'true');
        const devOtp = process.env.DEV_OTP;

        const otp = await prisma.otp.findUnique({ where: { id: otpId } });
        if (!otp) return Response.json({ error: 'OTP not found' }, { status: 404 });
        if (otp.status !== 'active') return Response.json({ error: 'OTP not active' }, { status: 400 });
        if (new Date() > otp.expiresAt) {
            await prisma.otp.update({ where: { id: otpId }, data: { status: 'expired' } });
            return Response.json({ error: 'OTP expired' }, { status: 400 });
        }
        if (otp.attempts >= otp.maxAttempts) {
            await prisma.otp.update({ where: { id: otpId }, data: { status: 'cancelled' } });
            return Response.json({ error: 'Too many attempts' }, { status: 423 });
        }
        let match = false;
        if (disableOtp && devOtp && code === devOtp) {
            match = await bcrypt.compare(code, otp.hashedCode);
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
        const { data: data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) {
            console.error('Supabase signInWithPassword failed on verify', signInError.message || signInError);
            return Response.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        const cookieStore = await cookies();
        if (data.session.access_token) {
            cookieStore.set('auth_token', data.session.access_token, { httpOnly: true, path: '/', sameSite: 'lax', maxAge: 3600 });
        }
        if (data.session.refresh_token) {
            cookieStore.set('refresh_token', data.session.refresh_token, { httpOnly: true, path: '/', sameSite: 'lax', maxAge: 60 * 60 * 24 * 30 });
        }

        const user = await prisma.user.findUnique({ where: { id: otp.userId } });
        return Response.json({
            session: data.session,
            user: { id: user.id, firstname: user.firstname, lastname: user.lastname, email: user.email }
        });
    } catch (err) {
        console.error(err);
        return Response.json({ error: 'Internal server error' }, { status: 500 });
    }
}
