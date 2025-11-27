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
          First_Name,
          Last_Name
        )
      `)
      .eq('Booking_Status_ID', 1) // 1 = Pending
      .order('date_created', { ascending: false }); // Show latest first

    if (error) {
      throw new Error(error.message);
    }

    return data as Booking[];
  } catch (error) {
    console.error("Error fetching pending bookings:", error);
    return [];
  }
};
