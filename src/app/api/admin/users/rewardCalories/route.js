import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/db';
import { createServerClient } from '@/lib/supabase/server-only';
import { requireAdmin } from '@/lib/prisma/require-admin';
import serverApi from '@/utils/axios/serverApi';
import { awardBadgesForActivityProgress, awardPointsBadges } from '@/lib/badges/ruleEvaluator';
import { CALORIES_PER_POINT } from '@/app/constants/constants';


async function sendInvitationEmailsToTempUsers(tempUserEmailsWithNames) {
	if (!tempUserEmailsWithNames || tempUserEmailsWithNames.length === 0) {
		return;
	}

	const templateId = process.env.INVITE_INVITED_USER_TEMPLATE_ID;
	if (!templateId) {
		console.error('INVITE_INVITED_USER_TEMPLATE_ID environment variable not configured');
		return;
	}

	for (const { email, name } of tempUserEmailsWithNames) {
		setImmediate(async () => {
			try {
				const params = {
					name: name || email
				};

				await serverApi.post(
					'/admin/email/template_email',
					{
						to: email,
						templateId,
						params,
					},
					{
						headers: {
							'x-internal-api': process.env.INTERNAL_API_SECRET,
						},
					}
				);

				console.log(`Successfully sent invitation email to temp user: ${email}`);
			} catch (error) {
				console.error(`Failed to send invitation email to temp user ${email}:`, error.message);
			}
		});
	}
}

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
	const successfulTempUsersWithNames = [];

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

		let validDuration = undefined;
		if (typeof duration === 'number') {
			if (Number.isFinite(duration) && duration <= 1440) {
				validDuration = Math.round(duration);
			} else {
				results.push({
					email,
					success: false,
					error: 'Invalid duration: must be a positive integer between 1 and 1440',
				});
				continue;
			}
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

		let pointsEarnedThisImport = 0;
		let awardedBadges = [];
		const postTransactionJobs = [];
		try {
			await prisma.$transaction(async (tx) => {
				if (user) {
					const updatedUser = await tx.user.update({
						where: { id: user.id },
						data: {
							totalCaloriesBurned: { increment: calories },
							pendingCaloriesForFsPoints: { increment: calories },
						},
						select: { pendingCaloriesForFsPoints: true, totalCaloriesBurned: true, totalPoints: true },
					});

					pointsEarnedThisImport = Math.floor(updatedUser.pendingCaloriesForFsPoints / CALORIES_PER_POINT);
					let latestTotalPoints = updatedUser.totalPoints;
					if (pointsEarnedThisImport > 0) {
						const updatedPointRecord = await tx.user.update({
							where: { id: user.id },
							data: {
								totalPoints: { increment: pointsEarnedThisImport },
								pendingCaloriesForFsPoints: {
									decrement: pointsEarnedThisImport * CALORIES_PER_POINT,
								},
							},
							select: { totalPoints: true },
						});
						latestTotalPoints = updatedPointRecord.totalPoints;
					}

					await tx.userActivity.updateMany({
						where: { userId: user.id, activityId },
						data: { wasPresent: true, totalDuration: validDuration },
					});

					await tx.calorieSubmission.create({
						data: {
							userId: user.id,
							activityId,
							submittedCalories: calories,
						},
					});

						postTransactionJobs.push({
							type: 'activity_badges',
							userId: user.id,
							activityId,
							calories,
							wasPresent: true,
							totalCaloriesBurned: updatedUser.totalCaloriesBurned,
							pointsEarnedThisImport,
							latestTotalPoints,
							source: `activity_import:${activityId}`,
						});
				} else if (tempUser) {
					await tx.tempUser.update({
						where: { id: tempUser.id },
						data: {
							totalCaloriesBurned: { increment: calories },
							pendingCaloriesForFsPoints: { increment: calories },
						},
					});
					await tx.userActivity.updateMany({
						where: { tempUserId: tempUser.id, activityId },
						data: { wasPresent: true, totalDuration: validDuration },
					});
				}

				await tx.activity.updateMany({
					where: { id: activityId },
					data: { totalCaloriesBurnt: { increment: calories } },
				});
			});
			if (userType === 'tempUser' && tempUser) {
				const userName = tempUser.firstname && tempUser.lastname
					? `${tempUser.firstname} ${tempUser.lastname}`
					: tempUser.firstname || tempUser.lastname || email;
				successfulTempUsersWithNames.push({ email, name: userName });
			}
		} catch (err) {
			results.push({ email, success: false, error: err.message });
		}

		if (postTransactionJobs.length > 0) {
			for (const job of postTransactionJobs) {
				if (job.type === 'activity_badges') {
					try {
						awardedBadges = await awardBadgesForActivityProgress(prisma, {
							userId: job.userId,
							activityId: job.activityId,
							caloriesDelta: job.calories,
							totalCaloriesBurned: job.totalCaloriesBurned,
							wasPresent: job.wasPresent,
							source: job.source,
						});
						if (job.pointsEarnedThisImport > 0) {
							await awardPointsBadges(prisma, {
								userId: job.userId,
								totalPoints: job.latestTotalPoints,
								source: `points:${job.activityId}`,
							});
						}
					} catch (err) {
						console.error('Error awarding badges after transaction:', err?.message || err);
					}
				}
			}
		}

		results.push({
			email,
			success: true,
			userType,
			calories,
			duration,
			pointsEarned: user ? pointsEarnedThisImport : 0,
			awardedBadges: awardedBadges.map((entry) => entry.badgeId),
		});
	}

	if (successfulTempUsersWithNames.length > 0) {
		setImmediate(() => {
			sendInvitationEmailsToTempUsers(successfulTempUsersWithNames);
		});
	}

	return NextResponse.json({ results });
}
