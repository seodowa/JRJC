import { createClient } from '@/utils/supabase/server';
import { DashboardCarData } from "@/types";

export async function fetchDashboardCars(): Promise<DashboardCarData[]> {
  const supabase = await createClient();

  // Fetch cars and ongoing bookings in parallel for efficiency
  // This avoids N+1 queries and allows us to patch the car status on the fly
  const [carsResult, bookingsResult] = await Promise.all([
    supabase
      .from('Car_Models')
      .select(`
        Model_ID,
        Model_Name,
        Year_Model,
        color_code,
        status_id,
        is_deleted,
        Transmission_Types (
          Name
        ),
        Manufacturer (
          Manufacturer_Name
        )
      `)
      .eq('is_deleted', false),
      
    supabase
      .from('Booking_Details')
      .select(`
        Model_ID,
        Duration,
        Location,
        Customer (
          First_Name,
          Last_Name,
          Suffix
        )
      `)
      .eq('Booking_Status_ID', 3) // Ongoing
  ]);

  if (carsResult.error) {
    console.error('Error fetching cars:', carsResult.error);
    return [];
  }

  const ongoingBookings = bookingsResult.data || [];
  const carsData = carsResult.data || [];

  // Create a map for fast lookup of bookings by Model_ID
  const bookingMap = new Map();
  ongoingBookings.forEach(booking => {
    bookingMap.set(booking.Model_ID, booking);
  });

  // Merge data
  const cars = carsData.map((car) => {
    const ongoingBooking = bookingMap.get(car.Model_ID);
    let bookingDetails = null;
    let effectiveStatusId = car.status_id;

    if (ongoingBooking) {
      // If an ongoing booking exists, force status to 'Traveling' (2)
      // This ensures the UI shows the car as rented even if the DB status_id isn't updated yet
      effectiveStatusId = 2; 

      const customer = ongoingBooking.Customer;
      const fullName = customer 
        ? [customer.First_Name, customer.Last_Name, customer.Suffix].filter(Boolean).join(' ') 
        : 'Unknown Customer';
      
      bookingDetails = {
        Customer_Full_Name: fullName,
        Duration: ongoingBooking.Duration,
        Location: ongoingBooking.Location,
      };
    }

    // Flatten the object structure as expected by the type
    const { Transmission_Types, Manufacturer, status_id, ...rest } = car;

    return {
      ...rest,
      status_id: effectiveStatusId,
      Transmission_Type: Transmission_Types?.Name || 'N/A',
      Manufacturer_Name: Manufacturer?.Manufacturer_Name || 'N/A',
      bookingDetails,
    };
  });

  return (cars as DashboardCarData[]);
}