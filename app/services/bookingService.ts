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
      const { error: updateError } = await supabase
        .from('Booking_Details')
        .update({ Booking_Status_ID: 2 })
        .eq('Booking_ID', bookingId);

      if (updateError) {
        console.error(`Failed to update booking ${bookingId}`, updateError);
        results.push({ success: false, bookingId, error: updateError });
        continue;
      }

      const { data: customerData, error: fetchError } = await supabase
        .from('Booking_Details')
        .select(`Customer (Contact_Number, First_Name)`)
        .eq('Booking_ID', bookingId)
        .single();

      if (!fetchError) {
        const customer = (customerData as any)?.Customer;
        if (customer?.Contact_Number) {
          await sendSMS(customer.Contact_Number, `Hi ${customer.First_Name || 'Customer'}, Good news! Your booking (ID: ${bookingId}) has been APPROVED. See you soon!`);
        }
      }
      results.push({ success: true, bookingId, message: "Approved and SMS sent" });
    } catch (error) {
      results.push({ success: false, bookingId, error });
    }
  }
  return results;
};

/**
 * Declines a list of bookings: Updates DB status to 6 (Declined) and sends SMS.
 */
export const declineBookingsService = async (
  bookingIds: string[]
): Promise<BookingProcessResult[]> => {
  const supabase = createClient();
  const results: BookingProcessResult[] = [];

  for (const bookingId of bookingIds) {
    try {
      const { error: updateError } = await supabase
        .from('Booking_Details')
        .update({ Booking_Status_ID: 6 }) 
        .eq('Booking_ID', bookingId);

      if (updateError) {
        results.push({ success: false, bookingId, error: updateError });
        continue;
      }

      const { data: customerData, error: fetchError } = await supabase
        .from('Booking_Details')
        .select(`Customer (Contact_Number, First_Name)`)
        .eq('Booking_ID', bookingId)
        .single();

      if (!fetchError) {
        const customer = (customerData as any)?.Customer;
        if (customer?.Contact_Number) {
          await sendSMS(customer.Contact_Number, `Hi ${customer.First_Name || 'Customer'}, we regret to inform you that your booking (ID: ${bookingId}) has been DECLINED. Please contact us for details.`);
        }
      }
      results.push({ success: true, bookingId, message: "Declined and SMS sent" });
    } catch (error) {
      results.push({ success: false, bookingId, error });
    }
  }
  return results;
};

/**
 * Starts a list of bookings: Updates DB status to 3 (Ongoing) and sends SMS.
 */
export const startBookingsService = async (
  bookingIds: string[]
): Promise<BookingProcessResult[]> => {
  const supabase = createClient();
  const results: BookingProcessResult[] = [];

  for (const bookingId of bookingIds) {
    try {
      // 1. Update Status to 3 (Ongoing)
      const { error: updateError } = await supabase
        .from('Booking_Details')
        .update({ Booking_Status_ID: 3 }) 
        .eq('Booking_ID', bookingId);

      if (updateError) {
        results.push({ success: false, bookingId, error: updateError });
        continue;
      }

      // 2. Fetch Customer Info
      const { data: customerData, error: fetchError } = await supabase
        .from('Booking_Details')
        .select(`Customer (Contact_Number, First_Name)`)
        .eq('Booking_ID', bookingId)
        .single();

      if (!fetchError) {
        const customer = (customerData as any)?.Customer;
        if (customer?.Contact_Number) {
          // 3. Send "Ongoing/Started" SMS
          await sendSMS(customer.Contact_Number, `Hi ${customer.First_Name || 'Customer'}, your rental (ID: ${bookingId}) has officially STARTED. Drive safely!`);
        }
      }
      results.push({ success: true, bookingId, message: "Started and SMS sent" });
    } catch (error) {
      results.push({ success: false, bookingId, error });
    }
  }
  return results;
};

/**
 * Finishes a list of bookings: Updates DB status to 4 (Completed) and sends SMS.
 */
