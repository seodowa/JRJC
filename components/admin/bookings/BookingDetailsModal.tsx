'use client';

import { SpecificBookingDetails } from '@/lib/supabase/queries/fetchSpecificBooking';
import Modal from '@/components/Modal'; // Generic Modal wrapper
import Image from 'next/image';
import AsyncButton from "@/components/AsyncButton"; // For car image

interface BookingDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: SpecificBookingDetails | null;
  onApprove: (bookingId: string) => void;
  onDecline: (bookingId: string) => void;
  onCancel: (bookingId: string) => void;
  onStart: (bookingId: string) => void;
  onFinish: (bookingId: string) => void;
  onExtend: (bookingId: string) => void;
  isProcessing: boolean; // To show loading state for actions
}

const BookingDetailsModal = ({
  isOpen,
  onClose,
  booking,
  onApprove,
  onDecline,
  onCancel,
  onStart,
  onFinish,
  onExtend,
  isProcessing,
}: BookingDetailsModalProps) => {
  if (!booking) return null; // Don't render if no booking data

  // Helper to format date/time
  const formatDateTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString(); // Adjust as needed for specific locale/format
  };

  const getStatusButtons = (status: string) => {
    switch (status) {
      case 'Pending':
        return (
          <>
            <AsyncButton
              onClick={() => onApprove(booking.Booking_ID)}
              disabled={isProcessing}
              className="px-4 py-2 bg-[#A1E3F9] text-white rounded-md hover:bg-blue-400 disabled:opacity-50"
            >
              Approve
            </AsyncButton>
            <AsyncButton
              onClick={() => onDecline(booking.Booking_ID)}
              disabled={isProcessing}
              className="px-4 py-2 shadow-sm text-red-500 rounded-md hover:bg-red-400 hover:text-white disabled:opacity-50"
            >
              Decline
            </AsyncButton>
          </>
        );
      case 'Confirmed':
        return (
          <>
            <AsyncButton
              onClick={() => onStart(booking.Booking_ID)}
              disabled={isProcessing}
              className="px-4 py-2 bg-[#A1E3F9] text-white rounded-md hover:bg-blue-400 disabled:opacity-50"
            >
              Start
            </AsyncButton>
            <AsyncButton
              onClick={() => onCancel(booking.Booking_ID)}
              disabled={isProcessing}
              className="px-4 py-2 border border-gray-400 text-red-500 rounded-md hover:bg-red-400 hover:text-white disabled:opacity-50"
            >
              Cancel
            </AsyncButton>
          </>
        );
      case 'Ongoing':
        return (
          <>
            <button
              onClick={() => onFinish(booking.Booking_ID)}
              disabled={isProcessing}
              className="px-4 py-2 bg-[#A1E3F9] rounded-md hover:bg-blue-400 disabled:opacity-50"
            >
              Finish
            </button>
            <button
              onClick={() => onExtend(booking.Booking_ID)}
              disabled={isProcessing}
              className="px-4 py-2 bg-gray-200 rounded-md hover:bg-green-400 disabled:opacity-50"
            >
              Extend
            </button>
          </>
        );
      default: // Completed, Cancelled, Declined, etc.
        return null; // No action buttons for these statuses
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="bg-white rounded-lg shadow-xl p-6 md:p-8 relative">
        {/* Modal Header */}
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Booking Details - {booking.Booking_ID}</h2>

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          {/* Left Column: Booking & Customer Info */}
          <div className="space-y-4">
            {/* Booking Info */}
            <div>
              <h3 className="font-semibold text-lg text-gray-700 mb-2">Booking Information</h3>
              <p className="text-sm text-gray-600"><strong>Status:</strong> <span className={`font-medium ${
                  booking.Booking_Status.Name === 'Pending' ? 'text-yellow-600' :
                  booking.Booking_Status.Name === 'Confirmed' ? 'text-blue-600' :
                  booking.Booking_Status.Name === 'Ongoing' ? 'text-green-600' :
                  booking.Booking_Status.Name === 'Completed' ? 'text-gray-600' :
                  'text-red-600'
                }`}>{booking.Booking_Status.Name}</span></p>
              <p className="text-sm text-gray-600"><strong>Booked On:</strong> {formatDateTime(booking.date_created)}</p>
              <p className="text-sm text-gray-600"><strong>Start:</strong> {formatDateTime(booking.Booking_Start_Date_Time)}</p>
              <p className="text-sm text-gray-600"><strong>End:</strong> {formatDateTime(booking.Booking_End_Date_Time)}</p>
              <p className="text-sm text-gray-600"><strong>Duration:</strong> {booking.Duration} hours</p>
              <p className="text-sm text-gray-600"><strong>Location:</strong> {booking.Location}</p>
            </div>

            {/* Customer Info */}
            <div>
              <h3 className="font-semibold text-lg text-gray-700 mb-2">Customer Information</h3>
              <p className="text-sm text-gray-600"><strong>Name:</strong> {booking.Customer.First_Name} {booking.Customer.Last_Name} {booking.Customer.Suffix || ''}</p>
              <p className="text-sm text-gray-600"><strong>Email:</strong> {booking.Customer.Email || 'N/A'}</p>
              <p className="text-sm text-gray-600"><strong>Contact:</strong> {booking.Customer.Contact_Number || 'N/A'}</p>
            </div>
          </div>

          {/* Right Column: Car Info & Placeholder Image */}
          <div className="space-y-4">
            {/* Car Info */}
            <div>
              <h3 className="font-semibold text-lg text-gray-700 mb-2">Car Information</h3>
              <p className="text-sm text-gray-600"><strong>Make:</strong> {booking.Car_Models.Manufacturer.Manufacturer_Name}</p>
              <p className="text-sm text-gray-600"><strong>Model:</strong> {booking.Car_Models.Model_Name}</p>
              <p className="text-sm text-gray-600"><strong>Year:</strong> {booking.Car_Models.Year_Model}</p>
            </div>

            {/* Car Image Placeholder */}
            <div>
              <h3 className="font-semibold text-lg text-gray-700 mb-2">Car Image</h3>
              {booking.Car_Models.image ? (
                <div className="relative w-full h-40 border border-gray-300 rounded-md overflow-hidden">
                  <Image
                    src={booking.Car_Models.image}
                    alt={`${booking.Car_Models.Manufacturer.Manufacturer_Name} ${booking.Car_Models.Model_Name}`}
                    layout="fill"
                    objectFit="cover"
                    className="rounded-md"
                  />
                </div>
              ) : (
                <div className="w-full h-40 border border-gray-300 rounded-md flex items-center justify-center bg-gray-50 text-gray-400">
                  No Image Available
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end space-x-3">
          {getStatusButtons(booking.Booking_Status.Name)}
          <AsyncButton
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
          >
            Close
          </AsyncButton>
        </div>
      </div>
    </Modal>
  );
};

export default BookingDetailsModal;
