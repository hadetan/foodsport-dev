import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/client';
import { requireAdmin } from '@/lib/supabase/require-admin';

const cache = new Map();
const CACHE_TTL = 60 * 1000;

function parseQueryParams(searchParams) {
  return {
    status: searchParams.get('status') || '',
    page: parseInt(searchParams.get('page') || '1', 10),
    limit: parseInt(searchParams.get('limit') || '20', 10),
    type: searchParams.get('type') || '',
  };
}

export async function GET(req) {
  const supabase = createServerClient();
  const { error } = await requireAdmin(supabase, NextResponse);
  if (error) return error;

  const url = new URL(req.url);
  const { searchParams } = url;
  const { status, page, limit, type } = parseQueryParams(searchParams);
  const offset = (page - 1) * limit;
  const cacheKey = `activity-list:${status}:${type}:${page}:${limit}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return new NextResponse(JSON.stringify(cached.data), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=60' }
    });
  }
  let query = supabase.from('activities').select('id, title, status, activity_type, current_participants, start_date, end_date, location');
  if (status) {
    query = query.eq('status', status);
  }
  if (type) {
    query = query.eq('activity_type', type);
  }
  query = query.order('start_date', { ascending: false });
  query = query.range(offset, offset + limit - 1);
  const { data: activities, error: activitiesError, count: total } = await query;
  if (activitiesError) {
    return NextResponse.json({ error: activitiesError.message }, { status: 500 });
  }
  const activitiesList = (activities || []).map(a => ({
    id: a.id,
    title: a.title,
    status: a.status,
    type: a.activity_type,
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
      total: total || activitiesList.length
    }
  };
  cache.set(cacheKey, { data: responseData, timestamp: Date.now() });
  return new NextResponse(JSON.stringify(responseData), {
    status: 200,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=60' }
  });
}

export async function POST(req) {
  const supabase = createServerClient();
  const { error } = await requireAdmin(supabase, NextResponse);
  if (error) return error;

  if (!req.headers.get('content-type')?.includes('multipart/form-data')) {
    return NextResponse.json({ error: 'Content-Type must be multipart/form-data' }, { status: 400 });
  }

  const formData = await req.formData();
  const title = formData.get('title');
  const description = formData.get('description') || '';
  const activity_type = formData.get('type');
  const location = formData.get('location');
  const start_date = formData.get('startDate');
  const end_date = formData.get('endDate');
  const start_time = formData.get('startTime');
  const end_time = formData.get('endTime');
  const status = formData.get('status') || 'draft';
  const image = formData.get('image') || null;
  const participant_limit = formData.get('participantLimit') ? parseInt(formData.get('participantLimit'), 10) : null;

  if (!title || !activity_type || !location || !start_date || !end_date || !start_time || !end_time) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }
  if (participant_limit !== null && (isNaN(participant_limit) || participant_limit < 1)) {
    return NextResponse.json({ error: 'Invalid participantLimit' }, { status: 400 });
  }

  let image_url = null;
  if (image && image.name) {
    const fileExt = image.name.split('.').pop();
    const filePath = `activities/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const { data: uploadData, error: uploadError } = await supabase.storage.from('activity-images').upload(filePath, image, { contentType: image.type });
    if (uploadError) {
      return NextResponse.json({ error: 'Image upload failed' }, { status: 500 });
    }
    image_url = supabase.storage.from('activity-images').getPublicUrl(uploadData.path).data.publicUrl;
  }

  const insertObj = {
    title,
    description,
    activity_type,
    location,
    start_date,
    end_date,
    start_time,
    end_time
  };
  if (status) insertObj.status = status;
  if (image_url) insertObj.image_url = image_url;
  if (participant_limit !== null) insertObj.participant_limit = participant_limit;

  const { data: activity, error: createError } = await supabase
    .from('activities')
    .insert(insertObj)
    .select()
    .single();
  if (createError) {
    return NextResponse.json({ error: createError.message }, { status: 500 });
  }

  await supabase.from('audit_logs').insert({
    type: 'activity',
    action: 'create',
    table_name: 'activities',
    record_id: activity.id,
    details: activity,
    timestamp: new Date().toISOString()
  });

  return NextResponse.json(activity, { status: 201 });
}

export async function PATCH(req, { params }) {
  const supabase = createServerClient();
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

  const allowedStatus = ['draft', 'active', 'closed', 'upcoming', 'completed', 'cancelled', 'open'];
  const updates = {};
  if (body.status) {
    if (!allowedStatus.includes(body.status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }
    updates.status = body.status;
  }
  if (body.title) updates.title = body.title;
  if (body.description) updates.description = body.description;
  if (body.type) updates.activity_type = body.type;
  if (body.location) updates.location = body.location;
  if (body.startDate) updates.start_date = body.startDate;
  if (body.endDate) updates.end_date = body.endDate;
  if (body.participantLimit !== undefined) {
    const participant_limit = parseInt(body.participantLimit, 10);
    if (isNaN(participant_limit) || participant_limit < 1) {
      return NextResponse.json({ error: 'Invalid participantLimit' }, { status: 400 });
    }
    updates.participant_limit = participant_limit;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
  }

  const { data: updatedActivity, error: updateError } = await supabase
    .from('activities')
    .update(updates)
    .eq('id', params.activityId)
    .select()
    .single();
  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  await supabase.from('audit_logs').insert({
    type: 'activity',
    action: 'update',
    table_name: 'activities',
    record_id: params.activityId,
    details: updates,
    timestamp: new Date().toISOString()
  });

  cache.clear();

  return NextResponse.json(updatedActivity, { status: 200 });
}
