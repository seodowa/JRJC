import { useState, useEffect, useCallback } from 'react';
import { fetchBookings } from '@/lib/supabase/queries/fetchBooking';
import { Booking } from '@/types';
import { createClient } from '@/utils/supabase/client';

export const useBookings = (filters: Record<string, any> = {}) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updateTrigger, setUpdateTrigger] = useState(0);
  const supabase = createClient();

  const filtersJSON = JSON.stringify(filters);

  const loadBookings = useCallback(async () => {
    // We don't set loading to true on re-fetches to avoid UI flicker.
    try {
      const parsedFilters = JSON.parse(filtersJSON);
      const data = await fetchBookings(parsedFilters);
      setBookings(data as Booking[]);
    } catch (err) {
      setError('Failed to load bookings.');
      console.error(err);
    } finally {
      // This ensures the initial loading state is turned off.
      if (loading) setLoading(false);
    }
  }, [filtersJSON]); // loading is removed from dependencies

  useEffect(() => {
    loadBookings();
  }, [loadBookings, updateTrigger]);

  useEffect(() => {
    const channel = supabase
      .channel('booking-details-realtime-trigger')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'Booking_Details' },
        (payload) => {
          console.log('Realtime change received:', payload);
          setUpdateTrigger(count => count + 1);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  return { bookings, loading, error };
};
