'use client';

import { createContext, useContext, ReactNode } from 'react';

type User = { username: string; email: string } | null;

const UserContext = createContext<User | undefined>(undefined);

export const UserProvider = ({ user, children }: { user: User, children: ReactNode }) => {
  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
};
