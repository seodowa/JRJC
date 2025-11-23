'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

export const RealtimeCarsRefresher = () => {
  const router = useRouter();
  
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel('car-models-refresh')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'Car_Models' }, () => {
        router.refresh();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [router]);

  return null; // This component renders nothing.
};
