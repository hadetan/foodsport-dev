'use client'

import React, { use } from 'react';
import TncDetails from '@/app/shared/components/TncDetails';
import { notFound } from 'next/navigation';
import { useActivities } from '@/app/shared/contexts/ActivitiesContext';
import TncDetailsSkeleton from '@/app/shared/components/skeletons/TncDetailsSkeleton';

export default function TncPage({ params }) {
  const unwrappedParams = use(params);
  const { id, tncTitle } = unwrappedParams;
  const { activities } = useActivities();
  const activity = activities?.find(act => String(act.id) === String(id));

  if (!activity) return < TncDetailsSkeleton />;

  const tnc = Array.isArray(activity?.tncs)
    ? activity.tncs.find(t =>
        String(t?.title || '')
          .trim()
          .replace(/\s+/g, '-') === String(tncTitle)
      )
    : null;
  
  if (!tnc) return notFound();

  return <TncDetails title={tnc?.title} description={tnc?.description} />;
}
