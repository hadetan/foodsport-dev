import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import RecentActivitiesTable from './RecentActivitiesTable';
import { FaCalendarAlt, FaDoorOpen, FaMedal, FaUser } from 'react-icons/fa';
import '@/app/[locale]/my/css/UserProfileCard.css'
import EditProfile from './EditProfile';
import AllBadges from './AllBadges';
import ConfirmDialog from '@/app/shared/components/ConfirmDialog';
import api from '@/utils/axios/api';

const menuItems = [
  { key: 'allActivities', label: 'My Activities', icon: <FaCalendarAlt className="mr-2" /> },
  { key: 'earnedBadges', label: 'My Achievement e-badges', icon: <FaMedal className="mr-2" /> },
  { key: 'editProfile', label: 'My Profile', icon: <FaUser className="mr-2" /> },
];

export default function UserProfileCard() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  let menuKey = 'allActivities';
  try {
    if (searchParams && typeof searchParams.has === 'function' && searchParams.has('editProfile')) {
      menuKey = 'editProfile';
    } else {
      const first = searchParams.keys().next().value;
      if (first) menuKey = first;
    }
  } catch (e) {
    // fallback
    menuKey = 'allActivities';
  }

  const contentRef = useRef(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && menuKey === 'editProfile' && contentRef.current) {
      contentRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleMenuClick = (key) => {
    router.replace(`/my/profile?${key}`);
  };

  async function handleLogout() {
    try {
      setLoggingOut(true);
      const { data } = await api.delete('/auth/logout');
      if (data.success) {
        try { localStorage.removeItem('auth_token'); } catch (e) {}
        window.location.href = '/';
      }
    } finally {
      setLoggingOut(false);
    }
  }

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

        <button
          className={`profile-card-menu-item logout`}
          onClick={() => setShowConfirm(true)}
          disabled={loggingOut}
        >
          <span className="profile-card-menu-icon"><FaDoorOpen className="mr-2 logout-icon" /></span>
          <span className="profile-card-menu-label">{loggingOut ? 'Logging out...' : 'Logout'}</span>
        </button>
      </div>
        <div className="profile-card-content">
        {menuKey === 'allActivities' && <RecentActivitiesTable />}
        {menuKey === 'earnedBadges' && <AllBadges />}
        {menuKey === 'editProfile' && <EditProfile />}
      </div>
      <ConfirmDialog
        open={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={() => { setShowConfirm(false); handleLogout(); }}
        title="Log out"
        message="Are you sure you want to log out?"
        confirmText="Log out"
        cancelText="Cancel"
        confirmColor="#dc2626"
        cancelColor="#6b7280"
      />
     </div>
   );
 }
