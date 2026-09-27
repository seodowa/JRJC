'use client';

import React from 'react';

interface WelcomeMessageProps {
  user: { username: string } | null;
}

const WelcomeMessage = ({ user }: WelcomeMessageProps) => {
  const today = new Date().toLocaleDateString('en-US', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric', timeZone: 'Asia/Manila' });

  return (
    <div className="flex flex-col gap-2">
      <p className="eyebrow" suppressHydrationWarning>{today}</p>
      <h1 className="text-4xl leading-none font-normal tracking-[-0.03em] md:text-5xl">
        Welcome back, {user?.username || 'Admin'}.
      </h1>
    </div>
  );
};

export default WelcomeMessage;
