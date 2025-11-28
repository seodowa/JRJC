import { supabaseAdmin } from "@/utils/supabase/admin";
import { Booking } from "@/types";

export const fetchPendingBookings = async (): Promise<Booking[]> => {
  try {
    const { data, error } = await supabaseAdmin
      .from('Booking_Details')
      .select(`
        Booking_ID,
        Booking_Start_Date_Time,
        Booking_End_Date_Time,
        Duration,
        Location,
        Customer:Customer_ID (
          Customer_ID,
          First_Name,
          Last_Name
        )
      `)
      .eq('Booking_Status_ID', 1) // 1 = Pending
      .order('date_created', { ascending: false }); // Show latest first

    if (error) {
      throw new Error(error.message);
    }

    const transformedData: Booking[] = data?.map(booking => {
      console.log(booking)
      return {
        Booking_ID: booking.Booking_ID,
        Booking_Start_Date_Time: booking.Booking_Start_Date_Time,
        Booking_End_Date_Time: booking.Booking_End_Date_Time,
        Duration: booking.Duration,
        Location: booking.Location,
        Customer_ID: (booking.Customer as any).Customer_ID, 
        Customer_Full_Name: `${(booking.Customer as any).First_Name} ${(booking.Customer as any).Last_Name}`,
        Booking_Status_Name: '',
        Model_ID: 0,
        Model_Name: '',
        Year_Model: 0,
        color_code: '',
        Car_Status: '',
        Transmission_Type: '',
        Manufacturer_Name: '',
      }
    });

    return transformedData;
  } catch (error) {
    console.error("Error fetching pending bookings:", error);
    return [];
  }
};
