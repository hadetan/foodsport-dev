import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/prisma/require-admin';
import {
	getById,
	getMany,
	insert,
	updateById,
} from '@/lib/prisma/db-utils';
import { formatDbError } from '@/utils/formatDbError';
import { createServerClient } from '@/lib/supabase/server-only';
import { validateRequiredFields } from '@/utils/validation';
import { sanitizeData } from '@/utils/sanitize';
import { MAX_IMAGE_SIZE_MB } from '@/app/constants/constants';

function parseQueryParams(searchParams) {
	return {
		status: searchParams.get('status') || '',
		page: parseInt(searchParams.get('page') || '1', 10),
		limit: parseInt(searchParams.get('limit') || '20', 10),
		type: searchParams.get('type') || '',
		organizerId: searchParams.get('organizerId') || '',
	};
}

// GET /api/admin/activities
export async function GET(req) {
	try {
		const supabase = await createServerClient();
		const { error } = await requireAdmin(supabase, NextResponse);
		if (error) return error;

		const url = new URL(req.url);
		const { searchParams } = url;
		const { status, page, limit, type, organizerId } =
			parseQueryParams(searchParams);
		const skip = (page - 1) * limit;
		const filters = {};
		if (status) filters.status = status;
		if (type) filters.type = type;
		if (organizerId) filters.organizerId = organizerId;
		const options = {
			limit,
			skip,
			orderBy: { startDate: 'desc' },
		};

		const activities = await getMany(
			'activity',
			filters,
			{
				id: true,
				title: true,
				titleZh: true,
				description: true,
				descriptionZh: true,
				summary: true,
				summaryZh: true,
				activityType: true,
				location: true,
				startDate: true,
				endDate: true,
				startTime: true,
				endTime: true,
				status: true,
				participantLimit: true,
				organizerId: true,
				organizationName: true,
				imageUrl: true,
				bannerImageUrl: true,
				caloriesPerHour: true,
				isFeatured: true,
				totalCaloriesBurnt: true,
				mapUrl: true,
				tncs: {
					select: {
						id: true,
						title: true,
						description: true,
						adminUserId: true,
						updatedBy: true,
						createdAt: true,
						updatedAt: true,
					},
				},
				createdAt: true,
				updatedAt: true,
			},
			options
		);

		const activityIds = (activities || []).map(a => a.id);
		const participantCountsRaw = await getMany('userActivity', { activityId: { in: activityIds } }, { activityId: true });
		const participantCountMap = {};
		for (const { activityId } of participantCountsRaw) {
			participantCountMap[activityId] = (participantCountMap[activityId] || 0) + 1;
		}

		const organizerIds = Array.from(new Set((activities || []).map(a => a.organizerId).filter(Boolean)));
		let organizerNameMap = {};
		if (organizerIds.length > 0) {
			const organizers = await getMany('adminUser', { id: { in: organizerIds } }, { id: true, name: true });
			organizerNameMap = organizers.reduce((acc, org) => {
				acc[org.id] = org.name;
				return acc;
			}, {});
		}

		// resolve admin names for tncs created/updated by
		let adminIds = [...organizerIds];
		for (const a of activities || []) {
			for (const t of (a.tncs || [])) {
				if (t.adminUserId) adminIds.push(t.adminUserId);
				if (t.updatedBy) adminIds.push(t.updatedBy);
			}
		}
		adminIds = Array.from(new Set(adminIds.filter(Boolean)));
		let adminMap = {};
		if (adminIds.length > 0) {
			const admins = await getMany('adminUser', { id: { in: adminIds } }, { id: true, name: true });
			adminMap = admins.reduce((acc, admin) => {
				acc[admin.id] = admin.name;
				return acc;
			}, {});
		}

		const activitiesList = (activities || []).map((a) => {
			return {
				id: a.id,
				title: a.title,
				titleZh: a.titleZh || null,
				description: a.description,
				descriptionZh: a.descriptionZh || null,
				summary: a.summary || null,
				summaryZh: a.summaryZh || null,
				activityType: a.activityType,
				location: a.location,
				startDate: a.startDate,
				endDate: a.endDate,
				startTime: a.startTime,
				endTime: a.endTime,
				status: a.status,
				participantLimit: a.participantLimit,
				participantCount: participantCountMap[a.id] || 0,
				organizerName: a.organizerId ? organizerNameMap[a.organizerId] : 'unknown',
				organizationName: a.organizationName,
				imageUrl: a.imageUrl,
				bannerImageUrl: a.bannerImageUrl,
				caloriesPerHour: a.caloriesPerHour,
				isFeatured: a.isFeatured,
				totalCaloriesBurnt: a.totalCaloriesBurnt,
				mapUrl: a.mapUrl,
				tncs: (a.tncs || []).map(t => ({
					id: t.id,
					title: t.title,
					description: t.description,
					createdBy: t.adminUserId ? adminMap[t.adminUserId] || null : null,
					updatedBy: t.updatedBy ? adminMap[t.updatedBy] || null : null,
					createdAt: t.createdAt,
					updatedAt: t.updatedAt,
				})),
				createdAt: a.createdAt,
				updatedAt: a.updatedAt,
			};
		});

		const responseData = {
			activities: activitiesList,
			pagination: {
				page,
				limit,
				total: activitiesList.length,
			},
		};

		return new NextResponse(JSON.stringify(responseData), {
			status: 200,
			headers: { 'Content-Type': 'application/json' },
		});
	} catch (error) {
		console.error('Error in GET /api/admin/activities:', error);
		return new NextResponse(
			JSON.stringify({ error: 'Failed to fetch activities. Please try again later.', message: error.message }),
			{
				status: 500,
				headers: { 'Content-Type': 'application/json' },
			}
		);
	}
}

