import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server-only';
import { requireUser } from '@/lib/prisma/require-user';
import { prisma } from '@/lib/prisma/db';
import { sortBadgesByPriority } from '@/lib/badges/utils';

const LOCKED_STATUS = 'locked';
const UNLOCKED_STATUSES = new Set(['earned', 'redeemed']);

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
  return ordered.map((badge) => {
    const owned = badge.userBadges?.[0] ?? null;
    const status = owned?.status ?? null;
    const isUnlocked = status ? UNLOCKED_STATUSES.has(status) : false;

    return {
      id: badge.id,
      title: badge.name,
      titleZh: badge.nameZh,
      description: badge.description,
      descriptionZh: badge.descriptionZh,
      imageUrl: badge.imageUrl,
      place: badge.place,
      activityId: badge.activityId,
      isSeasonal: badge.isSeasonal,
      seasonalStartDate: badge.seasonalStartDate,
      seasonalEndDate: badge.seasonalEndDate,
      isLimitedEdition: badge.isLimitedEdition,
      fsPointsCost: badge.fsPointsCost,
      isUnlocked,
      status: isUnlocked ? status : LOCKED_STATUS,
      unlockedAt: isUnlocked ? owned?.earnedAt : null,
      earnedValue: isUnlocked ? owned?.earnedValue ?? null : null,
      pointsSpent: isUnlocked ? owned?.pointsSpent ?? null : null,
      source: isUnlocked ? owned?.source ?? null : null,
    };
  });
}
