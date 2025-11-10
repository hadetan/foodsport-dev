"use client";

import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import RecentActivitiesTable from './RecentActivitiesTable';
import { FaCalendarAlt, FaDoorOpen, FaMedal, FaUser } from 'react-icons/fa';
import '@/app/[locale]/my/css/UserProfileCard.css'
import EditProfile from './EditProfile';
import AllBadges from './AllBadges';
import ConfirmDialog from '@/app/shared/components/ConfirmDialog';
import api from '@/utils/axios/api';
import { useTranslations } from 'next-intl';

const menuItems = (t) => [
  { key: 'allActivities', label: t('menu.allActivities'), icon: <FaCalendarAlt className="menu-item-icon" aria-hidden /> },
  { key: 'earnedBadges', label: t('menu.earnedBadges'), icon: <FaMedal className="menu-item-icon" aria-hidden /> },
  { key: 'editProfile', label: t('menu.editProfile'), icon: <FaUser className="menu-item-icon" aria-hidden /> },
];

export default function UserProfileCard() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const t = useTranslations('ProfilePage');

  const [menuKey, setMenuKey] = useState('allActivities');

  useEffect(() => {
    try {
      if (searchParams && typeof searchParams.has === 'function') {
        const keys = ['editProfile', 'earnedBadges', 'allActivities'];
        for (const key of keys) {
          if (searchParams.has(key)) {
            setMenuKey(key);
            return;
          }
        }

        const first = searchParams.keys().next().value;
        if (first) setMenuKey(first);
      }
    } catch (e) {
      setMenuKey('allActivities');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const contentRef = useRef(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && menuKey === 'editProfile' && contentRef.current) {
      contentRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleMenuClick = (key) => {
    setMenuKey(key);

    const pathname = typeof window !== 'undefined' ? window.location.pathname : '/my/profile';
    const query = key ? `?${encodeURIComponent(key)}` : '';
    router.replace(`${pathname}${query}`);
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
        {menuItems(t).map(item => (
          <button
            key={item.key}
            className={`profile-card-menu-item ${menuKey === item.key ? 'active' : ''}`}
            onClick={() => handleMenuClick(item.key)}
            aria-pressed={menuKey === item.key}
            role="tab"
          >
            <span className="profile-card-menu-icon">{item.icon}</span>
            <span className="profile-card-menu-label">{item.label}</span>
          </button>
        ))}

        <button
          className={`profile-card-menu-item logout`}
          onClick={() => setShowConfirm(true)}
          disabled={loggingOut}
          role="button"
        >
          <span className="profile-card-menu-icon"><FaDoorOpen className="logout-icon menu-item-icon" aria-hidden /></span>
          <span className="profile-card-menu-label">{loggingOut ? t('menu.loggingOut') : t('menu.logout')}</span>
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
        title={t('confirm.logoutTitle')}
        message={t('confirm.logoutMessage')}
        confirmText={t('confirm.logoutConfirm')}
        cancelText={t('confirm.cancel')}
        confirmColor="#dc2626"
        cancelColor="#6b7280"
      />
     </div>
   );
 }
