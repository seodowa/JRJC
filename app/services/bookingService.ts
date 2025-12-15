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

// --- Individual Admin Actions ---

export const markBookingReturnedService = async (bookingId: string) => {
  try {
    const response = await fetch('/api/admin/bookings/return', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId }),
    });
    
    const data = await response.json();
    
    if (!response.ok) throw new Error(data.error || 'Failed to mark returned');
    
    return { success: true, data };
  } catch (error: any) {
    console.error("Mark Returned Service Error:", error);
    return { success: false, error: error.message };
  }
};

interface UpdatePaymentPayload {
  paymentId: number;
  status: string;
  additionalFees: number;
  totalPayment: number;
}

export const updatePaymentStatusService = async (payload: UpdatePaymentPayload) => {
  try {
    const response = await fetch('/api/admin/bookings/update-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) throw new Error(data.error || 'Failed to update payment');

    return { success: true, data };
  } catch (error: any) {
    console.error("Update Payment Service Error:", error);
    return { success: false, error: error.message };
  }
};

// --- User Actions ---

export const requestCancelOTPService = async (bookingId: string) => {
  try {
    const response = await fetch('/api/bookings/cancel/request-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to request OTP');
    }

    return { success: true, message: data.message };
  } catch (error: any) {
    console.error("Request OTP Error:", error);
    return { success: false, error: error.message };
  }
};

export const cancelBookingService = async (bookingId: string, otp: string): Promise<BookingProcessResult> => {
  try {
    const response = await fetch('/api/bookings/cancel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId, otp }),
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
  bfReferenceNumber: string,
  notificationType: string
): Promise<{ success: boolean; error?: any }> => {
  try {
    // UPDATED: SMS Message with reminders
    const message = `Hi ${firstName}, booking (ID: ${bookingId}) received. Status: ${status}. Total: P${totalAmount}. Ref: ${bfReferenceNumber}. Reminders: Booking fee is non-refundable. Keep posted and we will notify you once confirmed.`;
    
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
    
    // 2. Check if Email is requested
    if (notificationType.includes('Email')) {
      // UPDATED: Email HTML with Reminders section
      const html = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Booking Received</h2>
          <p>Hi ${firstName},</p>
          <p>Thank you for your booking. We have received your request.</p>
          
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Booking ID:</strong> ${bookingId}</p>
            <p style="margin: 5px 0;"><strong>Status:</strong> ${status}</p>
            <p style="margin: 5px 0;"><strong>Total Amount:</strong> P${totalAmount}</p>
            <p style="margin: 5px 0;"><strong>Reference Number:</strong> ${bfReferenceNumber}</p>
          </div>

          <div style="border-top: 1px solid #eee; padding-top: 15px; margin-top: 20px;">
            <p style="font-weight: bold; color: #555;">Reminders:</p>
            <ul style="color: #666; padding-left: 20px;">
                <li style="margin-bottom: 5px;">Booking fee is non-refundable.</li>
                <li>Keep posted and we will notify you once the booking has been confirmed.</li>
            </ul>
          </div>

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