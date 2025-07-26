'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import api from '@/utils/axios/api';

const ActivitiesContext = createContext();

export function ActivitiesProvider({ children }) {
  const [activities, setActivities] = useState([]);

  const fetchActivities = async () => {
    const res = await api.get('/admin/activities');
    setActivities(res.data?.activities);
  }
  useEffect(() => {
    fetchActivities();
  }, []);

  return (
    <ActivitiesContext.Provider value={{ activities, setActivities }}>
      {children}
    </ActivitiesContext.Provider>
  );
}

export function useActivities() {
  return useContext(ActivitiesContext);
}