'use client';

import React from 'react';

interface WelcomeMessageProps {
  user: { username: string } | null;
}

const WelcomeMessage = ({ user }: WelcomeMessageProps) => {
  return (
    <>
      <h2 className="text-2xl font-bold">Welcome back, {user?.username || 'Admin'}!</h2>
      <p className="text-gray-500">Here's a quick overview of your business.</p>
    </>
  );
};

export default WelcomeMessage;