'use client'

import React, { use } from 'react';
import TncDetails from '@/app/shared/components/TncDetails';
import { notFound } from 'next/navigation';
import { useActivities } from '@/app/shared/contexts/ActivitiesContext';

export default function TncPage({ params }) {
  const unwrappedParams = use(params);
  const { id, tncTitle } = unwrappedParams;
  const { activities } = useActivities();
  const activity = activities?.find(act => String(act.id) === String(id));

  // render loading jus like other places.

  const tnc = activity?.tnc && activity.tnc?.title.replace(/\s+/g, '-') === tncTitle ? activity.tnc : null;
  
  // if (!tnc) return notFound();

  return <TncDetails title={tnc?.title} description={tnc?.description} />;
}
