import React, { useState, useRef } from 'react';
import { useUser } from '@/app/shared/contexts/userContext';
import api from '@/utils/axios/api';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import '@/app/my/css/EditProfile.css';
import { LiaUserEditSolid } from 'react-icons/lia';
import { IoIosFemale, IoIosMale } from 'react-icons/io';
import { FaMountainSun } from 'react-icons/fa6';

export default function EditProfile() {
	const { user, setUser } = useUser();
	const [form, setForm] = useState({
		firstname: user.firstname,
		lastname: user.lastname,
		dateOfBirth: user.dateOfBirth.slice(0, 10),
		weight: user.weight || '',
		height: user.height || '',
		gender: user.gender || '',
		phoneNumber: user.phoneNumber || '',
		bio: user.bio || '',
	});
	const [initialValues, setInitialValues] = useState(form);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState('');
	const [crop, setCrop] = useState({ unit: '%', aspect: 1, width: 80, x: 10, y: 10, });
	const [srcImg, setSrcImg] = useState(null);
	const [croppedImg, setCroppedImg] = useState(null);
	const [croppedImgUrl, setCroppedImgUrl] = useState(null);
	const [showCropModal, setShowCropModal] = useState(false);
	const imgRef = useRef(null);
	const fileRef = useRef(null);

	const handleChange = (e) => {
		const { name, value } = e.target;
		setForm((f) => ({ ...f, [name]: value }));
	};

	const handleGender = (gender) => setForm((f) => ({ ...f, gender }));

	const handleImgSelect = (e) => {
		if (e.target.files && e.target.files[0]) {
			setSrcImg(URL.createObjectURL(e.target.files[0]));
			setShowCropModal(true);
		}
	};

	const handleCropConfirm = async () => {
		if (!imgRef.current || !crop.width || !crop.height) return;
		const image = imgRef.current;
		const scaleX = image.naturalWidth / image.width;
		const scaleY = image.naturalHeight / image.height;

		const getCropValue = (val, scale, natural) =>
			crop.unit === '%' ? (val * natural) / 100 : val * scale;

		const cropX = getCropValue(crop.x, scaleX, image.naturalWidth);
		const cropY = getCropValue(crop.y, scaleY, image.naturalHeight);
		const cropWidth = getCropValue(crop.width, scaleX, image.naturalWidth);
		const cropHeight = getCropValue(crop.height, scaleY, image.naturalHeight);

		const canvas = document.createElement('canvas');
		canvas.width = Math.round(cropWidth);
		canvas.height = Math.round(cropHeight);
		const ctx = canvas.getContext('2d');
		ctx.drawImage(image, cropX, cropY, cropWidth, cropHeight, 0, 0, canvas.width, canvas.height);
		canvas.toBlob((blob) => {
				setCroppedImg(blob);
				const previewUrl = URL.createObjectURL(blob);
				setCroppedImgUrl(previewUrl);
				setShowCropModal(false);
				setSrcImg(null);
			},
			'image/jpeg'
		);
	};

	const handleSave = async (e) => {
		e.preventDefault();
		setSaving(true);
		setError('');
		try {
			const changedFields = {};
			let res = { ...user };
			Object.keys(form).forEach((key) => {
				if (form[key] !== initialValues[key]) changedFields[key] = form[key];
			});
			if (Object.keys(changedFields).length > 0) {
				const data = await api.patch('/my/profile/edit', changedFields);
				res = {...user, ...data.data.user};
			}
			if (croppedImg) {
				const formData = new FormData();
				formData.append('profilePicture', croppedImg, 'avatar.jpg');
				const data = await api.patch('/my/profile/edit', formData, {
					headers: { 'Content-Type': 'multipart/form-data' },
				});
				res = { ...res, ...data.data.user };
			}
			setUser({ ...user, ...form, profilePictureUrl: res.profilePictureUrl });
			setInitialValues(form);
		} catch (err) {
			setError('Failed to save profile.');
		}
		setSaving(false);
	};

	return (
		<form className='edit-profile-form' onSubmit={handleSave}>
			<div className='edit-profile-avatar-section'>
				<div className='edit-profile-avatar-wrapper'>
					<div className='profile'>
						{croppedImgUrl ? (
							<img
								src={croppedImgUrl}
								alt='Profile Preview'
								className='edit-profile-avatar'
							/>
						) : user.profilePictureUrl ? (
							<img
								src={process.env.NEXT_PUBLIC_SUPABASE_URL + user.profilePictureUrl}
								alt='Profile'
								className='edit-profile-avatar'
							/>
						) : (
							<div style={{ width: '100%', height: '100%', display: 'flex' }}>
								<FaMountainSun style={{ width: '100%', height: '100%' }} />
							</div>
						)}
					</div>
					<div
						className='edit-profile-avatar-pencil'
						onClick={() =>
							fileRef.current && fileRef.current.click()
						}
						title='Edit profile picture'
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
							locked={true}
							minWidth={80}
							minHeight={80}
							keepSelection={true}
							ruleOfThirds={true}
						>
							<img
								src={srcImg}
								alt='Crop source'
								ref={imgRef}
								style={{
									maxWidth: 320,
									maxHeight: 320,
									display: 'block',
								}}
								onLoad={() => {
									const cropSizePercent = 80;
									const xPercent = (100 - cropSizePercent) / 2;
									const yPercent = (100 - cropSizePercent) / 2;
									setCrop({
										unit: '%',
										aspect: 1,
										width: cropSizePercent,
										height: cropSizePercent,
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
								Crop
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
								Cancel
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
					placeholder='First Name'
				/>
				<input
					name='lastname'
					value={form.lastname}
					onChange={handleChange}
					placeholder='Last Name'
				/>
			   <div className="edit-profile-input-suffix-wrapper">
				   <input
					   name='weight'
					   value={form.weight}
					   onChange={handleChange}
					   placeholder='Weight'
					   className='edit-profile-input'
				   />
				   <span className="edit-profile-input-suffix">kg</span>
			   </div>
			   <div className="edit-profile-input-suffix-wrapper">
				   <input
					   name='height'
					   value={form.height}
					   onChange={handleChange}
					   placeholder='Height'
					   className='edit-profile-input'
				   />
				   <span className="edit-profile-input-suffix">cm</span>
			   </div>
				<div className='edit-profile-gender'>
					<span className='edit-profile-gender-label'>Gender:</span>
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
								Male
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
								Female
							</span>
						</label>
					</div>
				</div>
				<input
					name='phoneNumber'
					value={form.phoneNumber}
					onChange={handleChange}
					placeholder='Contact No.'
					className='edit-profile-fullwidth'
				/>
				<input
					name='dateOfBirth'
					type='date'
					value={form.dateOfBirth}
					onChange={handleChange}
					placeholder='Date of Birth'
					className='edit-profile-fullwidth'
				/>
				<textarea
					name='bio'
					value={form.bio}
					onChange={handleChange}
					placeholder='Bio'
				/>
				<button
					type='submit'
					className='edit-profile-save-btn'
					disabled={saving}
				>
					{saving ? 'Saving...' : 'Save Profile'}
				</button>
			</div>
			{error && <div className='edit-profile-error'>{error}</div>}
		</form>
	);
}
