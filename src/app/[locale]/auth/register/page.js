'use client';
import '@/app/[locale]/auth/css/loginAndRegister.css';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import ErrorAlert from '@/app/shared/components/ErrorAlert';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { useAuth } from '@/app/shared/contexts/authContext';
import DobPickerClient from '@/app/shared/components/DobPickerClient';
import { getSupabaseClient } from '@/lib/supabase';
import toast from '@/utils/Toast';
import api from '@/utils/axios/api';

export default function RegisterPage() {
	const supabase = getSupabaseClient();
	const [email, setEmail] = useState('');
	const [firstname, setFirstname] = useState('');
	const [lastname, setLastname] = useState('');
	const [dateOfBirth, setDateOfBirth] = useState('');
	const [password, setPassword] = useState('');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [otpStep, setOtpStep] = useState(false);
	const [sessionId, setSessionId] = useState(null);
	const [otpCode, setOtpCode] = useState('');
	const otpInputRef = useRef(null);
	const router = useRouter();
	const { signup, authToken, verifyRegisterOtp, handleSession } = useAuth();
	const subOnce = useRef(false);
	const handledOnce = useRef(false);
	const t = useTranslations();
	const locale = useLocale();

	useEffect(() => {
		if (typeof window !== 'undefined' && authToken) {
			router.replace(`/${locale}/my`);
		}
	}, [router, authToken, locale]);

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

	async function handleRegister(e) {
		e.preventDefault();
		setLoading(true);
		setError('');
		try {
			const data = await signup({ email, password, firstname, lastname, dateOfBirth });
			if (data?.sessionId) {
				setSessionId(data.sessionId);
				setOtpStep(true);
			} else {
				setError(t('RegisterPage.genericError'));
			}
		} catch (err) {
			setError(t('RegisterPage.genericError'));
		} finally {
			setLoading(false);
		}
	}

	async function handleVerify(e) {
		e.preventDefault();
		setLoading(true);
		setError('');
		try {
			const data = await verifyRegisterOtp({ otpId: sessionId, code: otpCode, email, password, firstname, lastname, dateOfBirth });
			if (data?.session?.access_token) {
				router.replace(`/${locale}/my`);
			} else {
				setError(t('Auth.registrationVerificationFailed'));
			}
		} catch (_) {
			setError(t('Auth.registrationVerificationFailed'));
		} finally {
			setLoading(false);
		}
	}

	const onGoogle = async () => {
		setOtpStep(false);
		setSessionId(null);
		setOtpCode('');
		setError('');
		setLoading(true);
		try {
			const redirectTo = `${window.location.origin}/${locale}/auth/register`;
			await supabase.auth.signInWithOAuth({
				provider: 'google',
				options: { redirectTo },
			});
		} catch (e) {
			console.error(e);
			setLoading(false);
		}
	};

	useEffect(() => {
		if (otpStep) {
			otpInputRef.current?.focus();
		}
	}, [otpStep]);

	return (
		<div className=''>
			<div className='w-full max-w-md p-6 bg-base-100 rounded responsive-form'>
				<h1 className='text-2xl font-semibold mb-4 text-center'>
					{t('RegisterPage.title')}
				</h1>
				{!otpStep && (
					<form className='space-y-6' onSubmit={handleRegister}>
						{error && (
							<ErrorAlert
								message={error}
								onClose={() => setError('')}
							/>
						)}
						<div>
							<label className='block mb-1 font-medium text-black'>
								{t('RegisterPage.firstName')}
							</label>
							<input
								type='text'
								className='input input-bordered w-full'
								value={firstname}
								onChange={(e) => setFirstname(e.target.value)}
								required
							/>
						</div>
						<div>
							<label className='block mb-1 font-medium text-black'>
								{t('RegisterPage.lastName')}
							</label>
							<input
								type='text'
								className='input input-bordered w-full'
								value={lastname}
								onChange={(e) => setLastname(e.target.value)}
								required
							/>
						</div>
						<div>
							<DobPickerClient
								value={dateOfBirth}
								onChange={(val) => setDateOfBirth(val)}
								required
								label={t('RegisterPage.dateOfBirth')}
							/>
						</div>
						<div>
							<label className='block mb-1 font-medium text-black'>
								{t('RegisterPage.email')}
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
								{t('RegisterPage.password')}
							</label>
							<input
								type='password'
								className='input input-bordered w-full text-black'
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								required
							/>
						</div>
						<button
							type='submit'
							className='submit-button w-full text-black'
							disabled={loading}
						>
							{loading
								? t('RegisterPage.registering')
								: t('RegisterPage.register')}
						</button>
					</form>
				)}
				{otpStep && (
					<form className='space-y-6' onSubmit={handleVerify}>
						<div>
							<label className='block mb-1 font-medium text-black'>{t('Auth.enterOtpLabel')}</label>
							<input
								type='text'
								className='input input-bordered w-full'
								value={otpCode}
								onChange={(e) => setOtpCode(e.target.value)}
								ref={otpInputRef}
								required
							/>
						</div>
						<button type='submit' className='submit-button w-full text-black' disabled={loading}>
							{loading ? t('Auth.verifying') : t('Auth.verifyOtp')}
						</button>
					</form>
				)}
				<button
					onClick={onGoogle}
					disabled={loading}
					className='btn btn-outline w-full mt-4'
				>
					{t('RegisterPage.continueWithGoogle')}
				</button>
				<div className='mt-4 text-sm text-center'>
					{t('RegisterPage.alreadyHaveAccount')}{' '}
					<Link href={`/${locale}/auth/login`} className='link'>
						{t('RegisterPage.login')}
					</Link>
				</div>
			</div>
		</div>
	);
}
