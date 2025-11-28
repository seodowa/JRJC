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

  const transformedData: SpecificBookingDetails = {
    Booking_ID: data.Booking_ID,
    Booking_Start_Date_Time: data.Booking_Start_Date_Time,
    Booking_End_Date_Time: data.Booking_End_Date_Time,
    Duration: data.Duration,
    Location: data.Location,
    date_created: data.date_created,
    Customer: {
      First_Name: (data.Customer as any).First_Name,
      Last_Name: (data.Customer as any).Last_Name,
      Suffix: (data.Customer as any).Suffix,
      Email: (data.Customer as any).Email,
      Contact_Number: (data.Customer as any).Contact_Number
    },
    Car_Models: {
      Model_Name: (data.Car_Models as any).Model_Name,
      Year_Model: (data.Car_Models as any).Year_Model,
      image: (data.Car_Models as any).image,
      Manufacturer: {
        Manufacturer_Name: (data.Car_Models as any).Manufacturer_Name
      }
    },
    Booking_Status: {
      Name: (data.Booking_Status as any).Name
    }
  }

  return transformedData;
};
