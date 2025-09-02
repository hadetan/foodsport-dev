import { NextResponse } from 'next/server';
import { getMany } from '@/lib/prisma/db-utils';
import { validateRequiredFields } from '@/utils/validation';
import { sanitizeData } from '@/utils/sanitize';

function parseQueryParams(searchParams) {
	return {
		status: searchParams.get('status') || '',
		page: parseInt(searchParams.get('page') || '1', 10),
		limit: parseInt(searchParams.get('limit') || '20', 10),
		type: searchParams.get('type') || '',
		organizerId: searchParams.get('organizerId') || '',
	};
}

// GET /api/activities - Get all activities with optional filters
export async function GET(req) {
	try {
		const url = new URL(req.url);
		const { searchParams } = url;
		const { status, page, limit, type, organizerId } = parseQueryParams(searchParams);
		const skip = (page - 1) * limit;
		const filters = {};
	if (status) filters.status = status;
	filters.status = filters.status && filters.status !== 'draft' ? filters.status : undefined;
		if (type) filters.type = type;
		if (organizerId) filters.organizerId = organizerId;
		const options = {
			limit,
			skip,
			orderBy: { startDate: 'desc' },
		};

		// Validate query parameters
		const validation = validateRequiredFields({ status, page, limit, type, organizerId }, ['page', 'limit']);
		if (!validation.isValid) {
			return new NextResponse(
				JSON.stringify({ error: validation.error }),
				{ status: 400, headers: { 'Content-Type': 'application/json' } }
			);
		}

	const allowedFilters = ['status', 'type', 'organizerId'];
	let sanitizedFilters = sanitizeData(filters, allowedFilters);
	sanitizedFilters = { ...sanitizedFilters, NOT: { status: 'draft' } };

		const activities = await getMany(
			'activity',
			sanitizedFilters,
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
				caloriesPerHour: true,
				isFeatured: true,
			},
			options
		);

		// Optimize: fetch participant counts and organizer names in bulk
		const activityIds = (activities || []).map(a => a.id);
		const organizerIds = Array.from(new Set((activities || []).map(a => a.organizerId).filter(Boolean)));

		// Bulk fetch participant counts
		const participantCountsRaw = await getMany('userActivity', { activityId: { in: activityIds } }, { activityId: true });
		const participantCountMap = {};
		for (const { activityId } of participantCountsRaw) {
			participantCountMap[activityId] = (participantCountMap[activityId] || 0) + 1;
		}

		// Bulk fetch organizer names
		let organizerNameMap = {};
		if (organizerIds.length > 0) {
			const organizers = await getMany('adminUser', { id: { in: organizerIds } }, { id: true, name: true });
			organizerNameMap = organizers.reduce((acc, org) => {
				acc[org.id] = org.name;
				return acc;
			}, {});
		}

		const activitiesList = (activities || []).map((a) => ({
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
			participantCount: participantCountMap[a.id] || 0,
			organizerName: a.organizerId ? organizerNameMap[a.organizerId] : undefined,
			imageUrl: a.imageUrl,
			caloriesPerHour: a.caloriesPerHour,
			isFeatured: a.isFeatured,
		}));

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
		console.error('Error in GET /api/activities:', error);
		return new NextResponse(
			JSON.stringify({ error: 'Failed to fetch activities. Please try again later.', message: error.message }),
			{
				status: 500,
				headers: { 'Content-Type': 'application/json' },
			}
		);
	}
}
