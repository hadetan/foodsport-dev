import { createClient } from '@supabase/supabase-js';

// Create Supabase client for server-side operations (API routes)
export const createSupabaseClient = () => {
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
};

// Create Supabase client for client-side operations (components)
export const createClientClient = () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Missing Supabase configuration for client');
    }

    return createClient(supabaseUrl, supabaseAnonKey);
};

// Default client for API routes (server-side)
export const supabase = createSupabaseClient();

// Client for browser usage
export const supabaseClient = createClientClient(); 