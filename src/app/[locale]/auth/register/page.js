'use client';
import '@/app/[locale]/auth/css/loginAndRegister.css';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import ErrorAlert from '@/app/shared/components/ErrorAlert';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { useAuth } from '@/app/shared/contexts/authContext';
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
	const router = useRouter();
	const { signup, authToken, verifyRegisterOtp } = useAuth();
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
				await handleSession(session);
			}
		);
		return () => subscription?.subscription?.unsubscribe?.();
	}, [supabase]);

	useEffect(() => {
		(async () => {
			const { data } = await supabase.auth.getSession();
			if (data?.session && !handledOnce.current) {
				await handleSession(data.session);
			}
		})();
	}, [supabase]);

	const handleSession = async (session) => {
		if (handledOnce.current) return;
		handledOnce.current = true;
		try {
			await api.post('/auth/sync-session', {
				access_token: session.access_token,
				refresh_token: session.refresh_token,
			});
			try {
				localStorage.setItem('auth_token', session.access_token);
			} catch {}
			const res = await api.post('/auth/pre-profile');
			const data = res.data || {};
			if (data.reason === 'email_exists') {
				toast.info(t('RegisterPage.emailExistsToast'));
				try {
					localStorage.removeItem('auth_token');
				} catch {}
				try {
					await api.delete('/auth/logout');
				} catch {}
				try {
					await Promise.race([
						supabase.auth
							.signOut({ scope: 'local' })
							.catch(() => {}),
						new Promise((resolve) => setTimeout(resolve, 750)),
					]);
				} catch {}
				router.replace(`/${locale}/auth/login`);
				return;
			}
			if (data.created || (data.existing && data.userExists)) {
				router.replace(`/${locale}/my`);
				return;
			}
			if (data.preProfile) {
				router.replace(`/${locale}/auth/onboard`);
				return;
			}
		} catch (e) {
			console.error(e);
			handledOnce.current = false;
		}
	};

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
				setError('Verification failed');
			}
		} catch (_) {
			setError('Verification failed');
		} finally {
			setLoading(false);
		}
	}

	const onGoogle = async () => {
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
							<label className='block mb-1 font-medium text-black'>
								{t('RegisterPage.dateOfBirth')}
							</label>
							<input
								type='date'
								className='input input-bordered w-full'
								value={dateOfBirth}
								onChange={(e) => setDateOfBirth(e.target.value)}
								required
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
							<label className='block mb-1 font-medium text-black'>Enter OTP</label>
							<input
								type='text'
								className='input input-bordered w-full'
								value={otpCode}
								onChange={(e) => setOtpCode(e.target.value)}
								required
							/>
						</div>
						<button type='submit' className='submit-button w-full text-black' disabled={loading}>
							{loading ? 'Verifying...' : 'Verify OTP'}
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
