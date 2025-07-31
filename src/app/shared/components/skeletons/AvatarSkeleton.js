import React from 'react';

export default function AvatarSkeleton({ isNav = false }) {
  const sizeClass = isNav
    ? 'w-8 h-8 rounded-full'
    : 'w-12 h-12 rounded-xl';
  return (
    <div className={`avatar-skeleton bg-gray-200 animate-pulse ${sizeClass}`} />
  );
}
