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
  const supabase = await createServerClient();
  const { error } = await requireAdmin(supabase, NextResponse);
  if (error) return error;

  let formData;
  try {
    formData = await request.formData();
  } catch (err) {
    return NextResponse.json({ error: 'Invalid form data' }, { status: 400 });
  }

  const name = formData.get('name');
  const nameZh = formData.get('nameZh') || null;
  const description = formData.get('description');
  const descriptionZh = formData.get('descriptionZh') || null;
  const image = formData.get('image');
  const isSeasonal = formData.get('isSeasonal') === 'true';
  const seasonalStartDate = formData.get('seasonalStartDate') || null;
  const seasonalEndDate = formData.get('seasonalEndDate') || null;
  const activityId = formData.get('activityId') || null;
  const isLimitedEdition = formData.get('isLimitedEdition') === 'true';
  const fsPointsCost = formData.get('fsPointsCost') || null;
  const place = formData.get('place') || null;

  if (!name || !name.trim()) {
    return NextResponse.json({ error: 'Badge name is required' }, { status: 400 });
  }

  if (!image || typeof image === 'string') {
    return NextResponse.json({ error: 'Badge image is required' }, { status: 400 });
  }

  // Validate image type and size
  const allowedTypes = ['image/png'];
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (!allowedTypes.includes(image.type)) {
    return NextResponse.json({ error: 'Invalid image type. Only PNG is allowed.' }, { status: 400 });
  }
  if (image.size > maxSize) {
    return NextResponse.json({ error: 'Image size exceeds the maximum limit of 5MB.' }, { status: 400 });
  }

  // Upload image to Supabase storage
  const bucket = 'badges';
  const ext = image.name.split('.').pop();
  const fileName = `badge_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;

  const { error: uploadError } = await supabase.storage.from(bucket).upload(fileName, image, {
    cacheControl: '3600',
    upsert: false,
    contentType: image.type,
  });

  if (uploadError) {
    console.error('Upload error:', uploadError);
    return NextResponse.json({ error: 'Failed to upload image', details: uploadError.message }, { status: 500 });
  }

  const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(fileName);
  const imageUrl = publicUrlData?.publicUrl;

  if (!imageUrl) {
    return NextResponse.json({ error: 'Failed to get image URL' }, { status: 500 });
  }

  // Handle badge rules if provided (convert FormData to payload object for rules)
  const payload = {
    rules: formData.get('rules') ? JSON.parse(formData.get('rules')) : []
  };
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

  const limitedCost = fsPointsCost ? parseInt(fsPointsCost, 10) : null;
  if (isLimitedEdition && (!limitedCost || limitedCost <= 0)) {
    return NextResponse.json({ error: 'Limited-edition badges require a positive fsPointsCost' }, { status: 400 });
  }

  const lastHighestPlace = await prisma.badge.findFirst({
    orderBy: { place: 'desc' },
    select: { place: true },
  });

  const normalizedPlace = place ? parseInt(place, 10) : ((lastHighestPlace?.place ?? 0) + 1);

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
