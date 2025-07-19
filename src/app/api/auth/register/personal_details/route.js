import { prisma } from '@/lib/prisma/client';

export async function POST(req) {
	try {
		const { userId, weight, height, gender, phoneNumber } =
			await req.json();
		if (!userId) {
			return Response.json(
				{ error: 'Missing user id.' },
				{ status: 400 }
			);
		}
		const user = await prisma.user.findUnique({ where: { id: userId } });
		if (!user) {
			return Response.json({ error: 'Invalid userId.' }, { status: 404 });
		}
		await prisma.user.update({
			where: { id: userId },
			data: {
				weight,
				height,
				gender,
				phoneNumber,
			},
		});
		return Response.json({ message: 'Personal details updated.' });
	} catch (err) {
		return Response.json(
			{ error: 'Internal server error.' },
			{ status: 500 }
		);
	}
}
