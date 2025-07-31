import { NextResponse } from 'next/server';
import { getById, getCount, getMany } from '@/lib/prisma/db-utils';

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
	const url = new URL(req.url);
	const { searchParams } = url;
	const { status, page, limit, type, organizerId } = parseQueryParams(searchParams);
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
				organizerName,
				imageUrl: a.imageUrl,
				pointsPerParticipant: a.pointsPerParticipant,
				caloriesPerHour: a.caloriesPerHour,
				isFeatured: a.isFeatured,
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
}
