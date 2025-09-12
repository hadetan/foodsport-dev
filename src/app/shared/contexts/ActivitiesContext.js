'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import api from '@/utils/axios/api';
import { usePathname } from 'next/navigation';
import { getLocaleFromPath } from '@/i18n/getLocaleFromPath';
import { localizeActivities } from '@/i18n/localize';

const ActivitiesContext = createContext();

export function ActivitiesProvider({ children }) {
  const [activities, setActivities] = useState([]);
  const [localizedActivities, setLocalizedActivities] = useState([]);
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);

  const fetchActivities = async () => {
    const res = await api.get('/activities');
    const raw = res.data?.activities || [];
    setActivities(raw);
    setLoading(false);
  };
  useEffect(() => { fetchActivities(); }, []);

  useEffect(() => {
    const locale = getLocaleFromPath(pathname);
    setLocalizedActivities(localizeActivities(activities, locale));
  }, [activities, pathname]);

  return (
    <ActivitiesContext.Provider value={{ activities: localizedActivities, rawActivities: activities, setActivities, loading }}>
      {children}
    </ActivitiesContext.Provider>
  );
}

export function useActivities() {
  return useContext(ActivitiesContext);
}