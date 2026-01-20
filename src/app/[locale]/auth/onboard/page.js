'use client';
import { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import api from '@/utils/axios/api';
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
		country: '',
	});
	const [countries, setCountries] = useState([]);
	const [countriesError, setCountriesError] = useState('');
	const [error, setError] = useState('');
	const t = useTranslations();
	const locale = useLocale();
	const router = useRouter();
	const baseFieldClasses =
		'w-full rounded-xl border border-[#e5e7eb] bg-[#f9fbff] px-4 py-3 text-base text-gray-900 shadow-sm transition focus:border-[#00bbbb] focus:outline-none focus:ring-2 focus:ring-[#00bbbb33]';

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

	useEffect(() => {
		(async () => {
			try {
				const res = await api.get('/constants/countries');
				setCountries(Array.isArray(res.data?.countries) ? res.data.countries : []);
			} catch (err) {
				setCountriesError(t('OnboardPage.failedToLoadCountries'));
			}
		})();
	}, [t]);

	const onSubmit = async (e) => {
		e.preventDefault();
		try {
			const payload = { ...form };
			if (!payload.country) delete payload.country;
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
			{countriesError && <div className='alert alert-warning mb-4'>{countriesError}</div>}
			<form onSubmit={onSubmit} className='space-y-3'>
				<div>
					<DobPickerClient
						value={form.dateOfBirth}
						onChange={(val) => setForm((f) => ({ ...f, dateOfBirth: convertDDMMYYYYToYYYYMMDD(val) }))}
						required
						label={t('OnboardPage.dateOfBirth')}
						// hFull
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
							className={baseFieldClasses}
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
							className={baseFieldClasses}
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
							{t('OnboardPage.country')}
						</span>
					</label>
					<select
						className={baseFieldClasses}
						value={form.country}
						onChange={(e) =>
							setForm((f) => ({ ...f, country: e.target.value }))
						}
					>
						<option value=''>
							{t('OnboardPage.selectCountry')}
						</option>
						{countries.map((option) => (
							<option key={option.value} value={option.value}>
								{option.label}
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
