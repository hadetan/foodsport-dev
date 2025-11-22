'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import '@/app/[locale]/my/css/AllBadges.css';
import BadgeGrid from './BadgeGrid';
import BadgeModal from './BadgeModal';

const BADGES_ENDPOINT = '/api/my/badges';

export default function AllBadges() {
  const t = useTranslations('AllBadges');
  const locale = useLocale();
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
    let isMounted = true;
    const controller = new AbortController();

    async function fetchBadges() {
      setIsLoading(true);
      setErrorMessage('');

      try {
        const response = await fetch(BADGES_ENDPOINT, { signal: controller.signal });
        const payload = await response.json().catch(() => ({}));

        if (!response.ok) {
          const message = typeof payload?.error === 'string' ? payload.error : `HTTP ${response.status}`;
          throw new Error(message);
        }

        if (!isMounted) {
          return;
        }

        setBadges(Array.isArray(payload?.badges) ? payload.badges : []);
      } catch (err) {
        if (!isMounted || err?.name === 'AbortError') {
          return;
        }
        console.error('Failed to load badges', err);
        setErrorMessage(err instanceof Error ? err.message : '');
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchBadges();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [refreshKey]);

  const handleBadgeSelect = (badge) => {
    setSelectedBadge(badge);
  };

  const handleCloseModal = () => {
    setSelectedBadge(null);
  };

  const handleRetry = () => {
    setRefreshKey((key) => key + 1);
  };

  const hasBadges = badges.length > 0;

  return (
    <section className="all-badges-section">

      <div className="all-badges-grid-wrapper">
        {isLoading && (
          <p className="all-badges-state" role="status">
            {t('states.loading')}
          </p>
        )}

        {!isLoading && errorMessage && (
          <div className="all-badges-state all-badges-state--error" role="alert">
            <p>{t('states.error')}</p>
            {errorMessage && <small>{errorMessage}</small>}
            <button type="button" className="all-badges-state__action" onClick={handleRetry}>
              {t('states.retry')}
            </button>
          </div>
        )}

        {!isLoading && !errorMessage && !hasBadges && (
          <p className="all-badges-state">
            {t('states.empty')}
          </p>
        )}

        {!isLoading && hasBadges && (
          <BadgeGrid
            badges={badges}
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
        />
      )}
    </section>
  );
}
