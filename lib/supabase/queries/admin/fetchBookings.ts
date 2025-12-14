import { supabaseAdmin } from "@/utils/supabase/admin";
import { TAdminBooking } from "@/types/adminBooking";
import { verifyAdmin } from "@/lib/auth";

const isUUID = (str: string) => {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
};

export const fetchAdminBookings = async (query: string = ''): Promise<TAdminBooking[]> => {
  const session = await verifyAdmin();
  if (!session) return [];

  const selectString = `
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
  `;

  const requests = [];

  // 1. Search by Customer Name (using !inner to filter by related table)
  if (query) {
    requests.push(
      supabaseAdmin
        .from('Booking_Details')
        .select(`
          Booking_ID,
          Booking_Start_Date_Time,
          Booking_End_Date_Time,
          Duration,
          Location,
          date_created,
          date_returned,
          Customer!inner (
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
        .or(`First_Name.ilike.*${query}*,Last_Name.ilike.*${query}*`, { foreignTable: 'Customer' })
        .order('date_created', { ascending: false })
    );

    // 2. Search by Booking ID (only if valid UUID)
    if (isUUID(query)) {
      requests.push(
        supabaseAdmin
          .from('Booking_Details')
          .select(selectString)
          .eq('Booking_ID', query)
      );
    }
  } else {
    // No query, fetch all
    requests.push(
      supabaseAdmin
        .from('Booking_Details')
        .select(selectString)
        .order('date_created', { ascending: false })
    );
  }

  const results = await Promise.all(requests);

  const allBookings: any[] = [];
  results.forEach(({ data, error }) => {
    if (!error && data) {
      allBookings.push(...data);
    } else if (error) {
      console.error('Error fetching admin bookings:', error);
    }
  });

  // Deduplicate by Booking_ID
  const uniqueBookings = Array.from(
    new Map(allBookings.map((item) => [item.Booking_ID, item])).values()
  );

  // Sort by date_created descending (since merging might have messed up order)
  uniqueBookings.sort((a, b) => 
    new Date(b.date_created).getTime() - new Date(a.date_created).getTime()
  );

  return uniqueBookings.map((booking: any) => {
    const status = booking.Booking_Status?.Name || 'Pending';

    return {
      bookingId: booking.Booking_ID.toString(),
      startDate: booking.Booking_Start_Date_Time,
      endDate: booking.Booking_End_Date_Time,
      duration: booking.Duration,
      location: booking.Location,
      customerName:
        `${booking.Customer?.First_Name || ''} ${
          booking.Customer?.Last_Name || ''
        } ${booking.Customer?.Suffix || ''}`.trim(),
      customerSuffix: booking.Customer?.Suffix || '',
      carModel: booking.Car_Models?.Model_Name || 'Unknown Model',
      carManufacturer:
        booking.Car_Models?.Manufacturer?.Manufacturer_Name || 'Unknown Make',
      carYear: booking.Car_Models?.Year_Model || 0,
      status: status,
      dateCreated: booking.date_created || new Date().toISOString(),
      dateReturned: booking.date_returned || null,
    };
  });
};

export const fetchBookingStatuses = async () => {
    const session = await verifyAdmin();
    if (!session) return [];
    
    const { data, error } = await supabaseAdmin
        .from('Booking_Status')
        .select('Name');
    
    if (error) {
        console.error("Error fetching statuses:", error);
        return [];
    }
    return data.map((s: any) => s.Name);
}
