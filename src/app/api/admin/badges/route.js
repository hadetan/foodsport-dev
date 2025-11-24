import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server-only';
import { requireAdmin } from '@/lib/prisma/require-admin';
import { prisma } from '@/lib/prisma/db';
import { validateRequiredFields } from '@/utils/validation';
import { coerceRulesPayload, validateAndNormalizeBadgeRules } from '@/lib/badges/ruleValidation';

function parseDate(value) {
  if (!value) {
    return null;
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export async function POST(request) {
  // const supabase = await createServerClient();
  // const { error } = await requireAdmin(supabase, NextResponse);
  // if (error) return error;

  let payload = {};
  try {
    payload = await request.json();
  } catch (err) {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const validation = validateRequiredFields(payload, ['name', 'imageUrl']);
  if (!validation.isValid) {
    return NextResponse.json({ error: validation.error || 'Missing required fields' }, { status: 400 });
  }

  const {
    name,
    nameZh,
    description,
    descriptionZh,
    imageUrl,
    isSeasonal = false,
    seasonalStartDate,
    seasonalEndDate,
    activityId,
    isLimitedEdition = false,
    fsPointsCost,
    place,
  } = payload;

  const normalizedRulesResult = validateAndNormalizeBadgeRules(coerceRulesPayload(payload));
  if (!normalizedRulesResult.isValid) {
    return NextResponse.json({ error: normalizedRulesResult.error }, { status: 400 });
  }
  const normalizedRules = normalizedRulesResult.rules;

  const seasonalStart = parseDate(seasonalStartDate);
  const seasonalEnd = parseDate(seasonalEndDate);
  if (isSeasonal) {
    if (!seasonalStart || !seasonalEnd || seasonalStart >= seasonalEnd) {
      return NextResponse.json({ error: 'Seasonal badges require valid start and end dates' }, { status: 400 });
    }
  }

  if (activityId) {
    const activityExists = await prisma.activity.findUnique({ where: { id: activityId, status: { not: 'cancelled' } }, select: { id: true } });
    if (!activityExists) {
      return NextResponse.json({ error: 'Referenced activity not found or may be cancelled' }, { status: 404 });
    }
  }

  const limitedCost = Number.isFinite(fsPointsCost) ? Math.trunc(fsPointsCost) : null;
  if (isLimitedEdition && (!limitedCost || limitedCost <= 0)) {
    return NextResponse.json({ error: 'Limited-edition badges require a positive fsPointsCost' }, { status: 400 });
  }

  const lastHighestPlace = await prisma.badge.findFirst({
    orderBy: { place: 'desc' },
    select: { place: true },
  });

  const normalizedPlace = Number.isFinite(place)
    ? Math.trunc(place)
    : ((lastHighestPlace?.place ?? 0) + 1);

  const badgeData = {
    name,
    nameZh,
    description,
    descriptionZh,
    imageUrl,
    isSeasonal,
    seasonalStartDate: seasonalStart,
    seasonalEndDate: seasonalEnd,
    activityId: activityId ?? null,
    isLimitedEdition,
    fsPointsCost: isLimitedEdition ? limitedCost : null,
    place: normalizedPlace,
  };

  try {
    const created = await prisma.$transaction(async (tx) => {
      const badge = await tx.badge.create({
        data: badgeData,
      });

      await tx.badgeRule.createMany({
        data: normalizedRules.map((rulePayload) => ({
          badgeId: badge.id,
          ruleType: rulePayload.ruleType,
          targetValue: rulePayload.targetValue,
          params: rulePayload.params ?? null,
        })),
      });

      return tx.badge.findUnique({
        where: { id: badge.id },
        include: {
          badgeRules: {
            orderBy: { createdAt: 'asc' },
          },
        },
      });
    });

    return NextResponse.json({ badge: created }, { status: 201 });
  } catch (err) {
    console.error('Failed to create badge', err);
    return NextResponse.json({ error: 'Failed to create badge', details: err.message }, { status: 500 });
  }
}

// GET /api/admin/badges - Returns badges and related data for admin users
export async function GET(request) {
  try {
    const supabase = await createServerClient();
    const { error } = await requireAdmin(supabase, NextResponse, request);
    if (error) return error;

    const url = new URL(request.url);
    const searchParams = url.searchParams;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10000', 10);
    const skip = (page - 1) * limit;
    const status = searchParams.get('status') || '';
    const activityId = searchParams.get('activityId') || '';
    const isActiveFilter = status ? (status === 'active') : undefined;

    const where = {};
    if (typeof isActiveFilter === 'boolean') {
      where.isActive = isActiveFilter;
    }
    if (activityId) {
      where.activityId = activityId;
    }

    const badges = await prisma.badge.findMany({
      where,
      include: {
        badgeRules: {
          orderBy: { createdAt: 'asc' },
          select: {
            id: true,
            ruleType: true,
            targetValue: true,
            params: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
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
          select: {
            id: true,
            userId: true,
            earnedAt: true,
            status: true,
            earnedValue: true,
            pointsSpent: true,
            user: { select: { id: true, firstname: true, lastname: true, email: true } },
          },
        },
        redemptions: {
          select: {
            id: true,
            userId: true,
            pointsPaid: true,
            status: true,
            redeemedAt: true,
            user: { select: { id: true, firstname: true, lastname: true, email: true } },
          },
        },
        _count: {
          select: {
            userBadges: true,
            redemptions: true,
          },
        },
      },
      orderBy: { place: 'asc' },
      take: limit,
      skip,
    });

    const normalized = (badges || []).map((b) => ({
      id: b.id,
      name: b.name,
      nameZh: b.nameZh,
      description: b.description,
      descriptionZh: b.descriptionZh,
      imageUrl: b.imageUrl,
      place: b.place,
      isSeasonal: b.isSeasonal,
      seasonalStartDate: b.seasonalStartDate,
      seasonalEndDate: b.seasonalEndDate,
      activity: b.activity || null,
      isLimitedEdition: b.isLimitedEdition,
      fsPointsCost: b.fsPointsCost,
      isActive: b.isActive,
      badgeRules: (b.badgeRules || []).map((r) => ({
        id: r.id,
        type: r.ruleType,
        targetValue: r.targetValue,
        params: r.params,
        isActive: r.isActive,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
      })),
      userBadges: (b.userBadges || []).map((ub) => ({
        id: ub.id,
        userId: ub.userId,
        earnedAt: ub.earnedAt,
        status: ub.status,
        earnedValue: ub.earnedValue,
        pointsSpent: ub.pointsSpent,
        user: ub.user || null,
      })),
      redemptions: (b.redemptions || []).map((r) => ({
        id: r.id,
        userId: r.userId,
        pointsPaid: r.pointsPaid,
        status: r.status,
        redeemedAt: r.redeemedAt,
        user: r.user || null,
      })),
      stats: {
        unlockedCount: b._count?.userBadges ?? 0,
        redeemedCount: b._count?.redemptions ?? 0,
      },
      createdAt: b.createdAt,
    }));

    return NextResponse.json({ badges: normalized, pagination: { page, limit, total: normalized.length } }, { status: 200 });
  } catch (err) {
    console.error('Error in GET /api/admin/badges', err);
    return NextResponse.json({ error: 'Failed to load badges.' }, { status: 500 });
  }
}
