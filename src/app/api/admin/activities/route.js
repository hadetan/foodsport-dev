import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/prisma/require-admin';
import { getMany, insert, updateById } from '@/lib/prisma/db-utils';
import { validateRequiredFields } from '@/utils/validation';
import { sanitizeData } from '@/utils/sanitize';
import { formatDbError } from '@/utils/formatDbError';
import { supabase } from '@/lib/supabase/server';

function parseQueryParams(searchParams) {
  return {
    status: searchParams.get('status') || '',
    page: parseInt(searchParams.get('page') || '1', 10),
    limit: parseInt(searchParams.get('limit') || '20', 10),
    type: searchParams.get('type') || '',
  };
}

export async function GET(req) {
  const { error } = await requireAdmin(supabase, NextResponse);
  if (error) return error;

  const url = new URL(req.url);
  const { searchParams } = url;
  const { status, page, limit, type } = parseQueryParams(searchParams);
  const skip = (page - 1) * limit;
  const filters = {};
  if (status) filters.status = status;
  if (type) filters.type = type;
  const options = {
    limit,
    skip,
    orderBy: { startDate: 'desc' }
  };

  const activities = await getMany('activity', filters, {
    id: true,
    title: true,
    status: true,
    currentParticipants: true,
    participantLimit: true,
    startDate: true,
    endDate: true,
    location: true
  }, options);

  const activitiesList = (activities || []).map(a => ({
    id: a.id,
    title: a.title,
    status: a.status,
    type: a.type,
    participantLimit: a.participantLimit,
    participantCount: a.currentParticipants,
    startDate: a.startDate,
    endDate: a.endDate,
    location: a.location
  }));

  const responseData = {
    activities: activitiesList,
    pagination: {
      page,
      limit,
      total: activitiesList.length
    }
  };

  return new NextResponse(JSON.stringify(responseData), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}

export async function POST(req) {
  const { error } = await requireAdmin(supabase, NextResponse);
  if (error) return error;

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
  const requiredFields = ['title', 'activityType', 'location', 'startDate', 'endDate', 'startTime', 'endTime'];
  const validation = validateRequiredFields(body, requiredFields);
  if (!validation.isValid) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }
  const allowedFields = [
    'title', 'description', 'activityType', 'location', 'startDate', 'endDate', 'startTime', 'endTime', 'status', 'imageUrl', 'participantLimit'
  ];
  const activityData = sanitizeData(body, allowedFields);
  const activity = await insert('activity', activityData);

  if (activity && activity.error) {
    return NextResponse.json({ error: formatDbError(activity.error) }, { status: 500 });
  }
  return NextResponse.json(activity, { status: 201 });
}

export async function PATCH(req) {
  const { error } = await requireAdmin(supabase, NextResponse);
  if (error) return error;

  const url = new URL(req.url);
  const activityId = url.searchParams.get('activityId');
  if (!activityId) {
    return NextResponse.json({ error: 'Missing activityId' }, { status: 400 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const allowedFields = [
    'title', 'description', 'activityType', 'location', 'startDate', 'endDate', 'startTime', 'endTime', 'status', 'imageUrl', 'participantLimit'
  ];
  const updates = sanitizeData(body, allowedFields);

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
  }

  const updatedActivity = await updateById('activity', activityId, updates);
  if (updatedActivity && updatedActivity.error) {
    return NextResponse.json({ error: formatDbError(updatedActivity.error) }, { status: 500 });
  }
  return NextResponse.json(updatedActivity, { status: 200 });
}
