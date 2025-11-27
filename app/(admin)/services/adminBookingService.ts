export const createWalkInBookingService = async (bookingData: any): Promise<{ success: boolean; booking: any }> => {
  const response = await fetch('/api/admin/bookings/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(bookingData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to create booking");
  }

  return await response.json();
};
