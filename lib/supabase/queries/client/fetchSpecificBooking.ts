import { createClient } from '@/utils/supabase/client';
import { SpecificBookingDetails } from '@/types/adminBooking'; // Import from central types

export const fetchSpecificBooking = async (bookingId: string): Promise<SpecificBookingDetails | null> => {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('Booking_Details')
    .select(`
      Booking_ID,
      Model_ID,
      Booking_Start_Date_Time,
      Booking_End_Date_Time,
      Duration,
      Location,
      date_created,
      additional_hours,
      date_returned,
      Payment_Details_ID,
      Customer:Customer_ID (
        First_Name,
        Last_Name,
        Suffix,
        Email,
        Contact_Number
      ),
      Car_Models (
        Model_Name,
        Year_Model,
        image,
        Number_Of_Seats,
        Car_Class_FK,
        Manufacturer (
          Manufacturer_Name
        )
      ),
      Booking_Status:Booking_Status_ID (
        Name
      ),
      Payment_Details (
        Payment_ID,
        booking_fee,
        initial_total_payment,
        additional_fees,
        total_payment,
        payment_status,
        bf_reference_number
      )
    `)
    .eq('Booking_ID', bookingId)
    .single();

  if (error) {
    console.error('Error fetching specific booking details:', error);
    return null;
  }

  // Cast and transform data, ensuring types match SpecificBookingDetails
  const transformedData: SpecificBookingDetails = {
    Booking_ID: data.Booking_ID,
    Model_ID: data.Model_ID,
    Booking_Start_Date_Time: data.Booking_Start_Date_Time,
    Booking_End_Date_Time: data.Booking_End_Date_Time,
    Duration: data.Duration,
    Location: data.Location,
    date_created: data.date_created,
    additional_hours: data.additional_hours,
    date_returned: data.date_returned,
    Payment_Details_ID: data.Payment_Details_ID,
    Customer: {
      First_Name: (data.Customer as any)?.First_Name,
      Last_Name: (data.Customer as any)?.Last_Name,
      Suffix: (data.Customer as any)?.Suffix,
      Email: (data.Customer as any)?.Email,
      Contact_Number: (data.Customer as any)?.Contact_Number
    },
    Car_Models: {
      Model_Name: (data.Car_Models as any)?.Model_Name,
      Year_Model: (data.Car_Models as any)?.Year_Model,
      image: (data.Car_Models as any)?.image,
      Number_Of_Seats: (data.Car_Models as any)?.Number_Of_Seats,
      Car_Class_FK: (data.Car_Models as any)?.Car_Class_FK, // Add Car_Class_FK to transformation
      Manufacturer: {
        Manufacturer_Name: (data.Car_Models as any)?.Manufacturer?.Manufacturer_Name // Corrected access
      }
    },
    Booking_Status: {
      Name: (data.Booking_Status as any)?.Name
    },
    Payment_Details: (data.Payment_Details as any)?.[0] || null
  };

  return transformedData;
};
