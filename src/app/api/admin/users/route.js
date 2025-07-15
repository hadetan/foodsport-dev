import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/prisma/require-admin';
import { getMany, updateById } from '@/lib/prisma/db-utils';
import { sanitizeData } from '@/utils/sanitize';
import { formatDbError } from '@/utils/formatDbError';
import { supabase } from '@/lib/supabase/server';

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
  const { error } = await requireAdmin(supabase, NextResponse);
  if (error) return error;
  const url = new URL(req.url);
  const { searchParams } = url;
  const { search, status, page, limit, sortBy, sortOrder } = parseQueryParams(searchParams);
  const skip = (page - 1) * limit;
  const filters = {};
  if (search) {
    filters.OR = [
      { firstname: { contains: search, mode: 'insensitive' } },
      { lastname: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ];
  }
  if (status) filters.isActive = status === 'active';
  const options = {
    limit,
    skip,
    orderBy: { [sortBy === 'created_at' ? 'createdAt' : sortBy === 'updated_at' ? 'updatedAt' : sortBy]: sortOrder },
  };
  const users = await getMany(
    'user',
    filters,
    {
      id: true,
      firstname: true,
      lastname: true,
      email: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      totalActivities: true,
      totalCaloriesDonated: true,
      badgeCount: true,
    },
    options
  );
  const usersWithStats = (users || []).map((u) => ({
    id: u.id,
    firstname: u.firstname,
    lastname: u.lastname,
    email: u.email,
    isActive: u.isActive,
    joinDate: u.createdAt,
    lastActive: u.updatedAt,
    stats: {
      totalActivities: u.totalActivities,
      totalDonations: u.totalCaloriesDonated,
      badgeCount: u.badgeCount,
    },
  }));
  const responseData = {
    users: usersWithStats,
    pagination: {
      page,
      limit,
      total: usersWithStats.length,
    },
  };
  return new NextResponse(JSON.stringify(responseData), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function PATCH(req, { params }) {
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
  const allowedFields = ['isActive'];
  const updates = sanitizeData(body, allowedFields);
  if (Object.keys(updates).length === 0) {
    return NextResponse.json(
      { error: 'No valid fields to update' },
      { status: 400 }
    );
  }
  const updatedUser = await updateById('user', params.userId, updates);
  if (updatedUser && updatedUser.error) {
    return NextResponse.json(
      { error: formatDbError(updatedUser.error) },
      { status: 500 }
    );
  }
  return NextResponse.json(updatedUser, { status: 200 });
}