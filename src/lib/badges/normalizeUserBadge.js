const LOCKED_STATUS = 'locked';
const UNLOCKED_STATUSES = new Set(['earned', 'redeemed']);

export function normalizeUserBadge(badge, userBadge) {
    if (!badge) {
        return null;
    }

    const status = userBadge?.status ?? null;
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
        quantity: badge.quantity ?? null,
            remainingQuantity: (function() {
                if (badge.quantity == null) return null;
                const awardedCount = typeof badge._count?.userBadges === 'number' ? badge._count.userBadges : 0;
                return Math.max(0, badge.quantity - awardedCount);
            })(),
        isUnlocked,
        status: isUnlocked ? status : LOCKED_STATUS,
        unlockedAt: isUnlocked ? userBadge?.earnedAt : null,
        earnedValue: isUnlocked ? userBadge?.earnedValue ?? null : null,
        pointsSpent: isUnlocked ? userBadge?.pointsSpent ?? null : null,
        source: isUnlocked ? userBadge?.source ?? null : null,
    };
}

export { LOCKED_STATUS, UNLOCKED_STATUSES };
