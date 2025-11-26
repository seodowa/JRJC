import { createClient } from '@/utils/supabase/client';

export type BookingProcessResult = {
  success: boolean;
  bookingId: string;
  message?: string;
  error?: any;
};

// --- Helpers ---

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

const sendEmail = async (to: string, subject: string, html: string) => {
  try {
    await fetch('/api/email', { 
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to, subject, html })
    });
  } catch (e) {
    console.error("Email Send Error", e);
  }
};

const handleNotification = async (
  customer: any, 
  booking: any, // Added booking object to check preference
  message: string, 
  subject: string
) => {
  // Determine preference: Check Booking_Details first, default to SMS
  // Assuming the column in Booking_Details is 'Notification_Preference' (values: 'SMS' or 'Email')
  const preference = booking?.Notification_Preference || 'SMS';

  if (preference === 'SMS' && customer?.Contact_Number) {
    await sendSMS(customer.Contact_Number, message);
  } else if (preference === 'Email' && customer?.Email) {
    // Simple HTML wrapper for the message
    const html = `
      <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eaeaea; border-radius: 5px;">
        <h2>${subject}</h2>
        <p>${message}</p>
        <br/>
        <p>Thank you,</p>
        <p>The Team</p>
      </div>
    `;
    await sendEmail(customer.Email, subject, html);
  } else {
    // Fallback: If preference is Email but no email exists, try SMS, and vice-versa
    if (customer?.Contact_Number) await sendSMS(customer.Contact_Number, message);
    else if (customer?.Email) await sendEmail(customer.Email, subject, `<p>${message}</p>`);
  }
};

/**
 * Approves a list of bookings: Updates DB status to 2 (Confirmed).
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

      // Fetch Customer info AND the Notification_Preference from the booking
      const { data: bookingData, error: fetchError } = await supabase
        .from('Booking_Details')
        .select(`
          Notification_Preference,
          Customer (Contact_Number, First_Name, Email)
        `)
        .eq('Booking_ID', bookingId)
        .single();

      if (!fetchError && bookingData) {
        const customer = (bookingData as any)?.Customer;
        const message = `Hi ${customer?.First_Name || 'Customer'}, Good news! Your booking (ID: ${bookingId}) has been APPROVED. See you soon!`;
        
        await handleNotification(customer, bookingData, message, "Booking Approved");
      }
      results.push({ success: true, bookingId, message: "Approved and notification sent" });
    } catch (error) {
      results.push({ success: false, bookingId, error });
    }
  }
  return results;
};

/**
 * Declines a list of bookings: Updates DB status to 6 (Declined).
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

      const { data: bookingData, error: fetchError } = await supabase
        .from('Booking_Details')
        .select(`
          Notification_Preference,
          Customer (Contact_Number, First_Name, Email)
        `)
        .eq('Booking_ID', bookingId)
        .single();

      if (!fetchError && bookingData) {
        const customer = (bookingData as any)?.Customer;
        const message = `Hi ${customer?.First_Name || 'Customer'}, we regret to inform you that your booking (ID: ${bookingId}) has been DECLINED. Please contact us for details.`;
        await handleNotification(customer, bookingData, message, "Booking Declined");
      }
      results.push({ success: true, bookingId, message: "Declined and notification sent" });
    } catch (error) {
      results.push({ success: false, bookingId, error });
    }
  }
  return results;
};

/**
 * Starts a list of bookings: Updates DB status to 3 (Ongoing).
 */
export const startBookingsService = async (
  bookingIds: string[]
): Promise<BookingProcessResult[]> => {
  const supabase = createClient();
  const results: BookingProcessResult[] = [];

  for (const bookingId of bookingIds) {
    try {
      const { error: updateError } = await supabase
        .from('Booking_Details')
        .update({ Booking_Status_ID: 3 }) 
        .eq('Booking_ID', bookingId);

      if (updateError) {
        results.push({ success: false, bookingId, error: updateError });
        continue;
      }

      const { data: bookingData, error: fetchError } = await supabase
        .from('Booking_Details')
        .select(`
          Notification_Preference,
          Customer (Contact_Number, First_Name, Email)
        `)
        .eq('Booking_ID', bookingId)
        .single();

      if (!fetchError && bookingData) {
        const customer = (bookingData as any)?.Customer;
        const message = `Hi ${customer?.First_Name || 'Customer'}, your rental (ID: ${bookingId}) has officially STARTED. Drive safely!`;
        await handleNotification(customer, bookingData, message, "Rental Started");
      }
      results.push({ success: true, bookingId, message: "Started and notification sent" });
    } catch (error) {
      results.push({ success: false, bookingId, error });
    }
  }
  return results;
};

