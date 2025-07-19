import { getMany } from '@/lib/prisma/db-utils';
const { getCache, setCache } = await import('@/utils/cache');

// GET /api/activities - Get all activities with optional filters
export async function GET(request) {
	try {
		const cacheKey = 'all_activities';
		const cached = getCache(cacheKey);
		if (cached) {
			return Response.json(cached);
		}

		const { searchParams } = new URL(request.url);
		const status = searchParams.get('status');
		const type = searchParams.get('type');
		const location = searchParams.get('location');
		const date = searchParams.get('date');
		const limit = parseInt(searchParams.get('limit')) || 50;
		const page = parseInt(searchParams.get('page')) || 0;

		const filters = {};
		if (status) filters.status = status;
		if (type) filters.type = type;
		if (location) filters.location = location;
		if (date) filters.date = date;

		const options = {
			limit,
			skip: page * limit,
			orderBy: { createdAt: 'desc' },
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
				currentParticipants: true,
				organizerName: true,
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

		const activitiesWithOrganizers = await Promise.all(
			activities.map(async (activity) => {
				return {
					id: activity.id,
					title: activity.title,
					description: activity.description,
					activityType: activity.activityType,
					location: activity.location,
					startDate: activity.startDate,
					endDate: activity.endDate,
					startTime: activity.startTime,
					endTime: activity.endTime,
					status: activity.status,
					participantLimit: activity.participantLimit,
					currentParticipants: activity.currentParticipants,
					organizerId: activity.organizerId,
					imageUrl: activity.imageUrl,
					pointsPerParticipant: activity.pointsPerParticipant,
					caloriesPerHour: activity.caloriesPerHour,
					isFeatured: activity.isFeatured,
					createdAt: activity.createdAt,
					updatedAt: activity.updatedAt,
				};
			})
		);

		const response = {
			activities: activitiesWithOrganizers,
			pagination: {
				page,
				limit,
				total: activitiesWithOrganizers.length,
			},
		};
		setCache(cacheKey, response, 60);
		return Response.json(response);
	} catch (error) {
		return Response.json(
			{
				error: {
					code: 'INTERNAL_ERROR',
					message: 'Internal server error',
					details: error.message,
				},
			},
			{ status: 500 }
		);
	}
}
