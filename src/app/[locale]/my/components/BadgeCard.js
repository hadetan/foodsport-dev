"use client";

import React from 'react';
import { buildImageUrl } from '@/utils/image';
import '@/app/[locale]/my/css/BadgeCard.css';
import Tooltip from '@/app/shared/components/Tooltip';

function resolveLocalizedText(badge, locale) {
  const isZh = locale?.toLowerCase().startsWith('zh');
  const title = isZh && badge.titleZh ? badge.titleZh : badge.title;
  return title || badge.title || '';
}

export default function BadgeCard({ badge, locale, onSelect, statusLabels = {} }) {
  if (!badge) return null;

  const title = resolveLocalizedText(badge, locale);
  const buttonClasses = ['badge-card'];
  if (badge.isUnlocked) {
    buttonClasses.push('badge-card--unlocked');
  } else {
    buttonClasses.push('badge-card--locked');
  }

  const handleSelect = () => {
    if (typeof onSelect === 'function') {
      onSelect(badge);
    }
  };

  const lockedLabel = statusLabels.locked || 'locked';
  const unlockedLabel = statusLabels.unlocked || 'unlocked';

  return (
    <button
      type="button"
      className={buttonClasses.join(' ')}
      onClick={handleSelect}
      aria-label={`${title} ${badge.isUnlocked ? unlockedLabel : lockedLabel}`}
      data-badge-id={badge.id}
    >
      <div className="badge-card__image-wrapper" aria-hidden="true">
        {badge.imageUrl ? (
          <img src={buildImageUrl(badge.imageUrl)} alt={title} className="badge-card__image" />
        ) : (
          <span className="badge-card__emoji" role="img">
            {badge.emoji || '🏅'}
          </span>
        )}
        {!badge.isUnlocked && (
          <div className="badge-card__lock" aria-hidden="true">
            <span role="img" aria-label="locked">
              🔒
            </span>
          </div>
        )}
      </div>
      <Tooltip content={title} width={'12rem'} className="tooltip-block">
        <span className="badge-card__label">
          {title}
        </span>
      </Tooltip>
    </button>
  );
}
