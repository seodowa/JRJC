import { createClient } from '@/utils/supabase/server';
import { DashboardData } from '@/types/dashboard';

export async function getOngoingBookings(): Promise<DashboardData[]> {
  const supabase = await createClient();

  const { data: bookingsData, error: bookingsError } = await supabase
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
        status,
        Transmission_Types (
          Name
        ),
        Manufacturer (
          Manufacturer_Name
        )
      )
    `)
    .eq('Booking_Status_ID', 3); // Assuming 3 is for 'Ongoing'

  if (bookingsError) {
    console.error('Error fetching ongoing bookings:', bookingsError);
    return [];
  }

  const { data: statusData, error: statusError } = await supabase
    .from('Booking_Status')
    .select('Name')
    .eq('Booking_Status_ID', 3)
    .maybeSingle();

  if (statusError) {
    console.error('Error fetching booking status:', statusError);
    // We can still proceed, just the status name will be a default
  }

  const statusName = statusData?.Name || 'Ongoing';

  const bookings = bookingsData?.map(booking => {
    const customer = booking.Customer;
    const fullName = customer ? [customer.First_Name, customer.Last_Name, customer.Suffix].filter(Boolean).join(' ') : 'Unknown Customer';
    
    const carModel = booking.Car_Models;
    const transmission = carModel?.Transmission_Types;
    const manufacturer = carModel?.Manufacturer;

    const { Customer, Car_Models, ...rest } = booking;
    return {
      ...rest,
      Customer_Full_Name: fullName,
      Booking_Status_Name: statusName,
      Model_Name: carModel?.Model_Name || 'N/A',
      Year_Model: carModel?.Year_Model || 0,
      color_code: carModel?.color_code || '#808080', // Default to gray
      Car_Status: carModel?.status || 'N/A',
      Transmission_Type: transmission?.Name || 'N/A',
      Manufacturer_Name: manufacturer?.Manufacturer_Name || 'N/A',
    };
  });

  return (bookings as DashboardData[]) || [];
}