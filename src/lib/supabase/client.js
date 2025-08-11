import { createBrowserClient } from '@supabase/ssr';

function createClient() {
	const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
	const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
	if (!url || !key) {
		throw new Error('Missing Supabase configuration for client');
	}
	return createBrowserClient(url, key);
}

// Singleton instance for client-side
let supabaseClient = null;

export function getSupabaseClient() {
	if (!supabaseClient) {
		supabaseClient = createClient();
	}
	return supabaseClient;
}
