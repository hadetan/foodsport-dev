import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server-only';
import { requireAdmin } from '@/lib/prisma/require-admin';
import { prisma } from '@/lib/prisma/db';
import { validateRequiredFields } from '@/utils/validation';
import { coerceRulesPayload, validateAndNormalizeBadgeRules, INVALID_RULES_PAYLOAD_ERROR } from '@/lib/badges/ruleValidation';
import { MAX_IMAGE_SIZE_MB } from '@/app/constants/constants';
import { parseDate, parseBooleanInput, parseIntegerInput, normalizeNullableString } from '@/utils/input-parsing';

export async function POST(request) {
    const supabase = await createServerClient();
    const { error } = await requireAdmin(supabase, NextResponse);
    if (error) return error;

    let payload = {};
    let formData = null;
    const contentType = request.headers.get('content-type') || '';
    try {
        if (contentType.includes('multipart/form-data')) {
            formData = await request.formData();
            payload = Object.fromEntries(
                Array.from(formData.entries()).filter(([key, value]) => typeof value === 'string')
            );
        } else {
            payload = await request.json();
        }
    } catch (err) {
        return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const requireImage = !(formData && formData.get('image') && typeof formData.get('image') !== 'string');
    const validationFields = ['name'];
    if (requireImage) validationFields.push('imageUrl');
    const validation = validateRequiredFields(payload, validationFields);
    if (!validation.isValid) {
        return NextResponse.json({ error: validation.error || 'Missing required fields' }, { status: 400 });
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

    const normalizedRulesResult = validateAndNormalizeBadgeRules(rulesPayload);
    if (!normalizedRulesResult.isValid) {
        return NextResponse.json({ error: normalizedRulesResult.error }, { status: 400 });
    }
    const normalizedRules = normalizedRulesResult.rules;

    const isSeasonalFlag = parseBooleanInput(isSeasonal) ?? false;
    const isLimitedEditionFlag = parseBooleanInput(isLimitedEdition) ?? false;
    const normalizedActivityId = normalizeNullableString(activityId);
    const normalizedFsPointsCost = parseIntegerInput(fsPointsCost);
    const limitedCost = typeof normalizedFsPointsCost === 'number' ? normalizedFsPointsCost : null;
    const normalizedPlaceInput = parseIntegerInput(place);
    const requestedPlace = typeof normalizedPlaceInput === 'number' ? normalizedPlaceInput : null;

    const seasonalStart = parseDate(seasonalStartDate);
    const seasonalEnd = parseDate(seasonalEndDate);
    if (isSeasonalFlag) {
        if (!seasonalStart || !seasonalEnd || seasonalStart >= seasonalEnd) {
            return NextResponse.json({ error: 'Seasonal badges require valid start and end dates' }, { status: 400 });
        }
    }

    if (normalizedActivityId) {
        const activityExists = await prisma.activity.findUnique({ where: { id: normalizedActivityId, status: { not: 'cancelled' } }, select: { id: true } });
        if (!activityExists) {
            return NextResponse.json({ error: 'Referenced activity not found or may be cancelled' }, { status: 404 });
        }
    }

    if (isLimitedEditionFlag) {
        if (limitedCost === null || limitedCost <= 0) {
            return NextResponse.json({ error: 'Limited-edition badges require a positive fsPointsCost' }, { status: 400 });
        }
    }

    const lastHighestPlace = await prisma.badge.findFirst({
        orderBy: { place: 'desc' },
        select: { place: true },
    });

    const normalizedPlace = requestedPlace ?? ((lastHighestPlace?.place ?? 0) + 1);

    const badgeData = {
        name: typeof name === 'string' ? name.trim() : name,
        nameZh: typeof nameZh === 'string' ? nameZh.trim() : nameZh,
        description: typeof description === 'string' ? description.trim() : description,
        descriptionZh: typeof descriptionZh === 'string' ? descriptionZh.trim() : descriptionZh,
        imageUrl,
        isSeasonal: isSeasonalFlag,
        seasonalStartDate: seasonalStart,
        seasonalEndDate: seasonalEnd,
        activityId: normalizedActivityId,
        isLimitedEdition: isLimitedEditionFlag,
        fsPointsCost: isLimitedEditionFlag ? limitedCost : null,
        place: normalizedPlace,
        quantity: parseIntegerInput(payload.quantity) ?? null,
    };

    if (formData && formData.get('image') && typeof formData.get('image') !== 'string') {
        try {
            const file = formData.get('image');
            const allowedTypes = ['image/png'];
            const maxSize = MAX_IMAGE_SIZE_MB * 1024 * 1024;
            if (!allowedTypes.includes(file.type)) {
                return NextResponse.json({ error: 'Invalid image type. Only JPEG and PNG are allowed.' }, { status: 400 });
            }
            if (file.size > maxSize) {
                return NextResponse.json({ error: `Image size exceeds the maximum limit of ${MAX_IMAGE_SIZE_MB}MB.` }, { status: 400 });
            }

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
            badgeData.imageUrl = urlObj.pathname;
        } catch (err) {
            console.error('Badge image upload failed', err);
            return NextResponse.json({ error: 'Failed to process image upload' }, { status: 500 });
        }
    }

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
