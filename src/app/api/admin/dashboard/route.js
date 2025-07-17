import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/server';
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

  const totalUsers = await getCount('user');
  const activeActivities = await getCount('activity', { status: 'active' });
  const totalRewards = await getCount('userBadge');

  const { prisma } = await import('@/lib/prisma/client');
  const donations = await prisma.calorieDonation.findMany({ select: { caloriesDonated: true } });
  const totalDonations = donations.reduce((sum, d) => sum + (d.caloriesDonated || 0), 0);

  const newUsers = await getCount('user', { createdAt: { gte: fromDate } });
  const completedActivities = await getCount('activity', { status: 'completed', updatedAt: { gte: fromDate } });
  const donationsRange = await prisma.calorieDonation.findMany({ where: { createdAt: { gte: fromDate } }, select: { caloriesDonated: true } });
  const caloriesDonated = donationsRange.reduce((sum, d) => sum + (d.caloriesDonated || 0), 0);

  const recentSignupsData = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10,
    select: {
      id: true,
      firstname: true,
      lastname: true,
      email: true,
      createdAt: true,
      isActive: true,
      profilePictureUrl: true,
      totalActivities: true,
      totalPoints: true,
      badgeCount: true
    }
  });
  const recentSignups = (recentSignupsData || []).map(u => ({
    id: u.id,
    firstname: u.firstname,
    lastname: u.lastname,
    email: u.email,
    signupDate: u.createdAt,
    status: u.isActive ? 'active' : 'inactive',
    profilePictureUrl: u.profilePictureUrl,
    totalActivities: u.totalActivities,
    totalPoints: u.totalPoints,
    badgeCount: u.badgeCount
  }));

  const responseData = {
    stats: {
      totalUsers: totalUsers,
      activeActivities: activeActivities,
      totalRewards: totalRewards,
      totalDonations: totalDonations,
      dailyStats: {
        newUsers: newUsers,
        completedActivities: completedActivities,
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
