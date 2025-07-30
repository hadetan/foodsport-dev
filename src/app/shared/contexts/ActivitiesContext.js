'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import api from '@/utils/axios/api';

const ActivitiesContext = createContext();

export function ActivitiesProvider({ children }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchActivities = async () => {
    setLoading(true);
    const res = await api.get('/activities');
    setActivities(res.data?.activities);
    setLoading(false);
  }
  useEffect(() => {
    fetchActivities();
  }, []);

  return (
    <ActivitiesContext.Provider value={{ activities, setActivities, loading }}>
      {children}
    </ActivitiesContext.Provider>
  );
}

export function useActivities() {
  return useContext(ActivitiesContext);
}