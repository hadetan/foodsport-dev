export function isWithinSeasonWindow(badge, referenceDate = new Date()) {
    if (!badge.isSeasonal) {
        return true;
    }
    if (!badge.seasonalStartDate || !badge.seasonalEndDate) {
        return false;
    }
    const start = new Date(badge.seasonalStartDate);
    const end = new Date(badge.seasonalEndDate);
    return start <= referenceDate && referenceDate <= end;
}

export function sortBadgesByPriority(badges) {
    return [...badges].sort((a, b) => {
        const placeA = a.place ?? Number.MAX_SAFE_INTEGER;
        const placeB = b.place ?? Number.MAX_SAFE_INTEGER;
        if (placeA !== placeB) {
            return placeA - placeB;
        }
        const createdA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const createdB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return createdA - createdB;
    });
}

export function prioritizeBadges(badges, referenceDate = new Date()) {
    const eligible = badges.filter((badge) => isWithinSeasonWindow(badge, referenceDate));
    if (!eligible.length) {
        return [];
    }
    const seasonal = eligible.filter((badge) => badge.isSeasonal);
    const pool = seasonal.length ? seasonal : eligible;
    return sortBadgesByPriority(pool);
}

export function buildRuleKey(badge) {
    const ruleType = badge?.badgeRule?.ruleType ?? 'unknown';
    const targetValue = badge?.badgeRule?.targetValue ?? 'any';
    const activityKey = badge?.activityId ?? 'any';
    return `${ruleType}:${activityKey}:${targetValue}`;
}

export function groupBadgesByRuleKey(badges) {
    return badges.reduce((map, badge) => {
        const key = buildRuleKey(badge);
        if (!map.has(key)) {
            map.set(key, []);
        }
        map.get(key).push(badge);
        return map;
    }, new Map());
}
