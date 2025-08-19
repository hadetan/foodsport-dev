import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/prisma/require-admin';
import { getMany, updateById, getUserJoinedActivitiesWithDetails } from '@/lib/prisma/db-utils';
import { sanitizeData } from '@/utils/sanitize';
import { createServerClient } from '@/lib/supabase/server-only';

function parseQueryParams(searchParams) {
	return {
		search: searchParams.get('search') || '',
		status: searchParams.get('status') || '',
		page: parseInt(searchParams.get('page') || '1', 10),
		limit: parseInt(searchParams.get('limit') || '20', 10),
		sortBy: searchParams.get('sortBy') || 'created_at',
		sortOrder: searchParams.get('sortOrder') === 'asc' ? 'asc' : 'desc',
	};
}

export async function GET(req) {
	try {
		const supabase = await createServerClient();
		const { error } = await requireAdmin(supabase, NextResponse);
		if (error) return error;
		const url = new URL(req.url);
		const { searchParams } = url;
		const { search, status, page, limit, sortBy, sortOrder } =
			parseQueryParams(searchParams);
		const skip = (page - 1) * limit;
		const filters = {};
		if (search) {
			filters.OR = [
				{ firstname: { contains: search, mode: 'insensitive' } },
				{ lastname: { contains: search, mode: 'insensitive' } },
				{ email: { contains: search, mode: 'insensitive' } },
			];
		}
		if (status) filters.isActive = status === 'active';
		const options = {
			limit,
			skip,
			orderBy: {
				[sortBy === 'created_at'
					? 'createdAt'
					: sortBy === 'updated_at'
					? 'updatedAt'
					: sortBy]: sortOrder,
			},
		};
		const users = await getMany(
			'user',
			filters,
			{
				   id: true,
				   email: true,
				   firstname: true,
				   lastname: true,
				   dateOfBirth: true,
				   gender: true,
				   district: true,
				   phoneNumber: true,
				   profilePictureUrl: true,
				   totalCaloriesDonated: true,
				   isActive: true,
				   createdAt: true,
				   updatedAt: true,
				   height: true,
				   weight: true,
			},
			options
		);

		const usersWithActivities = await Promise.all(
			(users || []).map(async (u) => {
				try {
					const joinedActivities = (await getUserJoinedActivitiesWithDetails(u.id)) || [];
					return {
						...u,
						joinDate: u.createdAt,
						lastActive: u.updatedAt,
						totalActivities: joinedActivities.length,
						joinedActivities,
					};
				} catch {
					return {
						...u,
						joinDate: u.createdAt,
						lastActive: u.updatedAt,
						totalActivities: 0,
						joinedActivities: [],
					};
				}
			})
		);

		const responseData = {
			users: usersWithActivities,
			pagination: {
				page,
				limit,
				total: usersWithActivities.length,
			},
		};
		return new NextResponse(JSON.stringify(responseData), {
			status: 200,
			headers: { 'Content-Type': 'application/json' },
		});
	} catch (error) {
		console.error('Error in GET /api/admin/users:', error);
		return new NextResponse(
			JSON.stringify({ error: 'Failed to fetch users. Please try again later.', message: error.message }),
			{
				status: 500,
				headers: { 'Content-Type': 'application/json' },
			}
		);
	}
}

export async function PATCH(req) {
	try {
		const supabase = await createServerClient();
		const { error } = await requireAdmin(supabase, NextResponse);
		if (error) return error;

		let body;
		try {
			body = await req.json();
		} catch {
			return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
		}

		const userId = body.userId;
		if (!userId) {
			return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
		}

		const existingUser = await getMany('user', { id: userId }, { id: true });
		if (!existingUser || existingUser.length === 0) {
			return NextResponse.json({ error: 'User not found' }, { status: 404 });
		}

		const allowedFields = ['isActive'];
		const updates = sanitizeData(body, allowedFields);
		if (Object.keys(updates).length === 0) {
			return NextResponse.json(
				{ error: 'No valid fields to update' },
				{ status: 400 }
			);
		}

		const updatedUser = await updateById('user', userId, updates);
		if (updatedUser && updatedUser.error) {
			return NextResponse.json(
				{ error: updatedUser.error },
				{ status: 500 }
			);
		}

		return NextResponse.json(updatedUser, { status: 200 });
	} catch (error) {
		console.error('Error in PATCH /api/admin/users:', error);
		return new NextResponse(
			JSON.stringify({ error: 'Failed to update the user. Please try again later.', message: error.message }),
			{
				status: 500,
				headers: { 'Content-Type': 'application/json' },
			}
		);
	}
}
