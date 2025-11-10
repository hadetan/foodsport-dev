import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import { prisma } from '@/lib/prisma/db';
import { createServerClient } from '@/lib/supabase/server-only';
import serverApi from '@/utils/axios/serverApi';
import { generateOtp } from '@/utils/generateOtp';

const DEFAULT_OTP_TTL_MINUTES = 5;
const DEFAULT_RESET_TOKEN_TTL_MINUTES = 15;

function getOtpSettings() {
	const disableOtp =
		process.env.USER_DISABLE_OTP === 'true' ||
		process.env.NEXT_PUBLIC_USER_DISABLE_OTP === 'true';
	const useDevOtp = disableOtp && !!process.env.DEV_OTP;

	return {
		useDevOtp,
		devOtp: process.env.DEV_OTP,
		templateId: process.env.FORGOT_PASSWORD_OTP_TEMPLATE_ID,
		internalSecret: process.env.INTERNAL_API_SECRET,
	};
}

export async function requestPasswordReset(email) {
	if (!email) {
		throw new Error('Email is required');
	}

	const user = await prisma.user.findUnique({ where: { email } });
	if (!user) {
		const err = new Error('User not found');
		err.statusCode = 404;
		throw err;
	}

	const { useDevOtp, templateId, internalSecret } = getOtpSettings();
	const otpCode = useDevOtp ? process.env.DEV_OTP : generateOtp(6);
	const hashedCode = await bcrypt.hash(otpCode, 10);
	const ttlMinutes = parseInt(process.env.OTP_TTL_MINUTES || '', 10) || DEFAULT_OTP_TTL_MINUTES;
	const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);

	const result = await prisma.$transaction(async (tx) => {
		await tx.otp.updateMany({
			where: {
				userId: user.id,
				entityType: 'password_reset',
				status: 'active',
			},
			data: { status: 'cancelled' },
		});

		const otp = await tx.otp.create({
			data: {
				userId: user.id,
				entityType: 'password_reset',
				entityName: 'forgot_password',
				hashedCode,
				expiresAt,
				sentTo: email,
				status: 'active',
			},
		});

		return { otp, otpCode };
	});

	if (!useDevOtp) {
		if (!templateId) {
			console.error('FORGOT_PASSWORD_OTP_TEMPLATE_ID is not configured');
			await prisma.otp.updateMany({ where: { id: result.otp.id }, data: { status: 'cancelled' } });
			const err = new Error('Failed to send OTP email');
			err.statusCode = 500;
			throw err;
		}
		try {
			const params = {
				code: result.otpCode,
				name: `${user.firstname || ''} ${user.lastname || ''}`.trim() || user.email,
			};
			const response = await serverApi.post(
				'/admin/email/template_email',
				{ to: user.email, templateId, params },
				{ headers: { 'x-internal-api': internalSecret } }
			);
			if (!response?.data?.success) {
				throw new Error('Email send failed');
			}
		} catch (emailError) {
			console.error('Failed to send password reset OTP email', emailError);
			await prisma.otp.updateMany({ where: { id: result.otp.id }, data: { status: 'cancelled' } });
			const err = new Error('Failed to send OTP email');
			err.statusCode = 500;
			throw err;
		}
	} else {
		console.info('DEV_OTP enabled - skipped sending forgot password OTP email to', user.email);
	}

	return { otpId: result.otp.id, expiresAt };
}

