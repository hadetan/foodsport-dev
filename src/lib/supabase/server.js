import { createClient } from '@supabase/supabase-js';

// Create Supabase client for server-side operations (API routes)
export const createSupabaseServer = () => {
    if (typeof window !== 'undefined') {
        throw new Error('supabase (service key) should only be used in API/server code, not in client/browser code');
    }
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !supabaseServiceKey) {
        throw new Error('Missing Supabase configuration for server client');
    }
    return createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    });
}

// Default client for API routes (server-side)
export const supabase = createSupabaseServer();
