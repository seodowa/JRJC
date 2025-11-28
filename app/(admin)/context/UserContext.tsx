'use client';

import { createContext, ReactNode } from 'react';

// Updated type to include email
type User = { username: string; email: string } | null;

// Added 'export' so we can import it in page.tsx
export const UserContext = createContext<User | undefined>(undefined);

export const UserProvider = ({ user, children }: { user: User, children: ReactNode }) => {
  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
};