export async function verifyPasswordResetOtp({ otpId, code, email }) {
	if (!otpId || !code || !email) {
		const err = new Error('Missing otpId, code, or email');
		err.statusCode = 400;
		throw err;
	}

	const user = await prisma.user.findUnique({ where: { email } });
	if (!user) {
		const err = new Error('User not found');
		err.statusCode = 404;
		throw err;
	}

	const otp = await prisma.otp.findUnique({ where: { id: otpId } });
	if (!otp || otp.userId !== user.id || otp.entityType !== 'password_reset') {
		const err = new Error('OTP not found');
		err.statusCode = 404;
		throw err;
	}

	if (otp.status !== 'active') {
		const err = new Error('OTP not active');
		err.statusCode = 400;
		throw err;
	}

	if (new Date() > otp.expiresAt) {
		await prisma.otp.update({ where: { id: otpId }, data: { status: 'expired' } });
		const err = new Error('OTP expired');
		err.statusCode = 400;
		throw err;
	}

	if (otp.attempts >= otp.maxAttempts) {
		await prisma.otp.update({ where: { id: otpId }, data: { status: 'cancelled' } });
		const err = new Error('Too many attempts');
		err.statusCode = 423;
		throw err;
	}

	const { disableOtp, useDevOtp, devOtp } = getOtpSettings();

	let isValid = false;
	if (disableOtp && useDevOtp && devOtp && code === devOtp) {
		isValid = await bcrypt.compare(code, otp.hashedCode);
	} else {
		isValid = await bcrypt.compare(code, otp.hashedCode);
	}

	if (!isValid) {
		await prisma.otp.update({
			where: { id: otpId },
			data: { attempts: { increment: 1 } },
		});
		const updated = await prisma.otp.findUnique({ where: { id: otpId } });
		const err = new Error('Invalid code');
		err.statusCode = 401;
		err.attemptsLeft = Math.max(0, updated.maxAttempts - updated.attempts);
		throw err;
	}

	const tokenTtlMinutes =
		parseInt(process.env.PASSWORD_RESET_TOKEN_TTL_MINUTES || '', 10) ||
		DEFAULT_RESET_TOKEN_TTL_MINUTES;
	const tokenExpiresAt = new Date(Date.now() + tokenTtlMinutes * 60 * 1000);
	const rawToken = randomBytes(32).toString('hex');
	const hashedToken = await bcrypt.hash(rawToken, 12);

	await prisma.$transaction(async (tx) => {
		await tx.otp.update({
			where: { id: otpId },
			data: { status: 'used', usedAt: new Date() },
		});

		await tx.passwordResetToken.updateMany({
			where: { userId: user.id, usedAt: null },
			data: { usedAt: new Date() },
		});

		await tx.passwordResetToken.create({
			data: {
				userId: user.id,
				hashedToken,
				expiresAt: tokenExpiresAt,
			},
		});
	});

	return { resetToken: rawToken, tokenExpiresAt };
}

export async function resetPasswordWithToken({ email, password, token }) {
	if (!email || !password || !token) {
		const err = new Error('Missing email, password, or token');
		err.statusCode = 400;
		throw err;
	}

	if (password.length < 6) {
		const err = new Error('Password must be at least 6 characters long');
		err.statusCode = 400;
		throw err;
	}

	const user = await prisma.user.findUnique({ where: { email } });
	if (!user) {
		const err = new Error('User not found');
		err.statusCode = 404;
		throw err;
	}

	const tokens = await prisma.passwordResetToken.findMany({
		where: { userId: user.id },
		orderBy: { createdAt: 'desc' },
	});

	if (!tokens || tokens.length === 0) {
		const err = new Error('Reset token not found');
		err.statusCode = 404;
		throw err;
	}

	let matchedToken = null;
	for (const record of tokens) {
		if (record.usedAt) continue;
		const match = await bcrypt.compare(token, record.hashedToken);
		if (!match) continue;
		matchedToken = record;
		break;
	}

	if (!matchedToken) {
		const err = new Error('Invalid reset token');
		err.statusCode = 401;
		throw err;
	}

	if (new Date() > matchedToken.expiresAt) {
		await prisma.passwordResetToken.update({
			where: { id: matchedToken.id },
			data: { usedAt: new Date() },
		});
		const err = new Error('Reset token expired');
		err.statusCode = 400;
		throw err;
	}

	const supabase = await createServerClient();
	const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
		password,
	});
	if (updateError) {
		console.error('Supabase password update failed', updateError);
		const err = new Error('Failed to update password');
		err.statusCode = 500;
		throw err;
	}

	await prisma.passwordResetToken.update({
		where: { id: matchedToken.id },
		data: { usedAt: new Date() },
	});

	await prisma.otp.updateMany({
		where: { userId: user.id, entityType: 'password_reset', status: 'active' },
		data: { status: 'cancelled' },
	});

	return { success: true };
}

