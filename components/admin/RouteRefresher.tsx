'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface RouteRefresherProps {
  pollInterval?: number;
}

export const RouteRefresher = ({ pollInterval = 30000 }: RouteRefresherProps) => {
  const router = useRouter();

  useEffect(() => {
    const intervalId = setInterval(() => {
      router.refresh();
    }, pollInterval);

    return () => clearInterval(intervalId);
  }, [router, pollInterval]);

  return null; // This component renders nothing visible.
};
