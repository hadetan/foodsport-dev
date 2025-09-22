'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ErrorAlert from '@/app/shared/components/ErrorAlert';
import axiosClient from '@/utils/axios/api';
import { MAX_IMAGE_SIZE_MB } from '@/app/constants/constants';
import { ImageUp, Pencil, ArrowLeft, Calendar, MapPin } from 'lucide-react';
import { useAdminActivities } from '@/app/shared/contexts/AdminActivitiesContext';
import {
	ACTIVITY_TYPES,
	ACTIVITY_TYPES_FORMATTED,
} from '@/app/constants/constants';

const CreateActivityPage = () => {
	const router = useRouter();
	const [formData, setFormData] = useState({
		title: '',
		titleZh: '',
		activityType: '',
		description: '',
		descriptionZh: '',
		startDateTime: '',
		endDateTime: '',
		location: '',
		mapLocation: '',
		capacity: '',
		caloriesPerHourMin: '',
		caloriesPerHourMax: '',
		image: null,
		status: 'draft',
		mapUrl: '',
		tncId: '',
		organizationName: '',
		isFeatured: false,
	});
	const { setActivities } = useAdminActivities();
	const [error, setError] = useState('');
	const [fieldErrors, setFieldErrors] = useState({});
	const [loading, setLoading] = useState(false);
	const imgRef = useRef(null);
	const fileInputRef = useRef(null);
	const [mapUrl, setMapUrl] = useState(
		'https://www.google.com/maps?q=&output=embed'
	);
	const [tncOptions, setTncOptions] = useState([]);
	const [tncLoading, setTncLoading] = useState(false);

	const getMapUrl = (location) =>
		`https://www.google.com/maps?q=${location}&output=embed&z=14`;

	useEffect(() => {
		if (formData.mapLocation) {
			const encodedLocation = encodeURIComponent(
				formData.mapLocation + ', Hong Kong'
			);
			const url = getMapUrl(encodedLocation);
			setMapUrl(url);
			setFormData((prev) => ({
				...prev,
				mapUrl: url,
			}));
		} else {
			const url =
				'https://www.google.com/maps?q=Hong+Kong&output=embed&z=12';
			setMapUrl(url);
			setFormData((prev) => ({
				...prev,
				mapUrl: url,
			}));
		}
	}, [formData.mapLocation]);

	const fetchTncs = async () => {
		try {
			setTncLoading(true);
			const res = await axiosClient.get('/admin/tnc');
			if (Array.isArray(res.data)) {
				setTncOptions(res.data);
			} else if (Array.isArray(res.data?.data)) {
				setTncOptions(res.data.data);
			} else if (Array.isArray(res.data?.tncs)) {
				setTncOptions(res.data.tncs);
			}
		} catch (e) {
			console.error(e.message);
		} finally {
			setTncLoading(false);
		}
	};
	useEffect(() => {
		fetchTncs();
	}, []);

	const isValidYear = (dateStr) => {
		if (!dateStr) return true;
		const year = dateStr.split('-')[0];
		return /^\d{1,4}$/.test(year);
	};

	const validateFields = () => {
		const requiredFields = [
			'title',
			'titleZh',
			'activityType',
			'description',
			'descriptionZh',
			'location',
			'capacity',
			'caloriesPerHourMin',
			'caloriesPerHourMax',
			'image',
			'status',
			'startDateTime',
			'endDateTime',
		];
		const errors = {};
		requiredFields.forEach((field) => {
			if (
				formData[field] === '' ||
				formData[field] === null ||
				typeof formData[field] === 'undefined'
			) {
				errors[field] = 'This field is required.';
			}
		});
		if (formData.startDateTime && formData.endDateTime) {
			const start = new Date(formData.startDateTime);
			const end = new Date(formData.endDateTime);
			if (start > end) {
				errors.startDateTime =
					'Start date/time cannot be after end date/time.';
				errors.endDateTime =
					'End date/time cannot be before start date/time.';
			}
		}
		if (
			formData.caloriesPerHourMin &&
			formData.caloriesPerHourMax &&
			!isNaN(Number(formData.caloriesPerHourMin)) &&
			!isNaN(Number(formData.caloriesPerHourMax))
		) {
			if (
				Number(formData.caloriesPerHourMin) >
				Number(formData.caloriesPerHourMax)
			) {
				errors.caloriesPerHourMin =
					'Minimum must be less than or equal to maximum.';
				errors.caloriesPerHourMax =
					'Maximum must be greater than or equal to minimum.';
			}
		}
		setFieldErrors(errors);
		return Object.keys(errors).length === 0;
	};

	const handleFormChange = (e) => {
		const { name, value, type, checked } = e.target;
		if (
			(name === 'startDateTime' || name === 'endDateTime') &&
			!isValidYear(value)
		) {
			setFieldErrors((prev) => ({
				...prev,
				[name]: 'Year must be at most 4 digits.',
			}));
			return;
		}
		setFieldErrors((prev) => ({
			...prev,
			[name]: undefined,
		}));
		setError('');
		setFormData((prev) => ({
			...prev,
			[name]: type === 'checkbox' ? checked : value,
		}));
	};

	const handleImageUpload = (e) => {
		const file = e.target.files[0];
		if (!file) return;
		if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
			setFieldErrors((prev) => ({
				...prev,
				image: `Selected image cannot exceed ${MAX_IMAGE_SIZE_MB} MB.`,
			}));
			return;
		}
		setFieldErrors((prev) => ({
			...prev,
			image: undefined,
		}));
		setError("");
		setFormData((prev) => ({
			...prev,
			image: file,
		}));
	};

	const handleCreateActivity = async () => {
		if (!validateFields()) {
			setError('Please fix the errors in the form.');
			return;
		}
		try {
			setLoading(true);
			const startISO = formData.startDateTime
				? new Date(formData.startDateTime).toISOString()
				: '';
			const endISO = formData.endDateTime
				? new Date(formData.endDateTime).toISOString()
				: '';
			const caloriesPerHour =
				formData.caloriesPerHourMin && formData.caloriesPerHourMax
					? `${formData.caloriesPerHourMin}-${formData.caloriesPerHourMax}`
					: '';
			const payload = {
				title: formData.title,
				titleZh: formData.titleZh,
				activityType: formData.activityType,
				location: formData.location,
				startDate: startISO,
				endDate: endISO,
				startTime: startISO,
				endTime: endISO,
				description: formData.description,
				descriptionZh: formData.descriptionZh,
				status: formData.status,
				participantLimit: Number(formData.capacity),
				caloriesPerHour,
				image: formData.image,
				mapUrl: formData.mapUrl,
				tncId: formData.tncId || '',
				organizationName: formData.organizationName || '',
				isFeatured: !!formData.isFeatured,
			};
			const formDataToSend = new FormData();
			Object.entries(payload).forEach(([key, value]) => {
				if (key === 'image' && value) {
					formDataToSend.set('image', value);
				} else if (
					value !== undefined &&
					value !== null &&
					typeof value !== 'object'
				) {
					formDataToSend.set(key, value);
				}
			});
			const response = await axiosClient.post(
				'/admin/activities',
				formDataToSend,
				{
					headers: { 'Content-Type': 'multipart/form-data' },
				}
			);
			if (response?.data?.id) {
				setActivities((prev) =>
					Array.isArray(prev)
						? [...prev, response?.data]
						: [response?.data]
				);
				router.push(
					`/admin/activities/${response.data.id}?tab=description`
				);
			}
		} catch (err) {
			setError(err?.response?.data?.error || err.message);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className='flex flex-col items-center justify-start w-full h-full min-h-0 bg-[#F9FAFB] px-2 sm:px-4 md:px-8 lg:px-16 flex-1'>
			{/* Back Button */}
			<div className='w-full flex justify-start mb-4'>
				<button
					className='flex items-center gap-2 px-4 py-2 rounded-md bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 cursor-pointer'
					onClick={() => router.push('/admin/activities')}
					type='button'
				>
					<ArrowLeft className='w-4 h-4' />
					<span className='text-sm font-medium'>Back</span>
				</button>
			</div>

			{/* Card */}
			<div className='w-full bg-white rounded-lg shadow-sm p-6 md:p-8 mb-6'>

				<h1 className='text-2xl font-bold mb-6 text-gray-900'>Create Activity</h1>

				{error && (
					<ErrorAlert message={error} onClose={() => setError('')} />
				)}

				<form
					onSubmit={async (e) => {
						e.preventDefault();
						await handleCreateActivity();
					}}
				>
					{/* Main grid: left preview, right fields */}
					<div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
						{/* Left: Image */}
						<div className='lg:col-span-1'>
							<label className='block text-sm font-medium text-gray-600 mb-2'>Upload Image</label>
							<div className='relative group rounded-lg overflow-hidden bg-gray-100 border border-gray-200' style={{ aspectRatio: '16/9' }}>
								<input
									id='activity-image-upload'
									type='file'
									ref={fileInputRef}
									className='absolute inset-0 opacity-0 cursor-pointer'
									accept='image/jpeg,image/png,image/webp'
									onChange={handleImageUpload}
									disabled={!!formData.image}
									aria-label='Upload image'
									style={{ zIndex: 2 }}
								/>
								{formData.image ? (
									<>
										<img
											ref={imgRef}
											src={
												typeof formData.image === 'string'
													? formData.image
													: URL.createObjectURL(formData.image)
											}
											alt='Preview'
											className='w-full h-full object-contain'
										/>
										<button
											type='button'
											className='absolute top-2 right-2 bg-white/90 rounded-full p-1 shadow hover:bg-white cursor-pointer'
											style={{ zIndex: 10 }}
											onClick={() => {
												if (fileInputRef.current) {
													fileInputRef.current.value = '';
													fileInputRef.current.disabled = false;
													fileInputRef.current.click();
												}
											}}
											tabIndex={0}
											aria-label='Change image'
										>
											<Pencil className='text-indigo-600 w-5 h-5' />
										</button>
									</>
								) : (
									<div className='absolute inset-0 flex flex-col items-center justify-center text-indigo-600 select-none pointer-events-none'>
										<ImageUp className='w-10 h-10 mb-2' />
										<span className='font-medium'>Drop image or browse</span>
										<span className='text-xs text-gray-400 mt-1'>JPG, PNG, WEBP</span>
									</div>
								)}
							</div>
							{fieldErrors.image && (
								<span className='text-error text-base'>{fieldErrors.image}</span>
							)}
							{/* Featured */}
							<div className='mt-4 mb-10'>
								<label className='flex items-center cursor-pointer w-full' style={{justifyContent: "space-between"}} htmlFor='featured-toggle'>
									<div className=''>
										<p className='text-sm font-medium text-gray-900'>Featured</p>
										<p className='text-xs text-gray-500'>Feature this activity to highlight it on the landing page.</p>
									</div>
									<div
										className='relative'
										role='switch'
										aria-checked={!!formData.isFeatured}
										tabIndex={0}
										onKeyDown={(e) => {
											if (e.key === ' ' || e.key === 'Enter') {
												e.preventDefault();
												document.getElementById('featured-toggle')?.click();
											}
										}}
									>
										<input
											id='featured-toggle'
											type='checkbox'
											className='toggle toggle-primary sr-only'
											name='isFeatured'
											checked={!!formData.isFeatured}
											onChange={handleFormChange}
											tabIndex={-1}
										/>
										<div className='block bg-gray-200 w-14 h-8 rounded-full'></div>
										<div className='dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition'></div>
									</div>
								</label>
								<style>{`input#featured-toggle:checked ~ .dot { transform: translateX(100%); } input#featured-toggle:checked ~ .block { background-color: #A5B4FC; }`}</style>
							</div>
							{/* Start Date & Time with icon */}
							<div>
								<label className='block text-sm font-medium text-gray-700 mb-2 mt-2'>Start Date &amp; Time</label>
								<div className='relative'>
									<input
										type='datetime-local'
										className='input input-bordered input-lg w-full bg-white text-black pl-12'
										name='startDateTime'
										value={formData.startDateTime}
										onChange={handleFormChange}
										required
									/>
									<Calendar className='w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none' />
								</div>
								{fieldErrors.startDateTime && (
									<span className='text-error text-base'>{fieldErrors.startDateTime}</span>
								)}
							</div>

							{/* End Date & Time with icon */}
							<div>
								<label className='block text-sm font-medium text-gray-700 mb-2 mt-2'>End Date &amp; Time</label>
								<div className='relative'>
									<input
										type='datetime-local'
										className='input input-bordered input-lg w-full bg-white text-black pl-12'
										name='endDateTime'
										value={formData.endDateTime}
										onChange={handleFormChange}
										required
									/>
									<Calendar className='w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none' />
								</div>
								{fieldErrors.endDateTime && (
									<span className='text-error text-base'>{fieldErrors.endDateTime}</span>
								)}
							</div>
						</div>

						{/* Right: Fields */}
						<div className='lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6'>
							{/* Activity Title */}
							<div>
								<label className='block text-sm font-medium text-gray-700 mb-2'>Activity Title</label>
								<input
									className='input input-bordered input-lg w-full bg-white text-black'
									name='title'
									value={formData.title}
									onChange={handleFormChange}
									maxLength={100}
									required
								/>
								{fieldErrors.title && (
									<span className='text-error text-base'>{fieldErrors.title}</span>
								)}
							</div>

							{/* Chinese Title */}
							<div>
								<label className='block text-sm font-medium text-gray-700 mb-2'>Chinese Title</label>
								<input
									className='input input-bordered input-lg w-full bg-white text-black'
									name='titleZh'
									value={formData.titleZh}
									onChange={handleFormChange}
									maxLength={100}
									required
								/>
								{fieldErrors.titleZh && (
									<span className='text-error text-base'>{fieldErrors.titleZh}</span>
								)}
							</div>

							<div className='lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 center'>
								{/* Activity Type */}
								<div>
									<label className='block text-sm font-medium text-gray-700 mb-2'>Activity Type</label>
									<select
										className='select select-bordered select-lg w-full bg-white text-black'
										name='activityType'
										value={formData.activityType}
										onChange={handleFormChange}
										required
									>
										<option value=''>Select activity type</option>
										{ACTIVITY_TYPES_FORMATTED.map((formatted, idx) => (
											<option key={formatted} value={formatted}>
												{ACTIVITY_TYPES[idx].charAt(0).toUpperCase() + ACTIVITY_TYPES[idx].slice(1)}
											</option>
										))}
									</select>
									{fieldErrors.activityType && (
										<span className='text-error text-base'>{fieldErrors.activityType}</span>
									)}
								</div>
								{/* Location with icon */}
								<div>
									<label className='block text-sm font-medium text-gray-700 mb-2'>Location</label>
									<div className='relative'>
										<input
											className='input input-bordered input-lg w-full bg-white text-black pl-12'
											name='location'
											value={formData.location || ''}
											onChange={handleFormChange}
											placeholder='Enter location'
										/>
										<MapPin className='w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none' />
									</div>
									{fieldErrors.location && (
										<span className='text-error text-base'>{fieldErrors.location}</span>
									)}
								</div>
							</div>

							{/* Summary */}
							<div className='md:col-span-2'>
								<label className='block text-sm font-medium text-gray-700 mb-2'>Summary</label>
								<textarea
									className='textarea textarea-bordered textarea-lg w-full bg-white text-black'
									name='description'
									value={formData.description}
									onChange={(e) => {
										setFormData((prev) => ({ ...prev, description: e.target.value }));
										setFieldErrors((prev) => ({ ...prev, description: undefined }));
									}}
									required
									rows={4}
									placeholder='Enter english summary...'
								/>
								{fieldErrors.description && (
									<span className='text-error text-base'>{fieldErrors.description}</span>
								)}
							</div>

							{/* Chinese Summary */}
							<div className='md:col-span-2'>
								<label className='block text-sm font-medium text-gray-700 mb-2'>Chinese Summary</label>
								<textarea
									className='textarea textarea-bordered textarea-lg w-full bg-white text-black'
									name='descriptionZh'
									value={formData.descriptionZh}
									onChange={handleFormChange}
									required
									rows={4}
									placeholder='請輸入中文摘要...'
								/>
								{fieldErrors.descriptionZh && (
									<span className='text-error text-base'>{fieldErrors.descriptionZh}</span>
								)}
							</div>
						</div>
					</div>

					{/* Extra fields row (Capacity, Calories, T&C, Org) */}
					<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6 pt-6 border-t border-gray-200'>
						{/* Capacity */}
						<div>
							<label className='block text-sm font-medium text-gray-700 mb-2'>Capacity</label>
							<input
								type='number'
								className='input input-bordered input-lg w-full bg-white text-black'
								name='capacity'
								value={formData.capacity}
								onChange={handleFormChange}
								min={1}
								required
								placeholder='Enter participant limit'
							/>
							{fieldErrors.capacity && (
								<span className='text-error text-base'>{fieldErrors.capacity}</span>
							)}
						</div>

						{/* Calories */}
						<div>
							<label className='block text-sm font-medium text-gray-700 mb-2'>Calories Per Hour</label>
							<div className='flex gap-2'>
								<input
									type='number'
									className='input input-bordered input-lg w-1/2 bg-white text-black'
									name='caloriesPerHourMin'
									value={formData.caloriesPerHourMin}
									onChange={handleFormChange}
									min={0}
									required
									placeholder='Min'
								/>
								<span className='flex items-center px-1 text-lg text-gray-500'>-</span>
								<input
									type='number'
									className='input input-bordered input-lg w-1/2 bg-white text-black'
									name='caloriesPerHourMax'
									value={formData.caloriesPerHourMax}
									onChange={handleFormChange}
									min={0}
									required
									placeholder='Max'
								/>
							</div>
							{(fieldErrors.caloriesPerHourMin || fieldErrors.caloriesPerHourMax) && (
								<span className='text-error text-base'>{fieldErrors.caloriesPerHourMin || fieldErrors.caloriesPerHourMax}</span>
							)}
						</div>

						{/* T&C */}
						<div>
							<label className='block text-sm font-medium text-gray-700 mb-2'>Terms &amp; Conditions</label>
							<select
								className='select select-bordered select-lg w-full bg-white text-black'
								name='tncId'
								value={formData.tncId}
								onChange={handleFormChange}
								disabled={tncLoading}
							>
								<option value=''>{tncLoading ? 'Loading...' : 'Select T&C'}</option>
								{tncOptions.map((t) => (
									<option key={t.id} value={t.id}>{t.title}</option>
								))}
							</select>
							{fieldErrors.tncId && (
								<span className='text-error text-base'>{fieldErrors.tncId}</span>
							)}
						</div>

						{/* Organization Name */}
						<div>
							<label className='block text-sm font-medium text-gray-700 mb-2'>Organization Name</label>
							<input
								className='input input-bordered input-lg w-full bg-white text-black'
								name='organizationName'
								value={formData.organizationName || ''}
								onChange={handleFormChange}
								placeholder='Name of organizer'
							/>
						</div>
					</div>

					{/* Search Map - full width */}
					<div className='mt-6'>
						<label className='block text-sm font-medium text-gray-700 mb-2'>Search In Map</label>
						<input
							className='input input-bordered input-lg w-full bg-white text-black'
							name='mapLocation'
							value={formData.mapLocation || ''}
							onChange={handleFormChange}
							required
							placeholder='Enter Map Address'
						/>
						{fieldErrors.mapLocation && (
							<span className='text-error text-base'>{fieldErrors.mapLocation}</span>
						)}
					</div>

					{/* Google Map preview */}
					<div className='w-full mt-6'>
						<div className='w-full h-[320px] rounded-lg overflow-hidden border border-gray-200'>
							<iframe
								title='Google Map'
								width='100%'
								height='100%'
								style={{ border: 0, width: '100%', height: '100%' }}
								loading='lazy'
								allowFullScreen
								referrerPolicy='no-referrer-when-downgrade'
								src={mapUrl}
							/>
						</div>
					</div>

					{/* Actions */}
					<div className='flex justify-end gap-4 mt-8'>
						<button type='button' className='px-6 py-2 rounded-md text-sm font-medium bg-gray-200 text-gray-900 hover:bg-gray-300 cursor-pointer' onClick={() => router.push('/admin/activities')} disabled={loading}>
							Cancel
						</button>
						<button type='submit' className='px-6 py-2 rounded-md text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 cursor-pointer' disabled={loading}>
							{loading ? 'Creating Activity' : 'Save & Continue'}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default CreateActivityPage;
