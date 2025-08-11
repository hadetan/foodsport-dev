import React, { useState } from 'react';
import RecentActivitiesTable from './RecentActivitiesTable';
import { FaCalendarAlt, FaMedal, FaUser } from 'react-icons/fa';
import '@/app/my/css/UserProfileCard.css'
import EditProfile from './EditProfile';
import AllBadges from './AllBadges';

const menuItems = [
  { key: 'activities', label: 'My Activities', icon: <FaCalendarAlt className="mr-2" /> },
  { key: 'badges', label: 'My Achievement e-badges', icon: <FaMedal className="mr-2" /> },
  { key: 'profile', label: 'My Profile', icon: <FaUser className="mr-2" /> },
];

export default function UserProfileCard() {
  const [activeMenu, setActiveMenu] = useState('activities');

  return (
    <div className="user-profile-card">
      <div className="profile-card-menu">
        {menuItems.map(item => (
          <button
            key={item.key}
            className={`profile-card-menu-item${activeMenu === item.key ? ' active' : ''}`}
            onClick={() => setActiveMenu(item.key)}
          >
            <span className="profile-card-menu-icon">{item.icon}</span>
            <span className="profile-card-menu-label">{item.label}</span>
          </button>
        ))}
      </div>
      <div className="profile-card-content">
        {activeMenu === 'activities' && <RecentActivitiesTable />}
        {activeMenu === 'badges' && <AllBadges />}
        {activeMenu === 'profile' && <EditProfile />}
      </div>
    </div>
  );
}
