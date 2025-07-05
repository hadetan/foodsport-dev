import { NextResponse } from 'next/server';
import { createSupabaseClient } from '@/lib/supabase/client';
import { requireAdmin } from '@/lib/supabase/require-admin';

function parseQueryParams(searchParams) {
  return {
    search: searchParams.get('search') || '',
    status: searchParams.get('status') || '',
    page: parseInt(searchParams.get('page') || '1', 10),
    limit: parseInt(searchParams.get('limit') || '20', 10),
    sortBy: searchParams.get('sortBy') || 'created_at',
    sortOrder: searchParams.get('sortOrder') === 'asc' ? 'asc' : 'desc',
  };
}

export async function GET(req) {
  const supabase = createSupabaseClient();
  const { error } = await requireAdmin(supabase, NextResponse);
  if (error) return error;

  const url = new URL(req.url);
  const { searchParams } = url;
  const { search, status, page, limit, sortBy, sortOrder } = parseQueryParams(searchParams);
  const offset = (page - 1) * limit;
  let query = supabase.from('users').select('id, name, email, status, created_at, updated_at, total_activities, total_calories_donated, badge_count');
  if (search) {
    query = query.ilike('name', `%${search}%`);
  }
  if (status) {
    query = query.eq('is_active', status === 'active');
  }
  query = query.order(sortBy, { ascending: sortOrder === 'asc' });
  query = query.range(offset, offset + limit - 1);
  const { data: users, error: usersError, count: total } = await query;
  if (usersError) {
    return NextResponse.json({ error: usersError.message }, { status: 500 });
  }
  const usersWithStats = users.map(u => ({
    id: u.id,
    name: u.name,
    email: u.email,
    status: u.status,
    joinDate: u.created_at,
    lastActive: u.updated_at,
    stats: {
      totalActivities: u.total_activities,
      totalDonations: u.total_calories_donated,
      badgeCount: u.badge_count
    }
  }));
  const responseData = {
    users: usersWithStats,
    pagination: {
      page,
      limit,
      total: total || usersWithStats.length
    }
  };
  return new NextResponse(JSON.stringify(responseData), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}

export async function PATCH(req, { params }) {
  const supabase = createSupabaseClient();
  const { error } = await requireAdmin(supabase, NextResponse);
  if (error) return error;

  if (!params || !params.userId) {
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const allowedStatus = ['active', 'banned', 'locked'];
  const allowedRoles = ['admin', 'user'];
  const updates = {};
  if (body.status) {
    if (!allowedStatus.includes(body.status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }
    updates.is_active = body.status === 'active';
    updates.status = body.status;
  }
  if (body.role) {
    if (!allowedRoles.includes(body.role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }
    updates.role = body.role;
    if (body.role === 'admin') updates.is_admin = true;
    if (body.role === 'user') updates.is_admin = false;
  }
  if (body.reason) {
    updates.reason = body.reason;
  }
  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
  }

  const { data: updatedUser, error: updateError } = await supabase
    .from('users')
    .update(updates)
    .eq('id', params.userId)
    .single();
  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json(updatedUser, { status: 200 });
}
