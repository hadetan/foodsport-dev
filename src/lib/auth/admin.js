import { NextResponse } from "next/server";

/**
 * Validates if the current user has admin permissions
 * @param {object} supabase - Supabase client
 * @param {object} NextResponse - Next.js Response object
 * @returns {object} - { error } object if unauthorized, or { user } if authorized
 */
export async function requireAdmin(supabase, NextResponse) {
  try {
    // Get the session from Supabase
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
    }
    
    // Get the user details to check admin status
    const { data: user, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
    }

    // Check if user has admin role
    // You may need to adjust this based on how admin roles are stored in your application
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.user.id)
      .single();
    
    if (profileError || !profile) {
      return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
    }

    if (profile.role !== 'admin') {
      return { error: NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 }) };
    }
    
    // If all checks pass, return the user object
    return { user: user.user };
  } catch (error) {
    console.error("Error in requireAdmin:", error);
    return { error: NextResponse.json({ error: "Server error" }, { status: 500 }) };
  }
}
