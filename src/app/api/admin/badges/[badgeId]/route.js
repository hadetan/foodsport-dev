import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server-only';
import { requireAdmin } from '@/lib/prisma/require-admin';
import { prisma } from '@/lib/prisma/db';
import { coerceRulesPayload, validateAndNormalizeBadgeRules, INVALID_RULES_PAYLOAD_ERROR } from '@/lib/badges/ruleValidation';
import { MAX_IMAGE_SIZE_MB } from '@/app/constants/constants';
import { parseDate, parseBooleanInput, parseIntegerInput, normalizeNullableString } from '@/utils/input-parsing';

export async function PUT(request, { params }) {
  const supabase = await createServerClient();
  const { error } = await requireAdmin(supabase, NextResponse);
  if (error) return error;

  const { badgeId } = params || {};
  if (!badgeId) {
    return NextResponse.json({ error: 'Badge ID is required.' }, { status: 400 });
  }

  let payload = {};
  let formData = null;
  const contentType = request.headers.get('content-type') || '';
  try {
    if (contentType.includes('multipart/form-data')) {
      formData = await request.formData();
      payload = Object.fromEntries(
        Array.from(formData.entries()).filter(([k, v]) => typeof v === 'string')
      );
    } else {
      payload = await request.json();
    }
  } catch (err) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
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

  let rulesPayload;
  try {
    rulesPayload = coerceRulesPayload(payload);
  } catch (err) {
    if (err instanceof Error && err.message === INVALID_RULES_PAYLOAD_ERROR) {
      return NextResponse.json({ error: 'Invalid rules payload. Please send a JSON array of rule objects.' }, { status: 400 });
    }
    throw err;
  }
  const hasRuleUpdates = rulesPayload.length > 0;
  let normalizedRules = null;
  if (hasRuleUpdates) {
    const validation = validateAndNormalizeBadgeRules(rulesPayload);
    if (!validation.isValid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }
    normalizedRules = validation.rules;
  }

  const parsedIsSeasonal = parseBooleanInput(isSeasonal);
  const parsedIsLimitedEdition = parseBooleanInput(isLimitedEdition);
  const parsedIsActive = parseBooleanInput(isActive);
  const parsedPlace = place !== undefined ? parseIntegerInput(place) : undefined;
  if (parsedPlace !== undefined && typeof parsedPlace !== 'number') {
    return NextResponse.json({ error: 'Place must be a valid integer' }, { status: 400 });
  }
  const parsedFsPointsCost = fsPointsCost !== undefined ? parseIntegerInput(fsPointsCost) : undefined;
  const hasActivityField = activityId !== undefined;
  const normalizedActivityId = hasActivityField ? normalizeNullableString(activityId) : undefined;

  if (normalizedActivityId) {
    const activityExists = await prisma.activity.findUnique({
      where: { id: normalizedActivityId, status: { not: 'cancelled' } },
      select: { id: true },
    });
    if (!activityExists) {
      return NextResponse.json({ error: 'Referenced activity not found or may be cancelled' }, { status: 404 });
    }
  }

  // Use preserveUndefined to distinguish between "field not provided" (keep existing)
  // and "field provided as empty" (clear value) in update operations
  const parsedSeasonalStart = parseDate(seasonalStartDate, { preserveUndefined: true });
  const parsedSeasonalEnd = parseDate(seasonalEndDate, { preserveUndefined: true });

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

      if (formData && formData.get('image') && typeof formData.get('image') !== 'string') {
        const file = formData.get('image');
        const allowedTypes = ['image/png'];
        const maxSize = MAX_IMAGE_SIZE_MB * 1024 * 1024;
        if (!allowedTypes.includes(file.type)) {
          return NextResponse.json({ error: 'Invalid image type. Only JPEG and PNG are allowed.' }, { status: 400 });
        }
        if (file.size > maxSize) {
          return NextResponse.json({ error: `Image size exceeds the maximum limit of ${MAX_IMAGE_SIZE_MB}MB.` }, { status: 400 });
        }

        const currentBadge = await tx.badge.findUnique({ where: { id: badgeId }, select: { imageUrl: true } });
        const oldImagePath = currentBadge?.imageUrl || null;

        const bucket = 'badges-images';
        const ext = file.name.split('.').pop();
        const fileName = `badge_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;
        const { error: uploadError } = await supabase.storage.from(bucket).upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type,
        });
        if (uploadError) {
          return NextResponse.json({ error: 'Failed to upload image', details: uploadError.message }, { status: 500 });
        }
        const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(fileName);
        const publicUrl = publicUrlData?.publicUrl;
        if (!publicUrl) {
          return NextResponse.json({ error: 'Failed to get image public URL' }, { status: 500 });
        }
        const urlObj = new URL(publicUrl);
        data.imageUrl = urlObj.pathname;

        if (oldImagePath) {
          let oldFileName = null;
          try {
            const maybeUrl = new URL(oldImagePath.startsWith('/') ? (process.env.NEXT_PUBLIC_SUPABASE_URL + oldImagePath) : oldImagePath);
            const pathParts = maybeUrl.pathname.split('/');
            const bucketIndex = pathParts.findIndex((p) => p === bucket);
            if (bucketIndex !== -1) {
              oldFileName = pathParts.slice(bucketIndex + 1).join('/');
            }
          } catch (_) {
            const pathParts = oldImagePath.split('/').filter(Boolean);
            const bucketIndex = pathParts.findIndex((p) => p === bucket);
            if (bucketIndex !== -1) {
              oldFileName = pathParts.slice(bucketIndex + 1).join('/');
            } else {
              oldFileName = pathParts[pathParts.length - 1];
            }
          }
          if (oldFileName) {
            const { error: removeError } = await supabase.storage.from(bucket).remove([oldFileName]);
            if (removeError) {
              console.error('Failed to remove old badge image', removeError.message);
            }
          }
        }
      }
      if (hasActivityField) data.activityId = normalizedActivityId ?? null;
      if (parsedPlace !== undefined) {
        data.place = parsedPlace;
      }
      if (parsedIsActive !== undefined) {
        data.isActive = parsedIsActive;
      }

      const nextIsSeasonal = parsedIsSeasonal ?? existing.isSeasonal;
      const nextSeasonalStart = parsedSeasonalStart !== undefined ? parsedSeasonalStart : existing.seasonalStartDate;
      const nextSeasonalEnd = parsedSeasonalEnd !== undefined ? parsedSeasonalEnd : existing.seasonalEndDate;
      if (parsedIsSeasonal !== undefined) {
        data.isSeasonal = parsedIsSeasonal;
        if (!parsedIsSeasonal) {
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

      const nextIsLimited = parsedIsLimitedEdition ?? existing.isLimitedEdition;
      const normalizedCost = parsedFsPointsCost !== undefined
        ? parsedFsPointsCost
        : existing.fsPointsCost;
      if (parsedIsLimitedEdition !== undefined) {
        data.isLimitedEdition = parsedIsLimitedEdition;
      }
      if (nextIsLimited) {
        if (typeof normalizedCost !== 'number' || normalizedCost <= 0) {
          throw new Error('INVALID_LIMITED_EDITION_COST');
        }
        data.fsPointsCost = normalizedCost;
      } else if (parsedIsLimitedEdition === false) {
        data.fsPointsCost = null;
      } else if (parsedFsPointsCost !== undefined) {
        if (typeof parsedFsPointsCost === 'number' && parsedFsPointsCost > 0) {
          data.fsPointsCost = parsedFsPointsCost;
        } else if (parsedFsPointsCost === null) {
          data.fsPointsCost = null;
        } else {
          throw new Error('INVALID_LIMITED_EDITION_COST');
        }
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
