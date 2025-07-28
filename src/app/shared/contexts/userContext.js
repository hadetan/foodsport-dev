'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import api from '@/utils/axios/api';

const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState({});
  const [loading, setLoading] = useState(false);

  const fetchActivities = async () => {
    setLoading(true);
    const res = await api.get('/my/profile');
    setUser(res.data?.user);
    setLoading(false);
  }
  useEffect(() => {
    fetchActivities();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, loading }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}