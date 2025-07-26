'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import api from '@/utils/axios/api';

const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState([]);

  const fetchActivities = async () => {
    const res = await api.get('/my/profile');
    setUser(res.data?.user);
  }
  useEffect(() => {
    fetchActivities();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}