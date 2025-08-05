import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
	const cookieStore = await cookies();

	return createServerClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL,
		process.env.SUPABASE_SERVICE_ROLE_KEY,
		{
			cookies: {
				getAll() {
					return cookieStore.getAll();
				},
				setAll(cookiesToSet) {
					try {
						cookiesToSet.forEach(({ name, value, options }) =>
							cookieStore.set(name, value, options)
						);
					} catch(e) {
                        console.error(
                            `Error from the server supabase.
                            The error is ${e}`);
                        throw e;
					}
				},
			},
		}
	);
}

// Helper function to get authenticated user on server side
export async function getAuthenticatedUser() {
	const supabase = await createClient();
	const {
		data: { user },
		error,
	} = await supabase.auth.getUser();

	if (error) {
		console.error('Error getting authenticated user:', error);
		return null;
	}

	return user;
}

// Helper function to get session on server side
export async function getSession() {
	const supabase = await createClient();
	const {
		data: { session },
		error,
	} = await supabase.auth.getSession();

	if (error) {
		console.error('Error getting session:', error);
		return null;
	}

	return session;
}
