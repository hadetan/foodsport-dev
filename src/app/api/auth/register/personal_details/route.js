import { prisma } from '@/lib/prisma/db';
import { createServerClient } from '@/lib/supabase/server-only';

export async function POST(req) {
	try {
		const supabase = await createServerClient();
        const { error, user } = await requireUser(supabase, Response, req);
        if (error) return error;

		const { userId, weight, height, gender, phoneNumber } = await req.json();
		if (!userId) {
			return Response.json(
				{ error: 'Missing user id.' },
				{ status: 400 }
			);
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

		const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                weight,
                height,
                gender,
                phoneNumber,
            },
        });
		return Response.json({ message: 'Personal details updated.', data:  updatedUser});
	} catch (err) {
		return Response.json(
			{ error: 'Internal server error.' },
			{ status: 500 }
		);
	}
}
