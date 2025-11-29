'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import api from '@/utils/axios/api';

const MyBadgesContext = createContext(undefined);

export function MyBadgesProvider({ children }) {
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchBadges = useCallback(async () => {

    setLoading(true);
    setError('');
    try {
      const response = await api.get('/my/badges');
      const payload = response?.data?.badges;
      setBadges(Array.isArray(payload) ? payload : []);
    } catch (err) {
      if (err?.name === 'CanceledError' || err?.name === 'AbortError') {
        return;
      }
      const apiError = err?.response?.data?.error || err?.message || 'Badge load failed';
      setError(typeof apiError === 'string' ? apiError : String(apiError));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBadges();
  }, [fetchBadges]);

  const updateBadge = useCallback((nextBadge) => {
    if (!nextBadge || !nextBadge.id) {
      return;
    }
    setBadges((prev) => {
      const exists = prev.some((badge) => badge.id === nextBadge.id);
      if (!exists) {
        return prev;
      }
      return prev.map((badge) => (badge.id === nextBadge.id ? { ...badge, ...nextBadge } : badge));
    });
  }, []);

  const contextValue = useMemo(() => ({
    badges,
    loading,
    error,
    refresh: fetchBadges,
    updateBadge,
  }), [badges, loading, error, fetchBadges, updateBadge]);

  return (
    <MyBadgesContext.Provider value={contextValue}>
      {children}
    </MyBadgesContext.Provider>
  );
}

export function useMyBadges() {
  return useContext(MyBadgesContext);
}
