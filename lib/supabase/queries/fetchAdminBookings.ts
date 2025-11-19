
import { createClient } from '@/utils/supabase/server';
import { TAdminBooking } from '@/types/adminBooking';

export const fetchAdminBookings = async (query: string): Promise<TAdminBooking[]> => {
  const supabase = await createClient();

  let queryBuilder = supabase
    .from('Booking_Details')
    .select(`
      Booking_ID,
      Booking_Start_Date_Time,
      Booking_End_Date_Time,
      Duration,
      Location,
      Customer (
        First_Name,
        Last_Name
      ),
      Car_Models (
        Model_Name,
        Year_Model,
        Manufacturer (
          Manufacturer_Name
        )
      ),
      Booking_Status (
        Name
      ),
      date_created
    `);

  if (query) {
    // This is a bit tricky, as we can't directly use .or with joined tables in this way.
    // A view or a custom RPC function would be better here.
    // For now, let's filter by booking ID, and assume the user might search for customer name in the future.
    // A more robust solution would require a dedicated search function.
    queryBuilder = queryBuilder.ilike('Booking_ID', `%${query}%`);
  }

  const { data, error } = await queryBuilder;

  if (error) {
    console.error('Error fetching admin bookings:', error);
    return [];
  }

  // The RPC returns the data with snake_case column names, so we map them to our camelCase type.
  return data.map((booking: any) => ({
    bookingId: booking.Booking_ID,
    startDate: booking.Booking_Start_Date_Time,
    endDate: booking.Booking_End_Date_Time,
    duration: booking.Duration,
    location: booking.Location,
    customerName: `${booking.Customer.First_Name} ${booking.Customer.Last_Name}`,
    carModel: booking.Car_Models.Model_Name,
    carManufacturer: booking.Car_Models.Manufacturer.Manufacturer_Name,
    carYear: booking.Car_Models.Year_Model,
    status: booking.Booking_Status.Name,
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
