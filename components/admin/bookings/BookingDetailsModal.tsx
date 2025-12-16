'use client';

import { useState, useEffect } from 'react';
import { SpecificBookingDetails } from '@/types/adminBooking';
import Image from 'next/image';
import AsyncButton from "@/components/AsyncButton";
import ExtendBookingModal from './ExtendBookingModal';

interface BookingDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: SpecificBookingDetails | null;
  onApprove: (bookingId: string) => void;
  onDecline: (bookingId: string) => void;
  onCancel: (bookingId: string) => void;
  onStart: (bookingId: string) => void;
  onExtend: (bookingId: string, newEndDate: string) => Promise<void>; 
  isProcessing: boolean;
}

const BookingDetailsModal = ({
  isOpen,
  onClose,
  booking,
  onApprove,
  onDecline,
  onCancel,
  onStart,
  onExtend,
  isProcessing,
}: BookingDetailsModalProps) => {
  const [isExtendModalOpen, setIsExtendModalOpen] = useState(false);
  const [validIdUrl, setValidIdUrl] = useState<string | null>(null);

  // Handle browser history for "swipe to back" support
  useEffect(() => {
    if (isOpen) {
      window.history.pushState({ modalOpen: true }, '', window.location.href);

      const handlePopState = () => {
        onClose();
      };

      window.addEventListener('popstate', handlePopState);

      return () => {
        window.removeEventListener('popstate', handlePopState);
      };
    }
  }, [isOpen]);

  // Fetch Signed URL for ID
  useEffect(() => {
    if (booking?.valid_id_path) {
      const fetchSignedUrl = async () => {
        try {
          const res = await fetch('/api/admin/bookings/signed-url', {
            method: 'POST',
            body: JSON.stringify({ path: booking.valid_id_path })
          });
          const data = await res.json();
          if (data.signedUrl) setValidIdUrl(data.signedUrl);
        } catch (e) {
          console.error("Failed to fetch ID URL", e);
        }
      };
      fetchSignedUrl();
    } else {
        setValidIdUrl(null);
    }
  }, [booking]);

  const handleManualClose = () => {
    if (isOpen) {
      window.history.back();
    }
  };

  if (!isOpen || !booking) return null;

  const formatDateTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString();
  };

  const getStatusButtons = (status: string) => {
    switch (status) {
      case 'Pending':
        return (
          <>
            <AsyncButton onClick={() => onApprove(booking.Booking_ID)} disabled={isProcessing} className="flex-1 md:flex-none px-4 py-2 bg-[#A1E3F9] text-white rounded-md hover:bg-blue-400 disabled:opacity-50 text-center justify-center">Approve</AsyncButton>
            <AsyncButton onClick={() => onDecline(booking.Booking_ID)} disabled={isProcessing} className="flex-1 md:flex-none px-4 py-2 shadow-sm text-red-500 rounded-md hover:bg-red-400 hover:text-white disabled:opacity-50 text-center justify-center">Decline</AsyncButton>
          </>
        );
      case 'Confirmed':
        return (
          <>
            <AsyncButton onClick={() => onStart(booking.Booking_ID)} disabled={isProcessing} className="flex-1 md:flex-none px-4 py-2 bg-[#A1E3F9] text-white rounded-md hover:bg-blue-400 disabled:opacity-50 text-center justify-center">Start</AsyncButton>
            <AsyncButton onClick={() => onCancel(booking.Booking_ID)} disabled={isProcessing} className="flex-1 md:flex-none px-4 py-2 border border-gray-400 text-red-500 rounded-md hover:bg-red-400 hover:text-white disabled:opacity-50 text-center justify-center">Cancel</AsyncButton>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 md:p-4">
        {/* Mobile: Full screen, Desktop: Centered card */}
        <div className="relative bg-white md:rounded-lg shadow-xl w-full h-full md:h-auto md:max-h-[90vh] md:max-w-4xl overflow-hidden flex flex-col">
          
          {/* Header - Fixed */}
          <div className="flex-shrink-0 px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 truncate pr-4">
              Booking {booking.Booking_ID}
            </h2>
            <button type="button" onClick={handleManualClose} className="text-gray-500 p-2 hover:bg-gray-100 rounded-full">
               <span className="text-2xl leading-none">&times;</span>
            </button>
          </div>
          
          {/* Scrollable Body */}
          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              
              {/* Left Column: Booking & Customer Info */}
              <div className="space-y-4">
                {/* Booking Info */}
                <div>
                  <h3 className="font-semibold text-lg text-gray-700 mb-2">Booking Information</h3>
                  <p className="text-sm text-gray-600"><strong>Status:</strong> <span className={`font-medium ${
                    booking.Booking_Status?.Name === 'Pending' ? 'text-yellow-600' :
                    booking.Booking_Status?.Name === 'Confirmed' ? 'text-blue-600' :
                    booking.Booking_Status?.Name === 'Ongoing' ? 'text-green-600' :
                    booking.Booking_Status?.Name === 'Completed' ? 'text-gray-600' :
                    'text-red-600'
                  }`}>{booking.Booking_Status?.Name || 'Unknown'}</span></p>
                  <p className="text-sm text-gray-600"><strong>Booked On:</strong> {formatDateTime(booking.date_created)}</p>
                  <p className="text-sm text-gray-600"><strong>Start:</strong> {formatDateTime(booking.Booking_Start_Date_Time)}</p>
                  <p className="text-sm text-gray-600"><strong>End:</strong> {formatDateTime(booking.Booking_End_Date_Time)}</p>
                  <p className="text-sm text-gray-600"><strong>Duration:</strong> {booking.Duration} hours</p>
                  <p className="text-sm text-gray-600"><strong>Location:</strong> {booking.Location}</p>
                  {booking.date_returned && <p className="text-sm text-gray-600"><strong>Actual Return:</strong> {formatDateTime(booking.date_returned)}</p>}
                  {(booking.additional_hours || 0) > 0 && <p className="text-sm text-red-600"><strong>Additional Hours:</strong> {booking.additional_hours}</p>}
                  
                  {booking.Payment_Details && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-md">
                      <h4 className="font-semibold text-md text-gray-700 mb-1">Payment Summary</h4>
                      {(booking.Booking_Status.Name === 'Pending' || booking.Booking_Status.Name === 'Confirmed') ? (
                        <div className="space-y-1 text-sm">
                          <p className="text-gray-600"><strong>Booking Fee:</strong> P{booking.Payment_Details.booking_fee?.toFixed(2)}</p>
                          <p className="text-gray-600"><strong>Initial Total:</strong> P{booking.Payment_Details.initial_total_payment?.toFixed(2)}</p>
                          {booking.Payment_Details.bf_reference_number && <p className="text-gray-600"><strong>Ref No:</strong> {booking.Payment_Details.bf_reference_number}</p>}
                        </div>
                      ) : (
                        <div className="space-y-1 text-sm">
                          <p className="text-gray-600"><strong>Initial Total:</strong> P{booking.Payment_Details.initial_total_payment?.toFixed(2)}</p>
                          {booking.Payment_Details.additional_fees > 0 && <p className="text-red-600"><strong>Late Fees:</strong> P{booking.Payment_Details.additional_fees.toFixed(2)}</p>}
                          {booking.Payment_Details.total_payment && <p className="text-gray-800 font-bold"><strong>Final Total:</strong> P{booking.Payment_Details.total_payment.toFixed(2)}</p>}
                          <p className="text-gray-600"><strong>Status:</strong> {booking.Payment_Details.payment_status}</p>
                          {booking.Payment_Details.bf_reference_number && <p className="text-gray-600"><strong>Ref No:</strong> {booking.Payment_Details.bf_reference_number}</p>}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Customer Info */}
                <div>
                  <h3 className="font-semibold text-lg text-gray-700 mb-2">Customer Information</h3>
                  <p className="text-sm text-gray-600"><strong>Name:</strong> {booking.Customer.First_Name} {booking.Customer.Last_Name} {booking.Customer.Suffix || ''}</p>
                  <p className="text-sm text-gray-600"><strong>Email:</strong> {booking.Customer.Email || 'N/A'}</p>
                  <p className="text-sm text-gray-600"><strong>Contact:</strong> {booking.Customer.Contact_Number || 'N/A'}</p>
                </div>

                {/* Valid Government ID */}
                <div>
                  <h3 className="font-semibold text-lg text-gray-700 mb-2">Valid Government ID</h3>
                  {validIdUrl ? (
                    <div className="relative w-full h-48 border border-gray-300 rounded-md overflow-hidden cursor-pointer group" onClick={() => window.open(validIdUrl, '_blank')}>
                      <Image
                        src={validIdUrl}
                        alt="Customer ID"
                        fill
                        style={{ objectFit: 'contain' }}
                        className="rounded-md"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <span className="bg-white/80 px-2 py-1 rounded text-xs font-medium text-gray-800">Click to Open</span>
                      </div>
                    </div>
                  ) : booking.valid_id_path ? (
                      <div className="w-full h-48 border border-gray-300 rounded-md flex items-center justify-center bg-gray-50 text-gray-500 text-sm">
                        Loading ID...
                      </div>
                  ) : (
                    <div className="w-full h-12 border border-dashed border-gray-300 rounded-md flex items-center justify-center bg-gray-50 text-gray-400 text-sm">
                      No ID uploaded
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Car Info & Image */}
              <div className="space-y-4">
                {/* Car Info */}
                <div>
                  <h3 className="font-semibold text-lg text-gray-700 mb-2">Car Information</h3>
                  <p className="text-sm text-gray-600"><strong>Make:</strong> {booking.Car_Models.Manufacturer.Manufacturer_Name}</p>
                  <p className="text-sm text-gray-600"><strong>Model:</strong> {booking.Car_Models.Model_Name}</p>
                  <p className="text-sm text-gray-600"><strong>Year:</strong> {booking.Car_Models.Year_Model}</p>
                </div>

                {/* Car Image */}
                <div>
                  <h3 className="font-semibold text-lg text-gray-700 mb-2">Car Image</h3>
                  {booking.Car_Models.image ? (
                    <div className="relative w-full h-40 border border-gray-300 rounded-md overflow-hidden">
                      <Image
                        src={booking.Car_Models.image}
                        alt={`${booking.Car_Models.Manufacturer.Manufacturer_Name} ${booking.Car_Models.Model_Name}`}
                        fill
                        style={{ objectFit: 'cover' }}
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
          </div>

          {/* Footer Actions - Fixed */}
          <div className="flex-shrink-0 px-6 py-4 border-t border-gray-100 bg-white flex flex-col md:flex-row justify-end gap-3">
            <div className="flex gap-3 w-full md:w-auto">
              {getStatusButtons(booking.Booking_Status?.Name || '')}
              <AsyncButton onClick={handleManualClose} className="flex-1 md:flex-none px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 text-center justify-center">Close</AsyncButton>
            </div>
          </div>
        </div>
      </div>

      {/* Render the Extend Modal */}
      {isExtendModalOpen && (
        <ExtendBookingModal 
          isOpen={isExtendModalOpen}
          onClose={() => setIsExtendModalOpen(false)}
          booking={booking}
          onConfirm={onExtend}
        />
      )}
    </>
  );
};

export default BookingDetailsModal;