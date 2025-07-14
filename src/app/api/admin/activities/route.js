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
    orderBy: { start_date: 'desc' }
  };
  const activities = await getMany('activity', filters, {
    id: true, title: true, status: true, type: true, current_participants: true, start_date: true, end_date: true, location: true
  }, options);
  const activitiesList = (activities || []).map(a => ({
    id: a.id,
    title: a.title,
    status: a.status,
    type: a.type,
    participantCount: a.current_participants,
    startDate: a.start_date,
    endDate: a.end_date,
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
  const requiredFields = ['title', 'type', 'location', 'start_date', 'end_date', 'start_time', 'end_time'];
  const validation = validateRequiredFields(body, requiredFields);
  if (!validation.isValid) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }
  const allowedFields = [
    'title', 'description', 'type', 'location', 'start_date', 'end_date', 'start_time', 'end_time', 'status', 'image_url', 'participant_limit'
  ];
  const insertObj = sanitizeData(body, allowedFields);
  if (!insertObj.status) insertObj.status = 'draft';
  const activity = await insert('activity', insertObj);
  if (activity && activity.error) {
    return NextResponse.json({ error: formatDbError(activity.error) }, { status: 500 });
  }
  return NextResponse.json(activity, { status: 201 });
}

export async function PATCH(req, { params }) {
  const { error } = await requireAdmin(supabase, NextResponse);
  if (error) return error;
  if (!params || !params.activityId) {
    return NextResponse.json({ error: 'Missing activityId' }, { status: 400 });
  }
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
  const allowedFields = [
    'title', 'description', 'type', 'location', 'start_date', 'end_date', 'start_time', 'end_time', 'status', 'image_url', 'participant_limit'
  ];
  const updates = sanitizeData(body, allowedFields);
  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
  }
  const updatedActivity = await updateById('activity', params.activityId, updates);
  if (updatedActivity && updatedActivity.error) {
    return NextResponse.json({ error: formatDbError(updatedActivity.error) }, { status: 500 });
  }
  return NextResponse.json(updatedActivity, { status: 200 });
}
