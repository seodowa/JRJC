import { createClient } from "@/utils/supabase/client";
import { BookingStatus } from "@/types";

const supabase = createClient();

// --- UPDATED FUNCTION ---
export const fetchBookedDates = async (carModelId: number) => {
  const { data, error } = await supabase
    .from('Booking_Details')
    // 👇 ADDED Booking_ID here
    .select('Booking_ID, Booking_Start_Date_Time, Booking_End_Date_Time')
    .eq('Model_ID', carModelId)
    // 1 = Pending, 2 = Confirmed, 3 = Ongoing
    .in('Booking_Status_ID', [1, 2, 3]); 

  if (error) {
    console.error('Error fetching booked dates:', error);
    return [];
  }
  return data || [];
};

// ... (Rest of your file remains the same)
export const fetchBookings = async (filters: Record<string, any> = {}) => {
  let query = supabase
    .from('Booking_Details')
    .select(`
      Booking_ID,
      Model_ID,
      Booking_Start_Date_Time,
      Booking_End_Date_Time,
      Duration,
      Location,
      Customer:Customer_ID (
        First_Name,
        Last_Name
      )
    `);

  query = query.match(filters);

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching bookings:', error);
    throw new Error('Failed to fetch bookings.');
  }

  return data || [];
};

export const fetchBookingStatus = async (uuid: string) => {
  try {
    const { data, error } = await supabase
      .from("Booking_Details")
      .select(`
        Customer (
          First_Name,
          Last_Name
        ),
        Car_Models (
          Manufacturer (
            Manufacturer_Name
          ),
          Model_Name
        ),
        Booking_Status (
          Name
        )
      `)
      .eq("Booking_ID", uuid)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    if (!data) {
      return null;
    }

    const transformedData: BookingStatus = {
      customerFirstName: data.Customer.First_Name,
      customerLastName: data.Customer.Last_Name,
      carManufacturer: data.Car_Models.Manufacturer.Manufacturer_Name,
      carModelName: data.Car_Models.Model_Name,
      bookingStatus: data.Booking_Status.Name
    };

    return transformedData;
  } catch(error) {
    console.error("Error fetching booking status:", error);
  }
}