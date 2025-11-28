'use client';

import { useState, useEffect } from 'react';
import Modal from '@/components/Modal';
import AsyncButton from "@/components/AsyncButton";
import { SpecificBookingDetails, PaymentDetails } from '@/types'; // Assuming PaymentDetails is now imported via index.ts
import { fetchLateFeesService, LateFee } from '@/app/(admin)/services/lateFeeService';
import { FinishBookingPayload, finishBookingsService } from '@/app/services/bookingService';
import { toast } from '@/components/toast/use-toast';

interface FinishBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: SpecificBookingDetails | null;
  onSuccess: () => void; // Callback after successful finish
}

const FinishBookingModal = ({ isOpen, onClose, booking, onSuccess }: FinishBookingModalProps) => {
  const [dateReturned, setDateReturned] = useState<string>('');
  const [lateFees, setLateFees] = useState<LateFee[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Set initial return date to now
      setDateReturned(new Date().toISOString().slice(0, 16)); // YYYY-MM-DDTHH:MM format
      
      // Fetch late fees
      const loadLateFees = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const fees = await fetchLateFeesService();
          setLateFees(fees);
        } catch (err: any) {
          setError(err.message || 'Failed to load late fees.');
          toast({ variant: 'destructive', title: 'Error', description: err.message || 'Failed to load late fees.' });
        } finally {
          setIsLoading(false);
        }
      };
      loadLateFees();
    }
  }, [isOpen]);

  if (!booking) return null;

  const bookingEnd = new Date(booking.Booking_End_Date_Time);
  const actualReturn = dateReturned ? new Date(dateReturned) : null;

  // Calculate additional hours
  let additionalHours = 0;
  if (actualReturn && actualReturn > bookingEnd) {
    const timeDifferenceMs = actualReturn.getTime() - bookingEnd.getTime();
    additionalHours = Math.ceil(timeDifferenceMs / (1000 * 60 * 60)); // Round up to nearest hour
  }

  // Determine car class and applicable late fee rate
  let carClassId: number | null = null;
  let carClassName: string = 'N/A';

  if (booking.Car_Models && booking.Car_Models.Car_Class_FK) {
    carClassId = booking.Car_Models.Car_Class_FK;
    const foundLateFee = lateFees.find(fee => fee.Car_Class_FK === carClassId);
    if (foundLateFee) {
      carClassName = foundLateFee.Car_Class.Class;
    }
  }
  
  const applicableLateFeeRate = lateFees.find(fee => fee.Car_Class_FK === carClassId)?.value || 0;
  const calculatedAdditionalFees = additionalHours * applicableLateFeeRate;

  const initialTotalPayment = booking.Payment_Details?.initial_total_payment || 0; // Get from fetched Payment_Details
  const bookingFee = booking.Payment_Details?.booking_fee || 0; // Get from fetched Payment_Details
  
  const finalTotalPayment = initialTotalPayment + calculatedAdditionalFees;

  const handleSubmit = async () => {
    if (!dateReturned || !actualReturn || actualReturn < bookingEnd) {
      setError('Please provide a valid return date and time, after the booking end.');
      toast({ variant: 'destructive', title: 'Invalid Return Date', description: 'Return date must be after booking end date.' });
      return;
    }

    if (isLoading) return; // Don't submit if late fees are still loading

    setIsSubmitting(true);
    setError(null);

    const finishPayload: FinishBookingPayload = {
      dateReturned: actualReturn.toISOString(),
      additionalHours: additionalHours, // Pass additionalHours
      additionalFees: calculatedAdditionalFees,
      totalPayment: finalTotalPayment,
      paymentStatus: calculatedAdditionalFees > 0 ? 'Late Payment Due' : 'Paid', // Or 'Completed'
    };

    try {
      await finishBookingsService([booking.Booking_ID], finishPayload);
      toast({ title: 'Booking Finished', description: 'Booking successfully marked as finished and payment details updated.' });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to finish booking.');
      toast({ variant: 'destructive', title: 'Error', description: err.message || 'Failed to finish booking.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="bg-white rounded-3xl shadow-xl p-6 md:p-8 relative">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Finish Booking - {booking.Booking_ID}</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        
        <div className="space-y-4 mb-6">
          <p className="text-sm text-gray-600"><strong>Booking End:</strong> {new Date(booking.Booking_End_Date_Time).toLocaleString()}</p>
          
          <div>
            <label htmlFor="dateReturned" className="block text-sm font-medium text-gray-700">Actual Return Date & Time:</label>
            <input
              type="datetime-local"
              id="dateReturned"
              value={dateReturned}
              onChange={(e) => setDateReturned(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            />
          </div>

          <div className="border-t border-gray-200 pt-4 mt-4">
            <h3 className="font-semibold text-lg text-gray-700 mb-2">Payment Breakdown</h3>
            {isLoading ? (
              <p>Loading late fee rates...</p>
            ) : (
              <>
                <p className="text-sm text-gray-600"><strong>Initial Total Payment:</strong> P{initialTotalPayment.toFixed(2)}</p>
                <p className="text-sm text-gray-600"><strong>Booking Fee:</strong> P{bookingFee.toFixed(2)}</p>
                <p className="text-sm text-gray-600"><strong>Late Fee Rate ({booking.Car_Models?.Number_Of_Seats || 'N/A'} seats - {carClassName}):</strong> P{applicableLateFeeRate.toFixed(2)} / hour</p>
                <p className="text-sm text-gray-600"><strong>Additional Hours:</strong> {additionalHours}</p>
                <p className="text-sm text-red-600 font-semibold"><strong>Calculated Additional Fees:</strong> P{calculatedAdditionalFees.toFixed(2)}</p>
                <p className="text-lg text-gray-800 font-bold mt-2"><strong>Final Total Payment:</strong> P{finalTotalPayment.toFixed(2)}</p>
              </>
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <AsyncButton onClick={handleSubmit} disabled={isSubmitting || isLoading} className="px-4 py-2 bg-[#A1E3F9] text-white rounded-md hover:bg-blue-400 disabled:opacity-50">
            {isSubmitting ? 'Finishing...' : 'Confirm Finish'}
          </AsyncButton>
          <AsyncButton onClick={onClose} disabled={isSubmitting} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">
            Cancel
          </AsyncButton>
        </div>
      </div>
    </Modal>
  );
};

export default FinishBookingModal;
