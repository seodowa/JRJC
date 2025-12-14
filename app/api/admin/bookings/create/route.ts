import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/utils/supabase/admin';
import { BookingData } from "@/types";
import { verifyAdmin, unauthorizedResponse } from "@/lib/auth";

export async function POST(req: Request) {
  // 1. Verify Admin Session
  const session = await verifyAdmin();
  if (!session) {
    return unauthorizedResponse();
  }

  try {
    const bookingData: BookingData = await req.json();

    const convertDurationToHours = (duration: string): number => {
        if (duration === "12 hours") return 12;
        if (duration === "24 hours") return 24;
        if (duration.includes("days")) {
            const days = parseInt(duration);
            return days * 24;
        }
        return 0; 
    };
    
    // Step 1: Insert into Customer table
    const { data: customerData, error: customerError } = await supabaseAdmin
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
      .select('Customer_ID')
      .single();

    if (customerError) {
        console.error("Customer Insert Error:", customerError);
        throw new Error(`Customer creation failed: ${customerError.message}`);
    }

    const customerId = customerData.Customer_ID;

    // Step 2: Insert into Payment_Details table
    const { data: paymentDetailsData, error: paymentError } = await supabaseAdmin
      .from('Payment_Details')
      .insert([
        {
          booking_fee: bookingData.paymentInfo.bookingFee,
          initial_total_payment: bookingData.paymentInfo.initialTotalPayment,
          bf_reference_number: bookingData.paymentInfo.bfReferenceNumber,
          payment_status: 'Not Paid', // Default, will be updated on car return
        }
      ])
      .select('Payment_ID')
      .single();

    if (paymentError) {
      console.error("Payment Details Insert Error:", paymentError);
      throw new Error(`Payment details creation failed: ${paymentError.message}`);
    }

    const paymentId = paymentDetailsData.Payment_ID;

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

    // Step 3: Insert into Booking_Details table
    const { data: bookingDetailsData, error: bookingError } = await supabaseAdmin
      .from('Booking_Details')
      .insert([
        {
          Customer_ID: customerId,
          Booking_Start_Date_Time: startDateTime,
          Booking_End_Date_Time: endDateTime,
          Model_ID: bookingData.selectedCar,
          Duration: convertDurationToHours(bookingData.rentalInfo.duration),
          Chauffer: hasChauffer,
          Payment_Details_ID: paymentId, // Link to the new Payment_Details record
          Booking_Status_ID: bookingData.bookingStatusId || 1, 
          Location: bookingData.rentalInfo.area,
        }
      ])
      .select()
      .single();

    if (bookingError) {
        console.error("Booking Insert Error:", bookingError);
        throw new Error(`Booking creation failed: ${bookingError.message}`);
    }

    return NextResponse.json({
      customer: customerData,
      booking: bookingDetailsData
    });

  } catch (error: any) {
    console.error('Admin Create Booking Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