/**
 * Finishes a list of bookings: Updates DB status to 4 (Completed).
 */
export const finishBookingsService = async (
  bookingIds: string[]
): Promise<BookingProcessResult[]> => {
  const supabase = createClient();
  const results: BookingProcessResult[] = [];

  for (const bookingId of bookingIds) {
    try {
      const { error: updateError } = await supabase
        .from('Booking_Details')
        .update({ Booking_Status_ID: 4 })
        .eq('Booking_ID', bookingId);

      if (updateError) {
        results.push({ success: false, bookingId, error: updateError });
        continue;
      }

      const { data: bookingData, error: fetchError } = await supabase
        .from('Booking_Details')
        .select(`
          Notification_Preference,
          Customer (Contact_Number, First_Name, Email)
        `)
        .eq('Booking_ID', bookingId)
        .single();

      if (!fetchError && bookingData) {
        const customer = (bookingData as any)?.Customer;
        const message = `Hi ${customer?.First_Name || 'Customer'}, your booking (ID: ${bookingId}) has been COMPLETED. Thank you for choosing us!`;
        await handleNotification(customer, bookingData, message, "Booking Completed");
      }
      results.push({ success: true, bookingId, message: "Finished and notification sent" });
    } catch (error) {
      results.push({ success: false, bookingId, error });
    }
  }
  return results;
};

/**
 * Cancels a list of bookings (Admin Batch): Updates DB status to 5 (Canceled).
 */
export const cancelBookingsService = async (
  bookingIds: string[]
): Promise<BookingProcessResult[]> => {
  const supabase = createClient();
  const results: BookingProcessResult[] = [];

  for (const bookingId of bookingIds) {
    try {
      const { error: updateError } = await supabase
        .from('Booking_Details')
        .update({ Booking_Status_ID: 5 }) 
        .eq('Booking_ID', bookingId);

      if (updateError) {
        results.push({ success: false, bookingId, error: updateError });
        continue;
      }

      const { data: bookingData, error: fetchError } = await supabase
        .from('Booking_Details')
        .select(`
          Notification_Preference,
          Customer (Contact_Number, First_Name, Email)
        `)
        .eq('Booking_ID', bookingId)
        .single();

      if (!fetchError && bookingData) {
        const customer = (bookingData as any)?.Customer;
        const message = `Hi ${customer?.First_Name || 'Customer'}, your booking (ID: ${bookingId}) has been CANCELLED by the admin. Please contact us if this is a mistake.`;
        await handleNotification(customer, bookingData, message, "Booking Cancelled");
      }
      results.push({ success: true, bookingId, message: "Cancelled and notification sent" });
    } catch (error) {
      results.push({ success: false, bookingId, error });
    }
  }
  return results;
};

/**
 * Cancels a single booking (User initiated): Updates DB status to 5 (Canceled).
 */
export const cancelBookingService = async (
  bookingId: string
): Promise<BookingProcessResult> => {
  const result = await cancelBookingsService([bookingId]);
  return result[0];
};

/**
 * Sends a confirmation notification (SMS or Email) for a newly created booking.
 * NOTE: This is usually called immediately after creation, so we pass the preference directly
 * instead of fetching it again.
 */
export const sendBookingConfirmationService = async (
  bookingId: string,
  totalAmount: number,
  status: string,
  firstName: string,
  email: string,
  mobileNumber: string,
  referenceNumber: string,
  notificationType: 'SMS' | 'Email'
): Promise<{ success: boolean; error?: any }> => {
  try {
    const message = `Hi ${firstName}, your booking (ID: ${bookingId}) is currently ${status}. Total: P${totalAmount}. Ref: ${referenceNumber}. We will notify you once confirmed!`;
    const subject = "Booking Confirmation";

    // We use the passed preference directly here since it comes from the form
    if (notificationType === 'SMS') {
      await sendSMS(mobileNumber, message);
    } else {
      // HTML for email
      const html = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Booking Confirmation</h2>
          <p>Hi ${firstName},</p>
          <p>Thank you for your booking. We have received your request.</p>
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Booking ID:</strong> ${bookingId}</p>
            <p style="margin: 5px 0;"><strong>Status:</strong> ${status}</p>
            <p style="margin: 5px 0;"><strong>Total Amount:</strong> P${totalAmount}</p>
            <p style="margin: 5px 0;"><strong>Reference Number:</strong> ${referenceNumber}</p>
          </div>
          <p>We will review your booking and notify you once it is confirmed.</p>
          <br/>
          <p>Thank you!</p>
        </div>
      `;
      await sendEmail(email, subject, html);
    }

    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
};