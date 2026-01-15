'use client';

import DOMPurify from 'dompurify';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import {
    Activity,
    ArrowLeft,
    Calendar,
    Flame,
    Gift,
    HandCoins,
    MapPin,
    Repeat,
    Share2,
    ShoppingBag,
    Sparkles,
    Trophy,
    UserPlus,
    Users,
} from 'lucide-react';
import api from '@/utils/axios/api';
import { buildImageUrl } from '@/utils/image';
import BadgeModal from '@/app/[locale]/my/components/BadgeModal';
import '@/app/[locale]/(landing)/Components/BadgeDetails.css';
import { BadgeDetailsSkeleton } from '@/app/shared/components/skeletons/BadgeDetailsSkeleton';
import { useUser } from '@/app/shared/contexts/userContext';
import { useMyBadges } from '@/app/shared/contexts/myBadgesContext';
import ShareDialog from '@/app/shared/components/ShareDialog';

const RULE_ICONS = {
    calorie_single_activity: Flame,
    calorie_cumulative: Flame,
    activity_participation_count: Users,
    activity_specific_participation: MapPin,
    invite_count: UserPlus,
    social_share: Share2,
    frequency_count: Repeat,
    points_cumulative: Trophy,
    redeem_first: Gift,
    redeem_points_cumulative: HandCoins,
    redeem_purchase: ShoppingBag,
};

const FALLBACK_RULE_ICON = Sparkles;

function normalizeViewerRecord(entry) {
    if (!entry || !entry.id) {
        return null;
    }
    const status = entry.status || (entry.isUnlocked ? 'unlocked' : 'locked');
    const unlockedStatuses = new Set(['earned', 'redeemed', 'unlocked']);
    return {
        id: entry.id,
        status,
        isUnlocked: Boolean(entry.isUnlocked || unlockedStatuses.has((status || '').toLowerCase())),
        unlockedAt: entry.unlockedAt || null,
        earnedValue: entry.earnedValue ?? null,
        pointsSpent: entry.pointsSpent ?? null,
        source: entry.source ?? null,
    };
}

function isZhLocale(locale) {
    return locale?.toLowerCase().startsWith('zh');
}

function pickLocalizedField(primary, secondary, locale) {
    if (isZhLocale(locale) && secondary) {
        return secondary;
    }
    return primary;
}

function formatDateLabel(value, locale) {
    if (!value) {
        return '—';
    }
    try {
        return new Intl.DateTimeFormat(locale || 'en', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        }).format(new Date(value));
    } catch (error) {
        return new Date(value).toLocaleDateString();
    }
}

function formatDateRange(start, end, locale) {
    if (!start && !end) {
        return '—';
    }
    if (start && !end) {
        return formatDateLabel(start, locale);
    }
    if (!start && end) {
        return formatDateLabel(end, locale);
    }
    return `${formatDateLabel(start, locale)} → ${formatDateLabel(end, locale)}`;
}

function extractFrequencyMeta(rule = {}) {
    const params = rule.params || {};
    const timeframe = params.timeframe === 'monthly' ? 'month' : 'week';
    const occurrences = timeframe === 'week'
        ? Number(params.timesPerWeek ?? params.timesPerWindow ?? params.times ?? 0)
        : Number(params.timesPerMonth ?? params.timesPerWindow ?? params.times ?? 0);
    const periods = timeframe === 'week'
        ? Number(params.weeks ?? params.windows ?? rule.targetValue ?? 0)
        : Number(params.months ?? params.windows ?? rule.targetValue ?? 0);
    const minCalories = Number(params.minCaloriesPerEvent ?? params.minDailyCalories ?? 0) || null;
    const eventType = params.eventType === 'calorie_donation'
        ? 'calorie_donation'
        : params.eventType === 'calorie_burn'
            ? 'calorie_burn'
            : 'presence';

    return {
        timeframe,
        occurrences: Math.max(occurrences || 0, 1),
        periods: Math.max(periods || 0, 1),
        minCalories,
        eventType,
    };
}

