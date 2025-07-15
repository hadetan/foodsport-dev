import { createClient } from '@supabase/supabase-js';

// Create Supabase client for client-side operations (components)
export const createSupabaseClient = () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Missing Supabase configuration for client');
    }

    return createClient(supabaseUrl, supabaseAnonKey);
};

// Client for browser usage
export const supabaseClient = createSupabaseClient(); 