import { UserBadgeStatus } from '@prisma/client';

const SOCIAL_SHARE_SOURCE = 'social_share';

function isWithinSeasonWindow(badge, now) {
  if (!badge.isSeasonal) {
    return true;
  }
  if (!badge.seasonalStartDate || !badge.seasonalEndDate) {
    return false;
  }
  return badge.seasonalStartDate <= now && now <= badge.seasonalEndDate;
}

function sortCandidates(candidates) {
  return candidates.sort((a, b) => {
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

export async function awardSocialShareBadge(tx, userId) {
  const now = new Date();
  const badges = await tx.badge.findMany({
    where: {
      isActive: true,
      badgeRule: {
        isActive: true,
        ruleType: 'social_share',
      },
    },
    include: {
      badgeRule: true,
    },
  });

  const seasonal = [];
  const evergreen = [];
  for (const badge of badges) {
    if (!isWithinSeasonWindow(badge, now)) {
      continue;
    }
    if (badge.isSeasonal) {
      seasonal.push(badge);
    } else {
      evergreen.push(badge);
    }
  }

  const prioritized = sortCandidates(seasonal);
  const fallback = sortCandidates(evergreen);
  const targetBadge = prioritized[0] ?? fallback[0];
  if (!targetBadge) {
    return { awarded: false };
  }

  const existing = await tx.userBadge.findUnique({
    where: {
      userId_badgeId: {
        userId,
        badgeId: targetBadge.id,
      },
    },
  });

  if (existing) {
    return { awarded: false };
  }

  await tx.userBadge.create({
    data: {
      userId,
      badgeId: targetBadge.id,
      status: UserBadgeStatus.earned,
      source: SOCIAL_SHARE_SOURCE,
    },
  });

  return { awarded: true, badgeId: targetBadge.id };
}

export { SOCIAL_SHARE_SOURCE };
