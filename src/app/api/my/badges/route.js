import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server-only';
import { requireUser } from '@/lib/prisma/require-user';
import { prisma } from '@/lib/prisma/db';
import { sortBadgesByPriority } from '@/lib/badges/utils';
import { normalizeUserBadge } from '@/lib/badges/normalizeUserBadge';

export async function GET(request) {
  const supabase = await createServerClient();
  const { error, user } = await requireUser(supabase, NextResponse, request);
  if (error) {
    return error;
  }

  try {
    const badges = await prisma.badge.findMany({
      where: { isActive: true },
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
        },
        redemptions: {
          where: { status: 'completed' },
          select: { id: true },
        },
        _count: {
          select: {
            userBadges: true,
            redemptions: true,
          },
        },
      },
      orderBy: [
        { place: 'asc' },
        { createdAt: 'asc' },
      ],
    });

    const normalized = normalizeBadgesResponse(badges);
    const unlockedCount = normalized.filter((badge) => badge.isUnlocked).length;

    return NextResponse.json({
      badges: normalized,
      meta: {
        total: normalized.length,
        unlocked: unlockedCount,
        locked: normalized.length - unlockedCount,
      },
    });
  } catch (err) {
    console.error('Failed to fetch user badges', err);
    return NextResponse.json({ error: 'Failed to fetch badges' }, { status: 500 });
  }
}

function normalizeBadgesResponse(badges = []) {
  const ordered = sortBadgesByPriority(badges);
  return ordered.map((badge) => normalizeUserBadge(badge, badge.userBadges?.[0] ?? null));
}
