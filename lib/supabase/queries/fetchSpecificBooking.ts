import { createClient } from '@/utils/supabase/client';

export type SpecificBookingDetails = {
  Booking_ID: string;
  Booking_Start_Date_Time: string;
  Booking_End_Date_Time: string;
  Duration: number;
  Location: string;
  date_created: string;
  Customer: {
    First_Name: string;
    Last_Name: string;
    Suffix: string | null;
    Email: string | null;
    Contact_Number: string | null;
  };
  Car_Models: {
    Model_Name: string;
    Year_Model: number;
    image: string | null;
    Manufacturer: {
      Manufacturer_Name: string;
    };
  };
  Booking_Status: {
    Name: string;
  };
};

export const fetchSpecificBooking = async (bookingId: string): Promise<SpecificBookingDetails | null> => {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('Booking_Details')
    .select(`
      Booking_ID,
      Booking_Start_Date_Time,
      Booking_End_Date_Time,
      Duration,
      Location,
      date_created,
      Customer:Customer_ID (
        First_Name,
        Last_Name,
        Suffix,
        Email,
        Contact_Number
      ),
      Car_Models:Model_ID (
        Model_Name,
        Year_Model,
        image,
        Manufacturer (
          Manufacturer_Name
        )
      ),
      Booking_Status:Booking_Status_ID (
        Name
      )
    `)
    .eq('Booking_ID', bookingId)
    .single();

  if (error) {
    console.error('Error fetching specific booking details:', error);
    return null;
  }

  return data as SpecificBookingDetails;
};
