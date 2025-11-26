export type BookingProcessResult = {
  success: boolean;
  bookingId: string;
  message?: string;
  error?: any;
};

const updateBookingStatus = async (bookingIds: string[], action: string): Promise<BookingProcessResult[]> => {
  try {
    const response = await fetch('/api/admin/bookings/status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingIds, action })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update status');
    }

    const { results } = await response.json();
    return results;
  } catch (error) {
    console.error(`Error performing action ${action}:`, error);
    return bookingIds.map(id => ({
      success: false,
      bookingId: id,
      error: error instanceof Error ? error.message : 'Unknown error'
    }));
  }
};

/**
 * Approves a list of bookings: Updates DB status to 2 (Confirmed) and sends SMS.
 */
export const approveBookingsService = async (
  bookingIds: string[]
): Promise<BookingProcessResult[]> => {
  return updateBookingStatus(bookingIds, 'approve');
};

/**
 * Declines a list of bookings: Updates DB status to 6 (Declined) and sends SMS.
 */
export const declineBookingsService = async (
  bookingIds: string[]
): Promise<BookingProcessResult[]> => {
  return updateBookingStatus(bookingIds, 'decline');
};

/**
 * Starts a list of bookings: Updates DB status to 3 (Ongoing) and sends SMS.
 */
export const startBookingsService = async (
  bookingIds: string[]
): Promise<BookingProcessResult[]> => {
  return updateBookingStatus(bookingIds, 'start');
};

/**
 * Finishes a list of bookings: Updates DB status to 4 (Completed) and sends SMS.
 */
export const finishBookingsService = async (
  bookingIds: string[]
): Promise<BookingProcessResult[]> => {
  return updateBookingStatus(bookingIds, 'finish');
};

/**
 * Cancels a list of bookings (Admin Batch): Updates DB status to 5 (Canceled) and sends SMS.
 */
export const cancelBookingsService = async (
  bookingIds: string[]
): Promise<BookingProcessResult[]> => {
  return updateBookingStatus(bookingIds, 'cancel');
};

/**
 * Cancels a single booking (User initiated): Updates DB status to 5 (Canceled) and sends SMS.
 */
export const cancelBookingService = async (
  bookingId: string
): Promise<BookingProcessResult> => {
  const result = await cancelBookingsService([bookingId]);
  return result[0];
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
    // Use the new helper for SMS sending which is now centralized in the API or reusable utility if accessible, 
    // but since this is client-side, we call the API.
    let formattedNumber = mobileNumber;
    if (formattedNumber.startsWith('0')) {
      formattedNumber = '+63' + formattedNumber.substring(1);
    }
    
    await fetch('/api/sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: formattedNumber, text: message })
    });

    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
};