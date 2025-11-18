
import { createClient } from '@/utils/supabase/server';
import { TAdminBooking } from '@/types/adminBooking';

export const fetchAdminBookings = async (query: string): Promise<TAdminBooking[]> => {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc('search_bookings', {
    search_term: query,
  });

  if (error) {
    console.error('Error fetching admin bookings:', error);
    return [];
  }

  // The RPC returns the data with snake_case column names, so we map them to our camelCase type.
  return data.map((booking: any) => ({
    bookingId: booking.booking_id,
    startDate: booking.start_date,
    endDate: booking.end_date,
    duration: booking.duration,
    location: booking.location,
    customerName: booking.customer_name,
    carModel: booking.car_model,
    status: booking.status,
    dateCreated: booking.date_created,
  }));
};

export const fetchBookingStatuses = async (): Promise<string[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase.from('Booking_Status').select('Name');

  if (error) {
    console.error('Error fetching booking statuses:', error);
    return [];
  }

  return data.map((status: any) => status.Name);
};
