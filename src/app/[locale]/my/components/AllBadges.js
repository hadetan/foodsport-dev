import React from 'react';
import '@/app/[locale]/my/css/AllBadges.css';
import { useTranslations } from 'next-intl';

export default function AllBadges() {
  const t = useTranslations('AllBadges');
  return (
    <div className="all-badges-coming-soon">
      <div className="coming-soon-content">
        <h1 className="coming-soon-title">{t('title')}</h1>
        <p className="coming-soon-subtitle">{t('subtitle')}</p>
        <div className="coming-soon-illustration">
          <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
            <circle cx="60" cy="60" r="55" stroke="#FFD700" strokeWidth="6" fill="#FFF8DC" />
            <text x="50%" y="50%" textAnchor="middle" dy=".3em" fontSize="32" fill="#FFD700">🏅</text>
          </svg>
        </div>
        <p className="coming-soon-description">{t('description')}</p>
      </div>
    </div>
  );
}
