import { supabaseAdmin } from "@/utils/supabase/admin";
import { TAdminBooking } from "@/types/adminBooking";

export const fetchAdminBookings = async (query: string = ''): Promise<TAdminBooking[]> => {
  let bookingQuery = supabaseAdmin
    .from('Booking_Details')
    .select(`
      Booking_ID,
      Booking_Start_Date_Time,
      Booking_End_Date_Time,
      Duration,
      Location,
      date_created,
      date_returned,
      Customer (
        First_Name,
        Last_Name,
        Suffix
      ),
      Car_Models (
        Model_Name,
        Year_Model,
        Manufacturer (Manufacturer_Name)
      ),
      Booking_Status (
        Name
      )
    `)
    .order('date_created', { ascending: false });

  if (query) {
      bookingQuery = bookingQuery.or(`Customer.First_Name.ilike.%${query}%,Customer.Last_Name.ilike.%${query}%,Booking_ID.eq.${query}`);
  }

  const { data, error } = await bookingQuery;

  if (error) {
    console.error("Error fetching admin bookings:", error);
    return [];
  }

  return data.map((booking: any) => {
      const status = booking.Booking_Status?.Name || 'Pending';
      
      return {
        bookingId: booking.Booking_ID.toString(),
        startDate: booking.Booking_Start_Date_Time,
        endDate: booking.Booking_End_Date_Time,
        duration: booking.Duration,
        location: booking.Location,
        customerName: `${booking.Customer?.First_Name || ''} ${booking.Customer?.Last_Name || ''} ${booking.Customer?.Suffix || ''}`.trim(),
        customerSuffix: booking.Customer?.Suffix || '',
        carModel: booking.Car_Models?.Model_Name || 'Unknown Model',
        carManufacturer: booking.Car_Models?.Manufacturer?.Manufacturer_Name || 'Unknown Make',
        carYear: booking.Car_Models?.Year_Model || 0,
        status: status,
        dateCreated: booking.date_created || new Date().toISOString(), // Fallback if missing
        dateReturned: booking.date_returned || null,
      };
  });
};

export const fetchBookingStatuses = async () => {
    const { data, error } = await supabaseAdmin
        .from('Booking_Status')
        .select('Name');
    
    if (error) {
        console.error("Error fetching statuses:", error);
        return [];
    }
    return data.map((s: any) => s.Name);
}
