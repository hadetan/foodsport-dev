import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/client';
import { requireAdmin } from '@/lib/supabase/require-admin';

const cache = new Map();
const CACHE_TTL = 60 * 1000;

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
  const supabase = createServerClient();
  const { error } = await requireAdmin(supabase, NextResponse);
  if (error) return error;

  const url = new URL(req.url);
  const { searchParams } = url;
  const { search, status, page, limit, sortBy, sortOrder } = parseQueryParams(searchParams);
  const offset = (page - 1) * limit;
  const cacheKey = `user-list:${search}:${status}:${page}:${limit}:${sortBy}:${sortOrder}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return new NextResponse(JSON.stringify(cached.data), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=60' }
    });
  }
  let query = supabase.from('users').select('id, name, email, is_active, created_at, updated_at');
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
    status: u.is_active ? 'active' : 'inactive',
    joinDate: u.created_at,
    lastActive: u.updated_at,
    stats: {
      totalActivities: u.total_activities ?? 0,
      totalDonations: u.total_calories_donated ?? 0,
      badgeCount: u.badge_count ?? 0
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
  cache.set(cacheKey, { data: responseData, timestamp: Date.now() });
  return new NextResponse(JSON.stringify(responseData), {
    status: 200,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=60' }
  });
}

export async function PATCH(req, { params }) {
  const supabase = createServerClient();
  const { user, error } = await requireAdmin(supabase, NextResponse);
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

  await supabase.from('audit_logs').insert({
    user_id: params.userId,
    admin_id: user.id,
    action: 'user_update',
    details: updates,
    timestamp: new Date().toISOString()
  });

  cache.delete(`user-detail:${params.userId}`);

  return NextResponse.json(updatedUser, { status: 200 });
}
