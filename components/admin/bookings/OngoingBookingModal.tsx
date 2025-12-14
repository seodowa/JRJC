'use client';

import { useState, useEffect } from 'react';
import { SpecificBookingDetails } from '@/types/adminBooking';
import Modal from '@/components/Modal';
import Image from 'next/image';
import AsyncButton from "@/components/AsyncButton";
import { fetchLateFeesService, LateFee } from '@/app/(admin)/services/lateFeeService';
import { 
  finishBookingsService, 
  FinishBookingPayload, 
  markBookingReturnedService, 
  updatePaymentStatusService 
} from '@/app/services/bookingService';
import { toast } from '@/components/toast/use-toast';
import { useRouter } from 'next/navigation';
import ExtendBookingModal from './ExtendBookingModal';
import ConfirmationModal from '../ConfirmationModal';

interface OngoingBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: SpecificBookingDetails | null;
  onSuccess: () => void; // Trigger refresh on parent and close
  onExtend: (bookingId: string, newEndDate: string) => Promise<void>;
}

const OngoingBookingModal = ({ isOpen, onClose, booking, onSuccess, onExtend }: OngoingBookingModalProps) => {
  const [lateFees, setLateFees] = useState<LateFee[]>([]);
  const [isReturning, setIsReturning] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
  const [isExtendModalOpen, setIsExtendModalOpen] = useState(false);
  const [isReturnConfirmOpen, setIsReturnConfirmOpen] = useState(false);
  
  // Local state to track updates before final finish
  const [localBooking, setLocalBooking] = useState<SpecificBookingDetails | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (isOpen && booking) {
      setLocalBooking(booking);
      loadLateFees();
      
      // Push history state for back button support
      window.history.pushState({ modalOpen: true }, '', window.location.href);
      const handlePopState = () => onClose();
      window.addEventListener('popstate', handlePopState);
      return () => window.removeEventListener('popstate', handlePopState);
    }
  }, [isOpen, booking]);

  const handleManualClose = () => {
    if (isOpen) window.history.back();
  };

  const loadLateFees = async () => {
    try {
      const fees = await fetchLateFeesService();
      setLateFees(fees);
    } catch (error) {
      console.error("Failed to load late fees", error);
    }
  };

  if (!localBooking || !isOpen) return null;

  const formatDateTime = (isoString: string) => new Date(isoString).toLocaleString();

  // --- LOGIC: Calculate Fees on the Fly (or use DB values) ---
  
  const bookingEnd = new Date(localBooking.Booking_End_Date_Time);
  const returnDate = localBooking.date_returned ? new Date(localBooking.date_returned) : null;
  
  let additionalHours = 0;
  // Use DB value if available, otherwise calculate if returnDate is set
  if (localBooking.additional_hours) {
      additionalHours = localBooking.additional_hours;
  } else if (returnDate && returnDate > bookingEnd) {
    const diff = returnDate.getTime() - bookingEnd.getTime();
    additionalHours = Math.ceil(diff / (1000 * 60 * 60));
  }

  // Car Class Logic
  let carClassId: number | null = null;
  if (localBooking.Car_Models?.Car_Class_FK) {
    carClassId = localBooking.Car_Models.Car_Class_FK;
  }
  const lateFeeRate = lateFees.find(f => f.Car_Class_FK === carClassId)?.value || 0;
  
  const calculatedLateFees = additionalHours * lateFeeRate;
  const initialTotal = localBooking.Payment_Details?.initial_total_payment || 0;
  const finalTotal = initialTotal + calculatedLateFees;

  const isPaid = localBooking.Payment_Details?.payment_status === 'Paid';
  const hasLateFees = calculatedLateFees > 0;
  const canFinish = (!!localBooking.date_returned) && (!hasLateFees || (hasLateFees && isPaid));

  // --- ACTIONS ---

  const handleMarkReturned = async () => {
    setIsReturning(true);
    try {
      const result = await markBookingReturnedService(localBooking.Booking_ID);
      
      if (!result.success) {
          throw new Error(result.error || 'Failed to mark returned');
      }
      
      const updatedBooking = result.data;
      
      // 2. Update local state with new DB values (date_returned, additional_hours)
      setLocalBooking(prev => prev ? ({ ...prev, ...updatedBooking }) : null);
      toast({ title: "Car Returned", description: "Return time recorded successfully." });
      
      // Refresh parent list in background without closing modal
      router.refresh();
      setIsReturnConfirmOpen(false); // Close confirm modal

    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message || "Failed to mark return." });
    } finally {
      setIsReturning(false);
    }
  };

  const handleMarkPaid = async () => {
    if (!localBooking.Payment_Details?.Payment_ID) return;
    
    try {
      const result = await updatePaymentStatusService({
          paymentId: localBooking.Payment_Details.Payment_ID,
          status: 'Paid',
          additionalFees: calculatedLateFees,
          totalPayment: finalTotal
      });

      if (!result.success) {
          throw new Error(result.error || 'Failed to update payment');
      }
      
      // Update local state
      setLocalBooking(prev => {
          if (!prev || !prev.Payment_Details) return prev;
          return {
              ...prev,
              Payment_Details: {
                  ...prev.Payment_Details!,
                  payment_status: 'Paid',
                  additional_fees: calculatedLateFees,
                  total_payment: finalTotal
              }
          };
      });
      toast({ title: "Payment Updated", description: "Marked as Paid." });
      router.refresh(); // Refresh parent list in background

    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message || "Failed to update payment." });
    }
  };

  const handleFinish = async () => {
    setIsFinishing(true);
    try {
      const payload: FinishBookingPayload = {
        dateReturned: localBooking.date_returned || new Date().toISOString(),
        additionalHours: additionalHours,
        additionalFees: calculatedLateFees,
        totalPayment: finalTotal,
        paymentStatus: 'Paid' // We ensure it's paid before finishing
      };

      await finishBookingsService([localBooking.Booking_ID], payload);
      toast({ title: "Booking Finished", description: "Booking moved to history." });
      
      // Close via back (removes history state)
      handleManualClose();
      // Wait a tick then call onSuccess (which might also try to close or refresh)
      setTimeout(onSuccess, 50);

    } catch (error: any) {
        toast({ variant: "destructive", title: "Error", description: error.message || "Failed to finish." });
    } finally {
        setIsFinishing(false);
    }
  };

  const handleLocalExtend = async (bookingId: string, newEndDate: string) => {
      await onExtend(bookingId, newEndDate);
      // Update local state to reflect new end date immediately
      setLocalBooking(prev => prev ? ({ ...prev, Booking_End_Date_Time: newEndDate }) : null);
      setIsExtendModalOpen(false);
      router.refresh();
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 md:p-4">
        {/* Full screen mobile, Centered Card Desktop */}
        <div className="relative bg-white md:rounded-lg shadow-xl w-full h-full md:h-auto md:max-h-[90vh] md:max-w-4xl overflow-hidden flex flex-col">
          
          {/* Header */}
          <div className="flex-shrink-0 px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 truncate pr-4">Ongoing - {localBooking.Booking_ID}</h2>
            <button type="button" onClick={handleManualClose} className="text-gray-500 p-2 hover:bg-gray-100 rounded-full">
               <span className="text-2xl leading-none">&times;</span>
            </button>
          </div>
          
          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              
              {/* Left Column: Booking & Customer Info */}
              <div className="space-y-4">
                {/* Booking Info */}
                <div>
                  <h3 className="font-semibold text-lg text-gray-700 mb-2">Booking Information</h3>
                  <p className="text-sm text-gray-600"><strong>Status:</strong> <span className="font-medium text-green-600">Ongoing</span></p>
                  <p className="text-sm text-gray-600"><strong>Booked On:</strong> {formatDateTime(localBooking.date_created)}</p>
                  <p className="text-sm text-gray-600"><strong>Start:</strong> {formatDateTime(localBooking.Booking_Start_Date_Time)}</p>
                  <p className="text-sm text-gray-600"><strong>End:</strong> {formatDateTime(localBooking.Booking_End_Date_Time)}</p>
                  <p className="text-sm text-gray-600"><strong>Duration:</strong> {localBooking.Duration} hours</p>
                  <p className="text-sm text-gray-600"><strong>Location:</strong> {localBooking.Location}</p>
                  
                  {/* Return Status Area */}
                  <div className="mt-4 pt-2 border-t border-gray-100">
                      <h4 className="font-semibold text-sm text-gray-700 mb-2">Return Status</h4>
                      {!localBooking.date_returned ? (
                          <AsyncButton 
                              onClick={() => setIsReturnConfirmOpen(true)} 
                              disabled={isReturning}
                              className="text-sm bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-1.5 px-3 rounded-md transition-colors"
                          >
                              {isReturning ? 'Marking...' : 'Mark Returned Now'}
                          </AsyncButton>
                      ) : (
                          <div>
                              <p className="text-sm text-gray-600"><strong>Returned:</strong> {formatDateTime(localBooking.date_returned)}</p>
                              {additionalHours > 0 ? (
                                  <p className="text-sm text-red-600 font-medium">Overdue by {additionalHours} hours</p>
                              ) : (
                                  <p className="text-sm text-green-600 font-medium">Returned on time</p>
                              )}
                          </div>
                      )}
                  </div>
                </div>

                {/* Customer Info */}
                <div>
                  <h3 className="font-semibold text-lg text-gray-700 mb-2">Customer Information</h3>
                  <p className="text-sm text-gray-600"><strong>Name:</strong> {localBooking.Customer.First_Name} {localBooking.Customer.Last_Name} {localBooking.Customer.Suffix || ''}</p>
                  <p className="text-sm text-gray-600"><strong>Email:</strong> {localBooking.Customer.Email || 'N/A'}</p>
                  <p className="text-sm text-gray-600"><strong>Contact:</strong> {localBooking.Customer.Contact_Number || 'N/A'}</p>
                </div>
              </div>

              {/* Right Column: Car Info & Payment Summary */}
              <div className="space-y-4">
                {/* Car Info */}
                <div>
                  <h3 className="font-semibold text-lg text-gray-700 mb-2">Car Information</h3>
                  <p className="text-sm text-gray-600"><strong>Make:</strong> {localBooking.Car_Models.Manufacturer.Manufacturer_Name}</p>
                  <p className="text-sm text-gray-600"><strong>Model:</strong> {localBooking.Car_Models.Model_Name}</p>
                  <p className="text-sm text-gray-600"><strong>Year:</strong> {localBooking.Car_Models.Year_Model}</p>
                </div>

                {/* Car Image */}
                <div>
                  {localBooking.Car_Models.image ? (
                    <div className="relative w-full h-40 border border-gray-300 rounded-md overflow-hidden">
                      <Image
                        src={localBooking.Car_Models.image}
                        alt={`${localBooking.Car_Models.Manufacturer.Manufacturer_Name} ${localBooking.Car_Models.Model_Name}`}
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

                {/* Payment Summary (Breakdown) */}
                <div className="mt-4 p-3 bg-gray-50 rounded-md border border-gray-200">
                  <h4 className="font-semibold text-md text-gray-700 mb-2">Payment Summary</h4>
                  <div className="space-y-1 text-sm">
                      <div className="flex justify-between text-gray-600">
                          <span>Initial Total:</span>
                          <span>P{initialTotal.toFixed(2)}</span>
                      </div>
                      {additionalHours > 0 && (
                          <div className="flex justify-between text-red-600">
                              <span>Late Fees ({additionalHours}hr):</span>
                              <span>+ P{calculatedLateFees.toFixed(2)}</span>
                          </div>
                      )}
                      <div className="flex justify-between text-gray-800 font-bold border-t border-gray-300 pt-1 mt-1">
                          <span>Final Total:</span>
                          <span>P{finalTotal.toFixed(2)}</span>
                      </div>
                      
                      <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-200">
                          <div className="text-gray-600">
                              <strong>Status: </strong> 
                              <span className={`${isPaid ? 'text-green-600' : 'text-red-600'}`}>{localBooking.Payment_Details?.payment_status || 'Not Paid'}</span>
                          </div>
                          {/* Mark as Paid Button */}
                          {!isPaid && localBooking.date_returned && localBooking.Payment_Details && (
                              <AsyncButton 
                                  onClick={handleMarkPaid} 
                                  className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                              >
                                  Mark Paid
                              </AsyncButton>
                          )}
                      </div>
                      {localBooking.Payment_Details?.bf_reference_number && (
                          <p className="text-xs text-gray-500 mt-1">Ref: {localBooking.Payment_Details.bf_reference_number}</p>
                      )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex-shrink-0 px-6 py-4 border-t border-gray-100 bg-white flex flex-col md:flex-row justify-between items-center gap-3">
            {/* Left Side Actions (Extend) */}
            <div className="w-full md:w-auto">
                <AsyncButton
                  onClick={() => setIsExtendModalOpen(true)} 
                  disabled={isFinishing || !!localBooking.date_returned} 
                  className="w-full md:w-auto px-4 py-2 bg-gray-200 rounded-md hover:bg-green-400 disabled:opacity-50 text-gray-800"
                >
                  Extend
                </AsyncButton>
            </div>

            {/* Right Side Actions (Close & Finish) */}
            <div className="flex gap-3 w-full md:w-auto">
                <AsyncButton onClick={handleManualClose} disabled={isFinishing} className="flex-1 md:flex-none px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 text-center justify-center">
                    Close
                </AsyncButton>
                <AsyncButton 
                    onClick={handleFinish} 
                    disabled={!canFinish || isFinishing} 
                    className="flex-1 md:flex-none px-4 py-2 bg-[#A1E3F9] text-white rounded-md hover:bg-blue-400 disabled:opacity-50 disabled:cursor-not-allowed text-center justify-center"
                >
                    Confirm Finish
                </AsyncButton>
            </div>
          </div>
        </div>
      </div>

      {/* Extend Modal */}
      {isExtendModalOpen && (
        <ExtendBookingModal 
          isOpen={isExtendModalOpen}
          onClose={() => setIsExtendModalOpen(false)}
          booking={localBooking}
          onConfirm={handleLocalExtend}
        />
      )}

      {/* Return Confirmation Modal */}
      <ConfirmationModal 
        isOpen={isReturnConfirmOpen}
        onClose={() => setIsReturnConfirmOpen(false)}
        onConfirm={handleMarkReturned}
        title="Confirm Return"
        message="Are you sure you want to mark this car as returned? This will calculate any applicable late fees based on the current time."
        confirmButtonText="Yes, Return"
        cancelButtonText="Cancel"
        isLoading={isReturning}
        loadingText="Returning..."
      />
    </>
  );
};

export default OngoingBookingModal;
