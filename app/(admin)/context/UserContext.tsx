'use client';

import { createContext, useContext, ReactNode } from 'react';

type User = { username: string } | null;

const UserContext = createContext<User | undefined>(undefined);

export const UserProvider = ({ user, children }: { user: User, children: ReactNode }) => {
  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider. Make sure the component is a child of AdminLayoutClient.');
  }
  return context;
};
