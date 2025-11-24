import React from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import '@/app/[locale]/my/css/BadgeGrid.css';
import '@/app/[locale]/my/css/BadgeCard.css';

export default function BadgeGridSkeleton({ count = 10 }) {
  const items = Number.isFinite(count) && count > 0 ? count : 10;
  return (
    <div className="badge-grid" role="list" aria-hidden>
      {Array.from({ length: items }).map((_, idx) => (
        <div className="badge-grid__item" key={`skeleton-${idx}`} role="listitem">
          <div className="badge-card" aria-hidden>
            <div className="badge-card__image-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Skeleton height={`60%`} width={`60%`} />
            </div>
            <div style={{ width: '100%', padding: '8px 12px' }}>
              <Skeleton width={`100%`} height={20} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
