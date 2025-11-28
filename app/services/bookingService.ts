import { createClient } from '@/utils/supabase/client';

export type BookingProcessResult = {
  success: boolean;
  bookingId: string;
  message?: string;
  error?: any;
};

// --- Admin Actions (Delegated to Admin API Route) ---

const callStatusApi = async (bookingIds: string[], action: string, payload?: any): Promise<BookingProcessResult[]> => {
  try {
    const response = await fetch('/api/admin/bookings/status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingIds, action, payload }), // Pass payload
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

export const approveBookingsService = async (bookingIds: string[]) => callStatusApi(bookingIds, 'approve');
export const declineBookingsService = async (bookingIds: string[]) => callStatusApi(bookingIds, 'decline');
export const startBookingsService = async (bookingIds: string[]) => callStatusApi(bookingIds, 'start');

export interface FinishBookingPayload {
  dateReturned: string;
  additionalHours: number; // Added
  additionalFees: number; // For the Payment_Details record
  totalPayment: number; // For the Payment_Details record
  paymentStatus: string; // For the Payment_Details record
}
export const finishBookingsService = async (bookingIds: string[], finishPayload: FinishBookingPayload) => callStatusApi(bookingIds, 'finish', finishPayload);

export const cancelBookingsService = async (bookingIds: string[]) => callStatusApi(bookingIds, 'cancel');

// --- User Actions ---

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
 * Sends a confirmation notification.
 * Supports multiple methods simultaneously (e.g., "SMS, Email").
 */
export const sendBookingConfirmationService = async (
  bookingId: string,
  totalAmount: number,
  status: string,
  firstName: string,
  email: string,
  mobileNumber: string,
  bfReferenceNumber: string, // Changed from referenceNumber
  notificationType: string // Changed from strict union to string to allow "SMS, Email"
): Promise<{ success: boolean; error?: any }> => {
  try {
    const message = `Hi ${firstName}, your booking (ID: ${bookingId}) is currently ${status}. Total: P${totalAmount}. Ref: ${bfReferenceNumber}. We will notify you once confirmed!`;
    const subject = "Booking Confirmation";

    let formattedNumber = mobileNumber;
    if (formattedNumber.startsWith('0')) {
        formattedNumber = '+63' + formattedNumber.substring(1);
    }

    const promises = [];

    // 1. Check if SMS is requested
    if (notificationType.includes('SMS')) {
      promises.push(
        fetch('/api/sms', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ to: formattedNumber, text: message })
        })
      );
    } 
    
    // 2. Check if Email is requested (Independent check, allows both)
    if (notificationType.includes('Email')) {
      const html = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Booking Confirmation</h2>
          <p>Hi ${firstName},</p>
          <p>Thank you for your booking. We have received your request.</p>
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Booking ID:</strong> ${bookingId}</p>
            <p style="margin: 5px 0;"><strong>Status:</strong> ${status}</p>
            <p style="margin: 5px 0;"><strong>Total Amount:</strong> P${totalAmount}</p>
            <p style="margin: 5px 0;"><strong>Reference Number:</strong> ${bfReferenceNumber}</p>
          </div>
          <p>We will review your booking and notify you once it is confirmed.</p>
          <br/>
          <p>Thank you!</p>
        </div>
      `;
      
      promises.push(
        fetch('/api/email', { 
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ to: email, subject, html })
        })
      );
    }

    // Wait for all selected notifications to attempt sending
    await Promise.all(promises);

    return { success: true };
  } catch (error) {
    console.error("Confirmation Send Error:", error);
    // Return success: false, but in a real app you might want to know *which* failed
    return { success: false, error };
  }
};

export const extendBookingService = async (bookingId: string, newEndDate: string) => {
  try {
    const response = await fetch('/api/admin/bookings/extend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId, newEndDate }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to extend booking');
    }

    return { success: true };
  } catch (error: any) {
    console.error("Extend Service Error:", error);
    return { success: false, error: error.message };
  }
};