import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/db';
import { createServerClient } from '@/lib/supabase/server-only';
import { requireAdmin } from '@/lib/prisma/require-admin';

// POST: Reward calories to users and temp users from imported activity data
export async function POST(req) {
    const supabase = await createServerClient();
    const { error } = await requireAdmin(supabase, NextResponse);
    if (error) return error;

	let body;
	try {
		body = await req.json();
	} catch (err) {
		return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
	}

	const { activityId, users } = body;
	if (!activityId || !Array.isArray(users)) {
		return NextResponse.json(
			{ error: 'Missing activityId or users array' },
			{ status: 400 }
		);
	}

	const results = [];

	for (const userRow of users) {
		const { email, calories, duration } = userRow;
		if (!email || typeof calories !== 'number') {
			results.push({
				email,
				success: false,
				error: 'Missing email or calories',
			});
			continue;
		}

		let user = await prisma.user.findUnique({ where: { email } });
		let tempUser = null;
		let userType = 'user';
		if (!user) {
			tempUser = await prisma.tempUser.findUnique({ where: { email } });
			userType = tempUser ? 'tempUser' : null;
		}

		if (!user && !tempUser) {
			results.push({ email, success: false, error: 'User not found' });
			continue;
		}

		try {
			if (user) {
				await prisma.user.update({
					where: { email },
					data: { totalCaloriesBurned: { increment: calories } },
				});
				await prisma.userActivity.updateMany({
					where: { userId: user.id, activityId },
					data: { wasPresent: true, totalDuration: typeof duration === 'number' ? duration : undefined },
				});
			} else if (tempUser) {
				await prisma.tempUser.update({
					where: { email },
					data: { totalCaloriesBurned: { increment: calories } },
				});
				await prisma.userActivity.updateMany({
					where: { tempUserId: tempUser.id, activityId },
					data: { wasPresent: true, totalDuration: typeof duration === 'number' ? duration : undefined },
				});
			}
			results.push({ email, success: true, userType });
		} catch (err) {
			results.push({ email, success: false, error: err.message });
		}
	}

	return NextResponse.json({ results });
}