function describeRule(rule, badge, t, locale, formatNumber) {
    const target = Number(rule?.targetValue ?? 0) || 0;
    const params = rule?.params || {};
    switch (rule?.type) {
        case 'calorie_single_activity':
            return target
                ? t('rules.descriptions.calorie_single_activity.withTarget', { target: formatNumber(target) })
                : t('rules.descriptions.calorie_single_activity.default');
        case 'calorie_cumulative':
            return target
                ? t('rules.descriptions.calorie_cumulative.withTarget', { target: formatNumber(target) })
                : t('rules.descriptions.calorie_cumulative.default');
        case 'activity_participation_count':
            return t('rules.descriptions.activity_participation_count', { count: formatNumber(Math.max(target, 1)) });
        case 'activity_specific_participation': {
            const activityTitle = pickLocalizedField(badge?.activity?.title, badge?.activity?.titleZh, locale);
            return activityTitle
                ? t('rules.descriptions.activity_specific_participation.named', { activity: activityTitle })
                : t('rules.descriptions.activity_specific_participation.generic');
        }
        case 'invite_count': {
            const activityTitle = pickLocalizedField(badge?.activity?.title, badge?.activity?.titleZh, locale);
            if (activityTitle) {
                try {
                    return t('rules.descriptions.invite_count_activity_generic', { count: formatNumber(Math.max(target, 1)) });
                } catch (_) {
                    return t('rules.descriptions.invite_count', { count: formatNumber(Math.max(target, 1)) });
                }
            }
            return t('rules.descriptions.invite_count', { count: formatNumber(Math.max(target, 1)) });
        }
        case 'social_share':
            return t('rules.descriptions.social_share');
        case 'frequency_count': {
            const meta = extractFrequencyMeta(rule);
            const timeframeSingular = t(`rules.timeframes.${meta.timeframe}`);
            const timeframePlural = t(`rules.timeframes.${meta.timeframe}Plural`);
            const totalWindow = meta.periods > 1 ? timeframePlural : timeframeSingular;
            if (meta.eventType === 'presence') {
                return t('rules.descriptions.frequency_count.presence', {
                    occurrences: formatNumber(meta.occurrences),
                    window: timeframeSingular,
                    periods: formatNumber(meta.periods),
                    totalWindow,
                });
            }
            return t('rules.descriptions.frequency_count.calories', {
                occurrences: formatNumber(meta.occurrences),
                window: timeframeSingular,
                periods: formatNumber(meta.periods),
                calories: formatNumber(Math.max(meta.minCalories || 0, 1)),
                totalWindow,
            });
        }
        case 'points_cumulative':
            return t('rules.descriptions.points_cumulative', { points: formatNumber(Math.max(target, 1)) });
        case 'redeem_first':
            return target > 1
                ? t('rules.descriptions.redeem_first.multiple', { count: formatNumber(target) })
                : t('rules.descriptions.redeem_first.single');
        case 'redeem_points_cumulative':
            return t('rules.descriptions.redeem_points_cumulative', { points: formatNumber(Math.max(target, 1)) });
        case 'redeem_purchase':
            return t('rules.descriptions.redeem_purchase');
        default:
            return t('rules.descriptions.generic');
    }
}

