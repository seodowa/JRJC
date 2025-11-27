import { useState, useEffect } from 'react';
import { fetchBookedDates } from '@/lib/supabase/queries/client/fetchBooking'; // Adjust path if needed

// Ensure this matches the query selection
export interface BookedDateRange {
  Booking_ID: string;
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
        // Cast the result to ensure TS treats it correctly
        setBookedDates(dates as BookedDateRange[]);
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