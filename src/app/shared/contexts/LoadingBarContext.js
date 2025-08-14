'use client';

import { createContext, useContext, useRef } from 'react';

const LoadingBarContext = createContext(null);

export function LoadingBarProvider({ children }) {
  const loadingBarRef = useRef(null);

  const start = () => loadingBarRef.current && loadingBarRef.current.continuousStart();
  const complete = () => loadingBarRef.current && loadingBarRef.current.complete();
  const staticStart = () => loadingBarRef.current && loadingBarRef.current.staticStart();

  return (
    <LoadingBarContext.Provider value={{ start, complete, staticStart, loadingBarRef }}>
      {children}
    </LoadingBarContext.Provider>
  );
}

export function useLoadingBar() {
  return useContext(LoadingBarContext);
}
