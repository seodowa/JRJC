import { createClient } from '@/utils/supabase/client';

export type BookingProcessResult = {
  success: boolean;
  bookingId: string;
  message?: string;
  error?: any;
};

// --- Admin Actions (Delegated to Admin API Route) ---

/**
 * Generic helper to call the admin status update API route.
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

    return data.results.map((r: any) => ({
      success: r.success,
      bookingId: r.bookingId,
      message: r.success ? `Successfully ${action}ed` : r.error
    }));
  } catch (error: any) {
    console.error(`API Error during ${action}:`, error);
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

// --- User Actions ---

/**
 * Cancels a single booking (User initiated).
 * Calls the public cancellation API route.
 */
export const cancelBookingService = async (bookingId: string): Promise<BookingProcessResult> => {
  try {
    const response = await fetch('/api/bookings/cancel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, bookingId, error: data.error };
    }

    return { success: true, bookingId, message: "Booking cancelled successfully" };

  } catch (error: any) {
    console.error("Client Cancellation Error:", error);
    return { success: false, bookingId, error: error.message };
  }
};

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

    let formattedNumber = mobileNumber;
    if (formattedNumber.startsWith('0')) {
        formattedNumber = '+63' + formattedNumber.substring(1);
    }

    if (notificationType === 'SMS') {
      // Send SMS
      await fetch('/api/sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: formattedNumber, text: message })
      });
    } else {
      // Send Email
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
      
      await fetch('/api/email', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: email, subject, html })
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Confirmation Send Error:", error);
    return { success: false, error };
  }
};
