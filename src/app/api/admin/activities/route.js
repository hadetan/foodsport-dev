import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/prisma/require-admin';
import {
	getById,
	getCount,
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
				description: true,
				activityType: true,
				location: true,
				startDate: true,
				endDate: true,
				startTime: true,
				endTime: true,
				status: true,
				participantLimit: true,
				organizerId: true,
				imageUrl: true,
				pointsPerParticipant: true,
				caloriesPerHour: true,
				isFeatured: true,
				createdAt: true,
				updatedAt: true,
			},
			options
		);

		const activitiesList = await Promise.all(
			(activities || []).map(async (a) => {
				const participantCount = await getCount('userActivity', {
					activityId: a.id,
				});
				let organizerName;
				if (a.organizerId) {
					const organizer = await getById('adminUser', a.organizerId, {
						name: true,
					});
					organizerName = organizer.name;
				}
				return {
					id: a.id,
					title: a.title,
					description: a.description,
					activityType: a.activityType,
					location: a.location,
					startDate: a.startDate,
					endDate: a.endDate,
					startTime: a.startTime,
					endTime: a.endTime,
					status: a.status,
					participantLimit: a.participantLimit,
					participantCount,
					organizerId: a.organizerId,
					organizerName,
					imageUrl: a.imageUrl,
					pointsPerParticipant: a.pointsPerParticipant,
					caloriesPerHour: a.caloriesPerHour,
					isFeatured: a.isFeatured,
					createdAt: a.createdAt,
					updatedAt: a.updatedAt,
				};
			})
		);

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

// POST /api/admin/activities
export async function POST(req) {
	try {
		const supabase = await createServerClient();
		const { error } = await requireAdmin(supabase, NextResponse);
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

		if (file) {
			const allowedTypes = ['image/jpeg', 'image/png'];
			const maxSize = MAX_IMAGE_SIZE_MB * 1024 * 1024;

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

		const ext = file.name.split('.').pop();
		const fileName = `activity_${Date.now()}_${Math.random()
			.toString(36)
			.substring(2, 8)}.${ext}`;
		const bucket = 'activities-images';

		const { error: uploadError } = await supabase.storage
			.from(bucket)
			.upload(fileName, file, {
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
			.getPublicUrl(fileName);
		const imageUrl = publicUrlData?.publicUrl;
		if (!imageUrl) {
			return NextResponse.json(
				{ error: 'Failed to get image URL' },
				{ status: 500 }
			);
		}
		const allowedFields = [
			'title',
			'description',
			'activityType',
			'location',
			'startDate',
			'endDate',
			'startTime',
			'endTime',
			'status',
			'participantLimit',
			'organizerId',
			'pointsPerParticipant',
			'caloriesPerHour',
			'isFeatured',
			'imageUrl',
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

		if (activityData.participantLimit) {
			activityData.participantLimit = Number(activityData.participantLimit);
			if (isNaN(activityData.participantLimit)) {
				return NextResponse.json(
					{ error: 'participantLimit must be a number' },
					{ status: 400 }
				);
			}
		}
		if (activityData.pointsPerParticipant) {
			activityData.pointsPerParticipant = Number(activityData.pointsPerParticipant);
			if (isNaN(activityData.pointsPerParticipant)) {
				return NextResponse.json(
					{ error: 'pointsPerParticipant must be a number' },
					{ status: 400 }
				);
			}
		}
		if (activityData.caloriesPerHour) {
			activityData.caloriesPerHour = Number(activityData.caloriesPerHour);
			if (isNaN(activityData.caloriesPerHour)) {
				return NextResponse.json(
					{ error: 'caloriesPerHour must be a number' },
					{ status: 400 }
				);
			}
		}

		// Add validation for other fields
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
		const activity = await insert('activity', sanitizedData);
		if (activity && activity.error) {
			return NextResponse.json(
				{ error: formatDbError(activity.error), details: activity.error },
				{ status: 500 }
			);
		}
		return NextResponse.json(activity, { status: 201 });
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
        const { error } = await requireAdmin(supabase, NextResponse);
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
            'description',
            'activityType',
            'location',
            'startDate',
            'endDate',
            'startTime',
            'endTime',
            'status',
            'participantLimit',
            'organizerId',
            'pointsPerParticipant',
            'caloriesPerHour',
            'isFeatured',
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

        if (updates.participantLimit) {
            updates.participantLimit = Number(updates.participantLimit);
            if (isNaN(updates.participantLimit)) {
                return NextResponse.json(
                    { error: 'participantLimit must be a number' },
                    { status: 400 }
                );
            }
        }

        if (updates.pointsPerParticipant) {
            updates.pointsPerParticipant = Number(updates.pointsPerParticipant);
            if (isNaN(updates.pointsPerParticipant)) {
                return NextResponse.json(
                    { error: 'pointsPerParticipant must be a number' },
                    { status: 400 }
                );
            }
        }

        if (updates.caloriesPerHour) {
            updates.caloriesPerHour = Number(updates.caloriesPerHour);
            if (isNaN(updates.caloriesPerHour))
                return NextResponse.json(
                    { error: 'caloriesPerHour must be a number' },
                    { status: 400 }
                );
        }

        let newImageUrl = null;
        let oldImageUrl = null;
        let oldFilePath = null;
        const file = formData.get('image');
        if (file && typeof file !== 'string') {
            const current = await getMany(
                'activity',
                { id: activityId },
                { imageUrl: true }
            );
            oldImageUrl = current && current[0]?.imageUrl;

            if (oldImageUrl) {
                const urlObj = new URL(oldImageUrl);
                const pathParts = urlObj.pathname.split('/');
                // Find the index of the bucket and get everything after
                const bucketIndex = pathParts.findIndex((p) => p === 'activities-images');
                if (bucketIndex !== -1) {
                    oldFilePath = pathParts.slice(bucketIndex + 1).join('/');
                }
            }

            const ext = file.name.split('.').pop();
            const fileName = `activity_${Date.now()}_${Math.random()
                .toString(36)
                .substring(2, 8)}.${ext}`;
            const bucket = 'activities-images';
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

        if (Object.keys(updates).length === 0)
            return NextResponse.json(
                { error: 'No valid fields to update' },
                { status: 400 }
            );

        if (newImageUrl && oldFilePath) {
            const bucket = 'activities-images';
            const { error: removeError } = await supabase.storage
                .from(bucket)
                .remove([oldFilePath]);
            if (removeError) {
                console.error('Failed to remove old image:', removeError.message);
                return NextResponse.json(
                    { error: 'Failed to remove old image', details: removeError.message },
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

        return NextResponse.json(updatedActivity, { status: 200 });
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
