/**
 * Checks if the request is from an authenticated admin user.
 * Returns { user } if admin, or a NextResponse error if not.
 */
export async function requireAdmin(supabase, NextResponse) {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }
  const { data: adminUser, error: adminError } = await supabase
    .from('users')
    .select('id, is_admin')
    .eq('id', user.id)
    .single();
  if (adminError || !adminUser?.is_admin) {
    return { error: NextResponse.json({ error: 'Forbidden: Admins only' }, { status: 403 }) };
  }
  return { user };
}
