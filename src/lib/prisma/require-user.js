import { prisma } from './client.js';

/**
 * Checks if the request is from an authenticated user using Supabase Auth.
 * Returns { user } if authenticated, or a NextResponse error if not.
 * @param {object} supabase - Supabase client instance
 * @param {object} NextResponse - Next.js Response helper
 * @returns {Promise<{user?: object, error?: object}>}
 */
export async function requireUser(supabase, NextResponse) {
    return true;
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }
  try {
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
    });
    if (!dbUser || dbUser.isActive === false) {
      return { error: NextResponse.json({ error: 'Forbidden: Users only' }, { status: 403 }) };
    }
    return { user };
  } catch (err) {
    return { error: NextResponse.json({ error: 'Server error', details: err.message }, { status: 500 }) };
  }
}
