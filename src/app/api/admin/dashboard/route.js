import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/client';
import { requireAdmin } from '@/lib/supabase/require-admin';

const cache = new Map();
const CACHE_TTL = 60 * 1000;

function getDateRange(dateRange) {
  const now = new Date();
  let from;
  switch (dateRange) {
    case '24h':
      from = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      break;
    case '30d':
      from = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case '7d':
    default:
      from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
  }
  return from.toISOString();
}

export async function GET(req) {
    const supabase = createServerClient();
    const { searchParams } = new URL(req.url);
    const dateRange = searchParams.get('dateRange') || '7d';
    const fromDate = getDateRange(dateRange);

    const { user, error } = await requireAdmin(supabase, NextResponse);
    if (error) return error;
    
  const cacheKey = `${user.id}:${dateRange}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return new NextResponse(JSON.stringify(cached.data), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=60' }
    });
  }

  const { count: totalUsers } = await supabase
    .from('users')
    .select('id', { count: 'exact', head: true });
  const { count: activeActivities } = await supabase
    .from('activities')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'active');
  const { count: totalRewards } = await supabase
    .from('user_badges')
    .select('id', { count: 'exact', head: true });
  const { data: donations, error: donationsError } = await supabase
    .from('calorie_donations')
    .select('calories_donated');
  const totalDonations = donationsError || !donations ? 0 : donations.reduce((sum, d) => sum + (d.calories_donated || 0), 0);
  const { count: newUsers } = await supabase
    .from('users')
    .select('id', { count: 'exact', head: true })
    .gte('created_at', fromDate);
  const { count: completedActivities } = await supabase
    .from('activities')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'completed')
    .gte('updated_at', fromDate);
  const { data: donationsRange, error: donationsRangeError } = await supabase
    .from('calorie_donations')
    .select('calories_donated')
    .gte('created_at', fromDate);
  const caloriesDonated = donationsRangeError || !donationsRange ? 0 : donationsRange.reduce((sum, d) => sum + (d.calories_donated || 0), 0);

  const { data: recentSignupsData } = await supabase
    .from('users')
    .select('id, name, email, created_at, is_active')
    .order('created_at', { ascending: false })
    .limit(10);
  const recentSignups = (recentSignupsData || []).map(u => ({
    id: u.id,
    name: u.name,
    email: u.email,
    signupDate: u.created_at,
    status: u.is_active ? 'active' : 'inactive'
  }));

  const { data: activityLogsData } = await supabase
    .from('audit_logs')
    .select('id, type, action, user_id, details, timestamp')
    .gte('timestamp', fromDate)
    .order('timestamp', { ascending: false })
    .limit(20);
  const activityLogs = (activityLogsData || []).map(log => ({
    id: log.id,
    type: log.type,
    action: log.action,
    userId: log.user_id,
    details: log.details,
    timestamp: log.timestamp
  }));

  const responseData = {
    stats: {
      totalUsers: totalUsers || 0,
      activeActivities: activeActivities || 0,
      totalRewards: totalRewards || 0,
      totalDonations: totalDonations,
      dailyStats: {
        newUsers: newUsers || 0,
        completedActivities: completedActivities || 0,
        caloriesDonated: caloriesDonated
      }
    },
    recentSignups,
    activityLogs
  };

  cache.set(cacheKey, { data: responseData, timestamp: Date.now() });

  return new NextResponse(JSON.stringify(responseData), {
    status: 200,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=60' }
  });
}