// Helper to build canonical activity response (same shape as GET's mapping)
async function buildActivityResponse(id) {
	const activity = await getById('activity', id, {
		id: true,
		title: true,
		titleZh: true,
		description: true,
		descriptionZh: true,
		summary: true,
		summaryZh: true,
		activityType: true,
		location: true,
		startDate: true,
		endDate: true,
		startTime: true,
		endTime: true,
		status: true,
		participantLimit: true,
		organizerId: true,
		organizationName: true,
		imageUrl: true,
		bannerImageUrl: true,
		caloriesPerHour: true,
		isFeatured: true,
		totalCaloriesBurnt: true,
		mapUrl: true,
		tncs: {
			select: {
				id: true,
				title: true,
				description: true,
				adminUserId: true,
				updatedBy: true,
				createdAt: true,
				updatedAt: true,
			},
		},
		createdAt: true,
		updatedAt: true,
	});
	if (!activity) return null;

	// participant count
	const participantRows = await getMany('userActivity', { activityId: id }, { activityId: true });
	const participantCount = Array.isArray(participantRows) ? participantRows.length : 0;

	// organizer name
	let organizerName = 'unknown';
	if (activity.organizerId) {
		const admins = await getMany('adminUser', { id: activity.organizerId }, { id: true, name: true });
		if (Array.isArray(admins) && admins.length > 0) organizerName = admins[0].name || organizerName;
	}

	const tncsRaw = Array.isArray(activity.tncs) ? activity.tncs : [];
	const adminIds = Array.from(new Set(tncsRaw.flatMap(t => [t.adminUserId, t.updatedBy]).filter(Boolean)));
	let adminMap = {};
	if (adminIds.length > 0) {
		const admins = await getMany('adminUser', { id: { in: adminIds } }, { id: true, name: true });
		adminMap = (admins || []).reduce((acc, a) => {
			acc[a.id] = a.name;
			return acc;
		}, {});
	}

	return {
		id: activity.id,
		title: activity.title,
		titleZh: activity.titleZh || null,
		description: activity.description,
		descriptionZh: activity.descriptionZh || null,
		summary: activity.summary || null,
		summaryZh: activity.summaryZh || null,
		activityType: activity.activityType,
		location: activity.location,
		startDate: activity.startDate,
		endDate: activity.endDate,
		startTime: activity.startTime,
		endTime: activity.endTime,
		status: activity.status,
		participantLimit: activity.participantLimit,
		participantCount,
		organizerName,
		organizationName: activity.organizationName,
		imageUrl: activity.imageUrl,
		bannerImageUrl: activity.bannerImageUrl,
		caloriesPerHour: activity.caloriesPerHour,
		isFeatured: activity.isFeatured,
		totalCaloriesBurnt: activity.totalCaloriesBurnt,
		mapUrl: activity.mapUrl,
		tncs: tncsRaw.map(t => ({
			id: t.id,
			title: t.title,
			description: t.description,
			createdBy: t.adminUserId ? adminMap[t.adminUserId] || null : null,
			updatedBy: t.updatedBy ? adminMap[t.updatedBy] || null : null,
			createdAt: t.createdAt,
			updatedAt: t.updatedAt,
		})),
		createdAt: activity.createdAt,
		updatedAt: activity.updatedAt,
	};
}

