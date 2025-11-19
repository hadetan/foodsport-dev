import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server-only';
import { requireUser } from '@/lib/prisma/require-user';
import { prisma } from '@/lib/prisma/db';
import { UserBadgeStatus } from '@prisma/client';

const REDEEM_SOURCE = 'redeem';

class RedemptionError extends Error {
    constructor(status, message) {
        super(message);
        this.status = status;
    }
}

export async function POST(request, { params }) {
    const supabase = await createServerClient();
    const { error, user } = await requireUser(supabase, NextResponse, request);
    if (error) {
        return error;
    }

    const badgeId = params?.badgeId;
    if (!badgeId) {
        return NextResponse.json({ error: 'Badge id is required' }, { status: 400 });
    }

    try {
        const redemptionResult = await prisma.$transaction(async (tx) => {
            const badge = await tx.badge.findUnique({
                where: { id: badgeId },
                select: {
                    id: true,
                    isActive: true,
                    isLimitedEdition: true,
                    fsPointsCost: true,
                },
            });

            if (!badge || !badge.isActive) {
                throw new RedemptionError(404, 'Badge not found');
            }
            if (!badge.isLimitedEdition) {
                throw new RedemptionError(400, 'Badge is not redeemable');
            }
            const cost = badge.fsPointsCost ?? 0;
            if (cost <= 0) {
                throw new RedemptionError(400, 'Badge does not have a valid FS points cost');
            }

            const dbUser = await tx.user.findUnique({
                where: { id: user.id },
                select: { totalPoints: true },
            });
            if (!dbUser) {
                throw new RedemptionError(403, 'User account is not available');
            }

            if (dbUser.totalPoints < cost) {
                throw new RedemptionError(400, 'Not enough FS points to redeem this badge');
            }

            const alreadyOwned = await tx.userBadge.findUnique({
                where: {
                    userId_badgeId: {
                        userId: user.id,
                        badgeId: badge.id,
                    },
                },
            });
            if (alreadyOwned) {
                throw new RedemptionError(409, 'Badge already owned');
            }

            const updatedUser = await tx.user.update({
                where: { id: user.id },
                data: {
                    totalPoints: { decrement: cost },
                },
                select: { totalPoints: true },
            });

            const redemptionRecord = await tx.badgeRedemption.create({
                data: {
                    userId: user.id,
                    badgeId: badge.id,
                    pointsPaid: cost,
                },
            });

            const userBadge = await tx.userBadge.create({
                data: {
                    userId: user.id,
                    badgeId: badge.id,
                    status: UserBadgeStatus.redeemed,
                    pointsSpent: cost,
                    source: REDEEM_SOURCE,
                },
            });

            return {
                redemptionId: redemptionRecord.id,
                badgeId: userBadge.badgeId,
                pointsSpent: cost,
                remainingPoints: updatedUser.totalPoints,
            };
        });

        return NextResponse.json({ success: true, ...redemptionResult }, { status: 200 });
    } catch (err) {
        if (err instanceof RedemptionError) {
            return NextResponse.json({ error: err.message }, { status: err.status });
        }
        console.error('Failed to redeem badge', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
