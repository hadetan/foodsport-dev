'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import api from '@/utils/axios/api';

const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchUser = async () => {
    setLoading(true);
    const res = await api.get('/my/profile');
    setUser(res.data?.user);
    setLoading(false);
  }
  useEffect(() => {
    !!localStorage.getItem('auth_token') && fetchUser();
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