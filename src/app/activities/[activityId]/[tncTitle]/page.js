import React from 'react';
import TncDetails from '@/app/shared/components/TncDetails';
import { notFound } from 'next/navigation';

// This page expects activityId and tncTitle as route params
export default async function TncPage({ params }) {
  // Fetch activity data from API or props
  // For now, assume activity data is available via API
  const { activityId, tncTitle } = params;
  let activity;
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/activities/${activityId}`);
    if (!res.ok) throw new Error('Activity not found');
    activity = await res.json();
  } catch (e) {
    return notFound();
  }
  // Find TNC by title (replace hyphens with spaces for matching)
  const tnc = activity.tnc && activity.tnc.title.replace(/\s+/g, '-') === tncTitle ? activity.tnc : null;
  if (!tnc) return notFound();
  return <TncDetails title={tnc.title} description={tnc.description} />;
}
