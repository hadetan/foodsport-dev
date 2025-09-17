import { prisma } from '@/lib/prisma/db';
import bcrypt from 'bcryptjs';
import { generateOtp } from '@/utils/generateOtp';
import serverApi from '@/utils/axios/serverApi';

// POST /api/auth/register
export async function POST(req) {
    try {
        const { email, password, firstname, lastname, dateOfBirth } = await req.json();
        if (!email || !password || !firstname || !lastname || !dateOfBirth) {
            return Response.json({ error: 'Missing required fields.' }, { status: 400 });
        }

        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
            return Response.json({ error: 'Email already exists.' }, { status: 409 });
        }

        // Generate OTP and persist
        const otpCode = generateOtp(6);
        const hashed = await bcrypt.hash(otpCode, 10);

        const ttlMinutes = parseInt(process.env.OTP_TTL_MINUTES || '5', 10);
        const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);

        const result = await prisma.$transaction(async (tx) => {
            await tx.otp.updateMany({ where: { sentTo: email, status: 'active' }, data: { status: 'cancelled' } });

            const tempUser = await tx.tempUser.upsert({
                where: { email },
                update: { firstname, lastname, dateOfBirth: new Date(dateOfBirth) },
                create: { email, firstname, lastname, dateOfBirth: new Date(dateOfBirth) },
            });

            const otp = await tx.otp.create({
                data: {
                    tempUserId: tempUser.id,
                    entityType: 'email_verification',
                    entityName: 'register',
                    hashedCode: hashed,
                    expiresAt,
                    sentTo: email,
                    status: 'active',
                },
            });

            return { otp, otpCode };
        });

        try {
            const templateId = parseInt(process.env.OTP_TEMPLATE_ID || '191', 10);
            const params = { code: result.otpCode, name: `${firstname || ''} ${lastname || ''}` };
            const res = await serverApi.post(
                '/admin/email/template_email',
                { to: email, templateId, params },
                { headers: { 'x-internal-api': process.env.INTERNAL_API_SECRET } }
            );
            if (!res?.data?.success) throw new Error('Email send failed');
        } catch (err) {
            console.error('Failed to send OTP email', err.message || err);
            await prisma.otp.updateMany({ where: { id: result.otp.id }, data: { status: 'cancelled' } });
            return Response.json({ error: 'Failed to send OTP email' }, { status: 500 });
        }

        return Response.json({ sessionId: result.otp.id });
    } catch (err) {
        console.error(err);
        return Response.json({ error: 'Internal server error.' }, { status: 500 });
    }
}