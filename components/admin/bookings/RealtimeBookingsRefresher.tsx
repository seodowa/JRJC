'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

export const RealtimeBookingsRefresher = () => {
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const channel = supabase
      .channel('bookings-refresh')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'Booking_Details' }, () => {
        router.refresh();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel).then(() => {});
    };
  }, [supabase, router]);

  return null; 
};
