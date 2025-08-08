import { prisma } from '@/lib/prisma/db';
import { createServerClient } from '@/lib/supabase/server-only';
import { requireUser } from '@/lib/prisma/require-user';

export async function POST(req) {
	try {
		const supabase = await createServerClient();
		const { error, user } = await requireUser(supabase, Response, req);
		if (error) return error;

		const formData = await req.formData();
		const userId = formData.get('userId');
		const file = formData.get('profilePicture');
		const title = formData.get('title');
		const bio = formData.get('bio');

		if (!userId) {
			return Response.json({ error: 'Missing userId.' }, { status: 400 });
		}

		if (user.id !== userId) {
			return Response.json(
				{ error: 'Forbidden: You can only update your own details.' },
				{ status: 403 }
			);
		}

		const dbUser = await prisma.user.findUnique({ where: { id: userId } });
		if (!dbUser) {
			return Response.json({ error: 'Invalid userId.' }, { status: 404 });
		}

		let profilePictureUrl = dbUser.profilePictureUrl;
		if (file && file.name) {
			const arrayBuffer = await file.arrayBuffer();
			const buffer = Buffer.from(arrayBuffer);
			const bucket = 'profile-pictures';
			const cleanName = file.name.replace(/\s+/g, '-');
			const fileName = `${userId}-${Date.now()}-${cleanName}`;
			const { error: uploadError } = await supabase.storage
				.from(bucket)
				.upload(fileName, buffer, {
					upsert: true,
					contentType: file.type,
				});
			if (uploadError) {
				return Response.json(
					{
						error: 'Profile picture upload failed',
						details: uploadError.message,
					},
					{ status: 500 }
				);
			}
			profilePictureUrl = `/storage/v1/object/public/${bucket}/${fileName}`;
		}

		await prisma.user.update({
			where: { id: userId },
			data: {
				profilePictureUrl,
				title,
				bio,
			},
		});
		return Response.json({
			message: 'Additional details updated.',
			profilePictureUrl,
		});
	} catch (err) {
		return Response.json(
			{ error: 'Internal server error.' },
			{ status: 500 }
		);
	}
}
