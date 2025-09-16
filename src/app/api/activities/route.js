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
	};
}

// GET /api/activities - Get all activities with optional filters
export async function GET(req) {
	try {
		const url = new URL(req.url);
		const { searchParams } = url;
		const { status, page, limit, type } = parseQueryParams(searchParams);
		const skip = (page - 1) * limit;
		const filters = {};
	if (status) filters.status = status;
	filters.status = filters.status && filters.status !== 'draft' ? filters.status : undefined;
		if (type) filters.type = type;
		const options = {
			limit,
			skip,
			orderBy: { startDate: 'desc' },
		};

		const validation = validateRequiredFields({ status, page, limit, type }, ['page', 'limit']);
		if (!validation.isValid) {
			return new NextResponse(
				JSON.stringify({ error: validation.error }),
				{ status: 400, headers: { 'Content-Type': 'application/json' } }
			);
		}

	const allowedFilters = ['status', 'type'];
	let sanitizedFilters = sanitizeData(filters, allowedFilters);
	sanitizedFilters = { ...sanitizedFilters, NOT: { status: 'draft' } };

		const activities = await getMany(
			'activity',
			sanitizedFilters,
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
				participantLimit: true,
				imageUrl: true,
				caloriesPerHour: true,
				isFeatured: true,
				mapUrl: true,
				tncId: true,
				status: true,
				organizationName: true,
			},
			options
		);

		const activityIds = (activities || []).map(a => a.id);

		const participantCountsRaw = await getMany(
			'userActivity',
			{ activityId: { in: activityIds } },
			{
				activityId: true,
				user: {
					select: {
						id: true,
						profilePictureUrl: true,
						firstname: true,
						lastname: true,
					},
				},
				tempUser: {
					select: {
						id: true,
						firstname: true,
						lastname: true,
					},
				},
			}
		);
		const participantCountMap = {};
		const participantMap = {};
		for (const row of participantCountsRaw) {
			const { activityId, user, tempUser } = row;
			participantCountMap[activityId] = (participantCountMap[activityId] || 0) + 1;
			let participant = null;
			if (user) {
				participant = {
					profilePictureUrl: user.profilePictureUrl || null,
					firstname: user.firstname || null,
					lastname: user.lastname || null,
				};
			} else if (tempUser) {
				participant = {
					profilePictureUrl: null,
					firstname: tempUser.firstname || null,
					lastname: tempUser.lastname || null,
				};
			}
			if (participant) {
				participantMap[activityId] = participantMap[activityId] || [];
				participantMap[activityId].push(participant);
			}
		}

		const tncIds = Array.from(new Set((activities || []).map(a => a.tncId).filter(Boolean)));
		let tncMap = {};
		if (tncIds.length > 0) {
			const tncs = await getMany('tnc', { id: { in: tncIds } }, {
				id: true,
				title: true,
				description: true,
			});
			tncMap = tncs.reduce((acc, tnc) => {
				acc[tnc.id] = tnc;
				return acc;
			}, {});
		}

		const activitiesList = (activities || []).map((a) => ({
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
			participants: (participantMap[a.id] || []).map(p => ({
				profilePictureUrl: p.profilePictureUrl || null,
				firstname: p.firstname || null,
				lastname: p.lastname || null,
			})),
			imageUrl: a.imageUrl,
			caloriesPerHour: a.caloriesPerHour,
			isFeatured: a.isFeatured,
			mapUrl: a.mapUrl,
			tnc: a.tncId ? tncMap[a.tncId] || null : null,
			status: a.status,
			organizationName: a.organizationName,
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
