import { supabaseClient } from '@/lib/supabase/client';
import { prisma } from '@/lib/prisma/client';

export async function POST(req) {
	try {
		const { email, password } = await req.json();
		if (!email || !password) {
			return Response.json(
				{ error: 'Missing email or password.' },
				{ status: 400 }
			);
		}
		const { data, error } = await supabaseClient.auth.signInWithPassword({
			email,
			password,
		});
		if (error) {
			return Response.json(
				{ error: 'Invalid credentials. ' + error },
				{ status: 401 }
			);
		}
		const user = await prisma.user.findUnique({ where: { email } });
		if (!user) {
			return Response.json({ error: 'User not found.' }, { status: 404 });
		}
		return Response.json({
			session: data.session,
			user: {
				id: user.id,
				firstname: user.firstname,
				lastname: user.lastname,
				email: user.email,
			},
		});
	} catch (err) {
		return Response.json(
			{ error: 'Internal server error.' },
			{ status: 500 }
		);
	}
}
