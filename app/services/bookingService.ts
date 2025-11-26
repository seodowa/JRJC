import { createClient } from '@/utils/supabase/client';

export type BookingProcessResult = {
  success: boolean;
  bookingId: string;
  message?: string;
  error?: any;
};

/**
 * Approves a list of bookings: Updates DB status to 2 (Confirmed) and sends SMS.
 */
export const approveBookingsService = async (
  bookingIds: string[]
): Promise<BookingProcessResult[]> => {
  const supabase = createClient();
  const results: BookingProcessResult[] = [];

  for (const bookingId of bookingIds) {
    try {
      // 1. Update Status in Database (2 = Confirmed/Approved)
      const { error: updateError } = await supabase
        .from('Booking_Details')
        .update({ Booking_Status_ID: 2 })
        .eq('Booking_ID', bookingId);

      if (updateError) {
        console.error(`Failed to update booking ${bookingId}`, updateError);
        results.push({ success: false, bookingId, error: updateError });
        continue;
      }

      // 2. Fetch Customer Contact Info for SMS
      // We fetch this fresh from the DB because the table view model might not have phone numbers
      const { data: customerData, error: fetchError } = await supabase
        .from('Booking_Details')
        .select(`
          Customer (
            Contact_Number,
            First_Name
          )
        `)
        .eq('Booking_ID', bookingId)
        .single();

      if (fetchError) {
        console.warn(`Booking approved, but could not fetch phone for ${bookingId}`);
        results.push({ success: true, bookingId, message: "Approved, but SMS skipped (No contact info)" });
        continue;
      }

      // 3. Prepare and Send SMS
      const customer = (customerData as any)?.Customer;
      const phone = customer?.Contact_Number;
      const firstName = customer?.First_Name || "Valued Customer";

      if (phone) {
        let formattedNumber = phone;
        // Ensure PH format for SMS API
        if (formattedNumber.startsWith('0')) {
          formattedNumber = '+63' + formattedNumber.substring(1);
        }

        const smsMessage = `Hi ${firstName}, Good news! Your booking (ID: ${bookingId}) has been APPROVED. See you soon!`;

        await fetch('/api/sms', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ to: formattedNumber, text: smsMessage })
        });
      }

      results.push({ success: true, bookingId, message: "Approved and SMS sent" });

    } catch (error) {
      console.error(`Unexpected error processing ${bookingId}:`, error);
      results.push({ success: false, bookingId, error });
    }
  }

  return results;
};

/**
 * Declines a list of bookings: Updates DB status to 3 (Declined) and sends SMS.
 */
export const declineBookingsService = async (
  bookingIds: string[]
): Promise<BookingProcessResult[]> => {
  const supabase = createClient();
  const results: BookingProcessResult[] = [];

  for (const bookingId of bookingIds) {
    try {
      // 1. Update Status in Database (3 = Declined/Cancelled)
      const { error: updateError } = await supabase
        .from('Booking_Details')
        .update({ Booking_Status_ID: 3 }) 
        .eq('Booking_ID', bookingId);

      if (updateError) {
        console.error(`Failed to decline booking ${bookingId}`, updateError);
        results.push({ success: false, bookingId, error: updateError });
        continue;
      }

      // 2. Fetch Customer Contact Info for SMS
      const { data: customerData, error: fetchError } = await supabase
        .from('Booking_Details')
        .select(`
          Customer (
            Contact_Number,
            First_Name
          )
        `)
        .eq('Booking_ID', bookingId)
        .single();

      if (fetchError) {
        console.warn(`Booking declined, but could not fetch phone for ${bookingId}`);
        results.push({ success: true, bookingId, message: "Declined, but SMS skipped (No contact info)" });
        continue;
      }

      // 3. Prepare and Send SMS
      const customer = (customerData as any)?.Customer;
      const phone = customer?.Contact_Number;
      const firstName = customer?.First_Name || "Valued Customer";

      if (phone) {
        let formattedNumber = phone;
        if (formattedNumber.startsWith('0')) {
          formattedNumber = '+63' + formattedNumber.substring(1);
        }

        const smsMessage = `Hi ${firstName}, we regret to inform you that your booking (ID: ${bookingId}) has been DECLINED. Please contact us for more details.`;

        await fetch('/api/sms', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ to: formattedNumber, text: smsMessage })
        });
      }

      results.push({ success: true, bookingId, message: "Declined and SMS sent" });

    } catch (error) {
      console.error(`Unexpected error processing ${bookingId}:`, error);
      results.push({ success: false, bookingId, error });
    }
  }

  return results;
};

/**
 * Cancels a single booking (User initiated): Updates DB status to 3 (Cancelled) and sends SMS.
 */
export const cancelBookingService = async (
  bookingId: string
): Promise<BookingProcessResult> => {
  const supabase = createClient();

  try {
    // 1. Update Status in Database (3 = Cancelled)
    const { error: updateError } = await supabase
      .from('Booking_Details')
      .update({ Booking_Status_ID: 5 })
      .eq('Booking_ID', bookingId);

    if (updateError) {
      console.error(`Failed to cancel booking ${bookingId}`, updateError);
      return { success: false, bookingId, error: updateError };
    }

    // 2. Fetch Customer Contact Info for SMS
    const { data: customerData, error: fetchError } = await supabase
      .from('Booking_Details')
      .select(`
        Customer (
          Contact_Number,
          First_Name
        )
      `)
      .eq('Booking_ID', bookingId)
      .single();

    if (fetchError) {
      console.warn(`Booking cancelled, but could not fetch phone for ${bookingId}`);
      return { success: true, bookingId, message: "Cancelled, but SMS skipped (No contact info)" };
    }

    // 3. Prepare and Send SMS
    const customer = (customerData as any)?.Customer;
    const phone = customer?.Contact_Number;
    const firstName = customer?.First_Name || "Valued Customer";

    if (phone) {
      let formattedNumber = phone;
      if (formattedNumber.startsWith('0')) {
        formattedNumber = '+63' + formattedNumber.substring(1);
      }

      const smsMessage = `Hi ${firstName}, your booking (ID: ${bookingId}) has been successfully CANCELLED.`;

      await fetch('/api/sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: formattedNumber, text: smsMessage })
      });
    }

    return { success: true, bookingId, message: "Cancelled and SMS sent" };

  } catch (error) {
    console.error(`Unexpected error cancelling ${bookingId}:`, error);
    return { success: false, bookingId, error };
  }
};

/**
 * Sends a confirmation SMS for a newly created booking.
 */
export const sendBookingConfirmationService = async (
  bookingId: string,
  totalAmount: number,
  status: string,
  firstName: string,
  mobileNumber: string,
  referenceNumber: string
): Promise<{ success: boolean; error?: any }> => {
  try {
    let formattedNumber = mobileNumber;
    if (formattedNumber.startsWith('0')) {
      formattedNumber = '+63' + formattedNumber.substring(1);
    }

    const message = `Hi ${firstName}, your booking (ID: ${bookingId}) is currently ${status}. Total: P${totalAmount}. Ref: ${referenceNumber}. We will notify you once confirmed!`;

    const res = await fetch('/api/sms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: formattedNumber,
        text: message
      }),
    });

    const data = await res.json();
    if (data.success) {
      return { success: true };
    } else {
      console.warn("SMS Failed:", data.error);
      return { success: false, error: data.error };
    }
  } catch (error) {
    console.error("Error sending confirmation SMS:", error);
    return { success: false, error };
  }
};