export const finishBookingsService = async (
  bookingIds: string[]
): Promise<BookingProcessResult[]> => {
  const supabase = createClient();
  const results: BookingProcessResult[] = [];

  for (const bookingId of bookingIds) {
    try {
      // 1. Update Status to 4 (Completed)
      const { error: updateError } = await supabase
        .from('Booking_Details')
        .update({ Booking_Status_ID: 4 })
        .eq('Booking_ID', bookingId);

      if (updateError) {
        results.push({ success: false, bookingId, error: updateError });
        continue;
      }

      // 2. Fetch Customer Info
      const { data: customerData, error: fetchError } = await supabase
        .from('Booking_Details')
        .select(`Customer (Contact_Number, First_Name)`)
        .eq('Booking_ID', bookingId)
        .single();

      if (!fetchError) {
        const customer = (customerData as any)?.Customer;
        if (customer?.Contact_Number) {
          // 3. Send "Completed/Finished" SMS
          await sendSMS(customer.Contact_Number, `Hi ${customer.First_Name || 'Customer'}, your booking (ID: ${bookingId}) has been COMPLETED. Thank you for choosing us!`);
        }
      }
      results.push({ success: true, bookingId, message: "Finished and SMS sent" });
    } catch (error) {
      results.push({ success: false, bookingId, error });
    }
  }
  return results;
};

/**
 * Cancels a list of bookings (Admin Batch): Updates DB status to 5 (Canceled) and sends SMS.
 */
export const cancelBookingsService = async (
  bookingIds: string[]
): Promise<BookingProcessResult[]> => {
  const supabase = createClient();
  const results: BookingProcessResult[] = [];

  for (const bookingId of bookingIds) {
    try {
      // 1. Update Status to 5 (Canceled)
      const { error: updateError } = await supabase
        .from('Booking_Details')
        .update({ Booking_Status_ID: 5 }) 
        .eq('Booking_ID', bookingId);

      if (updateError) {
        results.push({ success: false, bookingId, error: updateError });
        continue;
      }

      // 2. Fetch Customer Info
      const { data: customerData, error: fetchError } = await supabase
        .from('Booking_Details')
        .select(`Customer (Contact_Number, First_Name)`)
        .eq('Booking_ID', bookingId)
        .single();

      if (!fetchError) {
        const customer = (customerData as any)?.Customer;
        if (customer?.Contact_Number) {
          // 3. Send "Cancelled" SMS
          await sendSMS(customer.Contact_Number, `Hi ${customer.First_Name || 'Customer'}, your booking (ID: ${bookingId}) has been CANCELLED by the admin. Please contact us if this is a mistake.`);
        }
      }
      results.push({ success: true, bookingId, message: "Cancelled and SMS sent" });
    } catch (error) {
      results.push({ success: false, bookingId, error });
    }
  }
  return results;
};

/**
 * Cancels a single booking (User initiated): Updates DB status to 5 (Canceled) and sends SMS.
 */
export const cancelBookingService = async (
  bookingId: string
): Promise<BookingProcessResult> => {
  // Re-using the logic for single items, mapping to status 5
  const result = await cancelBookingsService([bookingId]);
  return result[0];
};

// --- Helper for SMS ---
const sendSMS = async (number: string, text: string) => {
  let formattedNumber = number;
  if (formattedNumber.startsWith('0')) {
    formattedNumber = '+63' + formattedNumber.substring(1);
  }
  try {
    await fetch('/api/sms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to: formattedNumber, text })
    });
  } catch (e) {
    console.error("SMS Send Error", e);
  }
};

export const sendBookingConfirmationService = async (
  bookingId: string,
  totalAmount: number,
  status: string,
  firstName: string,
  mobileNumber: string,
  referenceNumber: string
): Promise<{ success: boolean; error?: any }> => {
  try {
    const message = `Hi ${firstName}, your booking (ID: ${bookingId}) is currently ${status}. Total: P${totalAmount}. Ref: ${referenceNumber}. We will notify you once confirmed!`;
    await sendSMS(mobileNumber, message);
    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
};