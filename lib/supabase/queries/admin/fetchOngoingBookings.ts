import { supabaseAdmin } from '@/utils/supabase/admin';
import { Booking } from '@/types/booking';

export async function fetchOngoingBookings(): Promise<Booking[]> {
  const { data: bookingsData, error: bookingsError } = await supabaseAdmin
    .from('Booking_Details')
    .select(`
      Booking_ID,
      Booking_Start_Date_Time,
      Booking_End_Date_Time,
      Duration,
      Location,
      Customer_ID,
      Model_ID,
      Customer (*),
      Car_Models (
        Model_Name,
        Year_Model,
        color_code,
        status_id,
        Car_Status (
            status
        ),
        Transmission_Types (
          Name
        ),
        Manufacturer (
          Manufacturer_Name
        )
      )
    `)
    .eq('Booking_Status_ID', 3); 

  if (bookingsError) {
    console.error('Error fetching ongoing bookings:', bookingsError);
    return [];
  }

  const { data: statusData, error: statusError } = await supabaseAdmin
    .from('Booking_Status')
    .select('Name')
    .eq('Booking_Status_ID', 3)
    .maybeSingle();

  const statusName = statusData?.Name || 'Ongoing';

  const bookings = bookingsData?.map(booking => {
    const customer = booking.Customer as any;
    const fullName = customer ? [customer.First_Name, customer.Last_Name, customer.Suffix].filter(Boolean).join(' ') : 'Unknown Customer';
    
    const carModel = booking.Car_Models as any;
    const transmission = carModel?.Transmission_Types;
    const manufacturer = carModel?.Manufacturer;

    const { Customer, Car_Models, ...rest } = booking;
    return {
      ...rest,
      Customer_Full_Name: fullName,
      Booking_Status_Name: statusName,
      Model_Name: carModel?.Model_Name || 'N/A',
      Year_Model: carModel?.Year_Model || 0,
      color_code: carModel?.color_code || '#808080', 
      Car_Status: carModel?.Car_Status?.status || 'N/A',
      Transmission_Type: transmission?.Name || 'N/A',
      Manufacturer_Name: manufacturer?.Manufacturer_Name || 'N/A',
    };
  });

  return (bookings as Booking[]) || [];
}
