import { createClient } from "@/utils/supabase/client";
import { BookingData } from "@/types"; // Ensure this type is updated if needed, or use 'any' for flexibility here

const supabase = createClient();

export const createBooking = async (bookingData: any) => {
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
    
    // Step 1: Insert into Customer table
    console.log("Inserting customer:", {
      First_Name: bookingData.personalInfo.firstName,
      Last_Name: bookingData.personalInfo.lastName,
      Email: bookingData.personalInfo.email,
      Contact_Number: bookingData.personalInfo.mobileNumber
    });

    // Check if customer exists or just create new one? 
    // Assuming simple create for now based on previous context.
    const { data: customerData, error: customerError } = await supabase
      .from('Customer')
      .insert([
        {
          First_Name: bookingData.personalInfo.firstName,
          Last_Name: bookingData.personalInfo.lastName,
          Suffix: bookingData.personalInfo.suffix,
          Email: bookingData.personalInfo.email,
          Contact_Number: bookingData.personalInfo.mobileNumber,
        }
      ])
      .select('Customer_ID');

    if (customerError) {
      console.error("Customer insertion error details:", customerError);
      throw new Error(`Customer creation failed: ${customerError.message}`);
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
      // Fallback if end date is explicitly provided in a different format, 
      // though your current logic relies on duration.
      endDateTime = new Date(`${bookingData.rentalInfo.endDate}T${bookingData.rentalInfo.time}`).toISOString();
    }

    const hasChauffer = bookingData.rentalInfo.selfDrive === "No";

    // Step 2: Insert into Booking_Details table using Secure RPC
    // This bypasses RLS SELECT restrictions by running as Security Definer on the DB
    const { data: bookingDetailsData, error: bookingError } = await supabase
      .rpc('create_new_booking', {
        p_customer_id: customerId,
        p_start_date: startDateTime,
        p_end_date: endDateTime,
        p_model_id: bookingData.selectedCar,
        p_duration: convertDurationToHours(bookingData.rentalInfo.duration),
        p_chauffer: hasChauffer,
        p_location: bookingData.rentalInfo.area,
        p_notification_preference: bookingData.notificationPreference
      });

    if (bookingError) {
      console.error("Booking details insertion error:", bookingError);
      throw new Error(`Booking creation failed: ${bookingError.message}`);
    }
    
    // RPC returns the object directly or wrapped, ensuring we have the object
    const finalBookingData = bookingDetailsData;

    return {
      customer: customerData[0],
      booking: finalBookingData
    };
  } catch (error) {
    console.error("Error creating booking:", error);
    throw error;
  }
};