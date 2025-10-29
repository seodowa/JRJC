// utils/supabase/booking.ts
import { createClient } from "@/utils/supabase/client";
import { BookingData, BookingStatus } from "@/types";

const supabase = createClient();

// utils/supabase/bookingQueries.ts
export const createBooking = async (bookingData: BookingData) => {
 
  
  try {
    console.log("Starting booking creation...");

    const convertDurationToHours = (duration: string): number => {
        if (duration === "12 hours") return 12;
        if (duration === "24 hours") return 24;
        if (duration.includes("days")) {
            const days = parseInt(duration);
            return days * 24;
        }
        return 0; // fallback
        };
    
    // Step 1: Insert into Customer table - FIXED COLUMN NAME
    console.log("Inserting customer:", {
      First_Name: bookingData.personalInfo.firstName,
      Last_Name: bookingData.personalInfo.lastName,
      Email: bookingData.personalInfo.email,
      Contact_Number: bookingData.personalInfo.mobileNumber // Make sure this matches your DB
    });

    const { data: customerData, error: customerError } = await supabase
      .from('Customer')
      .insert([
        {
          First_Name: bookingData.personalInfo.firstName,
          Last_Name: bookingData.personalInfo.lastName,
          Suffix: bookingData.personalInfo.suffix,
          Email: bookingData.personalInfo.email,
          Contact_Number: bookingData.personalInfo.mobileNumber, // Fixed column name
        }
      ])
      .select('Customer_ID');

    if (customerError) {
      console.error("Customer insertion error details:", customerError);
      throw new Error(`Customer creation failed: ${customerError.message} - Details: ${customerError.details}`);
    }

    console.log("Customer created successfully:", customerData);

    const customerId = customerData[0].Customer_ID;

    // Calculate timestamps
    const startDateTime = new Date(`${bookingData.rentalInfo.startDate}T${bookingData.rentalInfo.time}`).toISOString();
    
    let endDateTime: string;
    if (bookingData.rentalInfo.duration === "12 hours") {
      endDateTime = new Date(new Date(startDateTime).getTime() + (12 * 60 * 60 * 1000)).toISOString();
    } else if (bookingData.rentalInfo.duration === "24 hours") {
      endDateTime = new Date(new Date(startDateTime).getTime() + (24 * 60 * 60 * 1000)).toISOString();
    } else if (bookingData.rentalInfo.duration.includes("days")) {
      const days = parseInt(bookingData.rentalInfo.duration);
      endDateTime = new Date(new Date(startDateTime).getTime() + (days * 24 * 60 * 60 * 1000)).toISOString();
    } else {
      endDateTime = new Date(`${bookingData.rentalInfo.endDate}T${bookingData.rentalInfo.time}`).toISOString();
    }

    const hasChauffer = bookingData.rentalInfo.selfDrive === "No";

    // Step 2: Insert into Booking_Details table
    const { data: bookingDetailsData, error: bookingError } = await supabase
      .from('Booking_Details')
      .insert([
        {
          Customer_ID: customerId,
          Booking_Start_Date_Time: startDateTime,
          Booking_End_Date_Time: endDateTime,
          Model_ID: bookingData.selectedCar,
          Duration: convertDurationToHours(bookingData.rentalInfo.duration),
          Chauffer: hasChauffer,
          Payment_Details_URL: null,
          Booking_Status_ID: 1,
          Location: bookingData.rentalInfo.area,
        }
      ])
      .select();

    if (bookingError) {
      console.error("Booking details insertion error:", bookingError);
      throw new Error(`Booking creation failed: ${bookingError.message}`);
    }

    return {
      customer: customerData[0],
      booking: bookingDetailsData[0]
    };
  } catch (error) {
    console.error("Error creating booking:", error);
    throw error;
  }
};

// lib/supabase/queries/booking.ts
export const fetchBookedDates = async (carModelId: number) => {
  const { data, error } = await supabase
    .from('Booking_Details')
    .select('Booking_Start_Date_Time, Booking_End_Date_Time')
    .eq('Model_ID', carModelId)
    .in('Booking_Status_ID', [1, 2, 3]) // Adjust these IDs based on your Booking_Status table
    // Assuming: 1 = Confirmed, 2 = Paid, 3 = In Progress, etc.
    // Exclude: 4 = Cancelled, 5 = Completed, etc.

  if (error) {
    console.error('Error fetching booked dates:', error);
    return [];
  }

  return data || [];
};

export const fetchBookings = async (filters: Record<string, any> = {}) => {
  let query = supabase
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
    `);

  // Apply all filters from the filters object
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