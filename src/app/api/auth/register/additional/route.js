import { prisma } from '@/lib/prisma/client';
import { supabase } from '@/lib/supabase/server';

export async function POST(req) {
	try {
		const formData = await req.formData();
		const userId = formData.get('userId');
		const file = formData.get('profilePicture');
		const title = formData.get('title');
		const bio = formData.get('bio');
		const dailyGoal = formData.get('dailyGoal')
			? Number(formData.get('dailyGoal'))
			: undefined;
		const calorieGoal = formData.get('calorieGoal')
			? Number(formData.get('calorieGoal'))
			: undefined;

		if (!userId) {
			return Response.json({ error: 'Missing userId.' }, { status: 400 });
		}
		const user = await prisma.user.findUnique({ where: { id: userId } });
		if (!user) {
			return Response.json({ error: 'Invalid userId.' }, { status: 404 });
		}

		let profilePictureUrl = user.profilePictureUrl;
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

		const data = {
			profilePictureUrl,
			title,
			bio,
			dailyGoal,
			calorieGoal,
		};
		await prisma.user.update({
			where: { id: userId },
			data: {
				profilePictureUrl,
				title,
				bio,
				dailyGoal,
				calorieGoal,
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
