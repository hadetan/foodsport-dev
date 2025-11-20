'use client';

import React from 'react';
import BadgeCard from './BadgeCard';
import '@/app/[locale]/my/css/BadgeGrid.css';

export default function BadgeGrid({ badges = [], locale, onSelectBadge, statusLabels }) {

  return (
    <div className="badge-grid" role="list">
      {badges.map((badge) => (
        <div className="badge-grid__item" key={badge.id} role="listitem">
          <BadgeCard badge={badge} locale={locale} onSelect={onSelectBadge} statusLabels={statusLabels} />
        </div>
      ))}
    </div>
  );
}