function BadgeDetailsPage({ badgeId, viewerContext = null }) {
    const locale = useLocale();
    const t = useTranslations('BadgeDetails');
    const userContext = useUser();
    const myBadgesContext = useMyBadges();
    const userProfile = userContext?.user;
    const setUserProfile = userContext?.setUser;
    const userLoading = Boolean(userContext?.loading);
    const [badges, setBadges] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');
    const [shareFeedback, setShareFeedback] = useState('');
    const [shareDialogOpen, setShareDialogOpen] = useState(false);
    const [shareUrlState, setShareUrlState] = useState('');
    const initialViewer = viewerContext && viewerContext.id === badgeId ? viewerContext : null;
    const [viewerState, setViewerState] = useState(initialViewer);
    const [viewerFetchAttempted, setViewerFetchAttempted] = useState(Boolean(initialViewer));
    const [loggedIn, setLoggedIn] = useState(Boolean(initialViewer));
    const [isRedeeming, setIsRedeeming] = useState(false);

    useEffect(() => {
        let isMounted = true;
        async function fetchBadges() {
            setIsLoading(true);
            setErrorMessage('');
            try {
                const response = await api.get('/badges');
                if (!isMounted) return;
                const payload = Array.isArray(response?.data?.badges) ? response.data.badges : [];
                setBadges(payload);
            } catch (err) {
                if (!isMounted) return;
                const apiError = err?.response?.data?.error || err?.message || 'Error';
                setErrorMessage(typeof apiError === 'string' ? apiError : String(apiError));
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        }

        fetchBadges();
        return () => {
            isMounted = false;
        };
    }, [badgeId]);

    useEffect(() => {
        const contextForBadge = viewerContext && viewerContext.id === badgeId ? viewerContext : null;
        if (contextForBadge) {
            setViewerState(contextForBadge);
            setViewerFetchAttempted(true);
            return;
        }
        setViewerState(null);
        setViewerFetchAttempted(false);
    }, [badgeId, viewerContext]);

    useEffect(() => {
        if (!myBadgesContext?.badges || !badgeId) {
            return undefined;
        }
        const match = myBadgesContext.badges.find((entry) => entry.id === badgeId);
        if (!match) {
            return undefined;
        }
        const normalized = normalizeViewerRecord(match);
        if (normalized) {
            setViewerState((prev) => {
                if (prev && prev.id === badgeId) {
                    return { ...prev, ...normalized };
                }
                return normalized;
            });
            setViewerFetchAttempted(true);
        }
        return undefined;
    }, [myBadgesContext?.badges, badgeId]);

    useEffect(() => {
        if (userProfile?.id) {
            setLoggedIn(true);
            return undefined;
        }

        const hasViewer = Boolean(viewerContext);
        if (typeof window === 'undefined') {
            setLoggedIn(hasViewer);
            return undefined;
        }
        const token = window.localStorage?.getItem('auth_token');
        setLoggedIn(Boolean(token) || hasViewer);
        return undefined;
    }, [userProfile?.id, viewerContext]);

    useEffect(() => {
        if (!loggedIn || !badgeId) {
            return undefined;
        }
        if (viewerState && viewerState.id === badgeId) {
            return undefined;
        }
        if (viewerFetchAttempted) {
            return undefined;
        }
        if (myBadgesContext?.badges?.some((entry) => entry.id === badgeId)) {
            return undefined;
        }

        let isMounted = true;
        setViewerFetchAttempted(true);
        (async () => {
            try {
                const response = await api.get(`/my/badges/${badgeId}`);
                if (!isMounted) return;
                const candidate = response?.data?.badge || null;
                if (candidate) {
                    setViewerState(candidate);
                }
            } catch (viewerError) {
                console.error('Failed to fetch viewer badge context', viewerError);
            }
        })();

        return () => {
            isMounted = false;
        };
    }, [loggedIn, badgeId, viewerState, viewerFetchAttempted, myBadgesContext?.badges]);

    const tModal = useTranslations('AllBadges');
    const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
    const modalLabels = useMemo(() => ({
        share: tModal('modal.share'),
        close: tModal('modal.close'),
        viewDetails: tModal('modal.viewDetails'),
        shareSuccess: tModal('modal.shareSuccess'),
        shareError: tModal('modal.shareError'),
        buyCta: tModal('modal.buyCta'),
    }), [tModal]);
    const router = useRouter();

    useEffect(() => {
        if (!shareFeedback) return undefined;
        const timer = setTimeout(() => setShareFeedback(''), 2500);
        return () => clearTimeout(timer);
    }, [shareFeedback]);

    const numberFormatter = useMemo(() => new Intl.NumberFormat(locale || 'en'), [locale]);
    const formatNumber = (value) => numberFormatter.format(Number(value) || 0);

    const badge = useMemo(
        () => badges.find((entry) => entry.id === badgeId) || null,
        [badges, badgeId],
    );

    const localized = useMemo(() => {
        if (!badge) {
            return {
                title: '',
                description: '',
                activityTitle: '',
                activitySummary: '',
                activityLocation: '',
            };
        }
        return {
            title: pickLocalizedField(badge.title, badge.titleZh, locale),
            description: pickLocalizedField(badge.description, badge.descriptionZh, locale),
            activityTitle: pickLocalizedField(badge.activity?.title, badge.activity?.titleZh, locale),
            activitySummary: pickLocalizedField(badge.activity?.summary, badge.activity?.summaryZh, locale),
            activityLocation: badge.activity?.location || '',
        };
    }, [badge, locale]);

    const sanitizedActivitySummary = useMemo(() => {
        if (!localized.activitySummary) return '';
        const clean = DOMPurify.sanitize(localized.activitySummary, { USE_PROFILES: { html: true } });
        return clean.replace(/<p([^>]*)>(?:\s|&nbsp;|\u00A0)*<\/p>/gi, (match, attrs) => `<p${attrs || ''}>&nbsp;</p>`);
    }, [localized.activitySummary]);

    const otherBadges = useMemo(
        () => badges.filter((entry) => entry.id !== badgeId).slice(0, 4),
        [badges, badgeId],
    );

    const handleShare = async () => {
        if (!badge) return;
        // Build a locale-aware absolute URL for sharing and open the ShareDialog.
        const relativeUrl = `/${locale}/badges/${badge.id}`;
        const shareUrl = (typeof window !== 'undefined' && window.location?.origin)
            ? new URL(relativeUrl, window.location.origin).toString()
            : relativeUrl;
        setShareUrlState(shareUrl);
        setShareDialogOpen(true);
    };

    const isLimitedDerived = badge?.isLimitedEdition || (Array.isArray(badge?.badgeRules) && badge.badgeRules.some((r) => r.type === 'activity_specific_participation'));
    const heroSubtitle = localized.description || t('hero.defaultSubtitle');
    const viewerStatusKey = (viewerState?.status || (viewerState?.isUnlocked ? 'unlocked' : ''))?.toLowerCase();
    let viewerStatusLabel = null;
    if (viewerState && viewerStatusKey) {
        try {
            viewerStatusLabel = t(`viewer.statuses.${viewerStatusKey}`);
        } catch (translationError) {
            viewerStatusLabel = viewerStatusKey;
        }
    }
    const viewerUnlockedDate = viewerState?.unlockedAt ? formatDateLabel(viewerState.unlockedAt, locale) : null;
    const showViewerPanel = Boolean(viewerState && viewerState.status && viewerState.status !== 'locked');
    const viewerUnlocked = Boolean(viewerState?.isUnlocked);
    const viewerHasBadge = Boolean(viewerUnlocked || (viewerState?.status && viewerState.status !== 'locked'));
    const badgeCost = Number(badge?.fsPointsCost ?? 0) || 0;
    const profileReady = Boolean(userProfile?.id);
    const badgeRedeemable = Boolean(profileReady && badge?.isLimitedEdition && badgeCost > 0);
    const isOutOfStock = badge?.quantity && (badge.remainingQuantity !== undefined ? badge.remainingQuantity <= 0 : false);
    const canRedeemNow = Boolean(badgeRedeemable && !viewerHasBadge && !isOutOfStock);
    const showRedeemDisabled = Boolean(badgeRedeemable && (viewerHasBadge || isOutOfStock));
    const userPoints = Number(userProfile?.totalPoints ?? 0);
    const hasEnoughPoints = canRedeemNow ? userPoints >= badgeCost : false;
    const showGuestBuyCta = Boolean(!loggedIn && badgeCost > 0);

    const handleRedeem = useCallback(async () => {
        if (!canRedeemNow || !hasEnoughPoints || !badgeId) {
            return;
        }
        setIsRedeeming(true);
        try {
            const { data } = await api.post(`/my/badges/${badgeId}/redeem`);
            const remainingPoints = typeof data?.remainingPoints === 'number' ? data.remainingPoints : null;
            const unlockedAtResponse = data?.badge?.unlockedAt || new Date().toISOString();
            setViewerState((prev) => ({
                ...(prev && prev.id === badgeId ? prev : { id: badgeId }),
                status: 'redeemed',
                isUnlocked: true,
                unlockedAt: unlockedAtResponse,
                pointsSpent: badgeCost,
            }));
            if (typeof setUserProfile === 'function') {
                setUserProfile((prev) => {
                    if (!prev) {
                        return prev;
                    }
                    const nextPoints = typeof remainingPoints === 'number'
                        ? remainingPoints
                        : Math.max(0, (prev.totalPoints ?? 0) - badgeCost);
                    const nextBadgeCount = (prev.badgeCount ?? 0) + 1;
                    return { ...prev, totalPoints: nextPoints, badgeCount: nextBadgeCount };
                });
            }
            if (myBadgesContext?.refresh) {
                myBadgesContext.refresh();
            } else if (myBadgesContext?.updateBadge) {
                myBadgesContext.updateBadge({
                    id: badgeId,
                    status: 'redeemed',
                    isUnlocked: true,
                    unlockedAt: unlockedAtResponse,
                    pointsSpent: badgeCost,
                });
            }
        } catch (_) { } finally {
            setIsRedeeming(false);
        }
    }, [badgeCost, badgeId, canRedeemNow, hasEnoughPoints, myBadgesContext, setUserProfile, t, tModal]);

    if (isLoading || userLoading) {
        return (
            <section className="badge-details">
                <BadgeDetailsSkeleton message={t('loading')} />
            </section>
        );
    }

    if (errorMessage) {
        return (
            <section className="badge-details">
                <div className="badge-details__state" role="alert">
                    <h2>{t('error.title')}</h2>
                    <p>{t('error.message')}</p>
                    <small>{errorMessage}</small>
                    <button type="button" onClick={() => window.location.reload()}>{t('error.retry')}</button>
                </div>
            </section>
        );
    }

    if (!badge) {
        return (
            <section className="badge-details">
                <div className="badge-details__state" role="alert">
                    <h2>{t('notFound.title')}</h2>
                    <p>{t('notFound.message')}</p>
                    <Link href={`/${locale}/activities`} className="badge-details__link">{t('notFound.cta')}</Link>
                </div>
            </section>
        );
    }

    return (
        <section className="badge-details">
            <div className="badge-details__back">
                <ArrowLeft size={18} aria-hidden="true" />
                <Link href={`/${locale}/activities`}>{t('cta.back')}</Link>
            </div>

            <div className="badge-hero">
                <div className="badge-hero__media" aria-hidden="true">
                    {badge.imageUrl ? (
                        <img src={buildImageUrl(badge.imageUrl)} alt={localized.title} />
                    ) : (
                        <div className="badge-hero__placeholder">
                            <Sparkles size={40} />
                        </div>
                    )}
                    {isLimitedDerived && (
                        <span className="badge-hero__pill badge-hero__pill--accent">{t('hero.limited')}</span>
                    )}
                </div>
                <div className="badge-hero__content">
                    <p className="badge-hero__kicker">{t('hero.kicker')}</p>
                    <h1>{localized.title}</h1>
                    <p className="badge-hero__description">{heroSubtitle}</p>
                    <div className="badge-hero__tags">
                        {badge.activity && <span>{t('hero.activityTag')}</span>}
                        {isLimitedDerived && <span>{t('hero.limited')}</span>}
                    </div>
                    <div className="badge-hero__meta">
                        {badge.fsPointsCost ? (
                            <div>
                                <strong>{t('hero.costLabel')}</strong>
                                <p>{t('stats.fsCost', { cost: formatNumber(badge.fsPointsCost) })}</p>
                            </div>
                        ) : (
                            <div>
                                <strong>{t('metadata.placeLabel')}</strong>
                                <p>{t('stats.place', { place: formatNumber(badge.place || 1) })}</p>
                            </div>
                        )}
                        {badge.quantity && (
                            <div>
                                <strong>{t('metadata.quantityLabel')}</strong>
                                <p>{badge.remainingQuantity ?? badge.quantity} / {badge.quantity}</p>
                            </div>
                        )}
                    </div>
                    {showViewerPanel && (
                        <div className={`badge-hero__viewer ${viewerState.isUnlocked ? 'badge-hero__viewer--unlocked' : 'badge-hero__viewer--locked'}`}>
                            <div>
                                <p className="badge-hero__viewer-kicker">{t('viewer.title')}</p>
                                {viewerStatusLabel && <p className="badge-hero__viewer-status">{viewerStatusLabel}</p>}
                                {viewerUnlockedDate && (
                                    <p className="badge-hero__viewer-detail">{t('viewer.unlockedAt', { date: viewerUnlockedDate })}</p>
                                )}
                                {viewerState.pointsSpent !== null && viewerState.pointsSpent !== undefined && (
                                    <p className="badge-hero__viewer-detail">{t('viewer.pointsSpent', { points: formatNumber(viewerState.pointsSpent) })}</p>
                                )}
                            </div>
                            {viewerState.isUnlocked && (
                                <button
                                    type="button"
                                    className="badge-hero__btn badge-hero__btn--ghost badge-hero__btn--viewer"
                                    onClick={() => router.push(`/${locale}/my/profile?earnedBadges`)}
                                    aria-label={t('viewer.profileCta')}
                                >
                                    {t('viewer.profileCta')}
                                </button>
                            )}
                        </div>
                    )}
                    <div className="badge-hero__actions">
                        <button type="button" className="badge-hero__btn badge-hero__btn--share" onClick={handleShare} aria-label={t('share.cta')}>
                            <Share2 size={18} aria-hidden="true" />
                            {t('share.cta')}
                        </button>
                        {showGuestBuyCta && (
                            <Link href={`/${locale}/auth/login`} className="badge-hero__btn badge-hero__btn--buy" aria-label={tModal('modal.buyCta') || t('cta.join')}>
                                {tModal('modal.buyCta') || t('cta.join')}
                            </Link>
                        )}
                        {profileReady && badgeRedeemable && showRedeemDisabled && (
                            <button
                                type="button"
                                className="badge-hero__btn badge-hero__btn--disabled"
                                disabled
                                title={isOutOfStock ? tModal('modal.soldOut') : undefined}
                            >
                                {isOutOfStock ? tModal('modal.soldOut') : t('purchase.redeemed')}
                            </button>
                        )}
                        {profileReady && badgeRedeemable && canRedeemNow && (
                            <button
                                type="button"
                                className="badge-hero__btn badge-hero__btn--buy"
                                onClick={() => setIsBuyModalOpen(true)}
                                disabled={!hasEnoughPoints || isRedeeming}
                                aria-disabled={!hasEnoughPoints || isRedeeming}
                            >
                                {isRedeeming
                                    ? t('purchase.buying')
                                    : t('purchase.cta', { cost: formatNumber(badgeCost) })}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Buy modal (confirm before redeeming) */}
            {isBuyModalOpen && (
                <BadgeModal
                    badge={badge}
                    locale={locale}
                    labels={modalLabels}
                    initialScreen="redeem"
                    onClose={() => setIsBuyModalOpen(false)}
                    onRedeemed={() => {
                        // replicate success behavior: set viewer state and update context
                        const unlockedAtResponse = new Date().toISOString();
                        setViewerState((prev) => ({
                            ...(prev && prev.id === badgeId ? prev : { id: badgeId }),
                            status: 'redeemed',
                            isUnlocked: true,
                            unlockedAt: unlockedAtResponse,
                            pointsSpent: badgeCost,
                        }));
                        if (typeof setUserProfile === 'function') {
                            setUserProfile((prev) => {
                                if (!prev) return prev;
                                const nextPoints = Math.max(0, (prev.totalPoints ?? 0) - badgeCost);
                                const nextBadgeCount = (prev.badgeCount ?? 0) + 1;
                                return { ...prev, totalPoints: nextPoints, badgeCount: nextBadgeCount };
                            });
                        }
                        if (myBadgesContext?.refresh) {
                            myBadgesContext.refresh();
                        } else if (myBadgesContext?.updateBadge) {
                            myBadgesContext.updateBadge({
                                id: badgeId,
                                status: 'redeemed',
                                isUnlocked: true,
                                unlockedAt: unlockedAtResponse,
                                pointsSpent: badgeCost,
                            });
                        }
                        setIsBuyModalOpen(false);
                    }}
                />
            )}

            {shareDialogOpen && (
                <ShareDialog
                    url={shareUrlState}
                    onClose={() => setShareDialogOpen(false)}
                    label='Share this badge'
                />
            )}

            <div className="badge-panels-grid">
                <section className="badge-panel badge-panel--full">
                    <div className="badge-panel__header">
                        <div>
                            <p className="badge-panel__kicker">{t('rules.subtitle')}</p>
                            <h2>{t('rules.title')}</h2>
                        </div>
                    </div>
                    {badge.activity && badge.badgeRules?.some((r) => r.type === 'invite_count') && (
                        <div className="badge-panel__note">
                            <p>
                                {t('rules.hints.invite_activity', {
                                    activity: pickLocalizedField(badge.activity.title, badge.activity.titleZh, locale),
                                })}
                            </p>
                        </div>
                    )}
                    {badge.badgeRules?.length ? (
                        <div className="badge-rules">
                            {badge.badgeRules.map((rule) => {
                                const Icon = RULE_ICONS[rule.type] || FALLBACK_RULE_ICON;
                                let ruleLabel = rule.type.replace(/_/g, ' ');
                                try {
                                    ruleLabel = t(`rules.labels.${rule.type}`);
                                } catch (translationError) {
                                    // ignore, keep fallback label
                                }
                                return (
                                    <article key={rule.id || rule.type} className="badge-rule-card">
                                        <div className="badge-rule-card__icon" aria-hidden="true">
                                            <Icon size={20} />
                                        </div>
                                        <div>
                                            <h3>{ruleLabel}</h3>
                                            <p>
                                                {describeRule(rule, badge, t, locale, formatNumber)}
                                                {rule.type === 'invite_count' && badge.activity && (
                                                    <>
                                                        {' '}
                                                        <Link href={`/${locale}/activities/${badge.activity.id}`}>{localized.activityTitle || badge.activity.title}</Link>
                                                    </>
                                                )}
                                            </p>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="badge-panel__empty">{t('rules.noRules')}</p>
                    )}
                </section>

                {badge.activity && (
                    <section className="badge-panel badge-panel--full">
                        <div className="badge-activity">
                            <div className="badge-activity__details">
                                <p className="badge-panel__kicker">{t('activity.title')}</p>
                                <h2>{localized.activityTitle || t('activity.untitled')}</h2>
                                {sanitizedActivitySummary && (
                                    <div
                                        className="badge-activity__summary"
                                        dangerouslySetInnerHTML={{ __html: sanitizedActivitySummary }}
                                    />
                                )}
                                <ul>
                                    <li>
                                        <MapPin size={16} aria-hidden="true" />
                                        <span>{localized.activityLocation || t('activity.locationFallback')}</span>
                                    </li>
                                    <li>
                                        <Calendar size={16} aria-hidden="true" />
                                        <span>{formatDateRange(badge.activity.startDate, badge.activity.endDate, locale)}</span>
                                    </li>
                                </ul>
                            </div>
                            <div className="badge-activity__cta">
                                <Link href={`/${locale}/activities/${badge.activity.id}`}>
                                    {t('activity.cta')}
                                </Link>
                            </div>
                        </div>
                    </section>
                )}
            </div>

            {otherBadges.length > 0 && (
                <section className="badge-panel badge-panel--rail">
                    <div className="badge-panel__header">
                        <div>
                            <p className="badge-panel__kicker">{t('gallery.subtitle')}</p>
                            <h2>{t('gallery.title')}</h2>
                        </div>
                    </div>
                    <div className="badge-rail">
                        {otherBadges.map((other) => {
                            const otherTitle = pickLocalizedField(other.title, other.titleZh, locale) || other.title || '';
                            const otherDescription = pickLocalizedField(other.description, other.descriptionZh, locale) || other.description || '';
                            return (
                                <article key={other.id} className="badge-rail-card">
                                    <div className="badge-rail-card__media" aria-hidden="true">
                                        {other.imageUrl ? (
                                            <img src={buildImageUrl(other.imageUrl)} alt={otherTitle} />
                                        ) : (
                                            <div className="badge-rail-card__placeholder">
                                                <Activity size={24} />
                                            </div>
                                        )}
                                    </div>
                                    <h3>{otherTitle}</h3>
                                    {otherDescription && <p>{otherDescription}</p>}
                                    <Link href={`/${locale}/badges/${other.id}`}>
                                        {t('gallery.view')}
                                    </Link>
                                </article>
                            );
                        })}
                    </div>
                </section>
            )}
        </section>
    );
}

export default BadgeDetailsPage;
