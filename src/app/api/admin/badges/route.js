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
