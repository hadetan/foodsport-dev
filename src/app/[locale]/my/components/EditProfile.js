import React, { useState, useRef, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { FaInfoCircle, FaUser } from 'react-icons/fa';
import { toast } from '@/utils/Toast';
import { useUser } from '@/app/shared/contexts/userContext';
import api from '@/utils/axios/api';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import '@/app/[locale]/my/css/EditProfile.css';
import { LiaUserEditSolid } from 'react-icons/lia';
import { IoIosFemale, IoIosMale } from 'react-icons/io';
import { DISTRICTS } from '@/app/constants/constants';
import { useTranslations } from 'next-intl';
import Tooltip from '@/app/shared/components/Tooltip';
import DobPickerClient from '@/app/shared/components/DobPickerClient';
import convertDDMMYYYYToYYYYMMDD from '@/utils/convertDate';

export default function EditProfile() {
	const { user, setUser } = useUser();
	const t = useTranslations('EditProfile');
	const searchParams = useSearchParams();
	const router = useRouter();
	const [form, setForm] = useState({
		firstname: user.firstname,
		lastname: user.lastname,
		dateOfBirth: user.dateOfBirth.slice(0, 10),
		weight: user.weight || '',
		height: user.height || '',
		gender: user.gender || '',
		phoneNumber: user.phoneNumber || '',
		district: user.district || '',
		bio: user.bio || '',
	});
	const [initialValues, setInitialValues] = useState(form);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState('');
	const [crop, setCrop] = useState({
		unit: '%',
		aspect: 1,
		width: 80,
		x: 10,
		y: 10,
	});
	const [srcImg, setSrcImg] = useState(null);
	const [croppedImg, setCroppedImg] = useState(null);
	const [croppedImgUrl, setCroppedImgUrl] = useState(null);
	const [showCropModal, setShowCropModal] = useState(false);
	const [fileType, setFileType] = useState('');
	const imgRef = useRef(null);
	const fileRef = useRef(null);
	const [linking, setLinking] = useState(false);

	useEffect(() => {
		if (!searchParams?.has || !searchParams.has('editProfile')) {
			return;
		}

		const code = searchParams.get('code');
		const isValidCode = typeof code === 'string' && /^[0-9a-fA-F-]{8,}$/.test(code);
		if (!isValidCode) {
			try {
				const url = new URL(window.location.href);
				url.search = 'editProfile=1';
				window.history.replaceState({}, '', url.toString());
			} catch (e) {}
			return;
		}

		(async () => {
			try {
				toast.info(t('google.linkingWait'));
				const { data } = await api.put('/auth/link-to-google');
				if (data?.ok && data?.linked) {
					toast.success(t('google.linkedSuccess'));
					setUser((prev) => ({ ...prev, googleId: prev?.id }));
					try {
						const url = new URL(window.location.href);
						url.search = 'editProfile=1';
						window.history.replaceState({}, '', url.toString());
					} catch (e) {}
				} else if (data?.reason === 'google_id_conflict') {
					toast.error(t('google.alreadyLinked'));
				}
			} catch (_) {
				// ignore; not a hard failure for profile page
			}
		})();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [searchParams]);

	const handleChange = (e) => {
		const { name, value } = e.target;
		setForm((f) => ({ ...f, [name]: value }));
	};

	// Allow only digits (no spinner UI) for some inputs. We sanitize on change and block non-digit keys on keydown.
	const onlyDigits = (s) => (s ? String(s).replace(/\D+/g, '') : '');

	const handleNumericChange = (e) => {
		const { name, value } = e.target;
		setForm((f) => ({ ...f, [name]: onlyDigits(value) }));
	};

	const handleNumericKeyDown = (e) => {
		// allow control/navigation keys
		const allowed = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'Tab'];
		if (allowed.includes(e.key)) return;
		// allow ctrl/cmd combos
		if (e.ctrlKey || e.metaKey) return;
		// block non-digit
		if (!/^[0-9]$/.test(e.key)) e.preventDefault();
	};

	const handleNumericPaste = (e) => {
		e.preventDefault();
		const text = e.clipboardData.getData('text') || '';
		const digits = onlyDigits(text);
		if (!digits) return;
		const name = e.target.name;
		setForm((f) => ({ ...f, [name]: digits }));
	};

	const handleDistrictChange = (e) => {
		setForm((f) => ({ ...f, district: e.target.value }));
	};

	const handleGender = (gender) => setForm((f) => ({ ...f, gender }));

	const handleImgSelect = (e) => {
		if (e.target.files && e.target.files[0]) {
			const file = e.target.files[0];
			setSrcImg(URL.createObjectURL(file));
			setShowCropModal(true);
			setFileType(file.type);
		}
	};

	const handleCropConfirm = async () => {
		if (!imgRef.current || !crop.width || !crop.height) return;

		const image = imgRef.current;
		const scaleX = image.naturalWidth / image.width;
		const scaleY = image.naturalHeight / image.height;

		if (crop.width <= 0 || crop.height <= 0) {
			setError(t('errors.invalidCrop'));
			return;
		}

		const getCropValue = (val, scale, natural) =>
			crop.unit === '%' ? (val * natural) / 100 : val * scale;

		const cropX = getCropValue(crop.x, scaleX, image.naturalWidth);
		const cropY = getCropValue(crop.y, scaleY, image.naturalHeight);
		const cropWidth = getCropValue(crop.width, scaleX, image.naturalWidth);
		const cropHeight = getCropValue(
			crop.height,
			scaleY,
			image.naturalHeight
		);

		const cropSize = Math.min(cropWidth, cropHeight);

		const canvas = document.createElement('canvas');
		canvas.width = cropSize;
		canvas.height = cropSize;
		const ctx = canvas.getContext('2d');

		// Draw square crop
		ctx.drawImage(
			image,
			cropX,
			cropY,
			cropSize,
			cropSize,
			0,
			0,
			cropSize,
			cropSize
		);

		canvas.toBlob((blob) => {
			if (!blob) {
				setError(t('errors.failedProcessImage'));
				return;
			}

			setCroppedImg(blob);
			const previewUrl = URL.createObjectURL(blob);
			setCroppedImgUrl(previewUrl);
			setShowCropModal(false);
			setSrcImg(null);

			return () => URL.revokeObjectURL(previewUrl);
		}, fileType);
	};

	const handleSave = async (e) => {
		e.preventDefault();
		setSaving(true);
		setError('');
		try {
			const changedFields = {};
			let res = { ...user };
			Object.keys(form).forEach((key) => {
				if (form[key] !== initialValues[key])
					changedFields[key] = form[key];
			});
			if (Object.keys(changedFields).length > 0) {
				const data = await api.patch('/my/profile/edit', changedFields);
				res = { ...user, ...data.data.user };
			}
			if (croppedImg) {
				const formData = new FormData();
				formData.append('profilePicture', croppedImg, 'avatar.jpg');
				const data = await api.patch('/my/profile/edit', formData, {
					headers: { 'Content-Type': 'multipart/form-data' },
				});
				res = { ...res, ...data.data.user };
			}
			setUser({
				...user,
				...form,
				profilePictureUrl: res.profilePictureUrl,
			});
			setInitialValues(form);
			toast.info(t('success.profileUpdated'));
			const returnTo = searchParams.get('returnTo');
			if (returnTo) {
				setTimeout(() => router.push(returnTo), 500);
				return;
			}
		} catch (err) {
			setError(t('errors.generic'));
			toast.error(t('errors.generic'));
		}
		setSaving(false);
	};

	const isFormDirty = () => {
		if (croppedImg) return true;
		for (const key of Object.keys(form)) {
			if (form[key] !== initialValues[key]) return true;
		}
		return false;
	};

	const handleLinkGoogle = async () => {
		try {
			setLinking(true);
			const current = typeof window !== 'undefined' ? window.location.href : undefined;
			let redirectTo = current;
			try {
				const url = new URL(current);
				url.searchParams.set('editProfile', '1');
				redirectTo = url.toString();
			} catch (e) {}
			const { data } = await api.post('/auth/link-to-google', { redirectTo });
			if (data?.ok && data?.url) {
				toast.info(t('google.redirecting'));
				window.location.href = data.url;
				return;
			}
			if (data?.reason === 'link_identity_not_supported') {
				toast.error(t('google.notSupported'));
			} else if (data?.reason === 'link_identity_failed') {
				if (data?.details && data.details.toLowerCase().includes('manual')) {
					toast.error(t('google.manualDisabled'));
				} else {
					toast.error(t('google.failedStart'));
				}
			} else {
				toast.error(t('google.unable'));
			}
		} catch (e) {
			toast.error(t('google.unable'));
				// keep previous error message
		} finally {
			setLinking(false);
		}
	};

	const avatarUrl = (() => {
		const src = user.profilePictureUrl;
        if (!src) return null;
        if (src.includes('googleusercontent') || /^https?:\/\//i.test(src)) {
            return src;
        }
        return `${process.env.NEXT_PUBLIC_SUPABASE_URL}${src}`;
    })();

	return (
		<form className='edit-profile-form' onSubmit={handleSave}>
			<div className='edit-profile-avatar-section'>
				<div className='edit-profile-avatar-wrapper'>
					<div className='profile'>
						{croppedImgUrl ? (
							<img
									src={croppedImgUrl}
									alt={t('editPictureTitle')}
									className='edit-profile-avatar'
								/>
						) : user.profilePictureUrl ? (
							<img
								src={
									avatarUrl
								}
								alt={t('editPictureTitle')}
								className='edit-profile-avatar'
							/>
						) : (
							<div
								className='something'
								style={{
									width: '100%',
									height: '100%',
									display: 'flex',
									backgroundColor: '#676767'
								}}
							>
								<FaUser
									style={{ width: '100%', height: '100%', color: '#fff' }}
								/>
							</div>
						)}
					</div>
					<div
						className='edit-profile-avatar-pencil'
						onClick={() =>
							fileRef.current && fileRef.current.click()
						}
						title={t('editPictureTitle')}
					>
						<LiaUserEditSolid size={30} />
					</div>
				</div>
				<input
					type='file'
					accept='image/*'
					onChange={handleImgSelect}
					ref={fileRef}
				/>
			</div>
			{showCropModal && (
				<div className='edit-profile-crop-modal'>
					<div className='edit-profile-crop-modal-content'>
						<ReactCrop
							crop={crop}
							onChange={(_, percentCrop) => setCrop(percentCrop)}
							aspect={1}
							minCropSize={{ width: 80, height: 80 }}
							keepSelection={true}
							ruleOfThirds={true}
						>
							<img
								src={srcImg}
								alt={t('crop')}
								ref={imgRef}
								style={{
									maxWidth: 320,
									maxHeight: 320,
									display: 'block',
								}}
								onLoad={(e) => {
									const image = e.target;
									const minDim = Math.min(
										image.naturalWidth,
										image.naturalHeight
									);

									const cropSizePixels = minDim;
									const widthPercent =
										(cropSizePixels / image.naturalWidth) *
										100;
									const heightPercent =
										(cropSizePixels / image.naturalHeight) *
										100;

									const xPercent = (100 - widthPercent) / 2;
									const yPercent = (100 - heightPercent) / 2;

									setCrop({
										unit: '%',
										aspect: 1,
										width: widthPercent,
										height: heightPercent,
										x: xPercent,
										y: yPercent,
									});
								}}
							/>
						</ReactCrop>
						<div className='edit-profile-crop-modal-actions'>
							<button
								type='button'
								onClick={handleCropConfirm}
								className='edit-profile-crop-btn'
							>
								{t('crop')}
							</button>
							<button
								type='button'
								onClick={() => {
									setShowCropModal(false);
									setSrcImg(null);
									fileRef.current.value = '';
								}}
								className='edit-profile-crop-cancel-btn'
							>
								{t('cancel')}
							</button>
						</div>
					</div>
				</div>
			)}
			<div className='edit-profile-fields'>
				<input
					name='firstname'
					value={form.firstname}
					onChange={handleChange}
					placeholder={t('placeholders.firstName')}
				/>
				<input
					name='lastname'
					value={form.lastname}
					onChange={handleChange}
					placeholder={t('placeholders.lastName')}
				/>
				<div className='info'>
					<div className="edit-profile-info-row">
					<span className="edit-profile-info-label">{t('info.question')}</span>
					<Tooltip content={t('info.tooltip')} width={'16rem'}>
						<FaInfoCircle className="edit-profile-tooltip-icon" />
					</Tooltip>
				</div>
				</div>
				<div className='edit-profile-input-suffix-wrapper'>
					<input
						name='weight'
						value={form.weight}
						onChange={handleNumericChange}
						onKeyDown={handleNumericKeyDown}
						onPaste={handleNumericPaste}
						placeholder={t('placeholders.weight')}
						className='edit-profile-input'
						inputMode='numeric'
						pattern='[0-9]*'
						type='text'
					/>
					<span className='edit-profile-input-suffix'>kg</span>
				</div>
				<div className='edit-profile-input-suffix-wrapper'>
					<input
						name='height'
						value={form.height}
						onChange={handleNumericChange}
						onKeyDown={handleNumericKeyDown}
						onPaste={handleNumericPaste}
						placeholder={t('placeholders.height')}
						className='edit-profile-input'
						inputMode='numeric'
						pattern='[0-9]*'
						type='text'
					/>
					<span className='edit-profile-input-suffix'>cm</span>
				</div>
				<div className='edit-profile-gender'>
					<span className='edit-profile-gender-label'>{t('gender.label')}</span>
					<div className='edit-profile-gender-options'>
						<label
							className={`edit-profile-gender-card${
								form.gender === 'male' ? ' selected' : ''
							}`}
							onClick={() => handleGender('male')}
						>
							<input
								type='radio'
								checked={form.gender === 'male'}
								onChange={() => handleGender('male')}
								name='gender'
							/>
							<span className='edit-profile-gender-icon'>
								<IoIosMale />
							</span>
							<span className='edit-profile-gender-text'>
								{t('gender.male')}
							</span>
						</label>
						<label
							className={`edit-profile-gender-card${
								form.gender === 'female' ? ' selected' : ''
							}`}
							onClick={() => handleGender('female')}
						>
							<input
								type='radio'
								checked={form.gender === 'female'}
								onChange={() => handleGender('female')}
								name='gender'
							/>
							<span className='edit-profile-gender-icon'>
								<IoIosFemale />
							</span>
							<span className='edit-profile-gender-text'>
								{t('gender.female')}
							</span>
						</label>
					</div>
				</div>
				<input
					name='phoneNumber'
					value={form.phoneNumber}
					onChange={handleNumericChange}
					onKeyDown={handleNumericKeyDown}
					onPaste={handleNumericPaste}
					placeholder={t('placeholders.contact')}
					className='edit-profile-fullwidth'
					inputMode='tel'
					pattern='[0-9]*'
					type='text'
				/>
				<DobPickerClient
					value={form.dateOfBirth}
					onChange={(val) => setForm((f) => ({ ...f, dateOfBirth: convertDDMMYYYYToYYYYMMDD(val) }))}
					label={t('placeholders.dateOfBirth')}
					id="dateOfBirth"
					disableLabel
					hFull
				/>
				<div className='edit-profile-district-bio-row'>
					<div>
						<select
							id='district'
							name='district'
							value={form.district}
							onChange={handleDistrictChange}
							className='edit-profile-district-dropdown'
						>
							<option value='' disabled>{t('placeholders.selectDistrict')}</option>
							{DISTRICTS.map((d) => (
								<option key={d} value={d}>{d.replace(/_/g, ' ')}</option>
							))}
						</select>
					</div>
					<div>
						<textarea
							id='bio'
							name='bio'
							value={form.bio}
							onChange={handleChange}
							placeholder={t('placeholders.bio')}
							className='edit-profile-bio-textarea'
						/>
					</div>
				</div>
				<div className='edit-profile-link-google-container'>
					<button
						type='button'
						onClick={handleLinkGoogle}
						disabled={linking || !!user.googleId}
						className='edit-profile-link-google-btn'
					>
						{user.googleId ? t('google.linked') : linking ? t('google.starting') : t('google.link')}
					</button>
				</div>
				<button
					type='submit'
					className='edit-profile-save-btn'
					disabled={saving || !isFormDirty()}
				>
					{saving ? t('saving') : t('saveProfile')}
				</button>
			</div>
			{error && <div className='edit-profile-error'>{error}</div>}
		</form>
	);
}
