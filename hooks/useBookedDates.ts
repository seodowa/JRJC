// hooks/useBookedDates.ts
import { useState, useEffect } from 'react';
import { fetchBookedDates } from '@/lib/supabase/queries/fetchBooking';

interface BookedDateRange {
  Booking_Start_Date_Time: string;
  Booking_End_Date_Time: string;
}

export const useBookedDates = (carModelId: number | null) => {
  const [bookedDates, setBookedDates] = useState<BookedDateRange[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadBookedDates = async () => {
      if (!carModelId) {
        setBookedDates([]);
        return;
      }

      setLoading(true);
      try {
        const dates = await fetchBookedDates(carModelId);
        setBookedDates(dates);
      } catch (error) {
        console.error('Error fetching booked dates:', error);
        setBookedDates([]);
      } finally {
        setLoading(false);
      }
    };

    loadBookedDates();
  }, [carModelId]);

  return { bookedDates, loading };
};