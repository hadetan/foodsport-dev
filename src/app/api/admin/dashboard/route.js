import { NextResponse } from 'next/server';
import { createSupabaseClient } from '@/lib/supabase/client';
import { requireAdmin } from '@/lib/prisma/require-admin';
import { getCount } from '@/lib/prisma/db-utils';
import { getCache, setCache, CACHE_TTL } from '@/utils/cache';

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
  const supabase = createSupabaseClient();
  const { searchParams } = new URL(req.url);
  const dateRange = searchParams.get('dateRange') || '7d';
  const fromDate = getDateRange(dateRange);

  const { error } = await requireAdmin(supabase, NextResponse);
  if (error) return error;

  const cacheKey = `dashboard`;
  const cached = getCache(cacheKey);
  if (cached) {
    return new NextResponse(JSON.stringify(cached), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': `public, max-age=${CACHE_TTL}` }
    });
  }

  // Prisma-based queries
  const totalUsers = await getCount('user');
  const activeActivities = await getCount('activity', { status: 'active' });
  const totalRewards = await getCount('user_badge');

  // Total donations (sum)
  const { prisma } = await import('@/lib/prisma/client');
  const donations = await prisma.calorieDonation.findMany({ select: { calories_donated: true } });
  const totalDonations = donations.reduce((sum, d) => sum + (d.calories_donated || 0), 0);

  // New users in range
  const newUsers = await getCount('user', { created_at: { gte: fromDate } });
  // Completed activities in range
  const completedActivities = await getCount('activity', { status: 'completed', updated_at: { gte: fromDate } });
  // Calories donated in range
  const donationsRange = await prisma.calorieDonation.findMany({ where: { created_at: { gte: fromDate } }, select: { calories_donated: true } });
  const caloriesDonated = donationsRange.reduce((sum, d) => sum + (d.calories_donated || 0), 0);

  // Recent signups
  const recentSignupsData = await prisma.user.findMany({
    orderBy: { created_at: 'desc' },
    take: 10,
    select: { id: true, name: true, email: true, created_at: true, is_active: true }
  });
  const recentSignups = (recentSignupsData || []).map(u => ({
    id: u.id,
    name: u.name,
    email: u.email,
    signupDate: u.created_at,
    status: u.is_active ? 'active' : 'inactive'
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
  };

  setCache(cacheKey, responseData, CACHE_TTL);

  return new NextResponse(JSON.stringify(responseData), {
    status: 200,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': `public, max-age=${CACHE_TTL}` }
  });
}
