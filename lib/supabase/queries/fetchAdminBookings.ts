
import { createClient } from '@/utils/supabase/server';
import { TAdminBooking } from '@/types/adminBooking';

export const fetchAdminBookings = async (query: string): Promise<TAdminBooking[]> => {
  const supabase = await createClient();

  // 1. Fetch initial booking data from the RPC
  const { data: bookingsData, error: bookingsError } = await supabase.rpc('search_bookings', { search_term: query });

  if (bookingsError) {
    console.error('Error fetching admin bookings:', bookingsError);
    return [];
  }

  if (!bookingsData || bookingsData.length === 0) {
    return [];
  }

  // 2. Extract unique car model names from the bookings
  const carModelNames = [...new Set(bookingsData.map(b => b.car_model))];

  // 3. Fetch car details for those models in a single query
  const { data: carDetailsData, error: carDetailsError } = await supabase
    .from('Car_Models')
    .select(`
      Model_Name,
      Year_Model,
      Manufacturer (
        Manufacturer_Name
      )
    `)
    .in('Model_Name', carModelNames);

  if (carDetailsError) {
    console.error('Error fetching car details:', carDetailsError);
    // Return bookings without car details if this fails, providing fallback values.
    return bookingsData.map((booking: any) => ({
      bookingId: booking.booking_id,
      startDate: booking.start_date,
      endDate: booking.end_date,
      duration: booking.duration,
      location: booking.location,
      customerName: booking.customer_name,
      carModel: booking.car_model,
      carManufacturer: 'N/A', // Fallback
      carYear: 0, // Fallback
      status: booking.status,
      dateCreated: booking.date_created,
    }));
  }

  // 4. Create a map for easy lookup
  const carDetailsMap = new Map(carDetailsData.map((car: any) => [
    car.Model_Name,
    {
      manufacturer: car.Manufacturer.Manufacturer_Name,
      year: car.Year_Model,
    }
  ]));

  // 5. Merge the booking data with the car details
  return bookingsData.map((booking: any) => {
    const carDetails = carDetailsMap.get(booking.car_model);
    return {
      bookingId: booking.booking_id,
      startDate: booking.start_date,
      endDate: booking.end_date,
      duration: booking.duration,
      location: booking.location,
      customerName: booking.customer_name,
      carModel: booking.car_model,
      carManufacturer: carDetails?.manufacturer || 'N/A',
      carYear: carDetails?.year || 0,
      status: booking.status,
      dateCreated: booking.date_created,
    };
  });
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
