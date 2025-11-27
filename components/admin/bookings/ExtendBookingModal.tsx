// components/ExtendBookingModal.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Modal from '@/components/Modal';
import BookingCalendar from '@/components/BookingCalendar';
import AsyncButton from "@/components/AsyncButton";
import { SpecificBookingDetails } from '@/types/adminBooking';
import dayjs from 'dayjs';

interface ExtendBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: SpecificBookingDetails;
  onConfirm: (bookingId: string, newEndDate: string) => Promise<void>;
}

const ExtendBookingModal = ({ isOpen, onClose, booking, onConfirm }: ExtendBookingModalProps) => {
  // Initialize dates
  const [startDate, setStartDate] = useState(dayjs(booking.Booking_Start_Date_Time).format('YYYY-MM-DD'));
  const [endDate, setEndDate] = useState(dayjs(booking.Booking_End_Date_Time).format('YYYY-MM-DD'));
  const [error, setError] = useState<string | null>(null);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setStartDate(dayjs(booking.Booking_Start_Date_Time).format('YYYY-MM-DD'));
      setEndDate(dayjs(booking.Booking_End_Date_Time).format('YYYY-MM-DD'));
      setError(null);
    }
  }, [isOpen, booking]);

  const handleConfirm = async () => {
    if (error) return;
    
    // 1. Get the original time (e.g., "14:30:00")
    const originalTime = dayjs(booking.Booking_End_Date_Time).format('HH:mm:ss');
    
    // 2. Combine the new selected date with the original time
    const finalDateTime = `${endDate}T${originalTime}`;

    // 3. Validation: Ensure the new date is strictly AFTER the old date
    const currentEndObj = dayjs(booking.Booking_End_Date_Time);
    const newEndObj = dayjs(finalDateTime);

    if (newEndObj.isBefore(currentEndObj) || newEndObj.isSame(currentEndObj)) {
      setError("The new end date must be after the current end date.");
      return;
    }

    // 4. Send the full ISO string (Date + Time)
    await onConfirm(booking.Booking_ID, finalDateTime);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Extend Booking</h2>
        <p className="text-sm text-gray-600 mb-6">
          Select a new end date for the booking. The start date is locked.
          <br/>
          <span className="text-xs text-blue-600 font-medium">
            Note: Return time ({dayjs(booking.Booking_End_Date_Time).format('h:mm A')}) will remain the same.
          </span>
        </p>

        <div className="mb-6">
          <BookingCalendar
            selectedCar={booking.Model_ID} 
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={() => {}} // No-op, start date is locked
            onEndDateChange={setEndDate} // This updates the state correctly
            onRangeError={setError}
            minDate={dayjs(booking.Booking_Start_Date_Time)}
            excludeBookingId={booking.Booking_ID} 
            readOnlyStartDate={true} 
          />
          
          {error && (
            <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
              {error}
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-3 border-t pt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
          >
            Cancel
          </button>
          <AsyncButton
            onClick={handleConfirm}
            disabled={!!error}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            Confirm Extension
          </AsyncButton>
        </div>
      </div>
    </Modal>
  );
};

export default ExtendBookingModal;