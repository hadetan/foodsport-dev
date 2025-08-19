import React, { useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import RecentActivitiesTable from './RecentActivitiesTable';
import { FaCalendarAlt, FaMedal, FaUser } from 'react-icons/fa';
import '@/app/my/css/UserProfileCard.css'
import EditProfile from './EditProfile';
import AllBadges from './AllBadges';

const menuItems = [
  { key: 'allActivities', label: 'My Activities', icon: <FaCalendarAlt className="mr-2" /> },
  { key: 'earnedBadges', label: 'My Achievement e-badges', icon: <FaMedal className="mr-2" /> },
  { key: 'editProfile', label: 'My Profile', icon: <FaUser className="mr-2" /> },
];

export default function UserProfileCard() {
  const searchParams = useSearchParams();
  const router = useRouter();
    const menuKey = searchParams.keys().next().value || 'allActivities';

    const contentRef = useRef(null);

    useEffect(() => {
      if (typeof window !== 'undefined' && menuKey === 'editProfile' && contentRef.current) {
        contentRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      // Only run on mount
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

  const handleMenuClick = (key) => {
    router.replace(`/my/profile?${key}`);
  };

  return (
    <div className="user-profile-card" ref={contentRef}>
      <div className="profile-card-menu">
        {menuItems.map(item => (
          <button
            key={item.key}
            className={`profile-card-menu-item${menuKey === item.key ? ' active' : ''}`}
            onClick={() => handleMenuClick(item.key)}
          >
            <span className="profile-card-menu-icon">{item.icon}</span>
            <span className="profile-card-menu-label">{item.label}</span>
          </button>
        ))}
      </div>
        <div className="profile-card-content">
        {menuKey === 'allActivities' && <RecentActivitiesTable />}
        {menuKey === 'earnedBadges' && <AllBadges />}
        {menuKey === 'editProfile' && <EditProfile />}
      </div>
    </div>
  );
}
