import { supabaseAdmin } from '@/utils/supabase/admin';
import { DashboardCarData } from "@/types";
import { verifyAdmin } from '@/lib/auth';

export async function fetchDashboardCars(): Promise<DashboardCarData[]> {
  const session = await verifyAdmin();
  if (!session) return [];

  const [carsResult, bookingsResult] = await Promise.all([
    supabaseAdmin
      .from('Car_Models')
      .select(
        `
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
      `
      )
      .eq('is_deleted', false),

    supabaseAdmin
      .from('Booking_Details')
      .select(
        `
        Model_ID,
        Duration,
        Location,
        Customer (
          First_Name,
          Last_Name,
          Suffix
        )
      `
      )
      .eq('Booking_Status_ID', 3), // Ongoing
  ]);

  if (carsResult.error) {
    console.error('Error fetching cars:', carsResult.error);
    return [];
  }

  const ongoingBookings = bookingsResult.data || [];
  const carsData = carsResult.data || [];

  const bookingMap = new Map();
  ongoingBookings.forEach((booking) => {
    bookingMap.set(booking.Model_ID, booking);
  });

  const cars = carsData.map((car) => {
    const ongoingBooking = bookingMap.get(car.Model_ID);
    let bookingDetails = null;
    let effectiveStatusId = car.status_id;

    if (ongoingBooking) {
      effectiveStatusId = 2;

      const customer = ongoingBooking.Customer as any;
      const fullName = customer
        ? [customer.First_Name, customer.Last_Name, customer.Suffix]
            .filter(Boolean)
            .join(' ')
        : 'Unknown Customer';

      bookingDetails = {
        Customer_Full_Name: fullName,
        Duration: ongoingBooking.Duration,
        Location: ongoingBooking.Location,
      };
    }

    const { Transmission_Types, Manufacturer, status_id, ...rest } = car;

    return {
      ...rest,
      status_id: effectiveStatusId,
      Transmission_Type: (Transmission_Types as any)?.Name || 'N/A',
      Manufacturer_Name: (Manufacturer as any)?.Manufacturer_Name || 'N/A',
      bookingDetails,
    };
  });

  return cars as DashboardCarData[];
}
