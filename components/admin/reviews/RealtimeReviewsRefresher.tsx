'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

export const RealtimeReviewsRefresher = () => {
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const channel = supabase
      .channel('reviews-page-refresh')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'Reviews' }, () => {
        router.refresh();
      })
      // Reviews page also fetches and displays car information, so listen to Car_Models too
      .on('postgres_changes', { event: '*', schema: 'public', table: 'Car_Models' }, () => {
        router.refresh();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel).then(() => {});
    };
  }, [supabase, router]);

  return null; 
};
