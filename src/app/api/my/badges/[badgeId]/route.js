import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server-only';
import { requireUser } from '@/lib/prisma/require-user';
import { prisma } from '@/lib/prisma/db';
import { normalizeUserBadge } from '@/lib/badges/normalizeUserBadge';

export async function GET(request, { params }) {
  const supabase = await createServerClient();
  const { error, user } = await requireUser(supabase, NextResponse, request);
  if (error) {
    return error;
  }

  const badgeIdParam = await params;
  const badgeId = badgeIdParam?.badgeId;
  if (!badgeId) {
    return NextResponse.json({ error: 'Badge id is required' }, { status: 400 });
  }

    try {
    const badge = await prisma.badge.findFirst({
      where: { id: badgeId, isActive: true },
      include: {
        userBadges: {
          where: { userId: user.id },
          select: {
            id: true,
            status: true,
            earnedAt: true,
            earnedValue: true,
            pointsSpent: true,
            source: true,
          },
          take: 1,
          orderBy: { earnedAt: 'desc' },
        },
        redemptions: {
          where: { status: 'completed' },
          select: { id: true },
        },
      },
    });

    if (!badge) {
      return NextResponse.json({ error: 'Badge not found' }, { status: 404 });
    }

    const normalized = normalizeUserBadge(badge, badge.userBadges?.[0] ?? null);
    return NextResponse.json({ badge: normalized });
  } catch (err) {
    console.error('Failed to fetch badge for user', err);
    return NextResponse.json({ error: 'Failed to fetch badge' }, { status: 500 });
  }
}