// POST /api/admin/activities
export async function POST(req) {
	try {
		const supabase = await createServerClient();
		const { error, user } = await requireAdmin(supabase, NextResponse);
		if (error) return error;

		const contentType = req.headers.get('content-type') || '';
		if (!contentType.includes('multipart/form-data')) {
			return NextResponse.json(
				{ error: 'Content-Type must be multipart/form-data' },
				{ status: 400 }
			);
		}

		let formData;
		try {
			formData = await req.formData();
		} catch {
			return NextResponse.json(
				{ error: 'Invalid form data' },
				{ status: 400 }
			);
		}

		const requiredFields = [
			'title',
			'activityType',
			'location',
			'startDate',
			'endDate',
			'startTime',
			'endTime',
			'image',
			'bannerImage',
			'mapUrl',
		];
		const missingFields = requiredFields.filter(
			(field) => !formData.get(field)
		);
		if (missingFields.length > 0) {
			return NextResponse.json(
				{ error: `Missing required fields: ${missingFields.join(', ')}` },
				{ status: 400 }
			);
		}

		const file = formData.get('image');
		if (!file || typeof file === 'string') {
			return NextResponse.json(
				{ error: 'Image file is required' },
				{ status: 400 }
			);
		}

		const bannerFile = formData.get('bannerImage');
		if (!bannerFile || typeof bannerFile === 'string') {
			return NextResponse.json(
				{ error: 'Banner image file is required' },
				{ status: 400 }
			);
		}

		const allowedTypes = ['image/jpeg', 'image/png'];
		const maxSize = MAX_IMAGE_SIZE_MB * 1024 * 1024;

		if (file) {
			if (!allowedTypes.includes(file.type)) {
				return NextResponse.json(
					{ error: 'Invalid image type. Only JPEG and PNG are allowed.' },
					{ status: 400 }
				);
			}

			if (file.size > maxSize) {
				return NextResponse.json(
					{ error: 'Image size exceeds the maximum limit of 5MB.' },
					{ status: 400 }
				);
			}
		}

		if (bannerFile) {
			if (!allowedTypes.includes(bannerFile.type)) {
				return NextResponse.json(
					{ error: 'Invalid banner image type. Only JPEG and PNG are allowed.' },
					{ status: 400 }
				);
			}

			if (bannerFile.size > maxSize) {
				return NextResponse.json(
					{ error: 'Banner image size exceeds the maximum limit of 5MB.' },
					{ status: 400 }
				);
			}
		}

		const bucket = 'activities-images';

		const imageExt = file.name.split('.').pop();
		const imageFileName = `activity_${Date.now()}_${Math.random()
			.toString(36)
			.substring(2, 8)}.${imageExt}`;

		const { error: uploadError } = await supabase.storage
			.from(bucket)
			.upload(imageFileName, file, {
				cacheControl: '3600',
				upsert: false,
				contentType: file.type,
			});
		if (uploadError) {
			return NextResponse.json(
				{ error: 'Failed to upload image', details: uploadError.message },
				{ status: 500 }
			);
		}

		const { data: publicUrlData } = supabase.storage
			.from(bucket)
			.getPublicUrl(imageFileName);
		const imageUrl = publicUrlData?.publicUrl;
		if (!imageUrl) {
			return NextResponse.json(
				{ error: 'Failed to get image URL' },
				{ status: 500 }
			);
		}

		const bannerExt = bannerFile.name.split('.').pop();
		const bannerFileName = `activity_${Date.now()}_${Math.random()
			.toString(36)
			.substring(2, 8)}.${bannerExt}`;

		const { error: bannerUploadError } = await supabase.storage
			.from(bucket)
			.upload(bannerFileName, bannerFile, {
				cacheControl: '3600',
				upsert: false,
				contentType: bannerFile.type,
			});
		if (bannerUploadError) {
			return NextResponse.json(
				{ error: 'Failed to upload banner image', details: bannerUploadError.message },
				{ status: 500 }
			);
		}

		const { data: bannerPublicUrlData } = supabase.storage
			.from(bucket)
			.getPublicUrl(bannerFileName);
		const bannerImageUrl = bannerPublicUrlData?.publicUrl;
		if (!bannerImageUrl) {
			return NextResponse.json(
				{ error: 'Failed to get banner image URL' },
				{ status: 500 }
			);
		}
		const allowedFields = [
			'title',
			'titleZh',
			'description',
			'descriptionZh',
			'activityType',
			'location',
			'startDate',
			'endDate',
			'startTime',
			'endTime',
			'status',
			'participantLimit',
			'organizationName',
			'caloriesPerHour',
			'isFeatured',
			'imageUrl',
			'bannerImageUrl',
			'mapUrl',
			'tncIds',
		];
		const activityData = {};
		for (const field of allowedFields) {
			if (formData.get(field)) {
				if (field === 'isFeatured') {
					const val = formData.get(field);
					activityData.isFeatured = val === 'true' || val === '1';
				} else {
					activityData[field] = formData.get(field);
				}
			}
		}
		activityData.imageUrl = imageUrl;
		activityData.bannerImageUrl = bannerImageUrl;

		let adminId = null;
		if (user && user.email) {
			const adminRows = await getMany('adminUser', { email: user.email }, { id: true });
			if (adminRows && adminRows.length > 0) {
				adminId = adminRows[0].id;
			}
		}

		if (activityData.participantLimit) {
			activityData.participantLimit = Number(activityData.participantLimit);
			if (isNaN(activityData.participantLimit)) {
				return NextResponse.json(
					{ error: 'participantLimit must be a number' },
					{ status: 400 }
				);
			}
		}

		if (activityData.startDate && isNaN(Date.parse(activityData.startDate))) {
			return NextResponse.json(
				{ error: 'Invalid startDate format.' },
				{ status: 400 }
			);
		}

		if (activityData.endDate && isNaN(Date.parse(activityData.endDate))) {
			return NextResponse.json(
				{ error: 'Invalid endDate format.' },
				{ status: 400 }
			);
		}

		if (activityData.location && activityData.location.length < 5) {
			return NextResponse.json(
				{ error: 'Location must be at least 5 characters long.' },
				{ status: 400 }
			);
		}

		const validation = validateRequiredFields(activityData, ['title', 'activityType', 'location', 'startDate', 'endDate']);
		if (!validation.isValid) {
			return NextResponse.json(
				{ error: validation.error },
				{ status: 400 }
			);
		}
		
		const sanitizedData = sanitizeData(activityData, allowedFields);
		let tncIds = [];
		if (sanitizedData.tncIds && typeof sanitizedData.tncIds === 'string') {
			const trimmed = sanitizedData.tncIds.trim();
			if (trimmed) {
				if (trimmed.startsWith('[')) {
					try {
						const arr = JSON.parse(trimmed);
						if (Array.isArray(arr)) {
							tncIds = arr.filter(id => typeof id === 'string' && id.trim()).map(id => id.trim());
						}
					} catch {}
				}
				if (tncIds.length === 0) {
					tncIds = trimmed.split(',').map(s => s.trim()).filter(Boolean);
				}
				tncIds = Array.from(new Set(tncIds));
			}
		}
		delete sanitizedData.tncIds;
		if (adminId) sanitizedData.organizerId = adminId;
		if (Array.isArray(tncIds) && tncIds.length > 0) {
			sanitizedData.tncs = { connect: tncIds.map(id => ({ id })) };
		}
		const activity = await insert('activity', sanitizedData);
		if (activity && activity.error) {
			return NextResponse.json(
				{ error: formatDbError(activity.error), details: activity.error },
				{ status: 500 }
			);
		}

		const canonical = await buildActivityResponse(activity.id || activity?.[0]?.id || activity?.id);
		return NextResponse.json(canonical || activity, { status: 201 });
	} catch (error) {
		console.error('Error in POST /api/admin/activities:', error);
		return new NextResponse(
			JSON.stringify({ error: 'Failed to create activity. Please try again later.', message: error.message }),
			{
				status: 500,
				headers: { 'Content-Type': 'application/json' },
			}
		);
	}
}

