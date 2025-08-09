import React from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import '@/app/my/css/profile.css'
import '@/app/my/css/UserProfileCard.css'

export default function ProfilePageSkeleton() {
  return (
    <div style={{ background: '#f3f4f6' }}>
      <div className="profile-page-container ">
        <div className="profile-main-row">
          {/* Left Side: Avatar & Info */}
          <div className="profile-left">
            <div className="profile-avatar-wrapper animate-pulse">
              <Skeleton circle height={80} width={80} style={{ marginBottom: 8 }} />
              <div className="profile-level-badge animate-pulse">
              </div>
            </div>
            <div className="profile-name animate-pulse">
              <Skeleton width={120} height={24} />
            </div>
            <div className="profile-id animate-pulse">
              <Skeleton width={80} height={18} />
            </div>
          </div>
          {/* Right Side: Stat Cards */}
          <div className="profile-right">
            <div className="profile-stats-grid">
              <div className="profile-stat stat-orange animate-pulse">
                <span className="ribbon orange "></span>
                <div className="stats">
                  <div className="stat-value"><Skeleton width={60} height={28} /></div>
                  <div className="stat-label"><Skeleton width={140} height={16} /></div>
                </div>
              </div>
              <div className="profile-stat stat-blue animate-pulse">
                <span className="ribbon blue"></span>
                <div className="stat-value"><Skeleton width={60} height={28} /></div>
                <div className="stat-label"><Skeleton width={180} height={16} /></div>
              </div>
              <div className="profile-stat stat-purple animate-pulse">
                <span className="ribbon purple"></span>
                <div className="stat-value"><Skeleton width={60} height={28} /></div>
                <div className="stat-label"><Skeleton width={140} height={16} /></div>
              </div>
              <div className="profile-stat stat-pink animate-pulse">
                <span className="ribbon pink"></span>
                <div className="stat-value"><Skeleton width={60} height={28} /></div>
                <div className="stat-label"><Skeleton width={140} height={16} /></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Lower Card: Activities/Profile/Badges */}
      <div className="user-profile-card">
        {/* Left Side Menu */}
        <div className="profile-card-menu">
          {[1,2,3].map((i) => (
            <button key={i} className="profile-card-menu-item animate-pulse">
              <span className="profile-card-menu-icon"><Skeleton circle width={24} height={24} /></span>
              <span className="profile-card-menu-label"><Skeleton width={120} height={20} /></span>
            </button>
          ))}
        </div>
        {/* Right Side Content: Activities Table Skeleton */}
        <div className="profile-card-content">
          <table className="recent-activities-table animate-pulse">
            <thead>
              <tr>
                <th><Skeleton width={40} /></th>
                <th><Skeleton width={60} /></th>
                <th><Skeleton width={120} /></th>
                <th><Skeleton width={80} /></th>
                <th><Skeleton width={60} /></th>
                <th><Skeleton width={80} /></th>
              </tr>
            </thead>
            <tbody>
              {[1,2,3,4,5,6,7,8,9,10].map((i) => (
                <tr key={i}>
                  <td><Skeleton width={32} height={32} /></td>
                  <td><Skeleton width={80} /></td>
                  <td><Skeleton width={140} /></td>
                  <td><Skeleton width={80} /></td>
                  <td><Skeleton width={60} /></td>
                  <td><Skeleton width={80} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
