'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { buildImageUrl } from '@/utils/image';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import '@/app/[locale]/my/css/BadgeModal.css';
import { useUser } from '@/app/shared/contexts/userContext';
import api from '@/utils/axios/api';
import ShareDialog from '@/app/shared/components/ShareDialog';

function resolveLocalizedFields(badge, locale) {
    const isZh = locale?.toLowerCase().startsWith('zh');
    return {
        title: isZh && badge.titleZh ? badge.titleZh : badge.title,
        description: isZh && badge.descriptionZh ? badge.descriptionZh : badge.description,
    };
}

function buildBadgeViewerContext(badge) {
    if (!badge) return null;
    const safeBadge = {
        id: badge.id,
        title: badge.title,
        titleZh: badge.titleZh,
        description: badge.description,
        descriptionZh: badge.descriptionZh,
        imageUrl: badge.imageUrl,
        isUnlocked: Boolean(badge.isUnlocked),
        status: badge.status || (badge.isUnlocked ? 'unlocked' : 'locked'),
        unlockedAt: badge.unlockedAt || null,
        earnedValue: badge.earnedValue || null,
        pointsSpent: badge.pointsSpent || null,
        source: badge.source || null,
        fsPointsCost: typeof badge.fsPointsCost === 'number' ? badge.fsPointsCost : null,
        isLimitedEdition: Boolean(badge.isLimitedEdition),
    };
    return safeBadge;
}