// PATCH /api/admin/activities
export async function PATCH(req) {
    try {
        const supabase = await createServerClient();
        const { error, user } = await requireAdmin(supabase, NextResponse);
        if (error) return error;

        const url = new URL(req.url);
        const activityId = url.searchParams.get('activityId');
        if (!activityId) {
            return NextResponse.json(
                { error: 'Missing activityId' },
                { status: 400 }
            );
        }

        let formData;
        try {
            formData = await req.formData();
        } catch {
            return NextResponse.json(
                { error: 'Invalid form data' },
                { status: 400 }
            );
        }

		const allowedFields = [
			'title',
			'titleZh',
			'description',
			'descriptionZh',
			'summary',
			'summaryZh',
			'activityType',
			'location',
			'startDate',
			'endDate',
			'startTime',
			'endTime',
			'status',
			'participantLimit',
			'organizationName',
			'caloriesPerHour',
			'isFeatured',
			'totalCaloriesBurnt',
			'mapUrl',
			'tncIds',
		];
        let updates = {};
        for (const field of allowedFields) {
            if (formData.has(field)) {
                if (field === 'isFeatured') {
                    const val = formData.get(field);
                    updates.isFeatured = val === 'true' || val === '1';
                } else {
                    updates[field] = formData.get(field);
                }
            }
        }
		let tncIds = [];
		if (updates.tncIds && typeof updates.tncIds === 'string') {
			const trimmed = updates.tncIds.trim();
			if (trimmed) {
				if (trimmed.startsWith('[')) {
					try {
						const arr = JSON.parse(trimmed);
						if (Array.isArray(arr)) {
							tncIds = arr.filter(id => typeof id === 'string' && id.trim()).map(id => id.trim());
						}
					} catch {}
				}
				if (tncIds.length === 0) {
					tncIds = trimmed.split(',').map(s => s.trim()).filter(Boolean);
				}
				tncIds = Array.from(new Set(tncIds));
			}
		}
		delete updates.tncIds;
		if (tncIds.length > 0) {
			updates.tncs = { set: tncIds.map(id => ({ id })) };
		}

		let adminId = null;
		if (user && user.email) {
			const adminRows = await getMany('adminUser', { email: user.email }, { id: true });
			if (adminRows && adminRows.length > 0) {
				adminId = adminRows[0].id;
				updates.organizerId = adminId;
			}
		}

        if (updates.participantLimit) {
            updates.participantLimit = Number(updates.participantLimit);
            if (isNaN(updates.participantLimit)) {
                return NextResponse.json(
                    { error: 'participantLimit must be a number' },
                    { status: 400 }
                );
            }
        }



		if (updates.totalCaloriesBurnt !== undefined) {
			updates.totalCaloriesBurnt = Number(updates.totalCaloriesBurnt);
			if (isNaN(updates.totalCaloriesBurnt)) {
				return NextResponse.json(
					{ error: 'totalCaloriesBurnt must be a number' },
					{ status: 400 }
				);
			}
		}

		const bucket = 'activities-images';
        const file = formData.get('image');
		const bannerFile = formData.get('bannerImage');

        let newImageUrl = null;
        let oldImageUrl = null;
        let oldImageFilePath = null;
		let newBannerImageUrl = null;
		let oldBannerImageUrl = null;
		let oldBannerFilePath = null;

		if ((file && typeof file !== 'string') || (bannerFile && typeof bannerFile !== 'string')) {
			const current = await getMany(
				'activity',
				{ id: activityId },
				{ imageUrl: true, bannerImageUrl: true }
			);
			const currentActivity = current && current[0] ? current[0] : null;
			if (currentActivity) {
				oldImageUrl = currentActivity.imageUrl || null;
				oldBannerImageUrl = currentActivity.bannerImageUrl || null;
			}
		}

        if (file && typeof file !== 'string') {
            if (oldImageUrl) {
                const urlObj = new URL(oldImageUrl);
                const pathParts = urlObj.pathname.split('/');
                const bucketIndex = pathParts.findIndex((p) => p === bucket);
                if (bucketIndex !== -1) {
                    oldImageFilePath = pathParts.slice(bucketIndex + 1).join('/');
                }
            }

            const ext = file.name.split('.').pop();
            const fileName = `activity_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;
            const { error: uploadError } = await supabase.storage
                .from(bucket)
                .upload(fileName, file, {
                    cacheControl: '3600',
                    upsert: false,
                    contentType: file.type,
                });
            if (uploadError)
                return NextResponse.json(
                    {
                        error: 'Failed to upload image',
                        details: uploadError.message,
                    },
                    { status: 500 }
                );
            const { data: publicUrlData } = supabase.storage
                .from(bucket)
                .getPublicUrl(fileName);
            newImageUrl = publicUrlData?.publicUrl;
            if (!newImageUrl)
                return NextResponse.json(
                    { error: 'Failed to get image URL' },
                    { status: 500 }
                );
            updates.imageUrl = newImageUrl;
        }

		if (bannerFile && typeof bannerFile !== 'string') {
			if (oldBannerImageUrl) {
				const urlObj = new URL(oldBannerImageUrl);
				const pathParts = urlObj.pathname.split('/');
				const bucketIndex = pathParts.findIndex((p) => p === bucket);
				if (bucketIndex !== -1) {
					oldBannerFilePath = pathParts.slice(bucketIndex + 1).join('/');
				}
			}

			const bannerExt = bannerFile.name.split('.').pop();
			const bannerFileName = `activity_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${bannerExt}`;
			const { error: bannerUploadError } = await supabase.storage
				.from(bucket)
				.upload(bannerFileName, bannerFile, {
					cacheControl: '3600',
					upsert: false,
					contentType: bannerFile.type,
				});
			if (bannerUploadError)
				return NextResponse.json(
					{
						error: 'Failed to upload banner image',
						details: bannerUploadError.message,
					},
					{ status: 500 }
				);
			const { data: bannerPublicUrlData } = supabase.storage
				.from(bucket)
				.getPublicUrl(bannerFileName);
			newBannerImageUrl = bannerPublicUrlData?.publicUrl;
			if (!newBannerImageUrl)
				return NextResponse.json(
					{ error: 'Failed to get banner image URL' },
					{ status: 500 }
				);
			updates.bannerImageUrl = newBannerImageUrl;
		}

        if (Object.keys(updates).length === 0)
            return NextResponse.json(
                { error: 'No valid fields to update' },
                { status: 400 }
            );

        if (newImageUrl && oldImageFilePath) {
            const { error: removeError } = await supabase.storage
                .from(bucket)
                .remove([oldImageFilePath]);
            if (removeError) {
                console.error('Failed to remove old image:', removeError.message);
                return NextResponse.json(
                    { error: 'Failed to remove old image', details: removeError.message },
                    { status: 500 }
                );
            }
        }

		if (newBannerImageUrl && oldBannerFilePath) {
			const { error: removeBannerError } = await supabase.storage
				.from(bucket)
				.remove([oldBannerFilePath]);
			if (removeBannerError) {
				console.error('Failed to remove old banner image:', removeBannerError.message);
				return NextResponse.json(
					{ error: 'Failed to remove old banner image', details: removeBannerError.message },
					{ status: 500 }
				);
			}
		}

		const updatedActivity = await updateById('activity', activityId, updates);
		if (updatedActivity && updatedActivity.error)
			return NextResponse.json(
				{ error: formatDbError(updatedActivity.error) },
				{ status: 500 }
			);

		const canonical = await buildActivityResponse(activityId);
		return NextResponse.json(canonical || updatedActivity, { status: 200 });
    } catch (error) {
        console.error('Error in PATCH /api/admin/activities:', error);
        return new NextResponse(
            JSON.stringify({ error: 'Failed to update activity. Please try again later.', message: error.message }),
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            }
        );
    }
}
