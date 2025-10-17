'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

export const RealtimeRefresher = () => {
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const channel = supabase
      .channel('dashboard-refresh')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'Booking_Details' }, () => {
        router.refresh();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'Car_Models' }, () => {
        router.refresh();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'Reviews' }, () => {
        router.refresh();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel).then(() => {});
    };
  }, [supabase, router]);

  return null; // This component renders nothing.
};
