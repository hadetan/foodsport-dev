'use client';

import React, { useMemo, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import '@/app/[locale]/my/css/AllBadges.css';
import BadgeGrid from './BadgeGrid';
import BadgeModal from './BadgeModal';

const DEMO_IMAGES = ['/demo/ac1.png', '/demo/ac2.png', '/demo/ac3.png', '/demo/ac4.png', '/demo/ac5.png'];

const MOCK_BADGES = Array.from({ length: 20 }, (_, index) => ({
  id: `badge-${index + 1}`,
  title: `Badge ${index + 1}`,
  description: 'Complete activities to unlock this badge.',
  titleZh: `徽章 ${index + 1}`,
  descriptionZh: '完成活動即可解鎖此徽章。',
  imageUrl: DEMO_IMAGES[Math.floor(Math.random() * DEMO_IMAGES.length)],
  isUnlocked: index % 3 !== 0,
}));

export default function AllBadges() {
  const t = useTranslations('AllBadges');
  const locale = useLocale();
  const [selectedBadge, setSelectedBadge] = useState(null);

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

  const handleBadgeSelect = (badge) => {
    setSelectedBadge(badge);
  };

  const handleCloseModal = () => {
    setSelectedBadge(null);
  };

  return (
    <section className="all-badges-section">

      <div className="all-badges-grid-wrapper">
        <BadgeGrid
          badges={MOCK_BADGES}
          locale={locale}
          onSelectBadge={handleBadgeSelect}
          statusLabels={statusLabels}
        />
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
