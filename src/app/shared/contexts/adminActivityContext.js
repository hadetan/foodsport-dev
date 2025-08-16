'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import api from '@/utils/axios/api';

const AdminActivityContext = createContext();

export function AdminActivityProvider({ children }) {
  const [adminActivities, setAdminActivities] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchAdminActivities = async () => {
    setLoading(true);
    const res = await api.get('/admin/activities');
    setAdminActivities(res.data?.activities);
    setLoading(false);
  };

  useEffect(() => {
    fetchAdminActivities();
  }, []);

  return (
    <AdminActivityContext.Provider value={{ adminActivities, setAdminActivities, loading, fetchAdminActivities }}>
      {children}
    </AdminActivityContext.Provider>
  );
}

export function useAdminActivities() {
  return useContext(AdminActivityContext);
}
