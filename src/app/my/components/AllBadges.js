import React from 'react';
import '@/app/my/css/AllBadges.css';

export default function AllBadges() {
  return (
    <div className="all-badges-coming-soon">
      <div className="coming-soon-content">
        <h1 className="coming-soon-title">Achievement e-badges</h1>
        <p className="coming-soon-subtitle">Coming Soon</p>
        <div className="coming-soon-illustration">
          {/* You can replace this SVG with a custom illustration if desired */}
          <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
            <circle cx="60" cy="60" r="55" stroke="#FFD700" strokeWidth="6" fill="#FFF8DC" />
            <text x="50%" y="50%" textAnchor="middle" dy=".3em" fontSize="32" fill="#FFD700">🏅</text>
          </svg>
        </div>
        <p className="coming-soon-description">
          Unlock and showcase your achievements soon! Stay tuned for exciting rewards and badges.
        </p>
      </div>
    </div>
  );
}
