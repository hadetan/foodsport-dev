'use client';

import { createContext, useContext, useState } from 'react';

const UserActivityContext = createContext();

export function UserActivityProvider({ children }) {
  const [userActivity, setUserActivity] = useState([]);

  return (
    <UserActivityContext.Provider value={{ userActivity, setUserActivity }}>
      {children}
    </UserActivityContext.Provider>
  );
}

export function useUserActivity() {
  return useContext(UserActivityContext);
}