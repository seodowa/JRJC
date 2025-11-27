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

// --- Admin Actions (Delegated to API Route) ---

/**
 * Generic helper to call the status update API route.
 * This replaces the client-side DB updates and SMS logic for admin actions.
 */
const callStatusApi = async (bookingIds: string[], action: string): Promise<BookingProcessResult[]> => {
  try {
    const response = await fetch('/api/admin/bookings/status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingIds, action }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `Failed to ${action} bookings`);
    }

    // Map the API results back to our service format
    return data.results.map((r: any) => ({
      success: r.success,
      bookingId: r.bookingId,
      message: r.success ? `Successfully ${action}ed` : r.error
    }));
  } catch (error: any) {
    console.error(`API Error during ${action}:`, error);
    // Fail all if the API call itself blows up
    return bookingIds.map(id => ({
      success: false,
      bookingId: id,
      error: error.message
    }));
  }
};

export const approveBookingsService = async (bookingIds: string[]) => {
  return callStatusApi(bookingIds, 'approve');
};

export const declineBookingsService = async (bookingIds: string[]) => {
  return callStatusApi(bookingIds, 'decline');
};

export const startBookingsService = async (bookingIds: string[]) => {
  return callStatusApi(bookingIds, 'start');
};

export const finishBookingsService = async (bookingIds: string[]) => {
  return callStatusApi(bookingIds, 'finish');
};

export const cancelBookingsService = async (bookingIds: string[]) => {
  return callStatusApi(bookingIds, 'cancel');
};

/**
 * Cancels a single booking (User initiated).
 * Note: Users might not have access to the admin API route depending on your RLS/Auth.
 * If this fails for normal users, you might need a separate user-facing route or keep the old logic here.
 * Assuming this is for admins mostly, or the route handles user permissions.
 */
export const cancelBookingService = async (bookingId: string): Promise<BookingProcessResult> => {
  const results = await cancelBookingsService([bookingId]);
  return results[0];
};

// --- User Actions (Client-Side logic for New Bookings) ---

/**
 * Sends a confirmation notification (SMS or Email) for a newly created booking.
 * This runs on the client immediately after the user submits the booking form.
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

    if (notificationType === 'SMS') {
      await sendSMS(mobileNumber, message);
    } else {
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