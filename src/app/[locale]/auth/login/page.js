'use client';
import '@/app/[locale]/auth/css/loginAndRegister.css';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import ErrorAlert from '@/app/shared/components/ErrorAlert';
import PasswordInputClient from '@/app/shared/components/PasswordInputClient';
import Link from 'next/link';
import { useAuth } from '@/app/shared/contexts/authContext';
import { getSupabaseClient } from '@/lib/supabase';
import toast from '@/utils/Toast';
import api from '@/utils/axios/api';
import { useTranslations, useLocale } from 'next-intl';

export default function LoginPage() {
	const supabase = getSupabaseClient();
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [otpStep, setOtpStep] = useState(false);
	const [sessionId, setSessionId] = useState(null);
	const [otpCode, setOtpCode] = useState('');
	const [forgotMode, setForgotMode] = useState(false);
	const [forgotStep, setForgotStep] = useState('email');
	const [forgotEmail, setForgotEmail] = useState('');
	const [forgotOtpId, setForgotOtpId] = useState(null);
	const [forgotOtpCode, setForgotOtpCode] = useState('');
	const [resetToken, setResetToken] = useState('');
	const [newPassword, setNewPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [forgotError, setForgotError] = useState('');
	const [attemptsLeft, setAttemptsLeft] = useState(null);
	const otpInputRef = useRef(null);
	const forgotOtpInputRef = useRef(null);
	const router = useRouter();
	const {
		login,
		authToken,
		verifyOtp,
		handleSession,
		requestPasswordReset,
		verifyPasswordResetOtp,
		resetPasswordWithToken,
	} = useAuth();
	const subOnce = useRef(false);
	const handledOnce = useRef(false);
	const t = useTranslations();
	const locale = useLocale();

	useEffect(() => {
		if (typeof window !== 'undefined' && authToken) {
			router.replace(`/${locale}/my`);
		}
	}, [router, authToken, locale]);

	// Subscribe once to auth changes to sync server cookie and run pre-profile
	useEffect(() => {
		if (subOnce.current) return;
		subOnce.current = true;
		const { data: subscription } = supabase.auth.onAuthStateChange(
			async (_, session) => {
				if (!session?.access_token) return;
				try {
					const data = await handleSession(session);
					if (data?.reason === 'email_exists') {
						toast.info(t('LoginPage.emailExistsToast'));
						try { localStorage.removeItem('auth_token'); } catch {}
						try { await api.delete('/auth/logout'); } catch {}
						try {
							await Promise.race([
								supabase.auth.signOut({ scope: 'local' }).catch(() => {}),
								new Promise((resolve) => setTimeout(resolve, 750)),
							]);
						} catch {}
						router.replace(`/${locale}/auth/login`);
						return;
					}
					if (data?.created || (data?.existing && data?.userExists)) {
						router.replace(`/${locale}/my`);
						return;
					}
					if (data?.preProfile) {
						router.replace(`/${locale}/auth/onboard`);
						return;
					}
				} catch (e) {
					console.error(e);
				}
			}
		);
		return () => subscription?.subscription?.unsubscribe?.();
	}, [supabase]);

	useEffect(() => {
		(async () => {
			const { data } = await supabase.auth.getSession();
			if (data?.session && !handledOnce.current) {
				try {
					const res = await handleSession(data.session);
					if (res?.reason === 'email_exists') {
						toast.info(t('LoginPage.emailExistsToast'));
						try { localStorage.removeItem('auth_token'); } catch {}
						try { await api.delete('/auth/logout'); } catch {}
						try {
							await Promise.race([
								supabase.auth.signOut({ scope: 'local' }).catch(() => {}),
								new Promise((resolve) => setTimeout(resolve, 750)),
							]);
						} catch {}
						router.replace(`/${locale}/auth/login`);
						return;
					}
					if (res?.created || (res?.existing && res?.userExists)) {
						router.replace(`/${locale}/my`);
						return;
					}
					if (res?.preProfile) {
						router.replace(`/${locale}/auth/onboard`);
						return;
					}
				} catch (e) {
					console.error(e);
					handledOnce.current = false;
				}
			}
		})();
	}, [supabase]);

	useEffect(() => {
		if (otpStep) {
			otpInputRef.current?.focus();
		}
	}, [otpStep]);

	useEffect(() => {
		if (forgotMode && forgotStep === 'otp') {
			forgotOtpInputRef.current?.focus();
		}
}, [forgotMode, forgotStep]);

	function openForgotPassword() {
		const normalizedEmail = String(email || '').trim().toLowerCase();
		setForgotMode(true);
		setForgotStep('email');
		setForgotEmail(normalizedEmail);
		setForgotOtpId(null);
		setForgotOtpCode('');
		setResetToken('');
		setNewPassword('');
		setConfirmPassword('');
		setForgotError('');
		setAttemptsLeft(null);
		setOtpStep(false);
		setSessionId(null);
		setOtpCode('');
		setError('');
	}

	function backToLogin(preserveEmail = false) {
		const currentEmail = forgotEmail;
		setForgotMode(false);
		setForgotStep('email');
		setForgotEmail('');
		setForgotOtpId(null);
		setForgotOtpCode('');
		setResetToken('');
		setNewPassword('');
		setConfirmPassword('');
		setForgotError('');
		setAttemptsLeft(null);
		setLoading(false);
		if (preserveEmail && currentEmail) {
			setEmail(currentEmail);
		}
	}

	async function handleForgotRequest(e) {
		e.preventDefault();
		setLoading(true);
		setForgotError('');
		setAttemptsLeft(null);
		try {
			const normalizedEmail = String(forgotEmail || email || '')
				.trim()
				.toLowerCase();
			if (!normalizedEmail) {
				setForgotError(t('LoginPage.genericError'));
				setLoading(false);
				return;
			}
			setForgotEmail(normalizedEmail);
			const data = await requestPasswordReset({ email: normalizedEmail });
			if (data?.otpId) {
				setForgotOtpId(data.otpId);
				setForgotStep('otp');
				setForgotOtpCode('');
			}
		} catch (err) {
			const message =
				err?.response?.data?.error ||
				err?.message ||
				t('Auth.genericTryAgain');
			setForgotError(message);
		} finally {
			setLoading(false);
		}
	}

	async function handleForgotOtpVerify(e) {
		e.preventDefault();
		setLoading(true);
		setForgotError('');
		setAttemptsLeft(null);
		if (!forgotOtpId) {
			setForgotError(t('Auth.genericTryAgain'));
			setLoading(false);
			return;
		}
		try {
			const data = await verifyPasswordResetOtp({
				otpId: forgotOtpId,
				code: forgotOtpCode,
				email: forgotEmail,
			});
			if (data?.resetToken) {
				setResetToken(data.resetToken);
				setForgotStep('reset');
				setForgotOtpCode('');
			}
		} catch (err) {
			const response = err?.response?.data;
			setForgotError(response?.error || t('Auth.otpFailed'));
			if (typeof response?.attemptsLeft === 'number') {
				setAttemptsLeft(response.attemptsLeft);
			}
		} finally {
			setLoading(false);
		}
	}

	async function handleForgotReset(e) {
		e.preventDefault();
		setForgotError('');
		if (newPassword !== confirmPassword) {
			setForgotError(t('ForgotPassword.passwordMismatch'));
			return;
		}
		if (!resetToken) {
			setForgotError(t('Auth.genericTryAgain'));
			return;
		}
		setLoading(true);
		try {
			await resetPasswordWithToken({
				email: forgotEmail,
				token: resetToken,
				password: newPassword,
			});
			toast.success(t('ForgotPassword.success'));
			setForgotStep('success');
			setNewPassword('');
			setConfirmPassword('');
			setResetToken('');
			setPassword('');
		} catch (err) {
			const message =
				err?.response?.data?.error ||
				err?.message ||
				t('Auth.genericTryAgain');
			setForgotError(message);
		} finally {
			setLoading(false);
		}
	}

	async function handleLogin(e) {
		e.preventDefault();
		setLoading(true);
		setError('');
		try {
			const data = await login({ email, password });
			if (data?.sessionId) {
				setSessionId(data.sessionId);
				setOtpStep(true);
			}
		} catch (_) {
			setError(`${t('LoginPage.genericError')}`);
		} finally {
			setLoading(false);
		}
	}

	async function handleVerify(e) {
		e.preventDefault();
		setLoading(true);
		setError('');
		try {
			const data = await verifyOtp({ otpId: sessionId, code: otpCode, email, password });
			if (data?.session?.access_token) {
				router.replace(`/${locale}/my`);
			}
		} catch (err) {
			setError(t('Auth.otpFailed'));
		} finally {
			setLoading(false);
		}
	}

	const onGoogle = async () => {
		setLoading(true);
		try {
			const redirectTo = `${window.location.origin}/${locale}/auth/login`;
			await supabase.auth.signInWithOAuth({
				provider: 'google',
				options: { redirectTo },
			});
		} catch (e) {
			console.error(e);
			setLoading(false);
		}
	};

	return (
		<div className=''>
			<div className='w-full max-w-md p-6 bg-base-100 rounded responsive-form'>
				<h1 className='text-2xl font-semibold mb-4 text-center'>
					{forgotMode ? t('ForgotPassword.title') : t('LoginPage.title')}
				</h1>
				{!forgotMode ? (
					<>
						{error && (
							<ErrorAlert message={error} onClose={() => setError('')} />
						)}
						{!otpStep ? (
							<form className='space-y-6' onSubmit={handleLogin}>
								<div>
									<label className='block mb-1 font-medium text-black'>
										{t('LoginPage.email')}
									</label>
									<input
										type='email'
										className='input input-bordered w-full'
										value={email}
										onChange={(e) => setEmail(e.target.value)}
										required
									/>
								</div>
								<div>
									<label className='block mb-1 font-medium text-black'>
										{t('LoginPage.password')}
									</label>
									<PasswordInputClient
										value={password}
										onChange={(e) => setPassword(e.target.value)}
										required
									/>
								</div>
								<div className='text-right text-sm'>
									<button
										type='button'
										onClick={openForgotPassword}
										className='link link-hover'
									>
										{t('LoginPage.forgotPassword')}
									</button>
								</div>
								<button
									type='submit'
									className='submit-button w-full'
									disabled={loading}
								>
									{loading
										? t('LoginPage.loggingIn')
										: t('LoginPage.login')}
								</button>
							</form>
						) : (
							<form className='space-y-6' onSubmit={handleVerify}>
								<div>
									<label className='block mb-1 font-medium text-black'>
										{t('Auth.enterOtpLabel')}
									</label>
									<input
										type='text'
										ref={otpInputRef}
										className='input input-bordered w-full'
										value={otpCode}
										onChange={(e) => setOtpCode(e.target.value)}
										required
									/>
								</div>
								<button
									type='submit'
									className='submit-button w-full'
									disabled={loading}
								>
									{loading ? t('Auth.verifying') : t('Auth.verifyOtp')}
								</button>
							</form>
						)}
						<button
							onClick={onGoogle}
							disabled={loading}
							className='btn btn-outline w-full mt-4'
						>
							{t('LoginPage.continueWithGoogle')}
						</button>
						<div className='mt-4 text-sm text-center'>
							{t('LoginPage.dontHaveAccount')}{' '}
							<Link href={`/${locale}/auth/register`} className='link'>
								{t('LoginPage.register')}
							</Link>
						</div>
					</>
				) : (
					<div className='space-y-6'>
						{forgotError && (
							<ErrorAlert
								message={forgotError}
								onClose={() => setForgotError('')}
							/>
						)}
						{forgotStep === 'email' && (
							<form className='space-y-6' onSubmit={handleForgotRequest}>
								<p className='text-sm text-center text-gray-600'>
									{t('ForgotPassword.description')}
								</p>
								<div>
									<label className='block mb-1 font-medium text-black'>
										{t('LoginPage.email')}
									</label>
									<input
										type='email'
										className='input input-bordered w-full'
										value={forgotEmail}
										onChange={(e) => setForgotEmail(e.target.value)}
										required
									/>
								</div>
								<button
									type='submit'
									className='submit-button w-full'
									disabled={loading}
								>
									{loading
										? t('ForgotPassword.sendingOtp')
										: t('ForgotPassword.sendOtp')}
								</button>
							</form>
						)}
						{forgotStep === 'otp' && (
							<form className='space-y-6' onSubmit={handleForgotOtpVerify}>
								<p className='text-sm text-center text-gray-600'>
									{t('ForgotPassword.otpInstructions', { email: forgotEmail })}
								</p>
								<div>
									<label className='block mb-1 font-medium text-black'>
										{t('Auth.enterOtpLabel')}
									</label>
									<input
										type='text'
										ref={forgotOtpInputRef}
										className='input input-bordered w-full'
										value={forgotOtpCode}
										onChange={(e) => setForgotOtpCode(e.target.value)}
										required
									/>
								</div>
								{typeof attemptsLeft === 'number' && (
									<p className='text-sm text-right text-error'>
										{t('ForgotPassword.attemptsLeft', {
											count: attemptsLeft,
										})}
									</p>
								)}
								<button
									type='submit'
									className='submit-button w-full'
									disabled={loading}
								>
									{loading
										? t('ForgotPassword.verifyingOtp')
										: t('ForgotPassword.verifyOtp')}
								</button>
							</form>
						)}
						{forgotStep === 'reset' && (
							<form className='space-y-6' onSubmit={handleForgotReset}>
								<div>
									<label className='block mb-1 font-medium text-black'>
										{t('ForgotPassword.newPassword')}
									</label>
									<PasswordInputClient
										id='new_password'
										name='new_password'
										value={newPassword}
										onChange={(e) => setNewPassword(e.target.value)}
										required
									/>
								</div>
								<div>
									<label className='block mb-1 font-medium text-black'>
										{t('ForgotPassword.confirmPassword')}
									</label>
									<PasswordInputClient
										id='confirm_password'
										name='confirm_password'
										value={confirmPassword}
										onChange={(e) => setConfirmPassword(e.target.value)}
										required
									/>
								</div>
								<button
									type='submit'
									className='submit-button w-full'
									disabled={loading}
								>
									{loading
										? t('ForgotPassword.resetting')
										: t('ForgotPassword.reset')}
								</button>
							</form>
						)}
						{forgotStep === 'success' && (
							<div className='space-y-4 text-center'>
								<p>{t('ForgotPassword.success')}</p>
								<button
									type='button'
									className='submit-button w-full'
									onClick={() => backToLogin(true)}
								>
									{t('ForgotPassword.backToLogin')}
								</button>
							</div>
						)}
						{forgotStep !== 'success' && (
							<button
								type='button'
								className='btn btn-outline w-full'
								onClick={() => backToLogin()}
								disabled={loading}
							>
								{t('ForgotPassword.backToLogin')}
							</button>
						)}
					</div>
				)}
			</div>
		</div>
	);
}
