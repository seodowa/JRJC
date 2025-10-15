'use client';

import React from 'react';
import { useUser } from '@/app/(admin)/context/UserContext';

const WelcomeMessage = () => {
  const user = useUser();

  return (
    <>
      <h2 className="text-2xl font-bold">Welcome back, {user?.username || 'Admin'}!</h2>
      <p className="text-gray-500">Here's a quick overview of your business.</p>
    </>
  );
};

export default WelcomeMessage;
