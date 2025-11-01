
import { createClient } from '@/utils/supabase/server';
import { DashboardData } from '@/types/dashboard';

export async function fetchDashboardCars(): Promise<DashboardData[]> {
  const supabase = await createClient();

  const { data: carsData, error: carsError } = await supabase
    .from('Car_Models')
    .select(`
      Model_ID,
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
    `);

  if (carsError) {
    console.error('Error fetching cars:', carsError);
    return [];
  }

  const cars = await Promise.all(carsData.map(async (car) => {
    let bookingDetails = null;
    if (car.status === 'Traveling') {
      const { data: bookingData, error: bookingError } = await supabase
        .from('Booking_Details')
        .select(`
          Duration,
          Location,
          Customer (
            First_Name,
            Last_Name,
            Suffix
          )
        `)
        .eq('Model_ID', car.Model_ID)
        .eq('Booking_Status_ID', 3) // Assuming 3 is for 'Ongoing'
        .maybeSingle();

      if (bookingError) {
        console.error('Error fetching booking details:', bookingError);
      } else if (bookingData) {
        const customer = bookingData.Customer;
        const fullName = customer ? [customer.First_Name, customer.Last_Name, customer.Suffix].filter(Boolean).join(' ') : 'Unknown Customer';
        bookingDetails = {
          Customer_Full_Name: fullName,
          Duration: bookingData.Duration,
          Location: bookingData.Location,
        };
      }
    }

    const { Transmission_Types, Manufacturer, ...rest } = car;
    return {
      ...rest,
      Transmission_Type: Transmission_Types?.Name || 'N/A',
      Manufacturer_Name: Manufacturer?.Manufacturer_Name || 'N/A',
      bookingDetails,
    };
  }));

  return (cars as DashboardData[]) || [];
}
