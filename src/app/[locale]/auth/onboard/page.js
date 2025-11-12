'use client';
import { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import api from '@/utils/axios/api';
import { DISTRICTS } from '@/app/constants/constants';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/shared/contexts/authContext';
import DobPickerClient from '@/app/shared/components/DobPickerClient';
import convertDDMMYYYYToYYYYMMDD from '@/utils/convertDate';

export default function OnboardPage() {
	const [loading, setLoading] = useState(true);
	const { onboard } = useAuth();
	const [form, setForm] = useState({
		dateOfBirth: '',
		weight: '',
		height: '',
		district: '',
	});
	const [error, setError] = useState('');
	const t = useTranslations();
	const locale = useLocale();
	const router = useRouter();

	useEffect(() => {
		(async () => {
			try {
				const res = await api.get('/auth/pre-profile');
				const { preProfile } = res.data || {};
				if (!preProfile) {
					router.replace(`/${locale}/auth/login`);
					return;
				}
				setLoading(false);
			} catch (e) {
				setError(t('OnboardPage.failedToLoad'));
				setLoading(false);
			}
		})();
	}, []);

	const onSubmit = async (e) => {
		e.preventDefault();
		try {
			const payload = { ...form };
			await onboard({ payload })
			router.replace(`/${locale}/my`);
		} catch (e) {
			setError(
				e?.response?.data?.error || t('OnboardPage.failedToComplete')
			);
		}
	};

	if (loading) return <div className=''>{t('OnboardPage.loading')}</div>;

	return (
		<div className='w-full max-w-md p-8 bg-white rounded-lg shadow-lg responsive-form'>
			<h1 className='text-2xl font-semibold mb-4'>
				{t('OnboardPage.title')}
			</h1>
			{error && <div className='alert alert-error mb-4'>{error}</div>}
			<form onSubmit={onSubmit} className='space-y-3'>
				<div>
					<DobPickerClient
						value={form.dateOfBirth}
						onChange={(val) => setForm((f) => ({ ...f, dateOfBirth: convertDDMMYYYYToYYYYMMDD(val) }))}
						required
						label={t('OnboardPage.dateOfBirth')}
					/>
				</div>
				<div className='grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2'>
					<div>
						<label className='label'>
							<span className='label-text'>
								{t('OnboardPage.weight')}
							</span>
						</label>
						<input
							type='number'
							step='0.01'
							className='input input-bordered w-full'
							value={form.weight}
							onChange={(e) =>
								setForm((f) => ({
									...f,
									weight: e.target.value,
								}))
							}
						/>
					</div>
					<div>
						<label className='label'>
							<span className='label-text'>
								{t('OnboardPage.height')}
							</span>
						</label>
						<input
							type='number'
							step='0.01'
							className='input input-bordered w-full'
							value={form.height}
							onChange={(e) =>
								setForm((f) => ({
									...f,
									height: e.target.value,
								}))
							}
						/>
					</div>
				</div>
				<div>
					<label className='label'>
						<span className='label-text'>
							{t('OnboardPage.district')}
						</span>
					</label>
					<select
						className='select select-bordered w-full'
						value={form.district}
						onChange={(e) =>
							setForm((f) => ({ ...f, district: e.target.value }))
						}
					>
						<option value=''>
							{t('OnboardPage.selectDistrict')}
						</option>
						{DISTRICTS.map((d) => (
							<option key={d} value={d}>
								{d
									.split('_')
									.map(
										(w) =>
											w.charAt(0).toUpperCase() +
											w.slice(1).toLowerCase()
									)
									.join(' ')}
							</option>
						))}
					</select>
				</div>
				<button type='submit' className='btn btn-primary w-full'>
					{t('OnboardPage.finish')}
				</button>
			</form>
		</div>
	);
}
