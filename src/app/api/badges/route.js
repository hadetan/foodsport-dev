import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/db';
import { sortBadgesByPriority } from '@/lib/badges/utils';

export async function GET() {
  try {
    const badges = await prisma.badge.findMany({
      where: { isActive: true },
      include: {
        badgeRules: {
          where: { isActive: true },
          select: {
            id: true,
            ruleType: true,
            targetValue: true,
            params: true,
          },
        },
        activity: {
          select: {
            id: true,
            title: true,
            titleZh: true,
            summary: true,
            summaryZh: true,
            location: true,
            startDate: true,
            endDate: true,
            activityType: true,
            imageUrl: true,
            bannerImageUrl: true,
          },
        },
        userBadges: {
          select: { earnedAt: true },
          orderBy: { earnedAt: 'desc' },
          take: 1,
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

    const ordered = sortBadgesByPriority(badges);
    const normalized = ordered.map((badge) => ({
      id: badge.id,
      title: badge.name,
      titleZh: badge.nameZh,
      description: badge.description,
      descriptionZh: badge.descriptionZh,
      imageUrl: badge.imageUrl,
      place: badge.place,
      isSeasonal: badge.isSeasonal,
      seasonalStartDate: badge.seasonalStartDate,
      seasonalEndDate: badge.seasonalEndDate,
      isLimitedEdition: badge.isLimitedEdition,
      fsPointsCost: badge.fsPointsCost,
      activity: badge.activity
        ? {
            id: badge.activity.id,
            title: badge.activity.title,
            titleZh: badge.activity.titleZh,
            summary: badge.activity.summary,
            summaryZh: badge.activity.summaryZh,
            location: badge.activity.location,
            startDate: badge.activity.startDate,
            endDate: badge.activity.endDate,
            activityType: badge.activity.activityType,
            imageUrl: badge.activity.imageUrl,
            bannerImageUrl: badge.activity.bannerImageUrl,
          }
        : null,
      badgeRules: (badge.badgeRules ?? []).map((rule) => ({
        id: rule.id,
        type: rule.ruleType,
        targetValue: rule.targetValue,
        params: rule.params,
      })),
      stats: {
        unlockedCount: badge._count?.userBadges ?? 0,
        redeemedCount: badge._count?.redemptions ?? 0,
        lastUnlockedAt: badge.userBadges?.[0]?.earnedAt ?? null,
      },
      createdAt: badge.createdAt,
    }));

    return NextResponse.json({ badges: normalized });
  } catch (error) {
    console.error('Failed to load badges catalog', error);
    return NextResponse.json({ error: 'Failed to load badges.' }, { status: 500 });
  }
}
