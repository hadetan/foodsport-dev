import { createServerClient } from '@/lib/supabase/server-only';
import { prisma } from '@/lib/prisma/db';
import { cookies } from 'next/headers';

export async function POST(req) {
	try {
		const supabase = await createServerClient();

		let providerId = null;
		let provider = 'google';
		let email = null;
		let emailVerified = false;
		let firstname = null;
		let lastname = null;
		let pictureUrl = null;

		try {
			const cookieStore = await cookies();
			const access = cookieStore.get('auth_token')?.value;
			const {
				data: { user },
				error,
			} = await supabase.auth.getUser(access);
			if (user && !error) {
				providerId = user.id;
				email = user.email || null;
				emailVerified = !!user.email_verified || false;
				const metadata = user.user_metadata || {};
				const fullName =
					metadata.name ||
					metadata.full_name ||
					metadata.display_name ||
					user.user_metadata?.full_name;
				firstname =
					metadata.given_name ||
					(fullName ? fullName.split(' ')[0] : null);
				lastname =
					metadata.family_name ||
					(fullName ? fullName.split(' ').slice(1).join(' ') : null);
				pictureUrl =
					metadata.picture ||
					user.user_metadata?.avatar_url ||
					user.user_metadata?.picture ||
					null;
			}
		} catch (e) {}

		if (!providerId) {
			const body = await req.json().catch(() => null);
			if (!body || (!body.providerId && !body.email)) {
				// No auth info available
				return Response.json(
					{ error: 'Missing authentication information' },
					{ status: 400 }
				);
			}
			provider = body.provider || provider;
			providerId = body.providerId || null;
			email = body.email || email;
			emailVerified = true;
			firstname = body.firstname || firstname;
			lastname = body.lastname || lastname;
			pictureUrl = body.pictureUrl || body.picture || pictureUrl;
		}

		if (providerId) {
			const existingByGoogle = await prisma.user.findUnique({
				where: { googleId: providerId },
			});
			if (existingByGoogle) {
				return Response.json({
					existing: true,
					userExists: true,
					user: { id: existingByGoogle.id },
				});
			}
		}

		if (email) {
			const existingByEmail = await prisma.user.findUnique({
				where: { email },
			});
			if (existingByEmail) {
				return Response.json({
					existing: true,
					userExists: true,
					reason: 'email_exists',
					user: { id: existingByEmail.id },
				});
			}
		}

		if (email) {
			const tempUser = await prisma.tempUser.findUnique({
				where: { email },
			});
			if (tempUser && providerId) {
				const created = await prisma.user.create({
					data: {
						id: providerId,
						email,
						firstname: tempUser.firstname,
						lastname: tempUser.lastname,
						dateOfBirth: tempUser.dateOfBirth,
						weight: tempUser.weight,
						height: tempUser.height,
						totalCaloriesBurned: tempUser.totalCaloriesBurned,
						profilePictureUrl: pictureUrl || undefined,
						googleId: providerId,
						emailVerified: true,
					},
				});

				await prisma.userActivity.updateMany({
					where: { tempUserId: tempUser.id },
					data: { userId: created.id, tempUserId: null },
				});
				await prisma.ticket.updateMany({
					where: { tempUserId: tempUser.id },
					data: { userId: created.id, tempUserId: null },
				});

				await prisma.tempUser.delete({ where: { id: tempUser.id } });

				if (providerId) {
					await prisma.preProfile.deleteMany({
						where: { supabaseUserId: providerId },
					});
				}

				return Response.json({
					created: true,
					user: { id: created.id, email: created.email },
				});
			}
		}

		const upsert = await prisma.preProfile.upsert({
			where: { supabaseUserId: providerId },
			update: {
				email: email || undefined,
				emailVerified: !!emailVerified,
				firstname: firstname || undefined,
				lastname: lastname || undefined,
				pictureUrl: pictureUrl || undefined,
				rawMetadata: { providerId, provider, email },
			},
			create: {
				supabaseUserId: providerId,
				provider: provider,
				email: email,
				emailVerified: true,
				firstname: firstname,
				lastname: lastname,
				pictureUrl: pictureUrl || undefined,
				rawMetadata: { providerId, provider, email },
			},
		});

		return Response.json({ preProfile: upsert });
	} catch (err) {
		return Response.json(
			{ error: 'Internal server error', details: err.message },
			{ status: 500 }
		);
	}
}

export async function GET(req) {
	try {
		const supabase = await createServerClient();
		const {
			data: { user },
			error,
		} = await supabase.auth.getUser();
		if (error || !user) {
			return Response.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const pre = await prisma.preProfile.findUnique({
			where: { supabaseUserId: user.id },
		});
		if (!pre) {
			return Response.json(
				{ error: 'PreProfile not found' },
				{ status: 404 }
			);
		}
		return Response.json({ preProfile: pre });
	} catch (err) {
		return Response.json(
			{ error: 'Internal server error', details: err.message },
			{ status: 500 }
		);
	}
}
