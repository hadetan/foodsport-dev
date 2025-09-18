'use client';
import '@/app/[locale]/auth/css/loginAndRegister.css';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import ErrorAlert from '@/app/shared/components/ErrorAlert';
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
	const otpInputRef = useRef(null);
	const router = useRouter();
	const { login, authToken, verifyOtp, handleSession } = useAuth();
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
			otpInputRef.current?.focus?.();
		}
	}, [otpStep]);


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
					{t('LoginPage.title')}
				</h1>
				{error && (
					<ErrorAlert message={error} onClose={() => setError('')} />
				)}
				{!otpStep && (
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
						className='submit-button w-full'
						disabled={loading}
					>
						{loading
							? t('LoginPage.loggingIn')
							: t('LoginPage.login')}
					</button>
				</form>
			)}
			{otpStep && (
				<form className='space-y-6' onSubmit={handleVerify}>
					<div>
						<label className='block mb-1 font-medium text-black'>{t('Auth.enterOtpLabel')}</label>
						<input
							type='text'
							ref={otpInputRef}
							className='input input-bordered w-full'
							value={otpCode}
							onChange={(e) => setOtpCode(e.target.value)}
							required
						/>
					</div>
					<button type='submit' className='submit-button w-full' disabled={loading}>
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
			</div>
		</div>
	);
}
