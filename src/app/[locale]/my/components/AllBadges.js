'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import '@/app/[locale]/my/css/AllBadges.css';
import BadgeGrid from './BadgeGrid';
import BadgeModal from './BadgeModal';
import BadgeGridSkeleton from '@/app/shared/components/skeletons/BadgeGridSkeleton';
import api from '@/utils/axios/api';
import { useMyBadges } from '@/app/shared/contexts/myBadgesContext';

export default function AllBadges() {
  const t = useTranslations('AllBadges');
  const locale = useLocale();
  const myBadgesContext = useMyBadges();
  const usingContext = Boolean(myBadgesContext);
  const [selectedBadge, setSelectedBadge] = useState(null);
  const [badges, setBadges] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const statusLabels = useMemo(() => ({
    locked: t('status.locked'),
    unlocked: t('status.unlocked'),
  }), [t]);

  const modalLabels = useMemo(() => ({
    share: t('modal.share'),
    close: t('modal.close'),
    viewDetails: t('modal.viewDetails'),
    shareSuccess: t('modal.shareSuccess'),
    shareError: t('modal.shareError'),
  }), [t]);


  useEffect(() => {
    if (usingContext) {
      return undefined;
    }

    let isMounted = true;

    async function fetchBadges() {
      setIsLoading(true);
      setErrorMessage('');

      try {
        const response = await api.get('/my/badges');
        const payload = response?.data ?? {};

        if (!isMounted) {
          return;
        }

        setBadges(Array.isArray(payload?.badges) ? payload.badges : []);
      } catch (err) {
        if (!isMounted || err?.name === 'AbortError') {
          return;
        }
        console.error('Failed to load badges', err);
        const apiError = err?.response?.data?.error || err?.message || '';
        setErrorMessage(apiError instanceof Error ? apiError.message : String(apiError));
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
  }, [refreshKey, usingContext]);

  const handleBadgeSelect = (badge) => {
    setSelectedBadge(badge);
  };

  const resolvedBadges = usingContext ? (myBadgesContext?.badges ?? []) : badges;
  const resolvedLoading = usingContext ? Boolean(myBadgesContext?.loading) : isLoading;
  const resolvedError = usingContext ? (myBadgesContext?.error || '') : errorMessage;

  useEffect(() => {
    if (!selectedBadge) {
      return;
    }
    const latest = resolvedBadges.find((badge) => badge.id === selectedBadge.id);
    if (!latest) {
      return;
    }
    const hasChanged = ['isUnlocked', 'status', 'pointsSpent', 'unlockedAt', 'earnedValue']
      .some((field) => latest[field] !== selectedBadge[field]);
    if (hasChanged) {
      setSelectedBadge(latest);
    }
  }, [resolvedBadges, selectedBadge]);

  const handleCloseModal = () => {
    setSelectedBadge(null);
  };

  const handleBadgeRedeemed = () => {
    if (usingContext && typeof myBadgesContext?.refresh === 'function') {
      myBadgesContext.refresh();
      return;
    }
    setRefreshKey((key) => key + 1);
  };

  const handleRetry = () => {
    if (usingContext && typeof myBadgesContext?.refresh === 'function') {
      myBadgesContext.refresh();
      return;
    }
    setRefreshKey((key) => key + 1);
  };

  const hasBadges = resolvedBadges.length > 0;

  return (
    <section className="all-badges-section">

      <div className="all-badges-grid-wrapper">
        {resolvedLoading && (
          <BadgeGridSkeleton />
        )}

        {!resolvedLoading && resolvedError && (
          <div className="all-badges-state all-badges-state--error" role="alert">
            <p>{t('states.error')}</p>
            {resolvedError && <small>{resolvedError}</small>}
            <button type="button" className="all-badges-state__action" onClick={handleRetry}>
              {t('states.retry')}
            </button>
          </div>
        )}

        {!resolvedLoading && !resolvedError && !hasBadges && (
          <p className="all-badges-state">
            {t('states.empty')}
          </p>
        )}

        {!resolvedLoading && hasBadges && (
          <BadgeGrid
            badges={resolvedBadges}
            locale={locale}
            onSelectBadge={handleBadgeSelect}
            statusLabels={statusLabels}
          />
        )}
      </div>

      {selectedBadge && (
        <BadgeModal
          badge={selectedBadge}
          locale={locale}
          labels={modalLabels}
          onClose={handleCloseModal}
          onRedeemed={handleBadgeRedeemed}
        />
      )}
    </section>
  );
}