export default function BadgeModal({ badge, locale, labels, onClose, onRedeemed, initialScreen = 'details' }) {
    const t = useTranslations('AllBadges');
    const userContext = useUser();
    const user = userContext?.user;
    const setUser = userContext?.setUser;

    const [screen, setScreen] = useState(initialScreen || 'details');
    const [isRedeeming, setIsRedeeming] = useState(false);
    const [redeemSummary, setRedeemSummary] = useState(null);
    const [shareDialogOpen, setShareDialogOpen] = useState(false);

    useEffect(() => {
        if (!badge) return undefined;

        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                event.stopPropagation();
                handleModalClose();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [badge]);

    useEffect(() => {
        setScreen(initialScreen || 'details');
        setRedeemSummary(null);
        setIsRedeeming(false);
    }, [badge?.id, initialScreen]);

    const localized = useMemo(() => {
        if (!badge) return { title: '', description: '' };
        return resolveLocalizedFields(badge, locale);
    }, [badge, locale]);

    const pointsSuffix = t('modal.pointsSuffix');
    const cost = Number(badge?.fsPointsCost ?? 0) || 0;
    const isRedeemable = Boolean(badge) && !badge.isUnlocked && badge.isLimitedEdition && cost > 0;
    const userPoints = Number(user?.totalPoints ?? 0);
    const hasEnoughPoints = userPoints >= cost;
    const shortfall = hasEnoughPoints ? 0 : Math.max(0, cost - userPoints);

    if (!badge) return null;

    const sharePath = `${locale}/badges/${badge.id}`;
    const shareUrl = typeof window !== 'undefined'
        ? new URL(sharePath, window.location.origin).toString()
        : sharePath;

    const isLoggedIn = Boolean(user?.id);
    const viewPath = isLoggedIn
        ? `/${locale}/my/badges/${badge.id}`
        : `/${locale}/badges/${badge.id}`;
    const viewerContext = isLoggedIn ? buildBadgeViewerContext(badge) : null;
    const encodedContext = viewerContext ? encodeURIComponent(JSON.stringify(viewerContext)) : null;
    const viewHref = encodedContext
        ? { pathname: viewPath, query: { ctx: encodedContext } }
        : viewPath;

    const viewLinkProps = {
        href: viewHref,
        target: '_blank',
        rel: 'noopener noreferrer',
    };

    const shareLabel = labels?.share || t('modal.share');
    const viewLabel = labels?.viewDetails || t('modal.viewDetails');
    const closeLabel = labels?.close || t('modal.close');

    function handleModalClose() {
        setScreen('details');
        setRedeemSummary(null);
        setIsRedeeming(false);
        onClose?.();
    }

    const handleShare = () => {
        setShareDialogOpen(true);
    };

    const handleBuyClick = () => {
        setScreen('redeem');
    };

    const handleRedeemConfirm = async () => {
        if (!badge || !isRedeemable || !hasEnoughPoints) {
            return;
        }
        setIsRedeeming(true);
        try {
            const { data } = await api.post(`/my/badges/${badge.id}/redeem`);
            const remainingPoints = typeof data?.remainingPoints === 'number' ? data.remainingPoints : undefined;
            setRedeemSummary({
                cost,
                remainingPoints,
            });
            if (typeof onRedeemed === 'function') {
                onRedeemed();
            }
            if (typeof setUser === 'function') {
                setUser((prev) => {
                    if (!prev) {
                        return prev;
                    }
                    const nextPoints = typeof remainingPoints === 'number' ? remainingPoints : Math.max(0, (prev.totalPoints ?? 0) - cost);
                    const nextBadgeCount = (prev.badgeCount ?? 0) + 1;
                    return { ...prev, totalPoints: nextPoints, badgeCount: nextBadgeCount };
                });
            }
            setScreen('success');
        } catch (error) {
            const apiMessage = error?.response?.data?.error || error?.message || t('modal.purchaseError');
        } finally {
            setIsRedeeming(false);
        }
    };

    const formatPoints = (value) => `${value} ${pointsSuffix}`;

    const finalBalance = (() => {
        if (typeof redeemSummary?.remainingPoints === 'number') {
            return redeemSummary.remainingPoints;
        }
        if (screen === 'success') {
            return Math.max(0, userPoints - cost);
        }
        return userPoints;
    })();

    const renderPurchasePanel = () => {
        if (screen === 'redeem') {
            return (
                <div className="badge-modal__redeem-panel">
                    <h3 className="badge-modal__redeem-title">{t('modal.buyTitle')}</h3>
                    <p className="badge-modal__redeem-description">{t('modal.buyDescription')}</p>
                    <div className="badge-modal__redeem-rows">
                        <div className="badge-modal__redeem-row">
                            <span>{t('modal.costLabel')}</span>
                            <strong>{formatPoints(cost)}</strong>
                        </div>
                        <div className="badge-modal__redeem-row">
                            <span>{t('modal.balanceLabel')}</span>
                            <strong>{formatPoints(userPoints)}</strong>
                        </div>
                    </div>
                    {!hasEnoughPoints && (
                        <div className="badge-modal__redeem-warning" role="alert">
                            <p className="badge-modal__redeem-warning-title">{t('modal.insufficientTitle')}</p>
                            <p>{t('modal.insufficientDescription', { shortfall })}</p>
                            <small>{t('modal.insufficientCta')}</small>
                        </div>
                    )}
                </div>
            );
        }

        if (screen === 'success') {
            return (
                <div className="badge-modal__success" role="status">
                    <h3 className="badge-modal__success-title">{t('modal.successTitle')}</h3>
                    <p className="badge-modal__success-body">
                        {t('modal.successDescription', { cost, balance: finalBalance })}
                    </p>
                </div>
            );
        }

        return null;
    };

    const renderFooter = () => {
        if (screen === 'details') {
            if (badge.isUnlocked) {
                return (
                    <>
                        <button type="button" className="badge-modal__share" onClick={handleShare}>
                            {shareLabel}
                        </button>
                        <Link className="badge-modal__link" {...viewLinkProps}>
                            {viewLabel}
                        </Link>
                    </>
                );
            }

            if (isRedeemable) {
                return (
                    <>
                        <Link className="badge-modal__link" {...viewLinkProps}>
                            {viewLabel}
                        </Link>
                        <button type="button" className="badge-modal__buy" onClick={handleBuyClick}>
                            {t('modal.buyCta')}
                        </button>
                    </>
                );
            }

            return (
                <Link className="badge-modal__link badge-modal__link--full" {...viewLinkProps}>
                    {viewLabel}
                </Link>
            );
        }

        if (screen === 'redeem') {
            return (
                <>
                    <button
                        type="button"
                        className="badge-modal__back"
                        onClick={() => {
                            setScreen('details');
                        }}
                    >
                        {t('modal.back')}
                    </button>
                    <button
                        type="button"
                        className="badge-modal__confirm"
                        onClick={handleRedeemConfirm}
                        disabled={!hasEnoughPoints || isRedeeming}
                    >
                        {isRedeeming ? t('modal.confirming') : t('modal.confirmCta')}
                    </button>
                </>
            );
        }

        if (screen === 'success') {
            return (
                <>
                    <Link className="badge-modal__link" {...viewLinkProps}>
                        {viewLabel}
                    </Link>
                    <button type="button" className="badge-modal__share" onClick={handleModalClose}>
                        {closeLabel}
                    </button>
                </>
            );
        }

        return null;
    };

    return (
        <div className="badge-modal" role="dialog" aria-modal="true" aria-label={localized.title}>
            <div className="badge-modal__backdrop" onClick={handleModalClose} />
            <div className="badge-modal__content">
                <button type="button" className="badge-modal__close" onClick={handleModalClose} aria-label={closeLabel}>
                    ×
                </button>
                <div className="badge-modal__body">
                    <div className="badge-modal__image" aria-hidden="true">
                        {badge.imageUrl ? (
                            <img src={buildImageUrl(badge.imageUrl)} alt={localized.title} />
                        ) : (
                            <span role="img" aria-label={localized.title}>
                                {badge.emoji || '🏅'}
                            </span>
                        )}
                    </div>
                    <h2 className="badge-modal__title">{localized.title}</h2>
                    <p className="badge-modal__description">{localized.description}</p>
                    {renderPurchasePanel()}
                </div>
                <div className={`badge-modal__footer${screen !== 'details' ? ' badge-modal__footer--stacked' : ''}`}>
                    {renderFooter()}
                </div>
            </div>
            {shareDialogOpen && (
                <ShareDialog url={shareUrl} onClose={() => setShareDialogOpen(false)} label='Share this badge' />
            )}
        </div>
    );
}
