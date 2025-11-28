import { createClient } from "@/utils/supabase/client";
// Ensure this type is updated if needed, or use 'any' for flexibility here
// import { BookingData } from "@/types"; 

const supabase = createClient();

export const createBooking = async (bookingData: any) => {
  try {
    console.log("Starting booking creation...");
    console.log("Booking Data Received:", bookingData);

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

    // --- DATE CALCULATION FIX START ---
    
    // 1. Construct startDateTime manually using string interpolation.
    // This preserves the exact date/time selected by the user without UTC conversion shifts.
    const startDateTime = `${bookingData.rentalInfo.startDate}T${bookingData.rentalInfo.time}:00`;
    console.log("Calculated startDateTime (Local):", startDateTime);

    // 2. Calculate endDateTime
    let endDateTime: string;
    
    // Helper to format a Date object back to "YYYY-MM-DDTHH:mm:ss" in LOCAL time
    const formatLocalDateTime = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
    };

    if (bookingData.rentalInfo.duration === "12 hours" || 
        bookingData.rentalInfo.duration === "24 hours" || 
        bookingData.rentalInfo.duration.includes("days")) {
        
        const startDateObj = new Date(startDateTime);
        const durationHours = convertDurationToHours(bookingData.rentalInfo.duration);
        
        // Add duration to the date object
        startDateObj.setHours(startDateObj.getHours() + durationHours);
        
        // Format back to string
        endDateTime = formatLocalDateTime(startDateObj);
        
    } else {
      // Fallback: If specific end date provided, format it manually too
      endDateTime = `${bookingData.rentalInfo.endDate}T${bookingData.rentalInfo.time}:00`;
    }
    
    // --- DATE CALCULATION FIX END ---

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
        p_notification_preference: bookingData.notificationPreference,
        // New Payment Parameters
        p_booking_fee: bookingData.paymentInfo.bookingFee,
        p_initial_total_payment: bookingData.paymentInfo.initialTotalPayment,
        p_bf_reference_number: bookingData.paymentInfo.bfReferenceNumber
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