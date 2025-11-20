import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server-only';
import { requireAdmin } from '@/lib/prisma/require-admin';
import { prisma } from '@/lib/prisma/db';
import { coerceRulesPayload, validateAndNormalizeBadgeRules } from '@/lib/badges/ruleValidation';

function parseDate(value) {
  if (value === undefined) {
    return undefined;
  }
  if (!value) {
    return null;
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export async function PUT(request, { params }) {
  const supabase = await createServerClient();
  const { error } = await requireAdmin(supabase, NextResponse);
  if (error) return error;

  const { badgeId } = params || {};
  if (!badgeId) {
    return NextResponse.json({ error: 'Badge ID is required.' }, { status: 400 });
  }

  let payload = {};
  try {
    payload = await request.json();
  } catch (err) {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const {
    name,
    nameZh,
    description,
    descriptionZh,
    imageUrl,
    isSeasonal,
    seasonalStartDate,
    seasonalEndDate,
    activityId,
    isLimitedEdition,
    fsPointsCost,
    place,
    isActive,
  } = payload;

  const rulesPayload = coerceRulesPayload(payload);
  const hasRuleUpdates = rulesPayload.length > 0;
  let normalizedRules = null;
  if (hasRuleUpdates) {
    const validation = validateAndNormalizeBadgeRules(rulesPayload);
    if (!validation.isValid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }
    normalizedRules = validation.rules;
  }

  if (activityId) {
    const activityExists = await prisma.activity.findUnique({
      where: { id: activityId, status: { not: 'cancelled' } },
      select: { id: true },
    });
    if (!activityExists) {
      return NextResponse.json({ error: 'Referenced activity not found or may be cancelled' }, { status: 404 });
    }
  }

  const parsedSeasonalStart = parseDate(seasonalStartDate);
  const parsedSeasonalEnd = parseDate(seasonalEndDate);

  try {
    const updated = await prisma.$transaction(async (tx) => {
      const existing = await tx.badge.findUnique({
        where: { id: badgeId },
        select: {
          id: true,
          isSeasonal: true,
          seasonalStartDate: true,
          seasonalEndDate: true,
          isLimitedEdition: true,
          fsPointsCost: true,
          isActive: true,
        },
      });

      if (!existing) {
        return null;
      }

      const data = {};

      if (name !== undefined) data.name = name;
      if (nameZh !== undefined) data.nameZh = nameZh;
      if (description !== undefined) data.description = description;
      if (descriptionZh !== undefined) data.descriptionZh = descriptionZh;
      if (imageUrl !== undefined) data.imageUrl = imageUrl;
      if (activityId !== undefined) data.activityId = activityId || null;
      if (place !== undefined && Number.isFinite(place)) {
        data.place = Math.trunc(place);
      }
      if (isActive !== undefined) {
        data.isActive = Boolean(isActive);
      }

      const nextIsSeasonal = typeof isSeasonal === 'boolean' ? isSeasonal : existing.isSeasonal;
      const nextSeasonalStart = parsedSeasonalStart !== undefined ? parsedSeasonalStart : existing.seasonalStartDate;
      const nextSeasonalEnd = parsedSeasonalEnd !== undefined ? parsedSeasonalEnd : existing.seasonalEndDate;
      if (typeof isSeasonal === 'boolean') {
        data.isSeasonal = isSeasonal;
        if (!isSeasonal) {
          data.seasonalStartDate = null;
          data.seasonalEndDate = null;
        }
      }
      if (nextIsSeasonal) {
        if (!nextSeasonalStart || !nextSeasonalEnd || nextSeasonalStart >= nextSeasonalEnd) {
          throw new Error('INVALID_SEASONAL_DATES');
        }
        data.seasonalStartDate = nextSeasonalStart;
        data.seasonalEndDate = nextSeasonalEnd;
      }

      const nextIsLimited = typeof isLimitedEdition === 'boolean' ? isLimitedEdition : existing.isLimitedEdition;
      const normalizedCost = fsPointsCost !== undefined && fsPointsCost !== null
        ? Math.trunc(fsPointsCost)
        : existing.fsPointsCost;
      if (typeof isLimitedEdition === 'boolean') {
        data.isLimitedEdition = isLimitedEdition;
      }
      if (nextIsLimited) {
        if (!Number.isFinite(normalizedCost) || normalizedCost <= 0) {
          throw new Error('INVALID_LIMITED_EDITION_COST');
        }
        data.fsPointsCost = normalizedCost;
      } else if (typeof isLimitedEdition === 'boolean' && !isLimitedEdition) {
        data.fsPointsCost = null;
      } else if (fsPointsCost !== undefined) {
        data.fsPointsCost = Number.isFinite(normalizedCost) && normalizedCost > 0 ? normalizedCost : null;
      }

      if (Object.keys(data).length) {
        await tx.badge.update({ where: { id: badgeId }, data });
      }

      if (hasRuleUpdates) {
        await tx.badgeRule.deleteMany({ where: { badgeId } });
        await tx.badgeRule.createMany({
          data: normalizedRules.map((rule) => ({
            badgeId,
            ruleType: rule.ruleType,
            targetValue: rule.targetValue,
            params: rule.params ?? null,
          })),
        });
      }

      return tx.badge.findUnique({
        where: { id: badgeId },
        include: {
          badgeRules: {
            orderBy: { createdAt: 'asc' },
          },
        },
      });
    });

    if (!updated) {
      return NextResponse.json({ error: 'Badge not found' }, { status: 404 });
    }

    return NextResponse.json({ badge: updated }, { status: 200 });
  } catch (err) {
    if (err instanceof Error && err.message === 'INVALID_SEASONAL_DATES') {
      return NextResponse.json({ error: 'Seasonal badges require valid start and end dates' }, { status: 400 });
    }
    if (err instanceof Error && err.message === 'INVALID_LIMITED_EDITION_COST') {
      return NextResponse.json({ error: 'Limited-edition badges require a positive fsPointsCost' }, { status: 400 });
    }
    console.error('Failed to update badge', err);
    return NextResponse.json({ error: 'Failed to update badge', details: err.message }, { status: 500 });
  }
}
